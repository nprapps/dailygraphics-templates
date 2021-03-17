var d3 = {
  ...require("d3-shape/dist/d3-shape.min")
};

var pym = require("./lib/pym");
require("./lib/webfonts");

var pymChild;
var renderAreaChart = require("./renderAreaChart");

//Initialize graphic
var onWindowLoaded = function() {
  var series = formatData(window.DATA);
  render(series);

  window.addEventListener("resize", () => render(series));

  pym.then(child => {
    pymChild = child;
    child.sendHeight();
  });
};

//Format graphic data for processing by D3.
var formatData = function(data) {
  data.forEach(function(d) {
    if (d.date instanceof Date) return;
    var [m, day, y] = d.date.split("/").map(Number);
    y = y > 50 ? 1900 + y : 2000 + y;
    d.date = new Date(y, m - 1, day);
    
    let total_amount = 0;    
    for (item in d) {
      if (item != "date") {
        total_amount += +d[item];  
      }
    }
    d.total_amount = total_amount;
  });

  // Restructure tabular data for easier charting.
  var dataKeys = Object.keys(data[0]);  
  var removeItems = ["date","total_amount"];
  for (var i = 0; i < removeItems.length; i++) {

    let index = dataKeys.indexOf(removeItems[i]);
    if (index > -1) {
      dataKeys.splice(index,1)
    }
  }

  var stackedData = d3.stack().keys(dataKeys)(data);  

  return stackedData;
};

// Render the graphic(s). Called by pym with the container width.
var render = function(data) {
  // Render the chart!
  var container = "#stacked-area-chart";
  var element = document.querySelector(container);
  var width = element.offsetWidth;
  renderAreaChart({
    container,
    width,
    data,
    dateColumn: "date",
    valueColumn: "amt"
  });

  // Update iframe
  if (pymChild) {
    pymChild.sendHeight();
  }
};

//Initially load the graphic
// (NB: Use window.load to ensure all images have loaded)
window.onload = onWindowLoaded;
