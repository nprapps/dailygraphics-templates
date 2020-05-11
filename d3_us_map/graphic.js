var pym = require('./lib/pym');
var ANALYTICS = require('./lib/analytics');
require('./lib/webfonts');
var { isMobile } = require('./lib/breakpoints');
var $ = require('./lib/qsa');

console.clear();

var { getTimeStamp, arrayToObject, isPlural, getData, updateTime, geoAlbersUsaPr } = require("./util");

var disableTooltips = false;
var maxTooltipWidth = 125;
var includeCounties = false;

var pymChild;

var {
  COLORS,
  getAPMonth,
  classify,
  makeTranslate,
  wrapText,
  fmtComma,
} = require('./lib/helpers');

var colorScheme = [COLORS.blue1, COLORS.blue2, COLORS.blue3, COLORS.blue4, COLORS.blue5];

var d3 = {
  ...require('d3-array/dist/d3-array.min'),
  ...require('d3-axis/dist/d3-axis.min'),
  ...require('d3-scale/dist/d3-scale.min'),
  ...require('d3-selection/dist/d3-selection.min'),
  ...require('d3-geo/dist/d3-geo.min'),
};

// combineData
var combineDataMap = function (data, states, counties) {
  // join DATA to geo_data
  if (includeCounties) {
    for (var feature of counties.objects.tl_2017_us_county.geometries) {
      var matchingData = data.find(itmInner => itmInner.county_id === feature.properties.GEOID);
      feature.properties = {...matchingData, ...feature.properties}
    }
    return topojson.feature(counties, counties.objects.tl_2017_us_county);

  } else {
    for (var feature of states.objects.ne_50m_admin_1_states_provinces.geometries) {
      var matchingData = data.find(itmInner => itmInner.state_name === feature.properties.name);
      feature.properties = {...matchingData, ...feature.properties}
    }
    return topojson.feature(states, states.objects.ne_50m_admin_1_states_provinces);
  }
};

var getCounties = async function () {
  if (!includeCounties) {
    return null;
  }
  var response = await fetch('./assets/counties-topo.json');
  return response.json();
};

//Initialize graphic
var getStates = async function () {
  var response = await fetch('./assets/states_topo.json');
  return response.json();
};

var onWindowLoaded = async function () {
  // replace "csv" to load from a different source
  // var geoStates = await Promise.resolve(getGeo());
  var [states, counties] = await Promise.all([getStates(), getCounties()]);
  
  var geoData = combineDataMap(includeCounties ? COUNTIES : STATES, states, counties)

  states = topojson.feature(states, states.objects.ne_50m_admin_1_states_provinces)
  render(geoData, states);

  window.addEventListener('resize', () => render(geoData, states));

  pym.then(child => {
    pymChild = child;
    child.sendHeight();
  });
};

var render = function (data, states) {
  var container = '#map-container';
  var element = document.querySelector(container);
  var width = element.offsetWidth;

  renderMap(
    {
      container,
      width,
      data,
    },
    includeCounties ? 'data' : 'category',
    states,
  );

  // Update iframe
  if (pymChild) {
    pymChild.sendHeight();
  }
};

