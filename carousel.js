/*
Instructions:
This file contains code for a single class, named 'Carousel'.
The class allows you to easily create a 3D carousel of images, with the ability
to rotate the carousel into any position you choose.
---
Input Parameters:
---
options: a single parameters object. Pass in the parameters as properties of this object.
- Properties:
  - width: the width, in pixels, of the carousel from end to end. Note that the width of the images
    is NOT included in this calculation. Default 800px
  - height: similar to width. Default 500px
  - imgMinSize: the smallest a carousel image becomes in size, as it moves to the back. Default 50px
  - imgMaxSize: the largest an image becomes, at the front of the carousel. Default 400px
  - carouselID: the id of the element to which to attach the carousel. Default "carousel-container"
  - images: an array of image urls to be used for the "src" attribute of the carousel images.

Upon instantiation, the carousel object will search the document for the element with id carouselID,
and create new carousel items to attach based on the input image urls.
After that, the carousel is ready to go, you just need to add the logic to control it.
There are three primary methods you can call to control the carousel:
  - positionCarousel(index): this function will move the carousel from its current position to the position indicated by the given index (integer)
  - shiftLeft(), shiftRight(): these are shortcuts for rotating the carousel just one item to the left or right.

Usage example:
- Let's say you want to anchor the carousel to a div with id= "my-div"
- create the image urls array:

var images = [
  "images/img1.png",
  "images/img2.jpg",
  "images/img3.png"
]
- Instantiate the carousel, passing in the carouselID and images options (all other parameters take default values):

var carousel = new Carousel({carouselID: "my-div", images: images})

- Now the carousel will be initialized, but to do anything useful you want to add event listeners.
- Say you have a variable representing a button to rotate the carousel right (clockwise):

var right = document.querySelector("#right-button"); //or whatever id the button is

right.addEventListener("click", (event)=>{
  if (!carousel.animating){
    carousel.shiftRight();
  }
})

- And it's as simple as that, now pressing the right button will rotate the carousel to show the next item on the right. The carousel.animating property is set to true when the carousel is in the middle of moving, so it's a good idea to check that it's false before animating, to avoid overlapping animations. The carousel class makes no attempts to reconcile conflicting animation calls.
*/
class Carousel{
  constructor({
    //parameters with default values
    //to instantiate, pass in an object with the following properties
      width = 800, 
      height = 500, 
      imgMinSize = 50, 
      imgMaxSize = 400, 
      carouselID = "carousel-container",
      images,
    } = {}){
    //these variables determine the shape of the carousel
    this.maxXOffset = width / 2;
    this.maxYOffset = height / 2;
    
    //these determine the min to max size of images in carousel
    this.imgMinSize = imgMinSize;
    this.imgMaxSize = imgMaxSize;
    //the carousel's current position and angle, starts at 0
    this.currentPosition = 0;
    this.currentAngle = 0;
    //carousel element
    var carouselID = carouselID;
    this.carousel = document.querySelector(`#${carouselID}`);
    //carousel items
    var carouselItemClass = carouselItemClass;
    //generate carousel items from passed in images
    this.carouselItems = this.createCarouselItems(images);
    //flag for if carousel is currently animating
    this.animating = false;
    //precompute a list of sin/cos values around the circle
    //rounded to 3 decimal places
    this.circleValues = this.computeCircleValues();
    //set positions of each item in carousel
    this.initializeCarousel();
  }

  createCarouselItems(images){
    var carouselItems = [];
    for (let imageURL of images){
      //create positioning div to hold image
      var item = document.createElement("div");
      item.className = "carousel-item";
      item.style.position = "relative";
      item.style.width = "0px";
      item.style.height = "0px";
      item.style.margin = "0px";
      item.style.padding = "0px";
      //create image
      var image = document.createElement("img");
      image.src = imageURL;
      image.className = "carousel-img";
      image.style.position = "absolute";
      image.style.transform = "translate(-50%, -100%)";
      image.style.width = this.imgMinSize + "px";
      image.style.zIndex = "0";
      //add image to item
      item.appendChild(image);
      //add item to carousel
      this.carousel.appendChild(item);
      carouselItems.push(item);
    }
    return carouselItems;
  }

  computeCircleValues(){
    var values = {
      sin: [],
      cos: []
    };
    //generate sin/cos values at 1 degree intervals
    for (let i = 0; i <= 360; i++){
      var radian = i * Math.PI / 180; //convert degree to radian
      //compute sin/cos values, rounded to 3 decimal places
      var sin = Math.round(Math.sin(radian) * 1000) / 1000;
      var cos = Math.round(Math.cos(radian) * 1000) / 1000;
      
      //store them in array
      values.sin.push(sin);
      values.cos.push(cos);
    }
    return values;
  }
  
