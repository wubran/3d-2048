      canvas = document.getElementById('screen');
			canvas.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); }

			canvas.addEventListener('mousedown', onClick);
			canvas.addEventListener("mouseup", onRelease);
			canvas.addEventListener("wheel", scroll)
			canvas.addEventListener('mouseleave', onMouseLeave);
			canvas.addEventListener('mousemove', onMouseMove);
			document.addEventListener('keydown', (event) => {
			  const keyName = event.key;
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
					revolveSpeedSlider.clickEvent(event.clientX, event.clientY)
					camdistSlider.clickEvent(event.clientX, event.clientY)
					sliding = true;
				}else{
					//click = true;
					butt = event.button;
          if(event.button == 0){ //left click begin
            startx = event.pageX;
            starty = event.pageY;
          }
				}
			}

			function onRelease(event){
				butt = -1;
				sliding = false;
				revolveSpeedSlider.releaseEvent()
				camdistSlider.releaseEvent()
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
			  mouseX = event.pageX;
			  mouseY = event.pageY;
				revolveSpeedSlider.mouseMove(mouseX, mouseY)
				camdistSlider.mouseMove(mouseX, mouseY)
				if(butt == 2){
					let diffx = mouseX-clickstart[0];
					let diffy = mouseY-clickstart[1];
					camera.orbit(-20*diffx/(canvas.width), 20*diffy/(canvas.width));

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

			function onMouseLeave(event){
				butt = -1;
			}

			function scroll(event){
				camera.zoom(Math.sign(event.deltaY));
			}

      window.onresize = canvasResize;
      function canvasResize(initialize) {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.fillStyle = '#13171A';
        //ctx.fillStyle = canvascolor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        xcenter = canvas.width/2;
        ycenter = canvas.height/2;
        //revolveSpeedSlider.
        //camdistSlider.
        revolveSpeedSlider = new Slider("revolve speed", 0.5, 0, 1, canvas.width/10, setRevolveSpeed, canvas.width/5, getRevolveSpeed, 2)
        camdistSlider = new Slider("perspective distortion", 100/camdistort, 100/100000, 100/10, canvas.width/10, setCamdist, canvas.width/5, getCamdist, 2)

        if(initialize != true){
          refresh();
          //console.log("boop")
        }
      }
