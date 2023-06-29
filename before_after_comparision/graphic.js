var pym = require("./lib/pym");
var ANALYTICS = require("./lib/analytics");
require("./lib/webfonts");
var {
  isMobile
} = require("./lib/breakpoints");

var pymChild = null;
var isMobile = isMobile.matches;
var toggleTimeout;

/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
  pym.then(function(child) {
    pymChild = child;
    child.sendHeight();
    window.addEventListener("resize", render);
  });

  initUI();
}

/*
 * Render the graphic.
 */
var render = function() {
  // Update iframe
  if (pymChild) {
    pymChild.sendHeight();
  }
}

var initUI = function() {
  autoToggle();

  document.querySelectorAll('.toggle-btn').forEach((element) => element.addEventListener('click', onToggleClicked));
};

var onToggleClicked = function() {
  document.querySelector('#image-toggle').classList.add('clicked');
  window.clearTimeout(toggleTimeout);

  if (this.getAttribute('id') == 'toggle-1') {
    document.querySelector('.image-1').classList.remove('hidden');
  } else {
    document.querySelector('.image-1').classList.add('hidden');
  }
  
  if (!this.classList.contains('active')) {
    let activeToggleBtn = document.querySelector('.toggle-btn.active');
    if (activeToggleBtn) {
      activeToggleBtn.classList.remove('active');
    }
    this.classList.add('active');
  }
}

var autoToggle = function() {
  var toggleWrap = document.querySelector('#image-toggle');

  var stepList = [2, 1, 2, 1, 2];
  toggleStep(0);

  function toggleStep(step_i) {
    if (step_i < stepList.length) {
      var step = stepList[step_i];

      // Don't auto-toggle if someone has clicked
      if (!toggleWrap.classList.contains('clicked')) {
        if (step == 1) {
            document.querySelector('.image-1').classList.remove('hidden');
        } else {
            document.querySelector('.image-1').classList.add('hidden');
        }
    
        let activeToggleBtn = document.querySelector('.toggle-btn.active');
        if (activeToggleBtn) {
            activeToggleBtn.classList.remove('active');
        }
        
        document.querySelector('#toggle-' + step).classList.add('active');
        
        toggleTimeout = window.setTimeout(toggleStep, 2000, step_i + 1);
      }
    }
  }
};

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
