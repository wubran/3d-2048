  canvascolor = "rgba(19, 23, 26, 1)";
  blurple = "rgba(140, 150, 250, 1)";
  gray = "rgba(153, 170, 181, 1)";
  canvas = document.getElementById('3d');
  var ctx = canvas.getContext('2d');

  var butt = -1; // 0 left, 1 middle, 2 right
  var mouseX = 0;
  var mouseY = 0;
  var startx = 0;
  var starty = 0;

  var pause = true;
  var xcenter = canvas.width/2;
  var ycenter = canvas.height/2;
  const planetosize = 20; //increases distance of plane away from camera AND scales everything down
  var bigness = 15/planetosize; // overall scale factor
  var initcamdist = 50; // fov effects (becomes orthographic as approaches infinity)
  var camdistort = 50; // fov effects (becomes orthographic as approaches infinity)
  var flammability = 0.01;
  var sliding = false;
  var clickstart = [0,0];
  var dotradius = 3;
  var toggledots = false;
  var togglelines = false;
  const gridth = 4;
  var opacity = 0.7;
  var revolvespeed = 0.01;
  var gapness = 0.8;
  const cubesize = 1.5;
  var explodeFac = 3;
  var mousemoved = false;

  const colormap = new Map();
  colormap.set(69, "rgb(10,10,10,")

  colormap.set(2, "rgb(200,200,200,")
  colormap.set(4, "rgb(200,200,150,")
  colormap.set(8, "rgb(255,200,100,")
  colormap.set(16, "rgb(255,160,80,")
  colormap.set(32, "rgb(255,110,40,")
  colormap.set(64, "rgb(255,50,20,")
  colormap.set(128, "rgb(255,235,140,")
  colormap.set(256, "rgb(255,250,90,")
  colormap.set(512, "rgb(200,255,100,")
  colormap.set(1024, "rgb(140,255,80,")
  colormap.set(2048, "rgb(80,255,140,")
  colormap.set(4096, "rgb(100,200,255,")
  colormap.set(8192, "rgb(200,100,255,")

  canvasResize(true);

  function getRevolveSpeed(){return revolvespeed;}
  function setRevolveSpeed(setTo){revolvespeed = setTo;}
  var revolveSpeedSlider = new Slider("revolve speed", 0.01, 0, 0.05, canvas.width/10, setRevolveSpeed, canvas.width/5, getRevolveSpeed, 3)
  function getCamdist(){return 100/camdistort;}
  function setCamdist(setTo){camdistort = 100/setTo;}
  var camdistSlider = new Slider("perspective distortion", 100/camdistort, 100/100000, 100/10, canvas.width/10, setCamdist, canvas.width/5, getCamdist, 2)
  //(name, value, minimum, maximum, containerWidth, updateFunc, container, checkUpdateFunc, roundPlaces)

  function randomRange(min, max){ //inclusive, inclusive
    let interval = 1 + max-min; //plus 1 because rounding shenanigans
    let answer = Math.trunc(interval*Math.random() + min);
    if(answer>max){
      return max;
    }
    return answer;
  }

  function angle(opp,adj){
    let angleto;
    if(adj==0){
      angleto = Math.PI/2; //uhh.... i guess sure?
      if(opp<0){
        angleto+=Math.PI;
      }
    } else {
      angleto = Math.atan(opp/adj);
    }
    if(adj < 0){
      angleto += Math.PI;
    }
    return angleto;
  }

  //initialize camera
  //let legs = initcamdist/Math.sqrt(3);
  //camera = new Cam(legs,legs,legs);
  camera = new Cam(39.33347860859019, 24.170967999528635, 19.20004600289643);

  //initialize origin
  let originsize = gridth*2.5;
  originpoints = [];
  originpoints.push(new Point(originsize,0,0,"red"));
  originpoints.push(new Point(0,originsize,0,"lime"));
  originpoints.push(new Point(0,0,originsize,"rgba(120,120,255,1)"));
  originpoints.push(new Point(-originsize,0,0,"red"));
  originpoints.push(new Point(0,-originsize,0,"lime"));
  originpoints.push(new Point(0,0,-originsize,"rgba(120,120,255,1)"));

  outline = new Cube(0,0,0,69);
  outline.popTimer = 10;
  outline.updatepoints(gridth*cubesize);

  let indicator;

  // initialize grid
  let grid = new Grid(gridth);
  grid.newcube()
  grid.newcube()
  console.log(grid.cubes);
  refresh();

  //console.log(ctx.getImageData(10,10,50,50))

  function draworigin(){
    for(let dot of originpoints){
      dot.project(camera);
      dot.draw();
      ctx.lineWidth = 2;
      ctx.strokeStyle = dot.color;
      ctx.beginPath();
      ctx.moveTo(xcenter,ycenter);
      ctx.lineTo(dot.x, dot.y);
      ctx.stroke();
    }
  }

  function refresh(){
    fillscreen();
    camera.update();
    outline.draw();
    draworigin();
    grid.draw();
  }

  function pickdirection(){
    if(Math.hypot(mouseX-startx,mouseY-starty)/(canvas.width+canvas.height) > .01){
      let mouseangle = angle((mouseY-starty),(mouseX-startx));
      let originangles = [];
      for(let i = 0; i<6; i++){
        originangles.push(angle((originpoints[i].y-ycenter),(originpoints[i].x-xcenter)));
        originangles[i] = Math.abs((originangles[i]-mouseangle)%(2*Math.PI));
        if(originangles[i]>Math.PI){
          originangles[i]-=2*Math.PI;
        }
        originangles[i] = Math.abs(originangles[i]);
      }
      //console.log(originangles, mouseangle)
      index = originangles.indexOf(Math.min(...originangles));
      //console.log(index)
      return(index);
    } else{
      return -1;
    }
  }

  function fillscreen(){
    ctx.fillStyle = canvascolor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "left"

    // revolveSpeedSlider.draw(4*canvas.width/20, 14*canvas.height/40);
    // camdistSlider.draw(4*canvas.width/20, 19*canvas.height/40);

    ctx.font = canvas.width / 40 + "px Arial";
    ctx.fillStyle = blurple;
    ctx.fillText("brian's 3d projector :D", canvas.width/54, canvas.height/12);

    // ctx.fillStyle = gray;
    // ctx.font = canvas.width / 90 + "px Arial";
    // let notes =["Pitch/Yaw - Right Mouse",
    //           "Zoom - Scrollwheel",
    //           "Toggle Spinning - Spacebar",
    //           "Swipe - Left Mouse",
    //           "Explode - Arrow Keys",
    //           "QW AS ZX for axis movements."];
    // let spacing = canvas.width/60;
    // for(var i = 0; i < notes.length; i++){
    //   ctx.fillText(notes[i], canvas.width/30, 6*canvas.height/40 + spacing*i);
    // }

    ctx.fillStyle = blurple;
    ctx.font = canvas.width / 30 + "px Arial";
    if(pause){
      ctx.fillText("paused", 35*canvas.width/40, 19*canvas.height/20);
    }

    ctx.fillStyle = gray;

    ctx.fillStyle = "white"; //origin dot
    ctx.beginPath();
    ctx.arc(xcenter, ycenter, 4, 0, 2 * Math.PI);
    ctx.fill();

  }

  setInterval(function(){
    if(!pause && (butt==-1)){
      if(revolvespeed != 0){
        camera.orbit(revolvespeed,0);
      }
    }
    refresh();
    if(startx!=0){
      if(startx!=mouseX && starty!=mouseY){
        ctx.beginPath();
        if(indicator!=null){
          ctx.strokeStyle = indicator.color;
        } else{
          ctx.strokeStyle = "white";
        }
        ctx.lineWidth = 5;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "black";
        ctx.moveTo(startx,starty);
        ctx.lineTo(mouseX,mouseY);
        ctx.stroke();
        ctx.shadowBlur = 0;
        //console.log((mouseX-startx)/(mouseY-starty))
        //pickdirection()
        if(indicator!=null){
          indicator.draw(originsize);
        }
      }
      draworigin();
    }

  }, 1000/60);
