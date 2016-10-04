const video = document.querySelector('#video');
const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');

const colors = new tracking.ColorTracker('yellow');
const rectToPoint = rect => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2
})
let points;

colors.on('track', event => {
  if (event.data.length === 2) {
    const p1 = rectToPoint(event.data[0]);
    const p2 = rectToPoint(event.data[0]);

    points = p1.x < p2.x ? { left: p1, right: p2 } : { left: p2, right: p1 };
  }
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < event.data.length; i++) {
    const rect = event.data[i];

    context.strokeStyle = rect.color;
    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    context.font = '10px Helvetica';
    context.fillStyle = "#fff";
    context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
    context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
  }
});

tracking.track(video, colors);

let data = [];

document.addEventListener("keypress", event => {
  data.push({key: event.key, left: points.left, right: points.right });
  console.log(event.key, points.left, points.right);
})

const startVideoStream = sourceId => {
  navigator.getUserMedia(
    {
      audio: false,
      video: {
        optional: [
          { sourceId },
          { width: { max: 640 } },
          { height: { max: 480 } },
          { frameRate: { max: 5 } },
          { aspectRation: 1.5 }
        ]
      }
    },
    stream => video.src = URL.createObjectURL(stream),
    error => console.log('failed', error)
  );
};

navigator.mediaDevices.enumerateDevices().then(list => {
  for (const device of list) {
    if (device.kind === "videoinput" && device.label.includes("USB")) {
      startVideoStream(device.deviceId);
    }
  }
});
