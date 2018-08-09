//foldDown("about-menu");

initializeNavMenus();

//initialize event listeners on navigation menus
function initializeNavMenus(){
  navMenus = document.querySelectorAll(".nav-menu");
  for (let i = 0; i < navMenus.length; i++){
    //only put the animation on menus with more than one button
    let navMenu = navMenus[i];
    //give navMenu an "open" property, indicating if the meny is opened
    navMenu.open = false;
    //give navMenu an "animating" property, so a new animation can't start until the old one is done
    navMenu.animating = false;

    navChildren = navMenu.children;
    if (navChildren.length > 1){
      //listen for clicks on the menu
      navMenu.addEventListener("click", function(event){
        if (!navMenu.animating){
          if (!navMenu.open){
            fold("down", navMenu.id);
          }
          else {
            fold("up", navMenu.id);
          }
        }
      });
      //listen for losing focus
      navMenu.addEventListener("focusout", function(event){
        if (navMenu.open){
          fold("up", navMenu.id);
        }
      });
    }
  }
}

//fold a navMenu up or down
function fold(direction, navMenuID){
  //this function loops through all nav-buttons in this navMenu after the first,
  //and slides them down into view one by one
  var navMenu = document.querySelector(`#${navMenuID}`);
  navMenu.animating = true;
  var buttons = document.querySelectorAll(`#${navMenuID} .nav-button`);
  buttons[0].style.zIndex = 10;
  //sliding begins at the second button if folding down, or last button if folding up
  var i = (direction == "down") ? 1 : buttons.length-1;
  //the whole animation should finish in 500ms, so determine the duration of each step
  var duration = 500 / (buttons.length - 1);
  //start sliding
  slide(buttons[i], duration);

  function slide(button, duration){
    //this function slides a single button up or down by its own height
    var start = null;
    var dir = {
      "down" : 1,
      "up" : -1
    }[direction];
    window.requestAnimationFrame(function animate(time){
      //when animation of this button starts:
      if (!start) {
        start = time;
        button.style.zIndex = 10 - i; //lower buttons go in the back
        let topOffset = (dir == 1) ? i-1 : i;
        button.style.top = topOffset * button.clientHeight + "px"; //position the button behind where the last one stopped
        
      }
      var progress = (time - start) / duration;
      //make sure progress doesn't exceed 1
      progress = (progress > 1) ? 1 : progress;
      //update button's transform
      button.style.transform = `translateY(${dir * progress * 100}%)`;
      //update opacity
      button.style.opacity = (dir == 1) ? progress : 1 - progress;
      //if animation isn't finished, request another frame
      if (progress < 1){
        window.requestAnimationFrame(animate);
      } else {
        //if animation is complete, start sliding the next button
        i += dir;
        if (i > 0 && i < buttons.length){
          //reset the value of start
          start = null;
          slide(buttons[i], duration);
        } else {
          //if full menu folding is complete, change navMenu.open flag
          navMenu.animating = false;
          navMenu.open = (dir == 1);
        }
      }
    });
  }

}

//precompute a list of sin/cos values around the circle
//rounded to 3 decimal places
var circleValues = function(){
  var array = [];
  //generate sin/cos values at 1 degree intervals
  for (let i = 0; i <= 360; i++){
    var radian = i * Math.PI / 180; //convert degree to radian
    //compute sin/cos values, rounded to 3 decimal places
    var sin = Math.round(Math.sin(radian) * 1000) / 1000;
    var cos = Math.round(Math.cos(radian) * 1000) / 1000;
    //store them in array
    array.push({sin: sin, cos: cos});
  }
  return array;
}();

//these variables determine the shape of the carousel
var maxXOffset = 400;
var maxYOffset = 250;
//these determine the min to max size of images in carousel
var imgMinSize = 50;
var imgMaxSize = 400;

//the carousel's current position and angle, starts at 0
var currentPosition = 0;
var currentAngle = 0;
//set positions of each item in carousel
initializeCarousel();

