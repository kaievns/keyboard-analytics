const fs = require('fs');

const DATA_DIR = `${__dirname}/data`;
const HAND_DIST_IN_KEY_CAPS = 8;
const LEFT_HAND_SYMBOLS = '`12345qwertasdfgzxcvb'.split('');
const RIGHT_HAND_SYMBOLS = '67890-=yuiop[]\\hjkl;\'nm,./'.split('').concat(['Enter']);
const SHIFTED_LEFT_LETTERS = 'QWERTASDFGZXCVB'.split('');
const SHIFTED_RIGHT_LETTERS = 'YUIOPHJKL:NM<>?'.split('');
const SHIFTED_LETTERS = SHIFTED_LEFT_LETTERS.concat(SHIFTED_RIGHT_LETTERS);

let data;
let key_caps_denominator;

console.log('Reading data sets:');
const DATA_FILES = fs.readdirSync(DATA_DIR);
const DATA_SETS = DATA_FILES.reduce((sets, filename) => {
  console.log(` * ${filename}`);
  return Object.assign(sets, { [filename]: require(`${DATA_DIR}/${filename}`) });
}, {});

console.log("\nAnalyzing the data:");

const results = Object.keys(DATA_SETS).map(filename => {
  console.log(` * ${filename}`);
  return analyzeDataSet(DATA_SETS[filename]);
});

console.log("\nHere's what i've got now:");
results.forEach(prettyPrint)

function prettyPrint(result) {
  let keyboard = "\n"+
  " \` 1 2 3 4 5 6 7 8 9 0 - = \n"+
  "    q w e r t y u i o p [ ] \\ \n"+
  "    a s d f g h j k l ; ' Enter \n"+
  "     z x c v b n m , . / \n"+
  " l-shift              00                 r-shift "
  ;

  result.forEach(entry => {
    keyboard = keyboard.replace(` ${entry.key} `, ` ${zerofy(entry.dist)} `);
  });

  console.log(keyboard);
}

function analyzeDataSet(dataset) {
  data = dataset;

  const left_hand_pos = handPositionWhenPressed(RIGHT_HAND_SYMBOLS, 'x1', 'y1');
  const right_hand_pos = handPositionWhenPressed(LEFT_HAND_SYMBOLS, 'x2', 'y2');

  key_caps_denominator = (right_hand_pos.x - left_hand_pos.x) / HAND_DIST_IN_KEY_CAPS;

  const normal_letter_data = Object.keys(data).reduce((list, key) => {
    if (!SHIFTED_LETTERS.includes(key)) {
      const anchor = LEFT_HAND_SYMBOLS.includes(key) ? left_hand_pos : right_hand_pos;
      const position = avgPosition(key);
      const diff = diffPosition(position, anchor);
      const dist = distance(diff);

      list.push({ key, position, diff, dist });
    }

    return list;
  }, []);

  const left_shift_pos = handPositionWhenPressed(SHIFTED_RIGHT_LETTERS, 'x1', 'y1');
  const right_shift_pos = handPositionWhenPressed(SHIFTED_LEFT_LETTERS, 'x2', 'y2');
  const left_shift_diff = diffPosition(left_shift_pos, left_hand_pos);
  const right_shift_diff = diffPosition(right_shift_pos, right_hand_pos);

  const all_data = normal_letter_data.concat([
    { key: 'l-shift', position: left_shift_pos, diff: left_shift_diff, dist: distance(left_shift_diff) },
    { key: 'r-shift', position: right_shift_pos, diff: right_shift_diff, dist: distance(right_shift_diff) }
  ]);

  return all_data;
}

function zerofy(val) {
  return val > 9 ? val : `0${val}`;
}

function avg(entries) {
  return ~~ (entries.reduce((sum, item) => sum + item, 0) / entries.length);
}

function distance(vector) {
  return Math.round(Math.sqrt(vector.x * vector.x + vector.y * vector.y));
}

function avgPosition(key) {
  const [x, y] = LEFT_HAND_SYMBOLS.includes(key) ? ['x1', 'y1'] : ['x2', 'y2'];
  return { x: avg(data[key][x]), y: avg(data[key][y]) };
}

function toCapSizes(dist) {
  return parseFloat((dist / key_caps_denominator * 10).toFixed(1));
}

function diffPosition(pos1, pos2) {
  return {
    x: toCapSizes(Math.abs(pos1.x - pos2.x)),
    y: toCapSizes(Math.abs(pos1.y - pos2.y))
  };
}

function handPositionWhenPressed(letters=[], x='x1', y='y1') {
  const positions = letters.reduce((sum, key) => {
    if (data[key]) {
      return {
        x: sum.x.concat(data[key][x]),
        y: sum.y.concat(data[key][y])
      };
    }

    return sum;
  }, { x: [], y: [] });

  return {
    x: avg(positions.x),
    y: avg(positions.y)
  };
}
