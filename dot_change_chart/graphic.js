var pym = require("./lib/pym");
var ANALYTICS = require("./lib/analytics");
require("./lib/webfonts");
var { isMobile } = require("./lib/breakpoints");

// Global vars
var pymChild = null;

var d3 = {
  ...require("d3-selection/dist/d3-selection.min"),
  ...require("d3-axis/dist/d3-axis.min"),
  ...require("d3-scale/dist/d3-scale.min")
};

var { makeTranslate, classify, formatStyle } = require("./lib/helpers");

// Initialize the graphic
var onWindowLoaded = function() {
  render();
  window.addEventListener("resize", render);

  pym.then(child => {
    pymChild = child;
    pymChild.sendHeight();

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
  var container = "#dot-chart";
  var element = document.querySelector(container);
  var width = element.offsetWidth;
  renderDotChart({
    container,
    width,
    data: DATA
  });

  // Update iframe
  if (pymChild) {
    pymChild.sendHeight();
  }
};

// Render a bar chart
var renderDotChart = function(config) {
  // Setup
  var labelColumn = "label";
  var startColumn = "start";
  var endColumn = "end";

  var barHeight = 20;
  var barGap = 5;
  var labelWidth = 60;
  var labelMargin = 10;
  var valueMinWidth = 30;
  var dotRadius = 5;

  var margins = {
    top: 0,
    right: 20,
    bottom: 20,
    left: labelWidth + labelMargin
  };

  var ticksX = 4;
  var roundTicksFactor = 5;

  if (isMobile.matches) {
    ticksX = 6;
    margins.right = 30;
  }

  // Calculate actual chart dimensions
  var chartWidth = config.width - margins.left - margins.right;
  var chartHeight = (barHeight + barGap) * config.data.length;

  // Clear existing graphic (for redraw)
  var containerElement = d3.select(config.container);
  containerElement.html("");

  // Create the root SVG element
  var chartWrapper = containerElement
    .append("div")
    .attr("class", "graphic-wrapper");

  var chartElement = chartWrapper
    .append("svg")
    .attr("width", chartWidth + margins.left + margins.right)
    .attr("height", chartHeight + margins.top + margins.bottom)
    .append("g")
    .attr("transform", `translate(${margins.left},${margins.top})`);

  // Create D3 scale objects
  var min = 0;
  var values = config.data.map(d => d[endColumn]);
  var ceilings = values.map(
    v => Math.ceil(v / roundTicksFactor) * roundTicksFactor
  );
  var floors = values.map(
    v => Math.floor(v / roundTicksFactor) * roundTicksFactor
  );
  var max = Math.max(...ceilings);
  var min = 0;

  var xScale = d3
    .scaleLinear()
    .domain([min, max])
    .range([0, chartWidth]);

  // Create D3 axes
  var xAxis = d3
    .axisBottom()
    .scale(xScale)
    .ticks(ticksX)
    .tickFormat(d => d + "%");

  // Render axes to chart
  chartElement
    .append("g")
    .attr("class", "x axis")
    .attr("transform", makeTranslate(0, chartHeight))
    .call(xAxis);

  // Render grid to chart
  var xAxisGrid = function() {
    return xAxis;
  };

  chartElement
    .append("g")
    .attr("class", "x grid")
    .attr("transform", makeTranslate(0, chartHeight))
    .call(
      xAxisGrid()
        .tickSize(-chartHeight, 0, 0)
        .tickFormat("")
    );

  // Render range bars to chart
  chartElement
    .append("g")
    .attr("class", "bars")
    .selectAll("line")
    .data(config.data)
    .enter()
    .append("line")
    .attr("x1", d => xScale(d[startColumn]))
    .attr("x2", d => xScale(d[endColumn]))
    .attr("y1", (d, i) => i * (barHeight + barGap) + barHeight / 2)
    .attr("y2", (d, i) => i * (barHeight + barGap) + barHeight / 2);

  // Render start dots to chart
  chartElement
    .append("g")
    .attr("class", "dots start-dots")
    .selectAll("circle")
    .data(config.data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d[startColumn]))
    .attr("cy", (d, i) => i * (barHeight + barGap) + barHeight / 2)
    .attr("r", dotRadius);

  // Render end dots to chart
  chartElement
    .append("g")
    .attr("class", "dots end-dots")
    .selectAll("circle")
    .data(config.data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d[endColumn]))
    .attr("cy", (d, i) => i * (barHeight + barGap) + barHeight / 2)
    .attr("r", dotRadius);


  // Render bar labels
  ["shadow", "text-label"].forEach(function(cls) {
    chartElement
      .append("g")
      .attr("class", cls)
      .selectAll("text")
      .data(config.data)
      .enter()
      .append("text")
      .attr("x", d => xScale(d[startColumn]) - 8)
      .attr("y", (d, i) => i * (barHeight + barGap) + barHeight / 2 + 4)
      .text(d => d[labelColumn]);
  });
};

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
