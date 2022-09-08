var { Sidechain } = require("@nprapps/sidechain");
Sidechain.registerGuest();

var skipLabels = ["Group", "key", "values"];
var renderGroupedBarChart = require("./renderGroupedBars");

// Initialize the graphic.
var onWindowLoaded = function () {
  var data = formatData(window.DATA);
  var options = window.OPTIONS;
  render(data, options);

  window.addEventListener("resize", () => render(data, options));
};

// Format graphic data for processing by D3.
var formatData = function (data) {
  var output = data.map(function (d) {
    var series = {
      key: d.Group,
      values: [],
    };

    for (var [k, v] of Object.entries(d)) {
      if (skipLabels.indexOf(k) > -1) {
        continue;
      }

      series.values.push({
        label: k,
        amt: Number(v),
      });
    }

    return series;
  });

  return output;
};

// Render the graphic(s).
var render = function (data, options) {
  // Render the chart!
  var container = "#grouped-bar-chart";
  var element = document.querySelector(container);
  var width = element.offsetWidth;
  renderGroupedBarChart({
    container,
    width,
    data,
    options,
    labelColumn: "label",
    valueColumn: "amt",
  });
};

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
