//foldDown("about-menu");

initializeNavMenus();
initializeCarousel();

function initializeNavMenus(){
  //initialize event listeners on navigation menus
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



function initializeCarousel(){
  //these variables determine the shape of the carousel
  var maxXOffset = 400;
  var maxYOffset = 250;
  //these determine the min to max size of images in carousel
  var imgMinSize = 50;
  var imgMaxSize = 400;
  var carouselItems = document.querySelectorAll("#carousel-container > .carousel-div");
  for (let i = 0; i < carouselItems.length; i++){
    //below variables declared with "var" instead of "let" to improve runtime
    //they weren't all declared at the top of the function because that looks ugly,
    //hoisting will take care of it

    //get item at position i
    var item = carouselItems[i];
    //get the image in the div
    var img = item.children[0];
    
    // calculate this item's position in the circle
    var radian = (i/carouselItems.length) * 2 * Math.PI;
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
    var imgSize = (imgMaxSize - imgMinSize)*prominence + imgMinSize;
    // apply position
    item.style.top = yOffset + "px";
    item.style.left = xOffset + "px";
    //apply z index
    item.style.zIndex = cos;
    //apply img size
    img.style.width = imgSize + "px";
    //apply img opacity
    img.style.opacity = prominence;
  }
}