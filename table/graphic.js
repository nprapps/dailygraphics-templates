var pym = require("./lib/pym");
require("./lib/webfonts");

// If sortable:
window.Tablesort = require("tablesort");
require("tablesort/dist/sorts/tablesort.number.min");
Tablesort(document.querySelector("#state-table"));
document.querySelectorAll('th').forEach(function(header) { header.classList.add('sort-header') });


pym.then(child => {
    child.sendHeight();
    window.addEventListener("resize", () => child.sendHeight());
});
