// Global vars
var pym = require("./lib/pym");
var ANALYTICS = require("./lib/analytics");
require("./lib/webfonts");
var { isMobile } = require("./lib/breakpoints");

var pymChild;

var { COLORS, makeTranslate, classify, formatStyle } = require("./lib/helpers");

var d3 = {
  ...require("d3-axis/dist/d3-axis.min"),
  ...require("d3-scale/dist/d3-scale.min"),
  ...require("d3-selection/dist/d3-selection.min"),
  ...require("d3-shape/dist/d3-shape.min")
};

// Initialize the graphic.
var onWindowLoaded = function() {
  render();

  window.addEventListener("resize", render);

  pym.then(child => {
    pymChild = child;
    child.sendHeight();

    pymChild.onMessage("on-screen", function(bucket) {
      ANALYTICS.trackEvent("on-screen", bucket);
    });
    pymChild.onMessage("scroll-depth", function(data) {
      data = JSON.parse(data);
      ANALYTICS.trackEvent("scroll-depth", data.percent, data.seconds);
    });
  });
};

// Render the graphic(s). Called by pym with the container width.
var render = function() {
  // Render the chart!
  var container = "#pie-chart";
  var element = document.querySelector(container);
  var width = element.offsetWidth;

  renderPieChart({
    container,
    width,
    data: DATA
  });

  // Update iframe
  if (pymChild) {
    pymChild.sendHeight();
  }
};

// Render a pie chart
var renderPieChart = function(config) {
  // Setup
  var labelColumn = "label";
  var valueColumn = "amt";

  var r = config.width/3;

  var margins = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  };

  // Calculate actual chart dimensions
  var chartWidth = config.width - margins.left - margins.right;
  var chartHeight = config.width - margins.left - margins.right;

  // Clear existing graphic (for redraw)
  var containerElement = d3.select(config.container);
  containerElement.html("");

  // Create the root SVG element.
  var chartWrapper = containerElement
    .append("div")
    .attr("class", "graphic-wrapper");

  var chartElement = chartWrapper
    .append("svg")
    .attr("width", chartWidth + margins.left + margins.right)
    .attr("height", chartHeight + margins.top + margins.bottom)
    .append("g")
    .attr("transform", "translate(" + chartWidth/2 + "," + chartHeight/2 + ")");

  // Create <path> elements
  // Change the inner radius to make a donut
  var arc = d3.arc().outerRadius(r).innerRadius(0);


  // Create arc data for us given a list of values
  var pie = d3.pie().value(function(d){ return d[valueColumn]; });

  console.log(pie(config.data));

  var arcs = chartElement.selectAll(".slice")
      .data(pie(config.data))
      .enter()
      .append("g")
      .attr("class", "slice");

  arcs.append("path")
    // .attr("fill", function(d, i) { return color(i); } )
    .attr("fill", "#eee")
    .attr("stroke","#fff")
    .attr("stroke-width",2)
    .attr("d", arc);

  arcs.append("text")
    .attr("transform", function(d) {
    //we have to make sure to set these before calling arc.centroid
    d.innerRadius = 0;
    d.outerRadius = r;
    //this gives us a pair of coordinates like [50, 50]
    return "translate(" + arc.centroid(d) + ")";
  })
  //center the text on it's origin
  .attr("text-anchor", "middle")
  .text(function(d, i) { return d.data[valueColumn]; })
  .attr('fill','black');



  // **** ADD A KEY, SWAP THE LABEL WITH THE DATA AMT, UPDATE THE COLORS ****

};

// Initially load the graphic
window.onload = onWindowLoaded;
