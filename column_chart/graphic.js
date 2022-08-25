var { Sidechain } = require("@nprapps/sidechain");
Sidechain.registerGuest();

var renderColumnChart = require("./renderColumnChart");

// Initialize the graphic.
var onWindowLoaded = function () {
  render(window.DATA);

  window.addEventListener("resize", () => render(window.DATA));
};

// Render the graphic(s)
var render = function (data) {
  // Render the chart!
  var container = "#column-chart";
  var element = document.querySelector(container);
  var width = element.offsetWidth;
  renderColumnChart({
    container,
    width,
    data,
    labelColumn: "label",
    valueColumn: "amt"
  });

  // in case of small multiples:
  // add a "category" column to your data
  // then swap in the following code instead

  // /* create grouped data by categories */
  // var categories = new Set(data.map(d => d.category));
  // var grouped = Object.fromEntries([...categories].map(c => [c, []]));
  // for (var d of data) {
  //   grouped[d.category].push(d);
  // }
  // /* select the outer container and remove the fallback */
  // var outer = document.querySelector("#column-chart");
  // outer.classList.add("small-multiples");
  // var fallback = outer.querySelector(".fallback");
  // if (fallback) fallback.remove();
  // for (var c of categories) {
  //   var container = document.querySelector(`[data-multiple="${c}"]`);
  //   /* create chart containers/headers if they don't exist */
  //   if (!container) {
  //     var inner = document.createElement("div");
  //     var head = document.createElement("h3");
  //     head.append(c);
  //     container = document.createElement("div");
  //     container.dataset.multiple = c;
  //     inner.append(head, container);
  //     outer.append(inner);
  //   }
  //   /* render to the inner container */
  //   var width = container.offsetWidth;
  //   renderColumnChart({
  //     container,
  //     width,
  //     data: grouped[c],
  //     labelColumn: "label",
  //     valueColumn: "amt"
  //   })
  // }
};

//Initially load the graphic
window.onload = onWindowLoaded;
