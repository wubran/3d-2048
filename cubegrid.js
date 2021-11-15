//this file contains the Cube & Grid classes and the createCubeArray & drawface functions.

class Cube{
  constructor(x,y,z,val,startindex){
    this.index = startindex;
    this.pos = [x,y,z];
    this.value = val;
    this.points = [];
    this.updatepoints(cubesize*gapness);
    this.popTimer = 0;
    this.slideTimer = 100;
    this.slideFrom = [];
    this.slideTo = [];
  }
  updatepoints(radius){
    this.points = [];
    for(let i = 0; i<8; i++){ // all points for a cube relative to the center
      let count = i;
      let coords = [];
      for(let j = 0; j<3; j++){
        coords.push(radius*((count%2)*2-1));
        count = count>>>1;
      }
      // console.log(coords);
      this.points.push(new Point(this.pos[0]+coords[0], this.pos[1]+coords[1], this.pos[2]+coords[2], "red"));
    }
  }
  draw(){
    let popTime = 10; //frames
    if(this.popTimer<popTime){
      this.popTimer+=1;
      this.updatepoints(cubesize*(this.popTimer/popTime)*gapness);
    }
    let slideTime = 10;
    if(this.slideTimer<slideTime){
      this.slideTimer+=1;
      for(let i = 0; i<3; i++){
        if(this.slideTo[i]!=this.slideFrom[i]){
          //console.log("me")
          this.pos[i] = this.slideFrom[i] + (this.slideTo[i]-this.slideFrom[i])*(this.slideTimer/slideTime);
        }
      }
      this.updatepoints(cubesize*gapness)
    }
    let color = colormap.get(this.value)+opacity+")";

    for(let dot of this.points){
      dot.project(camera);
      dot.color = color;
      if(toggledots){
        dot.draw();
      }
    }

    // if(this.value == 69){
    //   color = "rgb(255,255,255,0)";
    // }
    //https://en.wikipedia.org/wiki/Back-face_culling

    for(let i = 0; i<3; i++){
      for(let j = 0; j<2; j++){
        this.drawface(color, i, j*2-1);
      }
    }

    if(this.value != 69){
      let tempcenter = new Point(...this.pos, "red");
      tempcenter.project(camera);
      ctx.font = "bold " + (4*200*zoomfac)/gridth + "px Clear Sans";
      if(this.value >= 8){
        ctx.fillStyle = "rgb(249,246,242)"; //rgb(119,110,101)
        ctx.shadowColor = "black";
      } else {
        ctx.fillStyle = "rgb(119,110,101)";
        ctx.shadowColor = "white";
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowBlur = numberShadow;
      ctx.fillText(this.value, tempcenter.x, tempcenter.y);
      ctx.shadowBlur = 0;
    }

  }
  drawface(color, xyz, neg){
    if(!facesToDraw[(neg+1)/2+2*xyz]){
      return;
    }
    let indeces = cubefaces[(neg+1)/2+2*xyz];
    let normal = [0,0,0];
    normal[xyz] = neg;
    if(obfuscation&&this.index[xyz]+neg >= 0 && this.index[xyz]+neg < gridth){ //if within bounds, check if faces are covered
      let othercube = grid.cubes[this.index[0]+normal[0]] [this.index[1]+normal[1]] [this.index[2]+normal[2]];
      if(this.index!=69 && othercube != null){
        if(this.popTimer == 10 && this.slideTimer == 10 && othercube.popTimer == 10 && othercube.slideTimer == 10){
          if(!grid.explodeList[xyz]){
            return;
          }
        }
      }
    }
    let cull = 0;
    if(toggleCulling){
  		for(var j = 0; j < 3; j++){ // dot product of cam position and triangle pos
  			cull += (this.points[indeces[0]].pos[j]-camera.pos[j])*normal[j];
  		}
    } else{
      cull = -1;
    }
    if(cull < 0){
      ctx.beginPath();
      // ctx.strokeStyle = "rgba(255,255,255,0.4)"
      ctx.strokeStyle = "#bbada0";;
       ctx.shadowBlur = gridshadow;
      if(this.value!=69){
        ctx.lineWidth = (3*zoomfac)*cubelinewidth;
      } else{
        ctx.lineWidth = 2;
      }
      ctx.lineJoin = "round";
      ctx.fillStyle = color;
      ctx.moveTo(this.points[indeces[3]].x, this.points[indeces[3]].y);
      for(let index of indeces){
        ctx.lineTo(this.points[index].x, this.points[index].y);
      }
      ctx.fill();
      ctx.stroke();
      // ctx.shadowBlur = 0;
    }
  }
}

class Grid{
  constructor(){
    this.cubes = createCubeArray(gridth);
    this.explodeList = [false, false, false];
  }
  newcube(){
    let emptyIndeces = [];
    for(let i = 0; i<gridth; i++){
      for(let j = 0; j<gridth; j++){
        for(let k = 0; k<gridth; k++){
          if(this.cubes[i][j][k] == null){
            emptyIndeces.push([i,j,k])
          }
        }
      }
    }
    // console.log(emptyIndeces)
    if(emptyIndeces.length == 0){
      console.log("no more spaces!")
      return;
    }
    let whichone = randomRange(0, emptyIndeces.length - 1)
    let xyz = [0,0,0];
    for(let i = 0; i<3; i++){
      let urmom;
      if(grid.explodeList[i]){
        urmom = explodeFac;
      } else{
        urmom = 1;
      }
      xyz[i] = urmom*((-(gridth-1)*cubesize) + 2*cubesize*emptyIndeces[whichone][i]);
    }
    let thecube = new Cube(xyz[0],xyz[1],xyz[2], 2*randomRange(1,2), emptyIndeces[whichone]);
    this.cubes[emptyIndeces[whichone][0]][emptyIndeces[whichone][1]][emptyIndeces[whichone][2]] = thecube;
  }
  swipe(xyz, sign){ //0,1,2,  -1, 1
    const dirs = [[2,0,1],[1,2,0],[0,1,2]];
    let dir = dirs[xyz];
    let newarray = createCubeArray(gridth);
    let axis;
    let changed = false;

    for(let i = 0; i<gridth; i++){
      for(let j = 0; j<gridth; j++){
        let ray = [];
        for(let k = 0; k<gridth; k++){
          axis = [i,j,k];
          ray.push(this.cubes[axis[dir[0]]][axis[dir[1]]][axis[dir[2]]]);
        }
        let oldvals = [];
        for(let it of ray){
          if(it == null){
            oldvals.push(0);
          } else{
            oldvals.push(it.value)
          }
        }
        if(sign>0){
          ray.reverse()
        }
        let nullcounter = 0;
        for(let i = 0; i<gridth; i++){
          if(ray[i-nullcounter] == null){
            ray.splice(i-nullcounter,1);
            nullcounter+=1;
          }
        }

        if(ray.length > 1){
          ray = combine(ray);
        }
        while(ray.length<gridth){
          ray.push(null);
        }
        if(sign>0){
          ray.reverse();
        }
        let newvals = [];
        for(let it of ray){
          if(it == null){
            newvals.push(0);
          } else{
            newvals.push(it.value)
          }
        }
        for(let b = 0; b<gridth; b++){
          if(oldvals[b] != newvals[b]){
            changed = true;
          }
        }

        for(let k = 0; k<ray.length; k++){
          if(ray[k] != null){
            ray[k].slideTimer = 10;
            axis = [i,j,k];
            let urmom;
            for(let bruh = 0; bruh<3; bruh++){
              if(grid.explodeList[bruh]){
                urmom = explodeFac;
              } else{
                urmom = 1;
              }
              ray[k].slideTo[bruh] = urmom*((-(gridth-1)*cubesize) + 2*cubesize*[axis[dir[0]],axis[dir[1]],axis[dir[2]]][bruh]);
              if(ray[k].slideTo[bruh] != ray[k].pos[bruh]){
                ray[k].slideTimer = 0;
                changed = true;
              }
            }

            ray[k].slideFrom = ray[k].pos//this.cubes[axis[dir[0]]][axis[dir[1]]][axis[dir[2]]].pos;

            ray[k].index = [axis[dir[0]], axis[dir[1]], axis[dir[2]]];
            newarray[axis[dir[0]]][axis[dir[1]]][axis[dir[2]]] = ray[k];

          }
        }
      }
    }
    this.cubes = newarray;
    if(changed){
      this.newcube();
    }
    refresh();
  }
  draw(){
    let distances = [];
    let indeces = [];
    let dist = 0;
    for(let i = 0; i<gridth; i++){
      for(let j = 0; j<gridth; j++){
        for(let k = 0; k<gridth; k++){
          if(this.cubes[i][j][k] != null){
            //console.log(distances.length + "'nth cube")
            dist = Math.hypot(this.cubes[i][j][k].pos[0] - camera.pos[0], this.cubes[i][j][k].pos[1] - camera.pos[1], this.cubes[i][j][k].pos[2] - camera.pos[2]);
            if(distances.length == 0){
              distances.push(dist);
              indeces.push([i,j,k]);
              //console.log("firstcube")
            }else{
              for(let l = 0; l<distances.length; l++){
                if(dist>distances[l]){
                  distances.splice(l,0,dist); //if greater. put before the one its less than
                  indeces.splice(l,0,[i,j,k]);
                  //console.log("inserted before something")
                  break;
                } else if(l+1 == distances.length){ //if its the last term and not more,
                  distances.push(dist);
                  indeces.push([i,j,k]);
                  //console.log("inserted at the end")
                  break;

                }
              }
            }
          }
        }
      }
    }
    //console.log(distances);

    for(let indarry of indeces){
      this.cubes[indarry[0]][indarry[1]][indarry[2]].draw();
    }
  }
  explode(factors){
    for(let i = 0; i<gridth; i++){
      for(let j = 0; j<gridth; j++){
        for(let k = 0; k<gridth; k++){
          if(this.cubes[i][j][k] != null){
            this.cubes[i][j][k].slideTimer = 0;
            for(let l = 0; l<3; l++){
              this.cubes[i][j][k].slideFrom[l] = this.cubes[i][j][k].pos[l];
              this.cubes[i][j][k].slideTo[l] = factors[l]*((-(gridth-1)*cubesize) + 2*cubesize*[i,j,k][l]);
            }
            // console.log(this.cubes[i][j][k].slideFrom)
            // console.log(this.cubes[i][j][k].slideTo)
          }
        }
      }
    }
  }
}

function createCubeArray(sidelength){
  let arry = [];
  for(let i = 0; i<sidelength; i++){
    let square = []
    for(let i = 0; i<sidelength; i++){
      square.push(Array(sidelength)); //push a line to the square
    }
    arry.push(square); //push a square to the cube
  }
  // console.log(arry);
  return arry;
}


function combine(ray, i=0){
  if(i >= ray.length-1){
    return ray;
  }
  if(ray[i].value == ray[i+1].value){
    ray[i].value *= 2;
    ray.splice(i+1, 1);
  }
  return combine(ray, i+1);
}
