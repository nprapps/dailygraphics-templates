var topojson = require("topojson-client/dist/topojson-client.min");

require("@nprapps/autocomplete-input");
require("./lib/webfonts");

var pym = require("./lib/pym");
var ANALYTICS = require("./lib/analytics");
var { isMobile } = require("./lib/breakpoints");
var $ = require("./lib/qsa");
var dot = require("./lib/dot");
var { geoAlbersUsaPr, capitalizeFirstLetter, getCenter } = require("./util");
var { COLORS, classify } = require("./lib/helpers");

var d3 = {
  ...require("d3-array/dist/d3-array.min"),
  ...require("d3-axis/dist/d3-axis.min"),
  ...require("d3-zoom/dist/d3-zoom.min"),
  ...require("d3-scale/dist/d3-scale.min"),
  ...require("d3-selection/dist/d3-selection.min"),
  ...require("d3-geo/dist/d3-geo.min"),
};

console.clear();

// Global vars
var colorScale;
var pymChild;

// Graphic config
var showTooltips = true;
var maxTooltipWidth = 125;
var colorScheme = [
  COLORS.teal6,
  COLORS.teal5,
  COLORS.teal4,
  COLORS.teal3,
  COLORS.teal2,
  COLORS.teal1,
];

// Format graphic data.
var formatData = function(sheetData, geoData) {
  let countyGeoData = geoData.objects["counties-lakes"];
  let stateGeoData = geoData.objects["states"];

  // Merge county geometries and sheet data
  countyGeoData.geometries.forEach((feature) => {
    let fips = feature.properties.GEOID;
    
    // Get data from sheet
    let matchedRow = sheetData.find(row => String(row.fips) == fips) || {}
    
    // Get county and state metadata from lookups
    let countyData = window.COUNTY_LOOKUP.find(row => String(row.fips) == fips);
    let stateData = window.STATE_LOOKUP.find(row => String(row.fips) == fips.slice(0,2));

    // Merge geojson, sheet, lookup data
    feature.properties = {
      // Add properties from geojson
      ...feature.properties,

      // Add properties from sheet
      ...matchedRow,

      // Add data from lookup
      fips: fips,
      county: countyData.county_name,
      state: stateData.state_abbreviation,
      
      // Add rows to the search results for this county.
      // (These will appear below the search box.)
      // Keys = table column labels, values = column values
      searchResults: matchedRow && matchedRow.value != null 
        ? [
        {
          'County': countyData.county_name,
          'State':  stateData.state_abbreviation,
          'FIPS code': fips,
          'Value': matchedRow.value,
        }
      ] : '',
    };
  })

  // Filter/hide any states from the map here.
  let statesToFilter = [
    // "HI",
    // "AK",
    // "PR",
  ]
  countyGeoData.geometries = countyGeoData.geometries.filter(feature => {
    return (!statesToFilter.includes(feature.properties.state))
  })

  // Turn geometries into feature collections.
  let counties = topojson.feature(geoData, countyGeoData);
  let states = topojson.feature(geoData, stateGeoData);

  return {
    counties,
    states
  }
};

var onWindowLoaded = async function () {

  // Load geojson data
  var getGeodata = async function () {
    var response = await fetch(`./topo/counties-lakes-states.json`);
    var geoData = await response.json();
    return geoData;
  };
  getGeodata().then(geoData => {

    // Format sheet data
    let formattedData = formatData(window.DATA, geoData);
    
    // Setup search box listeners
    var searchBox = $.one("#search-input");
    searchBox.addEventListener("change", function (e) {
      let fips = e.target.entries[e.target.selectedIndex].value || null;
      let countyClass = getCountyClass(fips, formattedData);
      let countyEl = $.one(".district." + countyClass);
      countyEl.dispatchEvent(new Event('select'));
    });

    // Render graphic
    render(formattedData);
  
    // Rerender if window is resized
    var lastWidth = window.innerWidth;
    window.addEventListener("resize", () => {
      if (window.innerWidth != lastWidth) {
        lastWidth = window.innerWidth;
        render(formattedData)
      }
    });
  });

  // Update iframe
  pym.then(child => {
    pymChild = child;
    child.sendHeight();
  });
};

