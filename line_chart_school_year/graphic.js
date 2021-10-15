var { Sidechain } = require("@nprapps/sidechain");
Sidechain.registerGuest();

var { isMobile } = require("./lib/breakpoints");

var dataSeries;

var { COLORS, classify, makeTranslate } = require("./lib/helpers");
var d3 = {
  ...require("d3-axis/dist/d3-axis.min"),
  ...require("d3-scale/dist/d3-scale.min"),
  ...require("d3-selection/dist/d3-selection.min"),
  ...require("d3-shape/dist/d3-shape.min"),
  ...require("d3-interpolate/dist/d3-interpolate.min"),
  ...require("d3-collection/dist/d3-collection.min")
};

//Initialize graphic
var onWindowLoaded = function () {
  formatData();
  render();

  window.addEventListener("resize", render);
};

//Format graphic data for processing by D3.
var formatData = function () {
  // Restructure tabular data for easier charting.
  dataSeries = d3
    .nest()
    .key((d) => d.type)
    .entries(DATA);

  console.log(dataSeries);
};

// Render the graphic(s).

var render = function () {
  // Render the chart!
  var container = "#line-chart";
  var element = document.querySelector(container);
  var width = element.offsetWidth;
  renderLineChart({
    container,
    width,
    data: dataSeries
  });
};

