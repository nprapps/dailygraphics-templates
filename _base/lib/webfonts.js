var url = "https://apps.npr.org/dailygraphics/graphics/fonts/js/lib/webfont.js";
var script = document.createElement("script");
script.src = url;
document.head.appendChild(script);
script.onload = function () {
  WebFont.load({
    custom: {
      families: [
        'NPRSans:n4,n9,i4,i9',
        'NPRSerif:n4,n7,i4,i7'
      ],
      urls: [
        'https://s.npr.org/templates/css/fonts/NPRSans.css',
        'https://s.npr.org/templates/css/fonts/NPRSerif.css'
      ]
    },
    timeout: 10000
  });
};