var url = "https://apps.npr.org/dailygraphics/graphics/fonts/js/lib/webfont.js";
var script = document.createElement("script");
script.src = url;
document.head.appendChild(script);
script.onload = function() {
  WebFont.load({
      custom: {
          families: [
              'Source Sans Pro'
              // 'Gotham SSm:n4,n7',
              // 'Knockout 31 4r:n4'
          ],
          urls: [
              // 'https://s.npr.org/templates/css/fonts/GothamSSm.css',
              // 'https://s.npr.org/templates/css/fonts/Knockout.css'
              'https://fonts.googleapis.com/css?family=Source+Sans+Pro'
          ]
      },
      timeout: 10000
  });
};
