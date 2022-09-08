var { Sidechain } = require("@nprapps/sidechain");
Sidechain.registerGuest();

var renderDotChart = require("./renderDotChart");

// Initialize the graphic.
var onWindowLoaded = function () {
  render(window.DATA);
  window.addEventListener("resize", () => render(window.DATA));
};

// Render the graphic(s). Called by pym with the container width.
var render = function (data) {
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
    maxColumn: "max",
  });
};

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
