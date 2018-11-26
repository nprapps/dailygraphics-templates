module.exports = new Promise(ok => {
  var url = "https://pym.nprapps.org/pym.v1.min.js";
  var script = document.createElement("script");
  script.src = url;
  document.head.appendChild(script);

  script.onload = () => ok(new pym.Child());
});