// Render a line chart.
var renderLineChart = function (config) {
  // Setup

  var yearColumn = "year";
  var valueColumn = "amt";
  var typeColumn = "type";

  var aspectWidth = isMobile.matches ? 4 : 16;
  var aspectHeight = isMobile.matches ? 3 : 9;

  var margins = {
    top: 5,
    right: 40,
    bottom: 20,
    left: 30
  };

  var ticksX = 4;
  var ticksY = 4;
  var roundTicksFactor = 2;
  var xLeftPadding = 20;
  var yBottomPadding = 10;

  // // Mobile
  // if (isMobile.matches) {
  //   ticksX = 4;
  //   ticksY = 4;
  //   margins.right = 25;
  // }

  // Calculate actual chart dimensions
  var chartWidth = config.width - margins.left - margins.right;
  var chartHeight = Math.ceil((config.width * aspectHeight) / aspectWidth) - margins.top - margins.bottom;

  // Clear existing graphic (for redraw)
  var containerElement = d3.select(config.container);
  containerElement.html("");

  var years = config.data[0].values.map((d) => d.year);

  var xScale = d3
    .scalePoint()
    .domain(years)
    .range([0 + xLeftPadding, chartWidth]);

  var values = config.data.reduce((acc, d) => acc.concat(d.values.map((v) => v[valueColumn])), []);

  console.log(values);

  var floors = values.map((v) => Math.floor(v / roundTicksFactor) * roundTicksFactor);
  var min = Math.min.apply(null, floors);

  if (min > 0) {
    min = 0;
  }

  var ceilings = values.map((v) => Math.ceil(v / roundTicksFactor) * roundTicksFactor);
  console.log("ceilings: " + ceilings);
  var max = Math.max.apply(null, ceilings);

  var yScale = d3
    .scaleLinear()
    .domain([min, max])
    .range([chartHeight - yBottomPadding, 0]);

  var colorScale = d3
    .scaleOrdinal()
    .domain(
      config.data.map(function (d) {
        return d.key;
      })
    )
    .range([COLORS.purple2, COLORS.yellow2, COLORS.blue2, COLORS.teal2, COLORS.peach2, COLORS.gray2]);

  // Render the HTML legend.

  var legend = containerElement
    .append("ul")
    .attr("class", "key")
    .selectAll("g")
    .data(config.data)
    .enter()
    .append("li")
    .attr("class", (d) => "key-item " + classify(d.key));

  legend.append("b").style("background-color", (d) => colorScale(d.key));

  legend.append("label").text((d) => d.key);

  // Create the root SVG element.

  var chartWrapper = containerElement.append("div").attr("class", "graphic-wrapper");

  var chartElement = chartWrapper
    .append("svg")
    .attr("width", chartWidth + margins.left + margins.right)
    .attr("height", chartHeight + margins.top + margins.bottom)
    .append("g")
    .attr("transform", `translate(${margins.left},${margins.top})`);

  // Create D3 axes.

  var xAxis = d3.axisBottom().scale(xScale).ticks(ticksX);

  var yAxis = d3.axisLeft().scale(yScale).ticks(ticksY);

  // Render axes to chart.

  chartElement.append("g").attr("class", "x axis").attr("transform", makeTranslate(0, chartHeight)).call(xAxis);

  chartElement.append("g").attr("class", "y axis").call(yAxis);

  // Render grid to chart.

  var xAxisGrid = function () {
    return xAxis;
  };

  var yAxisGrid = function () {
    return yAxis;
  };

  chartElement
    .append("g")
    .attr("class", "x grid")
    .attr("transform", makeTranslate(0, chartHeight))
    .call(xAxisGrid().tickSize(-chartHeight, 0, 0).tickFormat(""));

  chartElement.append("g").attr("class", "y grid").call(yAxisGrid().tickSize(-chartWidth, 0, 0).tickFormat(""));

  // Render 0 value line.
  if (min < 0) {
    chartElement
      .append("line")
      .attr("class", "zero-line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0));
  }

  // Render lines to chart.
  var line = d3
    .line()
    .x((d) => xScale(d[yearColumn]))
    .y((d) => yScale(d[valueColumn]));

  chartElement
    .append("g")
    .attr("class", "lines")
    .selectAll("path")
    .data(config.data)
    .enter()
    .append("path")
    .attr("class", (d) => "line " + classify(d.key))
    .attr("stroke", (d) => colorScale(d.key))
    .attr("d", (d) => line(d.values));

  console.log(config);

  // Render dots to chart
  chartElement
    .selectAll(".circle-group")
    .data(config.data)
    .enter()
    .append("g")
    .attr("class", "circle-group")
    .selectAll("circle")
    .data((d) => d.values)
    .enter()
    .append("circle")
    .attr("class", (d) => "circle " + classify(d[typeColumn]))
    .attr("cx", (d) => xScale(d[yearColumn]))
    .attr("cy", (d) => yScale(d[valueColumn]))
    .attr("r", 6)
    .style("stroke", "#fff")
    .style("stroke-weight", 1)
    .attr("fill", (d) => colorScale(d[typeColumn]));

  var lastItem = (d) => d.values[d.values.length - 1];

  chartElement
    .append("g")
    .attr("class", "value")
    .selectAll("text")
    .data(config.data)
    .enter()
    .append("text")
    .attr("class", (d) => "text text-" + classify(lastItem(d)[typeColumn]))
    .attr("x", (d) => xScale(lastItem(d)[yearColumn]) + 9)
    .attr("y", (d) => yScale(lastItem(d)[valueColumn]) + 4)
    .text(function (d) {
      var item = lastItem(d);
      var value = item[valueColumn];
      var label = value.toFixed(1);
      return label;
    })
    .style("visibility", "hidden");

  var elements = d3.selectAll(".line,.circle");
  var textElements = d3.selectAll(".text");

  elements.on("mouseover", function (d) {
    var selected = d3.selectAll("." + classify(d.key) + ",." + classify(d[typeColumn]));
    var text = d3.selectAll(".text-" + classify(d.key) + ",.text-" + classify(d[typeColumn]));
    elements.style("opacity", 0.2);
    selected.style("opacity", 1);
    text.style("visibility", "visible");
  });

  elements.on("mouseout", function (d) {
    elements.style("opacity", 1);
    textElements.style("visibility", "hidden");
  });
};

//Initially load the graphic
// (NB: Use window.load to ensure all images have loaded)
window.onload = onWindowLoaded;