var render = function (data) {
  var container = "#county-map";
  var colorScheme = colorScheme;
  var valueColumn = "value";
  var isNumeric = window.LABELS.is_numeric;
  
  var categories = [];
  if (window.LABELS.legend_labels && window.LABELS.legend_labels !== "") {
    // If custom legend labels are specified
    categories = window.LABELS.legend_labels.split("|").map(l => l.trim());
    if (isNumeric) {
      categories.forEach(function(d,i) {
        categories[i] = Number(categories[i]);
      });
    }
  } else {
    // Default: Return sorted array of categories
    data.counties.features.forEach(function(feature) {
      if (feature.properties[valueColumn] != null) {
        categories.push(feature.properties[valueColumn]);
      }
    });
    //dedupe
    categories = Array.from(new Set(categories)).sort();
  }

  renderCountyMap({
    data: {
      counties: data.counties,
      states: data.states
    },
    categories,
    container,
    colorScheme,
    valueColumn,
    isNumeric,
  });

  // Update iframe
  if (pymChild) {
    pymChild.sendHeight();
  }
};

var renderCountyMap = function (config) {
  let mainProperty = config.valueColumn;
  var aspectWidth = isMobile.matches ? 4 : 16;
  var aspectHeight = isMobile.matches ? 2.6 : 10;

  var margins = {
    top: 30,
    right: 0,
    bottom: 0,
    left: 0,
  };

  // Clear existing graphic (for redraw)
  var containerElement = d3.select(config.container).select("#map");
  var width = containerElement.node().offsetWidth;
  containerElement.html("");

  // Calculate actual chart dimensions
  var chartWidth = width - margins.left - margins.right;
  var chartHeight = Math.ceil((width * aspectHeight) / aspectWidth) - margins.top - margins.bottom;

  // Create param functions like projection, scales, etc.
  var scaleIncrease = isMobile.matches ? 135 : 155;
  var projection = geoAlbersUsaPr()
    .translate([chartWidth / 2, chartHeight / 2.5]) // Translate to center of screen
    .scale(width + scaleIncrease); // Scale things down so we can see the whole thing

  var path = d3.geoPath().projection(projection);

  var categories = config.categories;
  colorScale = d3
    .scaleThreshold()
    .domain(categories)
    .range(colorScheme);

  // Create the root SVG element.
  var chartWrapper = containerElement
    .append("div")
    .attr("class", "graphic-wrapper");

  var chartElement = chartWrapper
    .append("svg")
    .attr("width", chartWidth + margins.left + margins.right)
    .attr("height", chartHeight + margins.top + margins.bottom)
    .append("g")
    .attr("transform", `translate(${margins.left},${margins.top})`);

  // Legend
  var legendWrapper = d3.select(".key-wrapper");
  var legendElement = d3.select(".key");
  if (config.isNumeric) {
    legendWrapper.classed("numeric-scale", true);
  }
  legendElement.html("");
  colorScale.domain().forEach(function (key, index) {
    var keyItem = legendElement
      .append("li")
      .attr("class", `key-item ${classify(key)}`);
    keyItem.append("b").style("background", colorScale(key.toString()));
    keyItem.append("label").text(`${capitalizeFirstLetter(key.toString())}`);

    // Add the optional upper bound label on numeric scale
    if (config.isNumeric && index == categories.length - 1) {
      if (window.LABELS.max_label && window.LABELS.max_label !== "") {
        keyItem
          .append("label")
          .attr("class", "end-label")
          .text(window.LABELS.max_label);
      }
    }
  });

  // Tooltip
  var tooltip = containerElement
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "#fff")
    .text("");
  var mainTooltipLabel = tooltip
    .append("div")
    .attr("class", "label main");
  var secondaryTooltipLabel = tooltip
    .append("div")
    .attr("class", "label secondary");

  //  Helper: render a tooltip for a given FIPS code
  var renderTooltip = (fips) => {
    if (!showTooltips) { return; }
    
    let d = config.data.counties.features.find(row => row.properties.fips == fips)
    
    // Set tooltip labels.
    let mainTooltipLabelHtml = `${d.properties.county}, ${d.properties.state}`
    let secondaryTooltipLabelHtml = '';
    if (d.properties[mainProperty] != null) {
      secondaryTooltipLabelHtml += `${capitalizeFirstLetter(mainProperty)}: <span class="${config.isNumeric ? '' : d.properties[mainProperty]}">${d.properties[mainProperty]}</span>`;
    } else {
      secondaryTooltipLabelHtml = "No data";
    }
    mainTooltipLabel.html(mainTooltipLabelHtml);
    secondaryTooltipLabel.html(secondaryTooltipLabelHtml);

    // Set tooltip positions. 
    var coordinates = getCenter(d, projection);
    if (!coordinates) {
      return
    }
    var x = coordinates[0];
    var y = coordinates[1];
    tooltip.style("top", y + 5 + "px");
    
    // If tooltip too far to the right, 
    // move to lefthand side of state.
    var tooltipEl = tooltip.node();
    var tooltipWidth = tooltipEl.getBoundingClientRect().width;
    var offset = x + 10;
    if (offset >= chartWidth - maxTooltipWidth) {
      offset = x - 10 - tooltipWidth;
    }
    tooltip.style("left", offset + "px");

    // Set tooltip visibility.
    tooltip.style("visibility", "visible");
  }

  // Render Map!
  chartElement
    .selectAll(".district")
    .data(config.data.counties.features)
    .enter()
    .append("path")
    .attr("class", function (d) {
      let countyClass = getCountyClass(d.properties.fips, config.data);
      return `district ${countyClass}`
    })
    .attr("fill", function (d) {
      return colorScale(d.properties[mainProperty]) || '#e8e8e8';
    })
    .attr("d", path)
    .attr("stroke-width", ".5px")
    .on("mousemove", function (d) {
      if (isMobile.matches) { return; } 
      this.classList.add("highlight");
      renderTooltip(d.properties.fips);
    })
    .on("mouseout", function (d) {
      if (isMobile.matches) { return; } 
      this.classList.remove("highlight");
      tooltip.style("visibility", "hidden");
    })
    // Custom 'select' event called when selected from dropdown
    .on("select", function(d) {
      let highlighted = $(".highlight");
      let searchBox = $.one('#search-input');
      let fips = d.properties.fips;

      // Clear all existing highlighted counties.
      highlighted.forEach((el) => {
        el.classList.remove("highlight");
      })

      // Highlight this county.
      this.classList.add("highlight")

      // Set selected county in the search box.
      let match = searchBox.entries.find(entry => entry.value == fips)
      if (match) {
        searchBox.selectedIndex = match.index
        searchBox.value = match.label
      }

      // Populate results table.
      let countyData = config.data.counties.features.find(row => row.properties.fips == fips)
      if (countyData) {
        let searchResults = countyData.properties.searchResults
        let template = dot.compile(require("./_results-table.html"));
        if (searchResults) {
          d3.select(".no-data-msg").classed("is-hidden", true);
          d3.select("#results").html(
            template({ data: searchResults })
          );
        } else {
          d3.select(".no-data-msg").classed("is-hidden", false);
          d3.select("#results").html(
            template({ data: null })
          );
        }
      }

      // Scroll to header
      if (pymChild) {
        pymChild.scrollParentToChildEl("search-hed");
      }

      // Resize pym
      if (pymChild) {
        pymChild.sendHeight();
      }

      // Render the tooltip.
      renderTooltip(fips);
    })
    ;

  // Add state outlines
  chartElement
    .selectAll(".states")
    .data(config.data.states.features)
    .enter()
    .append("path")
    .attr("class", "states")
    .attr("stroke", "#fff")
    .attr("d", path)
    .attr("fill", "none");
};

// Helper: get county class
var getCountyClass = (fips, data) => {
  let countyData = data.counties.features.find(row => row.properties.fips == fips)
  if (countyData) {
    var county = classify(countyData.properties.county);
    var state = classify(countyData.properties.state);
    return `${county}-${state}`;
  } else {
    return ''
  }
}

// Initially load the graphic
// (NB: Use window.load to ensure all images have loaded)
window.onload = onWindowLoaded;
