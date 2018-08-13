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

//images to be used in the carousel
var images = [
  "images/inkjet_paper.jpg",
  "images/office_paper.jpg",
  "images/construction_paper.jpg",
  "images/bank_paper.jpg",
  "images/coated_paper.jpg",
  "images/cotton_paper.jpg",
  "images/book_paper.jpg"
]
//create carousel
var carousel = new Carousel({carouselID: "carousel-container", images: images});

//add event listeners to carousel buttons
(function addCarouselEvents(){
  var carouselRight = document.querySelector("#carousel-right");
  var carouselLeft = document.querySelector("#carousel-left");
  //add listeners
  carouselRight.addEventListener("click", function(event){
    if (!carousel.carouselAnimating){
      carousel.positionCarousel(carousel.currentPosition + 1);
    }
  });
  carouselLeft.addEventListener("click", function(event){
    if (!carousel.carouselAnimating){
      carousel.positionCarousel(carousel.currentPosition - 1);
    }
  });
})();