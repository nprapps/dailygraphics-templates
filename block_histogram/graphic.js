var { Sidechain } = require("@nprapps/sidechain");
Sidechain.registerGuest();

var renderBlockHistogram = require("./renderBlockHistogram");

// Initialize the graphic.
var onWindowLoaded = function () {
  var binned = formatData(window.DATA);
  render(binned);

  window.addEventListener("resize", () => render(binned));
};

// Format graphic data for processing by D3.
var formatData = function (data) {
  var numBins = COLOR_BINS.length - 1;
  var binnedData = [];

  // init the bins
  for (var i = 0; i < numBins; i++) {
    binnedData[i] = [];
  }

  // put states in bins
  data.forEach(function (d) {
    if (d.amt != null) {
      var state = d.usps;

      for (var i = 0; i < numBins; i++) {
        if (d.amt >= COLOR_BINS[i] && d.amt < COLOR_BINS[i + 1]) {
          binnedData[i].unshift(state);
          break;
        }
      }
    }
  });

  return binnedData;
};

// Render the graphic(s). Called by pym with the container width.
var render = function (data) {
  // Render the chart!
  var container = "#block-histogram";
  var element = document.querySelector(container);
  var width = element.offsetWidth;
  renderBlockHistogram({
    container,
    width,
    data,
    bins: COLOR_BINS,
    colors: COLOR_RANGE,
    labelColumn: "usps",
    valueColumn: "amt"
  });
};

// Initially load the graphic
// (NB: Use window.load to ensure all images have loaded)
window.onload = onWindowLoaded;
