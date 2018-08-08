//foldDown("about-menu");

initializeCarousel();

function foldDown(navMenuID){
  // this function expects the id of an element with class "nav-menu"
  // it will search for child elements with class "nav-button"
  // and animate them folding down, like paper, to open the menu
  var navButtons = document.querySelectorAll(`#${navMenuID} > .nav-button`);
  
  var navButton = navButtons[1];
  navButton.style.display = "inline-block";
  
  var start = null;
  var duration = 200; //ms

  window.requestAnimationFrame(function animate(time){
    if (!start) start = time;
    var progress = Math.min((time - start) / duration, 1);
    navButton.style.top = 25 + Math.floor(progress * 50) + "px";
    if (progress < 1){
      // animation isn't finished, call requestAnimationFrame again
      window.requestAnimationFrame(animate);
    }
  });
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
    console.log(img);
    
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