      canvas = document.getElementById('3d');

			document.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); }

			canvas.addEventListener('mousedown', onClick);
			canvas.addEventListener("mouseup", onRelease);
			canvas.addEventListener("wheel", scroll)
      canvas.addEventListener('mouseenter', onMouseEnter);
			canvas.addEventListener('mouseleave', onMouseLeave);
			canvas.addEventListener('mousemove', onMouseMove);

	    canvas.addEventListener("wheel", preventDefaults, false)
      //document.addEventListener("keydown", preventDefaults)

      var slider1 = document.getElementById("slider1");
      var output1 = document.getElementById("output1");
      output1.innerHTML = slider1.value; // Display the default slider value

      var slider2 = document.getElementById("slider2");
      var output2 = document.getElementById("output2");
      output2.innerHTML = slider2.value; // Display the default slider value

      var message3 = document.getElementById("gridth message");
      var slider3 = document.getElementById("slider3");
      var output3 = document.getElementById("output3");
      output3.innerHTML = slider3.value; // Display the default slider value

      var slider4 = document.getElementById("slider4");
      var output4 = document.getElementById("output4");
      output4.innerHTML = slider4.value; // Display the default slider value

      var slider5 = document.getElementById("slider5");
      var output5 = document.getElementById("output5");
      output5.innerHTML = slider5.value; // Display the default slider value

      var slider6 = document.getElementById("slider6");
      var output6 = document.getElementById("output6");
      output6.innerHTML = slider6.value; // Display the default slider value

      // Update the current slider value (each time you drag the slider handle)
      slider1.oninput = function() {
        output1.innerHTML = this.value;
        let pos = 485-this.value * 485/(this.max-this.min);
        output1.setAttribute("style", "margin-right: " + pos + "px");

        targetleft = -this.value;
      }

      slider2.oninput = function() {
        output2.innerHTML = this.value;
        let pos = 100+480-this.value * 480/(this.max-this.min);
        output2.setAttribute("style", "margin-right: " + pos + "px");

        explodeFac = this.value;
        let setExplode = [1,1,1];
        for(let i = 0; i<3; i++){
          if(grid.explodeList[i] == true){
            setExplode[i] = explodeFac;
          }
        }
        grid.explode(setExplode);
      }

      slider3.oninput = function() {
        output3.innerHTML = this.value;
        let plural = "es";
        if(this.value==1){
          plural = "";
        }
        message3.innerHTML = "Grid Width (grid volume: "+ this.value**3 +" box"+plural+"; updates next game)";
        let pos = 30+485-this.value * 485/(this.max-this.min);
        output3.setAttribute("style", "margin-right: " + pos + "px");

        perameterQueue[0] = parseInt(this.value); //queue the next game's gridth
      }

      slider4.oninput = function() {
        output4.innerHTML = this.value;

        let pos = 30+485-this.value * 485/(this.max-this.min);
        output4.setAttribute("style", "margin-right: " + pos + "px");

        numberShadow = this.value;
      }

      slider5.oninput = function() {
        output5.innerHTML = this.value;

        let pos = 30+485-this.value * 485/(this.max-this.min);
        output5.setAttribute("style", "margin-right: " + pos + "px");

        gridshadow = this.value; //queue the next game's gridth
      }

      slider6.oninput = function() {
        output6.innerHTML = this.value;

        let pos = 30+485-this.value * 485/(this.max-this.min);
        output6.setAttribute("style", "margin-right: " + pos + "px");

        cubeLineFactor = this.value; //queue the next game's gridth
        cubelinewidth = (16*cubeLineFactor)/gridth;
      }


			function preventDefaults (e) {
			  e.preventDefault()
			  e.stopPropagation()
			}

			document.addEventListener('keydown', (event) => {
			  const keyName = event.key;
        if(keyName.includes("Arrow") || keyName == " "){
          event.preventDefault();
          if((firstkey == null || firstkey.includes("Arrow")) && swipes<4 && keyName!=" "){
            controlAlertTimer = 0;
            return;
          }
        }else if(["q","w","a","s","z","x"].includes(keyName)){ //if a letter control pressed,
          firstkey = keyName; //doesnt really matter than firstkey gets reset a bunch
        }
			  switch(keyName){
			    case 'Control':
			      return;
			    case 'Escape':
			      return;
			    case "ArrowUp":
            if(grid.explodeList[2]){
  			      grid.explode([1,1,1]);
              grid.explodeList = [false,false,false];
            } else{
              grid.explode([1,1,explodeFac]);
              grid.explodeList = [false,false,true];
            }
			      return;
          case "ArrowLeft":
            if(grid.explodeList[0]){
              grid.explode([1,1,1]);
              grid.explodeList = [false,false,false];
            } else{
              grid.explode([explodeFac,1,1]);
              grid.explodeList = [true,false,false];
            }
            return;
          case "ArrowRight":
            if(grid.explodeList[1]){
              grid.explode([1,1,1]);
              grid.explodeList = [false,false,false];
            } else{
              grid.explode([1,explodeFac,1]);
              grid.explodeList = [false,true,false];
            }
            return;
          case "ArrowDown":
            if(grid.explodeList[0] || grid.explodeList[1] || grid.explodeList[2]){
              grid.explode([1,1,1]);
              grid.explodeList = [false,false,false];
            }
            return;
			    case "q":
			      grid.swipe(0,-1);
			      return;
			    case "w":
			      grid.swipe(0,1);
			      return;
			    case "a":
			      grid.swipe(1,-1);
			      return;
			    case "s":
			      grid.swipe(1,1);
			      return;
			    case "z":
			      grid.swipe(2,-1);
			      return;
			    case "x":
			      grid.swipe(2,1);
			      return;

			    case ' ':
			      pause = !pause;
			      refresh(); //to display the "paused" after paused
			      return;
			    // default:
			    // console.log(keyName);
			    // return;
			  }
			}, false);


			function onClick(event){
				if(canvas.style.cursor == "pointer"){
					sliding = true;
				}else{
					//click = true;
					butt = event.button;
          if(event.button == 0){ //left click begin
            startx = event.offsetX;
            starty = event.offsetY;
          }
				}
			}

			function onRelease(event){
				butt = -1;
				sliding = false;
        if(event.button == 0){ //left click end
          let index = pickdirection();
          if(index!=-1){
            let sign = -((index%2)*2-1);
  					if(index%3 == 1){
  						sign *= -1;
  					}
            grid.swipe(index%3, sign);
          }
          startx = 0;
          starty = 0;
        }
			}

			function onMouseMove(event){
        //mousemoved = true;
			  mouseX = event.offsetX;
			  mouseY = event.offsetY;
				if(butt == 2){
					let diffx = mouseX-clickstart[0];
					let diffy = mouseY-clickstart[1];
					camera.orbit(-20*diffx/(1000), 20*diffy/(1000));

				}else if(sliding){
					updatefov();
					refresh();
				}else if(startx!=0){
          let index = pickdirection();
          if(index!=-1){
            indicator = new Point(...originpoints[index].pos, originpoints[index].color);
            for(let i = 0; i<3; i++){
              indicator.pos[i]*=1.5;
            }
            indicator.project(camera);
            indicator.draw(originsize);
          }
        }
				clickstart = [mouseX,mouseY];
			}

      function onMouseEnter(event){
        if(mouseEnterTimer != 0){
          mouseEnterTimer = 11+mouseEnterTimer;
        } else{
          mouseEnterTimer = 11;
        }
      }

			function onMouseLeave(event){
        if(mouseEnterTimer != 0){
          mouseEnterTimer = -11+mouseEnterTimer;
        } else{
          mouseEnterTimer = -11;
        }
				butt = -1;
        startx = 0;
        starty = 0;
			}

			function scroll(event){
        // console.log(event.deltaY)
				// camera.zoom(Math.sign(event.deltaY));
        camera.zoom(Math.sign(event.deltaY),Math.sqrt(Math.abs(event.deltaY))/4);

			}

      window.onresize = canvasResize;
      function canvasResize(initialize) {
        console.log("resize!")
        canvas.width  = 500-30;
        canvas.height = canvas.width;
        if(canvas.clientWidth>470){
          if(mouseEnterTimer<=10 ){
            canvas.setAttribute("style", "width: " + 500 + "px");
          }
        }
        ctx.fillStyle = '#13171A';
        //ctx.fillStyle = canvascolor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        xcenter = canvas.width/2;
        ycenter = canvas.height/2;
        if(initialize != true){
          refresh();
          //console.log("boop")
        }
      }
