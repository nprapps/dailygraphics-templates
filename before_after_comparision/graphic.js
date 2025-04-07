var pym = require("./lib/pym");
var ANALYTICS = require("./lib/analytics");
require("./lib/webfonts");
var { isMobile } = require("./lib/breakpoints");

var pymChild = null;
var isMobile = isMobile.matches;
var hasStarted = false;

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
  document.querySelectorAll('.graphic').forEach(function(wrapper) {
    var toggleTimeout;
    var toggleButtons = wrapper.querySelectorAll('.toggle-btn');
    var splitId = toggleButtons[0].getAttribute('id').split('-');

    toggleButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        var parentToggleWrap = button.parentElement;
        parentToggleWrap.classList.add('clicked');
        window.clearTimeout(toggleTimeout);

        splitId = button.getAttribute('id').split('-');

        // select before image by its unique id
        var beforeImage = wrapper.querySelector('#image-' + splitId[1] + '-1');
        
        if (splitId[2] == '1') {
          beforeImage.classList.remove('hidden');
        } else {
          beforeImage.classList.add('hidden');
        }
        
        if (!button.classList.contains('active')) {
          let activeToggleBtn = parentToggleWrap.querySelector('.toggle-btn.active');
          if (activeToggleBtn) {
            activeToggleBtn.classList.remove('active');
          }
          button.classList.add('active');
        }
      });
    });

    var autoToggle = function() {
      var stepList = [2, 1, 2, 1, 2];
      toggleStep(0);

      function toggleStep(step_i) {
        if (step_i < stepList.length) {
          var step = stepList[step_i];

          if (!wrapper.querySelector('.image-toggle').classList.contains('clicked')) {
            // select before image by its unique id
            var beforeImage = wrapper.querySelector('#image-' + splitId[1] + '-1');

            if (step == 1) {
              beforeImage.classList.remove('hidden');
            } else {
              beforeImage.classList.add('hidden');
            }

            let activeToggleBtn = wrapper.querySelector('.toggle-btn.active');
            if (activeToggleBtn) {
                activeToggleBtn.classList.remove('active');
            }
            
            wrapper.querySelector('#toggle-' + splitId[1] + '-' + step).classList.add('active');
            
            toggleTimeout = window.setTimeout(toggleStep, 2000, step_i + 1);
          }
        }
      }
    };

    //start looping through frames once graphic is visible
    var observer = new IntersectionObserver(intersectionCallback, {threshold: 0.25});
    var target = document.querySelector(".target");

    observer.observe(target);
    
    function intersectionCallback(entries, observer){
      entries.forEach(entry=> {
        
        if(entry.isIntersecting){
          //only start animation once
          if(hasStarted) return;

          autoToggle();
          hasStarted = true;
        }
      })
    }
  });
};
/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
