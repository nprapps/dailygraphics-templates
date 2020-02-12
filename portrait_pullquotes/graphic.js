var pym = require("./lib/pym");
require("./lib/webfonts");
var { isMobile } = require("./lib/breakpoints");

pym.then(child => {
    child.sendHeight();
    window.addEventListener("resize", () => child.sendHeight());
});
