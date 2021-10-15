var { Sidechain } = require("@nprapps/sidechain");
Sidechain.registerGuest();

var comma = require("./lib/helpers/fmtComma");
// If sortable:
window.Tablesort = require("tablesort");
require("tablesort/dist/sorts/tablesort.number.min");

// Global vars
var pymChild = null;
var input, table;

var onWindowLoaded = function () {
  table = document.getElementById("table-graphic");
  render();

  window.addEventListener("resize", render);
};

var render = function () {
  table.innerHTML = "";

  // Insert table content
  var header = table.createTHead();
  var body = table.createTBody();
  var headerRow = header.insertRow(0);
  DATA_HEADERS.forEach(function (d) {
    var cell = document.createElement("th");
    cell.innerHTML = d.label;
    cell.classList.add("columheader");
    cell.classList.add(d.format);
    cell.setAttribute("width", d.width);
    if (d.sort == "yes") {
      cell.classList.add("sortheader");
      cell.innerHTML +=
        '<div class="sorter"><div class="arrow-up">&#9650;</div><div class="arrow-down">&#9660;</div></div>';
    }
    headerRow.appendChild(cell);
  });
  for (i = 0; i < DATA.length; i++) {
    var row = body.insertRow(-1);
    for (a = 0; a < DATA_HEADERS.length; a++) {
      var cell = row.insertCell(-1);
      cell.setAttribute("width", DATA_HEADERS[a].width);
      cell.setAttribute("data-title", DATA_HEADERS[a].label);
      cell.classList.add(DATA_HEADERS[a].format);
      if (DATA_HEADERS[a].format == "number") {
        cell.innerHTML = comma(DATA[i][DATA_HEADERS[a].label]);
      } else if (DATA_HEADERS[a].format == "dollars") {
        cell.innerHTML = "$" + comma(DATA[i][DATA_HEADERS[a].label]);
      } else if (DATA_HEADERS[a].format == "percent") {
        cell.innerHTML = Math.round(DATA[i][DATA_HEADERS[a].label] * 100) + "%";
      } else {
        cell.innerHTML = DATA[i][DATA_HEADERS[a].label];
      }
    }
  }

  Tablesort(document.querySelector("#table-graphic"));
};

window.onload = onWindowLoaded;
