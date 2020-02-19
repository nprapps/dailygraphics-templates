var pym = require("./lib/pym");
require("./lib/webfonts");

// Global vars
var pymChild = null;
var keys, input, div;

var onWindowLoaded = function() {
  keys = Object.keys(DATA[0]);
  div = document.getElementById("table-graphic");
  render();

  window.addEventListener("resize", render);

  pym.then(child => {
    pymChild = child;
    child.sendHeight();
  });

};


var render = function() {

  // Create the table using for each to add rows
  var table = document.createElement("TABLE");
  var header = table.createTHead();
  var body = table.createTBody();
  var headerRow = header.insertRow(0);
  for(i=0; i<keys.length; i++) {
    var cell = headerRow.insertCell(-1);
    cell.innerHTML = keys[i];
  }

  for(i=0; i<DATA.length; i++) {
    var row = body.insertRow(0);
    for(a=0; a<keys.length; a++) {
      var cell = row.insertCell(-1);
      cell.innerHTML = "<span class='mobile mobile-table-header'>"+ keys[a] +": </span>" + DATA[i][keys[a]];
    }
  }

  div.appendChild(table);

  // Update iframe
  if (pymChild) {
    pymChild.sendHeight();
  }

}

window.onload = onWindowLoaded;
