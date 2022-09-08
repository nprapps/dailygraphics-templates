var d3 = {
  ...require("d3-axis/dist/d3-axis.min"),
  ...require("d3-scale/dist/d3-scale.min"),
  ...require("d3-selection/dist/d3-selection.min"),
  ...require("d3-format/dist/d3-format.min"),
};

var { COLORS, classify, makeTranslate, formatStyle } = require("./lib/helpers");
var { isMobile } = require("./lib/breakpoints");

// Render a bar chart.
module.exports = function (config) {
  // Setup chart container.
  var { labelColumn, valueColumn } = config;

  var numGroups = config.data.length;
  var numGroupBars = config.data[0].values.length;

  // Settings that can be adjusted in the google sheet
  const { labelWidth, axis, numberFormat, roundTicksFactor, ticksX, barLabelPosition, groupLabelPosition } =
    config.options;

  var barHeight = 20;
  var barGapInner = 2;
  var barGap = groupLabelPosition == "above" ? 36 : 10;
  var groupHeight = barHeight * numGroupBars + barGapInner * (numGroupBars - 1);
  var labelMargin = 0;
  var valueGap = 6;

  var formats = {
    regular: d3.format(","),
    "percent rounded": d3.format(".0%"),
    "percent decimal": d3.format("~%"),
    dollar: d3.format("$,"),
  };

  var valueFormat = formats[numberFormat] || formats.dollar;

  var margins = {
    top: groupLabelPosition == "above" ? 20 : 10,
    right: 15,
    bottom: 0,
    left: (groupLabelPosition == "above") & (barLabelPosition == "key") ? 0 : labelWidth + labelMargin,
  };

  // Calculate actual chart dimensions
  var chartWidth = config.width - margins.left - margins.right;
  var chartHeight =
    ((barHeight + barGapInner) * numGroupBars - barGapInner + barGap) * numGroups - barGap + barGapInner;

  // Clear existing graphic (for redraw)
  var containerElement = d3.select(config.container);
  containerElement.html("");

  // Create D3 scale objects.
  var values = config.data.reduce((acc, d) => acc.concat(d.values), []).map((d) => d[valueColumn]);
  var ceilings = values.map((v) => Math.ceil(v / roundTicksFactor) * roundTicksFactor);
  var floors = values.map((v) => Math.floor(v / roundTicksFactor) * roundTicksFactor);
  var min = Math.min(...floors);
  var max = Math.max(...ceilings);

  if (min > 0) {
    min = 0;
  }

  var xScale = d3.scaleLinear().domain([min, max]).range([0, chartWidth]);

  var yScale = d3.scaleLinear().range([chartHeight, 0]);

  var labelList = config.data[0].values.map((d) => d[labelColumn]);

  var colorScale = d3.scaleOrdinal().domain(labelList).range([COLORS.teal2, COLORS.peach2]);

  if (barLabelPosition == "key") {
    // Render a color legend.
    var legend = containerElement
      .append("ul")
      .attr("class", "key")
      .selectAll("g")
      .data(labelList)
      .enter()
      .append("li")
      .attr("class", function (d, i) {
        return `key-item key-${i} ${classify(d)}`;
      });

    legend.append("b").style("background-color", (d) => colorScale(d));
    legend.append("label").text((d) => d);
  }

  if (groupLabelPosition == "above") {
    // Render a color legend.
    var legend = containerElement
      .append("ul")
      .attr("class", "key")
      .style("position", "absolute")
      .selectAll("g")
      .data(config.data)
      .enter()
      .append("li")
      .attr("class", function (d, i) {
        return `key-item key-${i} ${classify(d)}`;
      })
      .style("position", "absolute")
      .style("top", (d, i) => (groupHeight + barGap) * i - 10 + margins.top + "px")
      .style("font-size", "1.2em")
      .style("font-weight", 600)
      .style("font-family", "'Barlow Condensed', Helvetica, Arial, sans-serif");

    legend.append("label").text((d) => d.key);
  }

  // Create the root SVG element.
  var chartWrapper = containerElement.append("div").attr("class", "graphic-wrapper");

  var chartElement = chartWrapper
    .append("svg")
    .attr("width", chartWidth + margins.left + margins.right)
    .attr("height", chartHeight + margins.top + margins.bottom)
    .append("g")
    .attr("transform", `translate(${margins.left},${margins.top})`);

  if (axis == "show") {
    // Create D3 axes.
    var xAxis = d3
      .axisBottom()
      .scale(xScale)
      .ticks(ticksX)
      .tickFormat((d) => valueFormat(d));

    // Render axes to chart.
    chartElement.append("g").attr("class", "x axis").attr("transform", makeTranslate(0, chartHeight)).call(xAxis);

    // Render grid to chart.
    chartElement
      .append("g")
      .attr("class", "x grid")
      .attr("transform", makeTranslate(0, chartHeight))
      .call(xAxis.tickSize(-chartHeight, 0, 0).tickFormat(""));
  }

  // Render bars to chart.
  var barGroups = chartElement
    .selectAll(".bars")
    .data(config.data)
    .enter()
    .append("g")
    .attr("class", "g bars")
    .attr("transform", (d, i) => makeTranslate(0, i ? (groupHeight + barGap) * i : 0));

  barGroups
    .selectAll("rect")
    .data((d) => d.values)
    .enter()
    .append("rect")
    .attr("x", (d) => (d[valueColumn] >= 0 ? xScale(0) : xScale(d[valueColumn])))
    .attr("y", (d, i) => (i ? barHeight * i + barGapInner * i : 0))
    .attr("width", (d) => Math.abs(xScale(0) - xScale(d[valueColumn])))
    .attr("height", barHeight)
    .style("fill", (d) => colorScale(d[labelColumn]))
    .attr("class", (d) => "y-" + d[labelColumn]);

  // Render 0-line.
  if (min < 0) {
    chartElement
      .append("line")
      .attr("class", "zero-line")
      .attr("x1", xScale(0))
      .attr("x2", xScale(0))
      .attr("y1", 0)
      .attr("y2", chartHeight);
  }

  if (groupLabelPosition == "inline") {
    // Render bar labels.
    chartWrapper
      .append("ul")
      .attr("class", "labels")
      .attr(
        "style",
        formatStyle({
          width: labelWidth + "px",
          top: margins.top + "px",
          left: "0",
        })
      )
      .selectAll("li")
      .data(config.data)
      .enter()
      .append("li")
      .attr("style", function (d, i) {
        var top = (groupHeight + barGap) * i;
        if (i == 0) {
          top = 0;
        }
        top = top + barHeight / 2;

        return formatStyle({
          width: labelWidth - 10 + "px",
          height: barHeight + "px",
          left: "0px",
          top: top + "px;",
        });
      })
      .attr("class", (d) => classify(d.key))
      .append("span")
      .text((d) => d.key);
  }

  if (barLabelPosition == "inline") {
    // Render bar labels.
    barGroups
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(labelList)
      .enter()
      .append("text")
      .text((d) => d)
      .attr("x", -labelWidth)
      .attr("y", (d, i) => (i ? barHeight * i + barGapInner * i : 0))
      // .style("text-anchor", "end")
      .attr("dy", barHeight / 2 + 5)
      .style("font-weight", 400)
      .style("fill", COLORS.gray2);
  }

  // Render bar values.
  barGroups
    .append("g")
    .attr("class", "value")
    .selectAll("text")
    .data((d) => d.values)
    .enter()
    .append("text")
    .text((d) => valueFormat(d[valueColumn]))
    .attr("x", (d) => xScale(d[valueColumn]))
    .attr("y", (d, i) => (i ? barHeight * i + barGapInner * i : 0))
    .attr("dx", function (d) {
      var xStart = xScale(d[valueColumn]);
      var textWidth = this.getComputedTextLength();

      // Negative case
      if (d[valueColumn] < 0) {
        var outsideOffset = -(valueGap + textWidth);
        d3.select(this).classed("out", true);
        return outsideOffset;
        // Positive case
      } else {
        d3.select(this).classed("out", true);
        return valueGap;
      }
    })
    .attr("dy", barHeight / 2 + 5);
};
