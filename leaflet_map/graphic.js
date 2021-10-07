var { Sidechain } = require("@nprapps/sidechain");
Sidechain.registerGuest();

var { isMobile } = require("./lib/breakpoints");
var L = require('leaflet/dist/leaflet.js');
var COLORS = require("./lib/helpers/colors.js");
// var d3 = {
//   ...require("d3-selection/dist/d3-selection.min"),
//   ...require("d3-array/dist/d3-array.min")
// };
var d3 = require("d3");



// Initialize the graphic.
var onWindowLoaded = function() {
  render();
};

// Render the graphic(s).
var render = function() {
  // Render the chart!
  var container = "#map";
  var element = document.querySelector(container);
  var width = element.offsetWidth;
  renderMap({
    container,
    width,
    data: DATA
  });
};

// Render map.
var renderMap = function(config) {

  var data = config.data;

  // Clear existing graphic (for redraw)
  var containerElement = d3.select("#key");
  containerElement.html("");

  var labels = d3.map(data, function(d){return d.type;}).keys();
  var color = d3.scaleOrdinal()
    .domain(labels)
    .range([COLORS.blue1, COLORS.red1, /** if more than two, add additional colors here **/]);

  var legend = containerElement
    .append("ul")
    .attr("class", "key")
    .selectAll("g")
    .data(labels)
    .enter()
    .append("li")
    .attr('class','key-item');

  legend.append("b").style("background-color", d => color(d));
  legend.append("label").text(d => d);

  // Basemap options
  var base = {
    'Empty': L.tileLayer(''),
    'OpenStreetMap': L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      'attribution': 'Map data &copy; OpenStreetMap contributors'}),
    'Wikimedia': L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
    	'attribution': '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>'}),

  }

  // Set up the map
  var map = L.map('map', {
    'layers':[base.Wikimedia],
    zoomControl:false
  });
  map.setView([LATITUDE, LONGITUDE], ZOOM);
  // map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();

  // Add circle markers
  for (var i = 0; i < data.length; i++) {
			circle = new L.circleMarker([data[i].latitude,data[i].longitude], {
        fillColor: color(data[i].type),
        fillOpacity: 1,
        radius: 8,
        stroke: true,
        color: COLORS.gray1,
        weight: 2
      })
				.bindPopup('<strong>' + data[i].name + '</strong></br> [Insert label]: ' + data[i].value + '</br> [Insert label]: ' + data[i].type)
        .on('mouseover',function(d) {
          this.openPopup();
        })
        .addTo(map);
		}


}



/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