var renderMap = function (config, mainProperty, states) {
  var aspectWidth = isMobile.matches ? 4 : 16;
  var aspectHeight = isMobile.matches ? 2.6 : 9;

  var leftLabelMargin = -5;
  var rightLabelMargin = 5;
  var topLabelMargin = 10;

  var margins = {
    top: 30,
    right: 0,
    bottom: 10,
    left: 0,
  };

  var nameProperty = includeCounties ? 'NAMELSAD' : 'state_name';

  // Calculate actual chart dimensions
  var chartWidth = config.width - margins.left - margins.right;
  var chartHeight =
    Math.ceil((config.width * aspectHeight) / aspectWidth) -
    margins.top -
    margins.bottom;

  // Clear existing graphic (for redraw)
  var containerElement = d3.select(config.container);
  containerElement.html('');

  // Create param functions like projection, scales, etc. TKTK
  var projection = geoAlbersUsaPr()
    .translate([chartWidth / 2, chartHeight / 2]) // translate to center of screen
    .scale(config.width + 100); // scale things down so see entire US

  var path = d3.geoPath().projection(projection);

  var values = config.data.features
    .map(d => d.properties[mainProperty] || 0);
  var max = Math.max(...values); // set me manually 
  var min = Math.min(...values);

  renderLegend(config.container, min, max);

  // Create legend TKTK

  // Create the root SVG element.
  var chartWrapper = containerElement
    .append('div')
    .attr('class', 'graphic-wrapper');

  var chartElement = chartWrapper
    .append('svg')
    .attr('width', chartWidth + margins.left + margins.right)
    .attr('height', chartHeight + margins.top + margins.bottom)
    .append('g')
    .attr('transform', `translate(${margins.left},${margins.top})`);

    // add in tooltip for individual state display.
  var tooltip = d3
    .select('#map-container')
    .append('div')
    .attr('id', 'tooltip')
    .style('position', 'absolute')
    .style('z-index', '10')
    .style('visibility', 'hidden')
    .style('background', '#fff')
    .text('');
  var mainTooltipLabel = tooltip.append('div').attr('class', 'label main');
  var secondaryTooltipLabel = tooltip.append('div').attr('class', 'label secondary');

  // Render Map!
  // states or counties depending on includeCounties bool
  chartElement
    .selectAll('.district')
    .data(
      config.data.features
    )
    .enter()
    .append('path')
    .attr('class', 'district')
    .attr("fill", function(d) {
        var percent = d.properties[mainProperty];
        return getFill(percent/max);
      })
    .attr('d', path)
    .attr('stroke', function (d) {
      if (includeCounties) {
        return 'none';
      }
      return '#e6e6e6';
    })
    .on('mousemove', function (d) {
      // Don't do tooltips on mobile.
      if (isMobile.matches || disableTooltips) {
        return;
      }

      // Update labels here
      mainTooltipLabel.text(d.properties[nameProperty]);
      secondaryTooltipLabel.text(d.properties[mainProperty]);


      // Set tooltip positions. If tooltip too far to the right, move
      // to lefthand side of state.
      var coordinates= d3.mouse(this);
      var x = coordinates[0];
      var y = coordinates[1];
      
      tooltip.style('top', y + 5 + 'px');

      var element = tooltip.node();
      var tooltipWidth = element.getBoundingClientRect().width;
      var offset = x + 5;
      if (offset >= chartWidth - maxTooltipWidth) {
        offset = x - 5 - tooltipWidth;
      }
      tooltip.style('left', offset + 'px');

      return tooltip.style('visibility', 'visible');
    })
    .on('mouseout', function () {
      return tooltip.style('visibility', 'hidden');
    });

    // Add in state outlines if include counties is true
  
    if (includeCounties) {
      console.log(states.features)
      chartElement
      .selectAll('.states')
      .data(
        states.features
      )
      .enter()
      .append('path')
      .attr('class', 'states')
      .attr('stroke', '#efefef')
      .attr('d', path)
      .attr('fill', 'none')
    }
};

var renderLegend = function(container, min, max) {
  var containerElement = d3.select('body');

  var categories;
  if (LABELS.legend_labels && LABELS.legend_labels !== "") {
    // If custom legend labels are specified
    categories = LABELS.legend_labels.split("|").map(l => Number(l.trim()));
  } else {
    //try to calculate categories
  }

  // Create legend
  var legendWrapper = containerElement.select(".key-wrap");
  var legendElement = containerElement.select(".key");
  legendElement.html("");

  var colorScale;
  legendWrapper.classed("numeric-scale", true);

  var colorScale = d3
    .scaleThreshold()
    .domain(categories)
    .range([
      "#000", // color that's not actually being used
      COLORS.blue5,
      COLORS.blue4,
      COLORS.blue3,
      COLORS.blue2,
      COLORS.blue1
    ]);

  colorScale.domain().forEach(function(key, i) {
    var keyItem = legendElement.append("li").classed("key-item", true);

    keyItem.append("b").style("background", colorScale(key));

    var keyVal = Number(key);

    keyItem.append("label").text(fmtComma(keyVal));

    // Add the optional upper bound label on numeric scale
    if (i == categories.length - 1) {
      if (LABELS.max_label && LABELS.max_label !== "") {
        keyItem
          .append("label")
          .attr("class", "end-label")
          .text(LABELS.max_label);
      }
    }
  });
}

function getFill(percent) {
  var index = Math.floor((colorScheme.length-1) * percent);
  if (!index || index < 0 || index > colorScheme.length-1) {
    return '#ddd';
  }
  return colorScheme[index];
}

function getLabelText(data, label, prop, overrideProp) {
  var number =
    data[overrideProp] > data[prop] ? data[overrideProp] : data[prop];

  return `${fmtComma(number)} ${label}${isPlural(number)}`;
}

// Gets the center for an geography.
function getCenter(d, projection) {
  var center = projection(d3.geoCentroid(d));

  // Add necessary special casing here.
  return center;
}

//Initially load the graphic
// (NB: Use window.load to ensure all images have loaded)
window.onload = onWindowLoaded;