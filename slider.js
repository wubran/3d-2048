class Slider {
  constructor(name, value, minimum, maximum, containerWidth, updateFunc, containerw, checkUpdateFunc, roundPlaces) {
    this.name = name;
    this.value = value;
    this.min = minimum;
    this.max = maximum;
    this.roundPlaces = roundPlaces
    this.range = this.max - this.min;
    this.selected = false;
    this.containerWidth = containerWidth;
    this.containerw = containerw;
    this.elementHeight = (2/3)*containerWidth;
    this.updateFunc = updateFunc;
    this.checkUpdateFunc = checkUpdateFunc;
    this.isBeingClicked = false;
    this.sliderPos = [];
    this.sliderLocationRange = [];
    this.elementBox = [];
  }
  clickEvent(x, y){
    if(Math.sqrt(Math.pow(x-this.sliderPos[0], 2) + Math.pow(y-this.sliderPos[1], 2)) <= 2*this.sliderPos[2]){
      this.isBeingClicked = true;
    }
  }
  releaseEvent(){
    if(this.isBeingClicked){
      this.isBeingClicked = false;
      canvas.style.cursor = "default";
    }
  }
  mouseMove(x, y){
    if(this.elementBox[0] < x && x < this.elementBox[2] && this.elementBox[1] < y && y < this.elementBox[3]){
      this.selected = true;
      if(Math.sqrt(Math.pow(x-this.sliderPos[0], 2) + Math.pow(y-this.sliderPos[1], 2)) <= 2*this.sliderPos[2] || this.isBeingClicked){
        canvas.style.cursor = "pointer";
      } else {
        canvas.style.cursor = "default";
      }
    } else {
      this.selected = false;
    }
    if(this.isBeingClicked){
      if(this.sliderLocationRange[0] >  x){var newX = this.sliderLocationRange[0];}
      else if(x > this.sliderLocationRange[1]) {var newX = this.sliderLocationRange[1];}
      else {var newX = x;}
      var pixelRange = this.sliderLocationRange[1] - this.sliderLocationRange[0];
      this.value = Math.round(10**this.roundPlaces*(this.range*((newX-this.sliderLocationRange[0])/pixelRange)+this.min))/(10**this.roundPlaces);
      //this.value = this.range*((newX-this.sliderLocationRange[0])/pixelRange)+this.min;
      if(this.value<this.min){
        this.value=this.min;
      }
      if(this.value>this.max){
        this.value=this.max;
      }
      this.updateFunc(this.value);
    }
  }
  draw(containerX, elementY){
    this.containerWidth = this.containerw;
    this.elementHeight = (1/3)*this.containerWidth;
    this.value = this.checkUpdateFunc();


    // if(this.selected){
    //   ctx.fillStyle = "rgba(230, 230, 255, 0.05)";
    //   ctx.fillRect(containerX-49*this.containerWidth/50, elementY, 48*this.containerWidth/50, this.elementHeight);
    // }

    this.elementBox = [containerX-49*this.containerWidth/50,
                      elementY,
                      (containerX-49*this.containerWidth/50)+48*this.containerWidth/50,
                      elementY+this.elementHeight];

    // ctx.fillStyle = "rgba(19, 23, 26, 0.2)";
    // ctx.fillRect(containerX-24*this.containerWidth/25, elementY+this.containerWidth/50,
    //   23*this.containerWidth/25, this.elementHeight-2*this.containerWidth/50);
    if(this.value<=this.max && this.value>=this.min){
      var point = ((this.value-this.min)/this.range)*((3*this.containerWidth/4)+0);
    } else if(this.value<this.min){
       var point = 0*((3*this.containerWidth/4)+0);
    } else {
      var point = ((this.max-this.min)/this.range)*((3*this.containerWidth/4)+0);
    }
    ctx.lineWidth = this.containerWidth/96;
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(containerX-7*this.containerWidth/8, elementY+5*this.elementHeight/8);
    ctx.lineTo(containerX-this.containerWidth/8, elementY+5*this.elementHeight/8);
    this.sliderLocationRange = [containerX-7*this.containerWidth/8, containerX-this.containerWidth/8];
    ctx.fillStyle = blurple;
    ctx.fill();
    ctx.closePath();
    ctx.stroke();


    ctx.beginPath();
    ctx.arc(containerX-7*this.containerWidth/8+point, elementY+5*this.elementHeight/8, this.containerWidth/48, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.stroke();
    this.sliderPos = [containerX-7*this.containerWidth/8+point, elementY+5*this.elementHeight/8, this.containerWidth/48];

    ctx.font = canvas.width / 90 + "px Arial";
    var textOffset = -1*ctx.measureText(Math.round((10**this.roundPlaces)*this.value)/(10**this.roundPlaces)).width/2;
    ctx.fillText(Math.round((10**this.roundPlaces)*this.value)/(10**this.roundPlaces), point+textOffset+containerX-7*this.containerWidth/8, (elementY+5*this.elementHeight/8)+this.containerWidth/14);

    ctx.font = canvas.width / 60 + "px Arial";
    ctx.fillStyle = blurple;
    ctx.fillText(this.name, -1*this.containerWidth/48+containerX-7*this.containerWidth/8, elementY+this.containerWidth/8);
  }
}
