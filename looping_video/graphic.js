var pym = require("./lib/pym");
var ANALYTICS = require("./lib/analytics");
require("./lib/webfonts");
var { isMobile, isDesktop } = require("./lib/breakpoints");

// Global vars
var videoElement = null;
var btnPause = document.querySelector('button.pause');
var progressElement = document.querySelector(".progress");
var progressInterval = null;

// check if this user has set "prefers reduced motion" in their browser
// https://since1979.dev/respecting-prefers-reduced-motion-with-javascript-and-react/
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

pym.then(child => {
  videoElement = document.querySelector('.player');
  if (btnPause) {
    btnPause.addEventListener('click', playPauseVideo);
  }
  if (progressElement) {
    progressInterval = setInterval(progressLoop);
  }

  var videoSource = VIDEO_SOURCE;

  if (VIDEO_SOURCE_MOBILE) {
    var videoSource = VIDEO_SOURCE_MOBILE;
    if (isDesktop.matches) {
      videoSource = VIDEO_SOURCE;
    }
  }

  videoElement.innerHTML = '<source src="' + MEDIA_BASE_PATH + videoSource + '" type="video/mp4">';

  if (reducedMotion.matches) {
    videoElement.pause();
  }

  // Update iframe
  child.sendHeight();
  window.addEventListener("resize", () => child.sendHeight());
});

var playPauseVideo = function(evt) {
  if (videoElement.paused) {
    videoElement.play();
    this.ariaPressed = false;
  } else {
    videoElement.pause();
    this.ariaPressed = true;
  }
}

var progressLoop = function() {
  if (videoElement.duration) {
    progressElement.value = Math.round(
      (videoElement.currentTime / videoElement.duration) * 100
    );
    // progressElement.innerHTML = Math.round(video.currentTime) + " seconds";
  }
}
