const video = document.getElementById('video');

navigator.getUserMedia(
  { video: true },
  stream => video.src = URL.createObjectURL(stream),
  error => console.log('failed', error)
);
