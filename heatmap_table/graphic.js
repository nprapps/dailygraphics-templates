var pym = require("./lib/pym");
require("./lib/webfonts");

pym.then(child => {
    child.sendHeight();
    window.addEventListener("resize", () => child.sendHeight());
});