  storedSin(angle){
    //takes an angle in degrees (0 <= angle < 360) and outputs the approximate sin value,
    //using the array of stored sin/cos values
    var index = Math.floor(angle);
    var fraction = angle - index;
    var firstVal = this.circleValues.sin[index];
    var secondVal = this.circleValues.sin[index+1];
    return firstVal + (secondVal - firstVal) * fraction;
  }
  
  storedCos(angle){
    //takes an angle in degrees (0 <= angle < 360) and outputs the approximate cos value,
    //using the array of stored sin/cos values
    var index = Math.floor(angle);
    var fraction = angle - index;
    var firstVal = this.circleValues.cos[index];
    var secondVal = this.circleValues.cos[index+1];
    return firstVal + (secondVal - firstVal) * fraction;
  }

  //initialize the product display carousel
  initializeCarousel(){

    var carouselItems = this.carouselItems;
    for (let i = 0; i < carouselItems.length; i++){
      //below variables declared with "var" instead of "let" to improve runtime
      //they weren't all declared at the top of the function because that looks ugly,
      //hoisting will take care of it

      //get item at position i
      var item = carouselItems[i];
      //calculate angle
      var angle = (i/carouselItems.length) * 360;
      //position this item
      this.positionCarouselItem(item, angle);
      //give item the offsetAngle property, to know where it belongs
      //in the circle
      item.offsetAngle = angle;
    }
  }

  //shortcut function to move carousel 1 item right
  shiftRight(){
    this.positionCarousel(this.currentPosition + 1);
  }

  //shortcut function to move carousel 1 item left
  shiftLeft(){
    this.positionCarousel(this.currentPosition - 1);
  }

  //function to rotate carousel to any desired position
  positionCarousel(position){
    //don't do anything if carousel is already in this position
    if (position == this.currentPosition) return;
    
    this.animating = true;
    //compute clockwise and counterclockwise distance from currentPosition to position
    var ccwDistance = (this.currentPosition - position + this.carouselItems.length) % this.carouselItems.length;
    var cwDistance = this.carouselItems.length - ccwDistance;
    //compare the distances and see which way we should rotate
    var direction = (ccwDistance < cwDistance) ? 1 : -1;
    var distance = Math.min(ccwDistance, cwDistance);
    var angle = direction * distance / this.carouselItems.length * 360;
    
    //rotate carousel
    this.rotateCarousel(angle, 500 * distance);
    //update currentPosition
    this.currentPosition = position;
  }

  //this function rotates the carousel by a certain amount of degrees,
  //in the given duration. Positive angle is ccw, negative is cw
  rotateCarousel(angle, duration){
    var start = null;
    var carousel = this;

    window.requestAnimationFrame(function animate(time){
      if (!start) start = time;
      var progress = (time - start) / duration;
      progress = (progress > 1) ? 1 : progress;
      
      //update positions of each item
      for (let i = 0; i < carousel.carouselItems.length; i++){
        //compute the new angle
        var newAngle = carousel.carouselItems[i].offsetAngle + carousel.currentAngle + angle * progress;
        
        //make sure angle doesn't go out of bounds
        newAngle = (newAngle + 360) % 360;
        //position this item
        carousel.positionCarouselItem(carousel.carouselItems[i], newAngle);
      }
      //if animation isn't complete, keep going
      if (progress < 1){
        window.requestAnimationFrame(animate);
      } else {
        //animation complete
        carousel.animating = false;
        //update currentAngle
        carousel.currentAngle += angle;
        carousel.currentAngle = (carousel.currentAngle + 360) % 360;
      }
    });
  }

  //this function positions a single carousel item
  positionCarouselItem(item, angle){
    //get the image in the div
    var img = item.children[0];
  
    var sin = this.storedSin(angle);
    var cos = this.storedCos(angle);
    //calculate x and y offset (where this item will appear on the carousel)
    var xOffset = sin * this.maxXOffset;
    var yOffset = cos * this.maxYOffset;
    
    var prominence = (cos + 1)/2;
    //prominence represents how "front and center" a carousel image is,
    //the image currently in the foreground has prominence = 1,
    //and the ones all the way in the back has prominence = 0
  
    //calculate how big the image should appear (biggest image is front and center)
    var imgSize = (this.imgMaxSize - this.imgMinSize) * prominence + this.imgMinSize;
    // apply position
    item.style.transform = `translate(${xOffset}px,${yOffset}px)`;
    //apply z index
    img.style.zIndex = 200 + Math.floor(cos * 180) + "";
    //apply img size
    img.style.width = imgSize + "px";
    //apply img opacity
    img.style.opacity = prominence;
  }
}