var pym = require("./lib/pym");
require("./lib/webfonts");
var { isMobile } = require("./lib/breakpoints");

var onWindowLoaded = function() {
  pym.then(child => {
    child.sendHeight();
    window.addEventListener("resize", () => child.sendHeight());
  });
}

// Initially load the graphic
// wait for images to load. see: https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
window.addEventListener("load", onWindowLoaded);