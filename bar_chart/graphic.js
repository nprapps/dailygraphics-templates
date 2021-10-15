var { Sidechain } = require("@nprapps/sidechain");
Sidechain.registerGuest();
var renderBarChart = require("./renderBars");

// Initialize the graphic.
var onWindowLoaded = function () {
  var data = window.DATA;
  var options = window.OPTIONS;
  render(data, options);

  window.addEventListener("resize", () => render(data, options));
};

// Render the graphic(s). Called by pym with the container width.
var render = function (data, options) {
  // Render the chart!
  var container = "#bar-chart";
  var element = document.querySelector(container);
  var width = element.offsetWidth;
  renderBarChart({
    container,
    width,
    data,
    options,
    labelColumn: "label",
    valueColumn: "amt"
  });
};

// Initially load the graphic
window.onload = onWindowLoaded;
