var pym = require("./lib/pym");
var { isMobile } = require("./lib/breakpoints");
require("./lib/webfonts");

// Global vars
var pymChild = null;
var renderDotChartMultiple = require("./renderDotChartMultiple");

// Initialize the graphic.
var onWindowLoaded = function () {
  if (document.body.classList.contains('promo')) {
    isPromo = true;
  }

  render(window.DATA);
  window.addEventListener("resize", () => render(window.DATA));

  pym.then(child => {
    pymChild = child;
    pymChild.sendHeight();
  });
};

// Render the graphic(s). Called by pym with the container width.
var render = function (data) {
  // Render the chart!
  var container = "#dot-chart-multiple";
  var element = document.querySelector(container);
  element.innerHTML = "";
  var width = element.offsetWidth;

  // draw the charts
  if (isMobile.matches) {
    for (var i = 0; i < data.length; i++) {
      var chartDiv = document.createElement('div');
      chartDiv.className = 'chart chart-' + i;
      element.appendChild(chartDiv);

      // Render the chart!
      renderDotChartMultiple({
        container: container + ' .chart-' + i,
        width,
        data: [data[i]],
        idx: i,
        labelColumn: "label",
        minColumn: "min",
        maxColumn: "max"
      });
    }
  } else {
    // Render the chart!
    renderDotChartMultiple({
      container,
      width,
      data,
      labelColumn: "label_fmt",
      minColumn: "min",
      maxColumn: "max"
    });
  }

  // Update iframe
  if (pymChild) {
    pymChild.sendHeight();
  }
};

/*
* Initially load the graphic
* (NB: Use window.load to ensure all images have loaded)
*/
window.onload = onWindowLoaded;
