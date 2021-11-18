  canvascolor = "rgba(19, 23, 26, 1)";
  blurple = "rgba(140, 150, 250, 1)";
  gray = "rgba(153, 170, 181, 1)";
  canvas = document.getElementById('3d');
  newGameButt = document.getElementById('newGameButt');

  var ctx = canvas.getContext('2d');

  //PREFACE: I LIKE PERAMETERS IM SORRY

  var butt = -1; // 0 left, 1 middle, 2 right
  var mouseX = 0;
  var mouseY = 0;
  var startx = 0;
  var starty = 0;
  var clickstart = [0,0];
  var mousemoved = false;
  var swipes = 0;
  var mouseEnterTimer = 0;

  var firstkey;
  var controlAlertTimer = 100;

  var pause = true;
  var sliding = false;

  var xcenter = canvas.width/2;
  var ycenter = canvas.height/2;
  const planetosize = 20; //increases distance of plane away from camera AND scales everything down
  var bigness = 15/planetosize; // overall scale factor

  var initcamdist = 50; // fov effects (becomes orthographic as approaches infinity)
  var zoomfac = 1/Math.sqrt(initcamdist);
  var camdistort = 50; // fov effects (becomes orthographic as approaches infinity)

  var gridth = 4;
  var gapness = 1;
  var cubesize = (4*1.5)/gridth;
  var explodeFac = 3;
  var revolvespeed = 0.01;

  var indicator;
  var grid;

  let targetleft = -80;

  var dotradius = 6;
  var toggledots = false;
  var cubeLineFactor = 3;
  var cubelinewidth = (cubeLineFactor*16)/gridth;
  var togglelines = false;

  // var facesToDraw = [false, false, false, false, true, false]; //settings for bottom plates only
  // var toggleCulling = false;
  // var obfuscation = false;

  var facesToDraw = [true, true, true, true, true, true]; //xxyyzz
  var toggleCulling = true;
  var obfuscation = true;
  const cubefaces = [ [0, 2, 6, 4], // negative X
                      [1, 3, 7, 5], // positive X
                      [0, 1, 5, 4], // negative Y
                      [2, 3, 7, 6], // positive Y
                      [0, 1, 3, 2], // bottom //HAVING ONLY THIS ACTUALLY LOOKS PRETTY COOL
                      [4, 5, 7, 6]] // top

  var gridshadow = 0;
  var numberShadow = 5;
  var opacity = 1;
  const colormap = new Map();
  colormap.set(69, "rgb(215,203,190,")

  // colormap.set(2, "rgb(200,200,200,")
  // colormap.set(4, "rgb(200,200,150,")
  // colormap.set(8, "rgb(255,200,100,")
  // colormap.set(16, "rgb(255,160,80,")
  // colormap.set(32, "rgb(255,110,40,")
  // colormap.set(64, "rgb(255,50,20,")
  // colormap.set(128, "rgb(255,235,140,")
  // colormap.set(256, "rgb(255,250,90,")
  // colormap.set(512, "rgb(200,255,100,")
  // colormap.set(1024, "rgb(140,255,80,")
  // colormap.set(2048, "rgb(80,255,140,")
  // colormap.set(4096, "rgb(100,200,255,")
  // colormap.set(8192, "rgb(200,100,255,")

  colormap.set(2, "rgb(238, 228, 218,")
  colormap.set(4, "rgb(237, 224, 200,")
  colormap.set(8, "rgb(242, 177, 121,")
  colormap.set(16, "rgb(245, 149, 99,")
  colormap.set(32, "rgb(246, 124, 95,")
  colormap.set(64, "rgb(246, 94, 59,")
  colormap.set(128, "rgb(237, 207, 114,")
  colormap.set(256, "rgb(237, 204, 97,")
  colormap.set(512, "rgb(237, 200, 80,")
  colormap.set(1024, "rgb(237, 197, 63,")
  colormap.set(2048, "rgb(237, 194, 46,")
  colormap.set(4096, "rgb(100,200,255,")
  colormap.set(8192, "rgb(200,100,255,")

  var perameterQueue = [gridth, 10];

  canvasResize(true);

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

  var originsize;
  var originpoints = [];

  // initialize grid
  newGame();
  slider1.oninput();
  slider2.oninput();
  slider3.oninput();
  slider4.oninput();
  slider5.oninput();
  slider6.oninput();


  //console.log(ctx.getImageData(10,10,50,50))
  function newGame(){
    // console.log(gridth);
    gridth = perameterQueue[0];
    cubesize = (4*1.5)/gridth;
    cubelinewidth = (16*cubeLineFactor)/gridth;

    // console.log(gridth);

    //initialize origin
    originsize = gridth*cubesize*2.5;
    originpoints = [];
    originpoints.push(new Point(originsize,0,0,"red"));
    originpoints.push(new Point(0,originsize,0,"lime"));
    originpoints.push(new Point(0,0,originsize,"rgba(120,120,255,1)"));
    originpoints.push(new Point(-originsize,0,0,"red"));
    originpoints.push(new Point(0,-originsize,0,"lime"));
    originpoints.push(new Point(0,0,-originsize,"rgba(120,120,255,1)"));

    outline = new Cube(0,0,0,69, 69);
    outline.popTimer = 10;
    outline.updatepoints((gridth+0.3)*cubesize);

    grid = new Grid(gridth);
    grid.newcube()
    grid.newcube()
    console.log(grid.cubes);
    refresh();
  }
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
    //fillscreen();
    ctx.clearRect(0,0,canvas.width, canvas.height)
    camera.update();
    outline.draw();
    draworigin();
    grid.draw();
  }

  function pickdirection(){
    if(Math.hypot(mouseX-startx,mouseY-starty) > 20){
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

  function boxResize(){
    if(mouseEnterTimer>0){
      let currentpos = targetleft-(targetleft)*(mouseEnterTimer-1)/10;
      let currentsize = 470-currentpos*2;
      let curremtbutt = currentpos*0.7;
      canvas.setAttribute("style", "left: " + currentpos
                          + "px; top: "+currentpos+"px;");
      canvas.setAttribute("width", currentsize + "px");
      canvas.setAttribute("height", currentsize + "px");

      newGameButt.setAttribute("style", "float:right; top: "+curremtbutt+"px;");

      xcenter = canvas.width/2;
      ycenter = canvas.height/2;

      mouseEnterTimer--;
    } else if(mouseEnterTimer<0){

      let currentpos = (-targetleft)*(mouseEnterTimer+1)/10;
      let currentsize = 470-currentpos*2;
      let curremtbutt = currentpos*0.7;
      canvas.setAttribute("style", "left: " + currentpos
                          + "px; top: "+currentpos+"px;");
      canvas.setAttribute("width", currentsize + "px");
      canvas.setAttribute("height", currentsize + "px");

      newGameButt.setAttribute("style", "float:right; top: "+curremtbutt+"px;");

      xcenter = canvas.width/2;
      ycenter = canvas.height/2;

      mouseEnterTimer++;
    }
  }

  function mouseIndicator(){
    if(startx!=0){
      if(startx!=mouseX || starty!=mouseY){
        ctx.beginPath();
        if(indicator!=null){
          ctx.strokeStyle = indicator.color;
        } else{
          ctx.strokeStyle = "white";
        }
        ctx.lineWidth = 5;
        ctx.shadowBlur = 5;
        ctx.lineCap = "round"
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
    }
  }

  setInterval(function(){ //the big loop
    if(!pause && (butt==-1)){
      if(revolvespeed != 0){
        camera.orbit(revolvespeed,0);
      }
    }

    boxResize();
    refresh();
    mouseIndicator();
    if(controlAlertTimer < 20){
      ctx.font = "bold " + (canvas.width/20) + "px Clear Sans";
      ctx.fillStyle = "rgba(210,0,0,"+(20-controlAlertTimer)/10+")";
      ctx.shadowColor = "black";
      ctx.shadowBlur = 4;
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText("Consider reading the controls first.",0,canvas.width - ((controlAlertTimer+6)**3)/50 - 10)
      ctx.font = "bold " + (canvas.width/40) + "px Clear Sans";
      ctx.fillText("Exploding the Grid is not recommended until more tiles have spawned.",0,canvas.width - ((controlAlertTimer+4)**3)/50)

      controlAlertTimer+=0.1;
    }
    if(butt>-1){
      draworigin();
    }

  }, 1000/60);
