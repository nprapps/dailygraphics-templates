var pym = require("./lib/pym");
require("./lib/webfonts");

// If sortable:
// window.Tablesort = require("tablesort");
// require("tablesort/dist/sorts/tablesort.number");
// Tablesort(document.querySelector("#state-table"))

var onWindowLoaded = function () {
  pym.then(child => {
    child.sendHeight();
    window.addEventListener("resize", () => child.sendHeight());
  });
}

// Initially load the graphic
// wait for images to load. see: https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
window.addEventListener("load", onWindowLoaded);