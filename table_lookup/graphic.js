var pym = require("./lib/pym");
require("./lib/webfonts");
var autocomplete = require("./lib/autocomplete");
var autocomplete = autocomplete.autocomplete;

// Global vars
var pymChild = null;
var names = [];
var keys, input, div, error, table, body;

var onWindowLoaded = function() {
  getSearchNames();
  keys = Object.keys(DATA[0]);
  form = document.getElementById("userSearchForm");
  input = document.getElementById("userSearch");
  div = document.getElementById("table-graphic");
  error = document.getElementById("input-error");
  autocomplete(input, names);

  // Create the table using for each to add rows
  table = document.createElement("TABLE");
  body = table.createTBody();
  var header = table.createTHead();
  var headerRow = header.insertRow(0);
  for(i=0; i<keys.length; i++) {
    var cell = headerRow.insertCell(-1);
    cell.innerHTML = keys[i];
  }
  div.appendChild(table);


  render();
  form.addEventListener("submit", render);
  input.addEventListener("change", render);
  window.addEventListener("resize", render);

  pym.then(child => {
    pymChild = child;
    child.sendHeight();
  });

};

//Format graphic data for processing by D3.
var getSearchNames = function() {
  DATA.forEach(function(d) {
    names.push(d[SEARCH_FIELD])
  });
  names = [... new Set(names)];
};

var render = function(e) {

  if(e) {
    if(e.type == "submit") {
      e.preventDefault();
    }
  }

  setTimeout(function() {
    val = input.value;
    if(val != "") {
      filter = DATA.filter(d => d[SEARCH_FIELD].toUpperCase() == val.toUpperCase());
      if(filter[0]) {
        body.innerHTML = "";
        error.innerHTML = "";
        for(i=0; i<filter.length; i++) {
          var row = body.insertRow(0);
          for(a=0; a<keys.length; a++) {
            var cell = row.insertCell(-1);
            cell.setAttribute("data-title",keys[a])
            cell.innerHTML = filter[i][keys[a]];
          }
        }
        table.classList.remove("hide");
      } else {
        table.classList.add("hide");
        error.innerHTML = "Hmm we couldn't find that. Try searching something else.";
      }
    } else {
      if(DEFAULT) {
        filter = DATA.filter(d => d[SEARCH_FIELD].toUpperCase() == DEFAULT.toUpperCase());
        body.innerHTML = "";
        error.innerHTML = "";
        for(i=0; i<filter.length; i++) {
          var row = body.insertRow(0);
          for(a=0; a<keys.length; a++) {
            var cell = row.insertCell(-1);
            cell.setAttribute("data-title",keys[a])
            cell.innerHTML = filter[i][keys[a]];
          }
        }
        table.classList.remove("hide");
      } else {
        table.classList.add("hide");
        error.innerHTML = "";
      }
    }

    // Update iframe
    if (pymChild) {
      pymChild.sendHeight();
    }

  }, 100);

  // Update iframe
  if (pymChild) {
    pymChild.sendHeight();
  }

}


//Initially load the graphic
// (NB: Use window.load to ensure all images have loaded)
window.onload = onWindowLoaded;
