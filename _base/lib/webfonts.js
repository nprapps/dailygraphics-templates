var url = "https://apps.npr.org/dailygraphics/graphics/fonts/js/lib/webfont.js";
var script = document.createElement("script");
script.src = url;
document.head.appendChild(script);
script.onload = function() {
  WebFont.load({
      google: {
          families: ['Source Sans Pro:Light,Regular,Bold']
      },
      timeout: 10000
  });
};
