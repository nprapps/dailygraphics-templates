var pym = require("./lib/pym");
var ANALYTICS = require("./lib/analytics");
require("./lib/webfonts");

// If sortable:
// window.Tablesort = require("tablesort");
// require("tablesort/dist/sorts/tablesort.number.min");
// Tablesort(document.querySelector("#state-table"))

pym.then(child => {
    pymChild = child;
    child.sendHeight();

    pymChild.onMessage("on-screen", function(bucket) {
        ANALYTICS.trackEvent("on-screen", bucket);
    });
    pymChild.onMessage("scroll-depth", function(data) {
        data = JSON.parse(data);
        ANALYTICS.trackEvent("scroll-depth", data.percent, data.seconds);
    });

    window.addEventListener("resize", () => child.sendHeight());
});
