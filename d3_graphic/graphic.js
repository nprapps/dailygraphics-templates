var { Sidechain } = require("@nprapps/sidechain");
Sidechain.registerGuest();

var d3 = {
  ...require("d3-array/dist/d3-array.min"),
  ...require("d3-axis/dist/d3-axis.min"),
  ...require("d3-scale/dist/d3-scale.min"),
  ...require("d3-selection/dist/d3-selection.min")
};

var render = function () {
  var containerElement = document.querySelector(".graphic");
  //remove fallback
  containerElement.innerHTML = "";
  var containerWidth = containerElement.offsetWidth;

  var container = d3.select(containerSelector);
  var svg = container.append("svg");

  //run your D3 functions here
};

//first render
render();
