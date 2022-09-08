var { isMobile } = require("./lib/breakpoints");

var { COLORS, makeTranslate, classify, formatStyle } = require("./lib/helpers");

var d3 = {
  ...require("d3-axis/dist/d3-axis.min"),
  ...require("d3-scale/dist/d3-scale.min"),
  ...require("d3-selection/dist/d3-selection.min"),
  ...require("d3-format/dist/d3-format.min"),
};

// Render a bar chart.
var renderBarChart = function (config) {
  // Setup
  var { labelColumn, valueColumn } = config;

  var barHeight = 20;
  var barGap = 5;
  var labelMargin = 8;
  var valueGap = 6;

  // Setting that can be adjusted in the google sheet
  const labelWidth = config.options.label_width;
  const axis = config.options.axis;
  const f = config.options.number_format;
  const roundTicksFactor = config.options.round_ticks_factor;
  const ticksX = config.options.ticks_x;
  const highlight = config.data.map((d) => d.highlight).includes("highlight");
  const annotationLabel = config.options.annotation_label;
  const annotationLabelAlign = config.options.annotation_label_align;
  const annotationValue = config.options.annotation_value;
  const annotationRangeMin = config.options.annotation_range_min;
  const annotationRangeMax = config.options.annotation_range_max;

  var valueFormat;

  if (f == "regular") {
    valueFormat = d3.format(",");
  } else if (f == "percent rounded") {
    valueFormat = d3.format(".0%");
  } else if (f == "percent decimal") {
    valueFormat = d3.format("~%");
  } else {
    valueFormat = d3.format("$,");
  }

  var floors = config.data.map((d) => Math.floor(d[valueColumn] / roundTicksFactor) * roundTicksFactor);

  var min = Math.min.apply(null, floors);
  if (min > 0) {
    min = 0;
  }

  var ceilings = config.data.map((d) => Math.ceil(d[valueColumn] / roundTicksFactor) * roundTicksFactor);

  var max = Math.max.apply(null, ceilings);
  if (max < 0) {
    max = 0;
  }

  var margins = {
    top: annotationLabel ? 22 : 0,
    right: max == 0 ? labelWidth + labelMargin : 24,
    bottom: 20,
    left: max == 0 ? 15 : labelWidth + labelMargin,
  };

  // Calculate actual chart dimensions
  var chartWidth = config.width - margins.left - margins.right;
  var chartHeight = (barHeight + barGap) * config.data.length;

  // Clear existing graphic (for redraw)
  var containerElement = d3.select(config.container);
  containerElement.html("");

  // Create the root SVG element.
  var chartWrapper = containerElement
    .append("div")
    .attr("class", highlight == true ? "graphic-wrapper highlight" : "graphic-wrapper");

  var chartElement = chartWrapper
    .append("svg")
    .attr("width", chartWidth + margins.left + margins.right)
    .attr("height", chartHeight + margins.top + margins.bottom)
    .append("g")
    .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

  // Create D3 scale objects.
  var xScale = d3.scaleLinear().domain([min, max]).range([0, chartWidth]);

  if (axis == "show") {
    // Create D3 axes.
    var xAxis = d3
      .axisBottom()
      .scale(xScale)
      .ticks(ticksX)
      .tickFormat(function (d) {
        return valueFormat(d);
      });

    // Render axes to chart.
    chartElement.append("g").attr("class", "x axis").attr("transform", makeTranslate(0, chartHeight)).call(xAxis);

    // Render grid to chart.
    chartElement
      .append("g")
      .attr("class", "x grid")
      .attr("transform", makeTranslate(0, chartHeight))
      .call(xAxis.tickSize(-chartHeight, 0, 0).tickFormat(""));
  }

  //Render bars to chart.
  chartElement
    .append("g")
    .attr("class", "bars")
    .selectAll("rect")
    .data(config.data)
    .enter()
    .append("rect")
    .attr("x", (d) => (d[valueColumn] >= 0 ? xScale(0) : xScale(d[valueColumn])))
    .attr("width", (d) => Math.abs(xScale(0) - xScale(d[valueColumn])))
    .attr("y", (d, i) => i * (barHeight + barGap))
    .attr("height", barHeight)
    .attr("class", (d, i) =>
      d.highlight ? `bar-${i} ${classify(d[labelColumn])} highlight` : `bar-${i} ${classify(d[labelColumn])}`
    );

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

  // Render annotation
  if (annotationValue) {
    chartElement
      .append("line")
      .attr("class", "annotation-line")
      .attr("x1", xScale(annotationValue))
      .attr("x2", xScale(annotationValue))
      .attr("y1", -20)
      .attr("y2", chartHeight + 6)
      .style("stroke", COLORS.gray1)
      .style("stroke-width", 1)
      .style("stroke-dasharray", 2);
  }

  if (annotationRangeMin) {
    chartElement
      .append("rect")
      .attr("class", "annotation-range")
      .attr("x", xScale(annotationRangeMin))
      .attr("width", Math.abs(xScale(annotationRangeMax) - xScale(annotationRangeMin)))
      .attr("y", -20)
      .attr("height", chartHeight + 26)
      .style("fill", COLORS.gray3)
      .style("opacity", 0.5);
  }

  if (annotationLabel !== undefined && annotationValue !== undefined) {
    chartElement
      .append("text")
      .attr("class", "annotation-label")
      .text(annotationLabel + ": " + valueFormat(annotationValue))
      .attr("x", annotationLabelAlign == "left" ? xScale(annotationValue) + 6 : xScale(annotationValue) - 6)
      .attr("y", -6)
      .style("text-anchor", annotationLabelAlign == "left" ? "start" : "end");
  }

  if (annotationLabel !== undefined && annotationRangeMin !== undefined) {
    chartElement
      .append("text")
      .attr("class", "annotation-label")
      .text(annotationLabel + ": " + valueFormat(annotationRangeMin) + "-" + valueFormat(annotationRangeMax))
      .attr("x", annotationLabelAlign == "left" ? xScale(annotationRangeMax) + 6 : xScale(annotationRangeMin) - 6)
      .attr("y", -6)
      .style("text-anchor", annotationLabelAlign == "left" ? "start" : "end");
  }

  // Render bar labels.
  chartWrapper
    .append("ul")
    .attr("class", "labels")
    .attr(
      "style",
      formatStyle({
        width: labelWidth + "px",
        top: margins.top + "px",
        left: max == 0 ? chartWidth + margins.left + labelMargin + "px" : "0",
      })
    )
    .selectAll("li")
    .data(config.data)
    .enter()
    .append("li")
    .attr("style", function (d, i) {
      return formatStyle({
        width: labelWidth + "px",
        height: barHeight + "px",
        left: "0px",
        top: i * (barHeight + barGap) + "px",
      });
    })
    .attr("class", function (d) {
      return max == 0 ? classify(d[labelColumn]) + " reverse" : classify(d[labelColumn]);
    })
    .append("span")
    .text((d) => d[labelColumn]);

  // Render bar values.
  chartElement
    .append("g")
    .attr("class", "value")
    .selectAll("text")
    .data(config.data)
    .enter()
    .append("text")
    .attr("class", (d) => (d.highlight ? "highlight" : ""))
    .text((d) => valueFormat(d[valueColumn]))
    .attr("x", (d) => xScale(d[valueColumn]))
    .attr("y", (d, i) => i * (barHeight + barGap))
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

module.exports = renderBarChart;
