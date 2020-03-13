var pym = require("./pym");
var pymChild = null;

function autocomplete(inp, arr) {

  pym.then(child => {
    pymChild = child;
    child.sendHeight();
  });

  // Autocomplete args are text field element and array of possible values
  var currentFocus;
  // Call function when someone writes in the text field
  inp.addEventListener("input", function(e) {
    var a, b, i, val = this.value;
    // Close already open lists of autocomplete values
    closeAllLists();
    if (!val) { return false; }
    currentFocus = -1;
    // Create DIV that will contain the items
    a = document.createElement("Div");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");

    // Append DIV element as a child of the autocomplete container
    this.parentNode.appendChild(a);
    for (i=0; i<arr.length; i++) {
      // Check if the item includes the same letters as the text value
      if (arr[i].toUpperCase().includes(val.toUpperCase())) {
        // Create a DIV for each matching element
        b = document.createElement("Div");
        // Make matching letters bold
        b.innerHTML = arr[i].substr(0, arr[i].toUpperCase().indexOf(val.toUpperCase()));
        b.innerHTML += "<strong>" + arr[i].substr(arr[i].toUpperCase().indexOf(val.toUpperCase()), val.length) + "</strong>";
        b.innerHTML += arr[i].substr((arr[i].toUpperCase().indexOf(val.toUpperCase()) + val.length), arr[i].length);
        // Insert input field that will hold the current array item's value
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        // Execute function when clicking on the item value
        b.addEventListener("click",function(e) {
          inp.value = this.getElementsByTagName("input")[0].value;
          // Close list of autocompleted values
          closeAllLists();
        });
        a.appendChild(b);
      }
      // Update iframe
      if (pymChild) {
        pymChild.sendHeight();
      }
    }
  });
  // Execute function with keyboard presses
  inp.addEventListener("keydown",function(e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      // If arrow down is pressed, increase currentFocus variable
      currentFocus++;
      // And make the current item more visible
      addActive(x);
    } else if (e.keyCode == 38) {
      // If arrow up is pressed, decrease currentFocus variable
      currentFocus--;
      // And make current item more visible
      addActive(x);
    } else if (e.keyCode == 13) {
      if (currentFocus > -1) {
        // Simulate click on active item
        if (x) x[currentFocus].click();
        inp.value = x[currentFocus].getElementsByTagName("input")[0].value;
      }
    }
  });
  function addActive(x) {
    // Classify an item as active
    if (!x) return false;
    // Remove active class on all items
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    // Add active class
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    // Remove active class
    for (var i=0; i<x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    // Close all autocomplete lists except the current one
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i=0; i<x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  document.addEventListener("click",function(e) {
    closeAllLists(e.target);
  });
}

module.exports =  {
  autocomplete: autocomplete
};
