var pym = require("./lib/pym");
require("./lib/webfonts");

// Global vars
var pymChild = null;
var renderDotChart = require("./renderDotChart");

// Initialize the graphic.
var onWindowLoaded = function() {
  render(window.DATA);
  window.addEventListener("resize", () => render(window.DATA));

  pym.then(child => {
    pymChild = child;
    pymChild.sendHeight();
  });
};

// Render the graphic(s). Called by pym with the container width.
var render = function(data) {
  // Render the chart!
  var container = "#dot-chart";
  var element = document.querySelector(container);
  var width = element.offsetWidth;
  renderDotChart({
    container,
    width,
    data,
    labelColumn: "label",
    valueColumn: "amt",
    minColumn: "min",
    maxColumn: "max"
  });

  // Update iframe
  if (pymChild) {
    pymChild.sendHeight();
  }
};

// Initially load the graphic
// wait for images to load. see: https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
window.addEventListener("load", onWindowLoaded);