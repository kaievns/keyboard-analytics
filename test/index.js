const data = require('../data');

const avg = entries =>
  ~~ (entries.reduce((sum, item) => sum + item, 0) / entries.length);

const distance = vector => Math.round(Math.sqrt(vector.x * vector.x + vector.y * vector.y));

const avgPosition = key => {
  const [x, y] = LEFT_HAND_SYMBOLS.includes(key) ? ['x1', 'y1'] : ['x2', 'y2'];
  return {
    x: avg(data[key][x]),
    y: avg(data[key][y])
  };
}

const diffPosition = (pos1, pos2) => ({
  x: toCapSizes(Math.abs(pos1.x - pos2.x)),
  y: toCapSizes(Math.abs(pos1.y - pos2.y))
});

const handPositionWhenPressed = (letters=[], x='x1', y='y1') => {
  const positions = letters.reduce((sum, key) => ({
    x: sum.x.concat(data[key][x]),
    y: sum.y.concat(data[key][y])
  }), { x: [], y: [] });

  return {
    x: avg(positions.x),
    y: avg(positions.y)
  };
};


const LEFT_HAND_SYMBOLS = '`12345qwertasdfgzxcvb'.split('');
const RIGHT_HAND_SYMBOLS = '67890-=yuiop[]\\hjkl;\'nm,./'.split('').concat(['Enter']);
const SHIFTED_LEFT_LETTERS = 'QWERTASDFGZXCVB'.split('').filter(key => data[key]);
const SHIFTED_RIGHT_LETTERS = 'YUIOPHJKL:NM<>?'.split('').filter(key => data[key]);
const SHIFTED_LETTERS = SHIFTED_LEFT_LETTERS.concat(SHIFTED_RIGHT_LETTERS);

const LEFT_HAND_POS = handPositionWhenPressed(RIGHT_HAND_SYMBOLS, 'x1', 'y1');
const RIGHT_HAND_POS = handPositionWhenPressed(LEFT_HAND_SYMBOLS, 'x2', 'y2');

const HAND_DIST_IN_KEY_CAPS = 8;
const KEY_CAPS_DENOMINATOR = (RIGHT_HAND_POS.x - LEFT_HAND_POS.x) / HAND_DIST_IN_KEY_CAPS;

const toCapSizes = dist => parseFloat((dist / KEY_CAPS_DENOMINATOR * 10).toFixed(1));

const NORMAL_LETTERS_DATA = Object.keys(data).reduce((list, key) => {
  if (!SHIFTED_LETTERS.includes(key)) {
    const anchor = LEFT_HAND_SYMBOLS.includes(key) ? LEFT_HAND_POS : RIGHT_HAND_POS;
    const position = avgPosition(key);
    const diff = diffPosition(position, anchor);
    const dist = distance(diff);

    list.push({ key, position, diff, dist });
  }

  return list;
}, []);

const LEFT_SHIFT_POS = handPositionWhenPressed(SHIFTED_RIGHT_LETTERS, 'x1', 'y1');
const RIGHT_SHIFT_POS = handPositionWhenPressed(SHIFTED_LEFT_LETTERS, 'x2', 'y2');

console.log('Left hand pos:', LEFT_HAND_POS);
console.log('Right hand pos:', RIGHT_HAND_POS);
console.log('');

NORMAL_LETTERS_DATA.forEach(entry => {
  console.log(
    `"${entry.key}"`,
    '  |  pos:', entry.position,
    '  |  diff:', entry.diff,
    '  |  dist:', entry.dist
  );
});

console.log('');
console.log('Left shift pos:', LEFT_SHIFT_POS,
  diffPosition(LEFT_SHIFT_POS, LEFT_HAND_POS),
  distance(diffPosition(LEFT_SHIFT_POS, LEFT_HAND_POS)));
console.log('Right shift pos: ', RIGHT_SHIFT_POS,
  diffPosition(RIGHT_SHIFT_POS, RIGHT_HAND_POS),
  distance(diffPosition(RIGHT_SHIFT_POS, RIGHT_HAND_POS)));


let keyboard = "\n"+
" \` 1 2 3 4 5 6 7 8 9 0 - = \n"+
"    q w e r t y u i o p [ ] \\ \n"+
"    a s d f g h j k l ; ' Enter \n"+
"     z x c v b n m , . / "
;

const zerofy = val => val > 9 ? val : `0${val}`;

NORMAL_LETTERS_DATA.forEach(entry => {
  keyboard = keyboard.replace(` ${entry.key} `, ` ${zerofy(entry.dist)} `);
});

console.log(keyboard);
