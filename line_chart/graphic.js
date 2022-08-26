var { Sidechain } = require("@nprapps/sidechain");
Sidechain.registerGuest();

var renderLineChart = require("./renderLineChart");

//Initialize graphic
var onWindowLoaded = function () {
  var series = formatData(window.DATA);
  render(series);

  window.addEventListener("resize", () => render(series));
};

//Format graphic data for processing by D3.
var formatData = function (data) {
  var series = [];

  data.forEach(function (d) {
    if (d.date instanceof Date) return;
    var [m, day, y] = d.date.split("/").map(Number);
    y = y > 50 ? 1900 + y : 2000 + y;
    d.date = new Date(y, m - 1, day);
  });

  // Restructure tabular data for easier charting.
  for (var column in data[0]) {
    if (column == "date") continue;

    series.push({
      name: column,
      values: data.map((d) => ({
        date: d.date,
        amt: d[column]
      }))
    });
  }

  return series;
};

// Render the graphic(s). Called by pym with the container width.
var render = function (data) {
  // Render the chart!
  var container = "#line-chart";
  var element = document.querySelector(container);
  var width = element.offsetWidth;
  renderLineChart({
    container,
    width,
    data,
    dateColumn: "date",
    valueColumn: "amt"
  });

  // replace the above code with the following lines for small multiples
  
  // var outer = document.querySelector("#line-chart");
  // outer.classList.add("small-multiple");
  // for (var series of data) {
  //   var container = document.querySelector(`[data-series="${series.name}"]`);
  //   if (!container) {
  //     container = document.createElement("div");
  //     container.dataset.series = series.name;
  //     var inner = document.createElement("div");
  //     inner.className = "chart";
  //     var head = document.createElement("h3");
  //     head.append(series.name);
  //     inner.append(head, container);
  //     outer.append(inner);
  //   }
  //   var width = container.offsetWidth;
  //   renderLineChart({
  //     container,
  //     width,
  //     data: [series],
  //     dateColumn: "date",
  //     valueColumn: "amt"
  //   });
  // }

};

document.querySelector(".fallback").remove();

//Initially load the graphic
// (NB: Use window.load to ensure all images have loaded)
window.onload = onWindowLoaded;
