require("./lib/webfonts");
var autocomplete = require("./lib/autocomplete");
var autocomplete = autocomplete.autocomplete;
var classify = require("./lib/helpers/classify");
// If sortable:
window.Tablesort = require("tablesort");
require("tablesort/dist/sorts/tablesort.number.min");
Tablesort(document.querySelector("#table-graphic"));

// Global vars
var names = [];
var input, table, keys, val, table;
var start = 0;
var end = 10;

var onWindowLoaded = function() {
  getSearchNames();
  input = document.getElementById("userSearch");
  table = document.getElementById("table-graphic");
  keys = Object.keys(DATA[0]);
  renderTable();
  updateTable(start, end);
  autocomplete(input, names);
  input.addEventListener("change", lookup);
  Tablesort(document.querySelector("#table-graphic"));
};

//Format graphic data for processing by D3.
var getSearchNames = function() {
  DATA.forEach(function(d) {
    names.push(d[SEARCH_FIELD])
  });
  names = [... new Set(names)];
};

var renderTable = function() {
  var header = table.createTHead();
  body = table.createTBody();
  var headerRow = header.insertRow(0);
  DATA_HEADERS.forEach(function(d) {
    var cell = document.createElement("th");
    cell.innerHTML = d.label;
    cell.classList.add("columheader");
    cell.setAttribute("width",d.width);
    if(d.sort == "yes") {
      cell.classList.add("sortheader");
      cell.innerHTML += '<div class="sorter"><div class="arrow-up">&#9650;</div><div class="arrow-down">&#9660;</div></div>';
    }
    headerRow.appendChild(cell);
  });
  // for(i=0; i<keys.length; i++) {
  //   var cell = document.createElement("th");
  //   cell.innerHTML = keys[i];
  //   headerRow.appendChild(cell);
  // }
  body.addEventListener('scroll', function (event) {
    if (body.scrollTop + 390 >= body.scrollHeight - 20) {
      if (DATA.length - start >= 1) {
        console.log("update");
        start = start + 10;
        end = end + 10;
        updateTable(start, end)
      }
    }
});
}

var updateTable = function(start, end) {
  for(i=start; i<end; i++) {
    if (DATA[i]) {
      var row = body.insertRow(-1);
      for(a=0; a<keys.length; a++) {
        var cell = row.insertCell(-1);
        cell.innerHTML = "<span class='mobile mobile-table-header'>"+ keys[a] +": </span>" + DATA[i][keys[a]];
      }
    }
  }
}

var lookup = function() {
  setTimeout(function() {
    if(val) {
      console.log(val);
      var row = document.querySelector('.' + classify(val));
      row.classList.remove("shadedrow");
    }
    val = input.value;
    if(val) {
      var row = document.querySelector('.' + classify(val));
      row.classList.add("shadedrow")
      row.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
      });
    } else {
      document.querySelectorAll('.row')[0].scrollIntoView(true);
    }
  }, 300);
}


//Initially load the graphic
// (NB: Use window.load to ensure all images have loaded)
window.onload = onWindowLoaded;
