var pym = require("./lib/pym");
var { classify } = require("./lib/helpers");

//Initialize graphic
var onWindowLoaded = function() {
  var races = [...new Set(CANDIDATES.map(candidate => candidate.race))];

  races.forEach(function(d) {
    var select = classify(d);
    var element = document.getElementById(select+"-select");
    element.onclick = switchRace;
  });

  switchRace(classify(races[0]));

  pym.then(child => {
      child.sendHeight();
      window.addEventListener("resize", () => child.sendHeight());
  });
};

var switchRace = function(e) {
  var race;
  if(e.target) {
    race = e.target.dataset.message;
  } else {
    race = e;
  }
  var buttonsAll = document.querySelector(".select-race.active");
  if (buttonsAll !== null) { buttonsAll.classList.remove("active") };
  var button = document.getElementById(race+"-select");
  button.classList.add("active");
  var groupsAll = document.querySelectorAll(".answer-group");
  var groupsSelected = document.querySelectorAll("."+race);
  for (var i = 0; i < groupsAll.length; i++) {
    groupsAll[i].classList.remove("active");
  }
  for (var i = 0; i < groupsSelected.length; i++) {
    groupsSelected[i].classList.add("active");
  }

  // Update iframe
  pym.then(child => {
      child.sendHeight();
  });
}


//Initially load the graphic
// (NB: Use window.load to ensure all images have loaded)
window.onload = onWindowLoaded;