//initialize the product display carousel
function initializeCarousel(){

  var carouselItems = document.querySelectorAll("#carousel-container .carousel-div");
  for (let i = 0; i < carouselItems.length; i++){
    //below variables declared with "var" instead of "let" to improve runtime
    //they weren't all declared at the top of the function because that looks ugly,
    //hoisting will take care of it

    //get item at position i
    var item = carouselItems[i];
    //calculate angle
    var angle = (i/carouselItems.length) * 360;
    //position this item
    positionCarouselItem(item, angle);
    //give item the offsetAngle property, to know where it belongs
    //in the circle
    item.offsetAngle = angle;
  }

  //add event listeners to carousel buttons
  addCarouselEvents();
}

//add event listeners to carousel buttons
function addCarouselEvents(){
  var carouselRight = document.querySelector("#carousel-right");
  var carouselLeft = document.querySelector("#carousel-left");
  //add listeners
  carouselRight.addEventListener("click", function(event){
    if (!carouselAnimating){
      positionCarousel(currentPosition + 1);
    }
  });
  carouselLeft.addEventListener("click", function(event){
    if (!carouselAnimating){
      positionCarousel(currentPosition - 1);
    }
  });
}

//carousel element
var carousel = document.querySelector("#carousel-container");
//carousel items
var carouselItems = document.querySelectorAll(".carousel-div");
//flag for if carousel is currently animating
var carouselAnimating = false;

//function to rotate carousel to any desired position
function positionCarousel(position){
  //don't do anything if carousel is already in this position
  if (position == currentPosition) return;
  
  carouselAnimating = true;
  //compute clockwise and counterclockwise distance from currentPosition to position
  var ccwDistance = (currentPosition - position + carouselItems.length) % carouselItems.length;
  var cwDistance = carouselItems.length - ccwDistance;
  //compare the distances and see which way we should rotate
  var direction = (ccwDistance < cwDistance) ? 1 : -1;
  var distance = Math.min(ccwDistance, cwDistance);
  var angle = direction * distance / carouselItems.length * 360;
  
  //rotate carousel
  rotateCarousel(angle, 500 * distance);
  //update currentPosition
  currentPosition = position;
}

//this function rotates the carousel by a certain amount of degrees,
//in the given duration. Positive angle is ccw, negative is cw
function rotateCarousel(angle, duration){
  var start = null;

  window.requestAnimationFrame(function animate(time){
    if (!start) start = time;
    var progress = (time - start) / duration;
    progress = (progress > 1) ? 1 : progress;
    
    //update positions of each item
    for (let i = 0; i < carouselItems.length; i++){
      //compute the new angle
      var newAngle = carouselItems[i].offsetAngle + currentAngle + angle * progress;
      
      //make sure angle doesn't go out of bounds
      newAngle = (newAngle + 360) % 360;
      //position this item
      positionCarouselItem(carouselItems[i], newAngle);
    }
    //if animation isn't complete, keep going
    if (progress < 1){
      window.requestAnimationFrame(animate);
    } else {
      //animation complete
      carouselAnimating = false;
      //update currentAngle
      currentAngle += angle;
      currentAngle = (currentAngle + 360) % 360;
    }
  });
}

function positionCarouselItem(item, angle){
  // calculate this item's position in the circle
  var radian = angle * Math.PI / 180;

  //get the image in the div
  var img = item.children[0];

  var sin = Math.sin(radian);
  var cos = Math.cos(radian);
  //calculate x and y offset (where this item will appear on the carousel)
  var xOffset = sin * maxXOffset;
  var yOffset = cos * maxYOffset;
  
  var prominence = (cos + 1)/2;
  //prominence represents how "front and center" a carousel image is,
  //the image currently in the foreground has prominence = 1,
  //and the ones all the way in the back has prominence = 0

  //calculate how big the image should appear (biggest image is front and center)
  var imgSize = (imgMaxSize - imgMinSize) * prominence + imgMinSize;
  // apply position
  item.style.top = yOffset + "px";
  item.style.left = xOffset + "px";
  //apply z index
  img.style.zIndex = 200 + Math.floor(cos * 180) + ""; //z-index can't have float values
  //apply img size
  img.style.width = imgSize + "px";
  //apply img opacity
  img.style.opacity = prominence * 1.1;
  //the "* 1.1" is just to make sure the front item is fully opaque
}