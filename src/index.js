const video = document.querySelector('#video');
const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');

navigator.getUserMedia(
  { video: true },
  stream => video.src = URL.createObjectURL(stream),
  error => console.log('failed', error)
);

const colors = new tracking.ColorTracker('yellow');

colors.on('track', event => {
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
