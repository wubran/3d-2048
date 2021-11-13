//this file contains the Cube & Grid classes and the createCubeArray & drawface functions.

class Cube{
  constructor(x,y,z,val){
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
      dot.draw();
    }
    if(this.value == 69){
      color = "rgb(255,255,255,0)";
    }
    drawface(this.points, [0, 1, 3, 2], color);
    drawface(this.points, [0, 1, 5, 4], color);
    drawface(this.points, [2, 3, 7, 6], color);
    drawface(this.points, [0, 2, 6, 4], color);
    drawface(this.points, [1, 3, 7, 5], color);
    drawface(this.points, [4, 5, 7, 6], color);

    if(this.value == 69){return;}

    let tempcenter = new Point(...this.pos, "red");
    tempcenter.project(camera);
    ctx.font = "" + (200/Math.sqrt(initcamdist)) + "px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur = 5;
    ctx.shadowColor = "black";
    ctx.fillText(this.value, tempcenter.x, tempcenter.y);
    ctx.shadowBlur = 0;

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
    let thecube = new Cube(xyz[0],xyz[1],xyz[2], 2*randomRange(1,2));
    this.cubes[emptyIndeces[whichone][0]][emptyIndeces[whichone][1]][emptyIndeces[whichone][2]] = thecube;
  }
  swipe(xyz, sign){ //0,1,2,  -1, 1
    const dirs = [[[-1,0,0],[1,0,0]],
          [[0,-1,0],[0,1,0]],
          [[0,0,-1],[0,0,1]]];
    let dir = dirs[xyz][(sign+1)/2];
    let newarray = createCubeArray(gridth);
    let changed = false;

    for(let i = 0; i<gridth; i++){
      for(let j = 0; j<gridth; j++){
        for(let k = 0; k<gridth; k++){
          if(this.cubes[i][j][k] != null){
            let steps = 0;
            let ray = [];
            let cap = 0;
            if(sign==1){
              cap = gridth - [i,j,k][xyz];
            } else{
              cap = [i,j,k][xyz]+1;
            }
            while(steps < cap){ //while in bounds
              if(this.cubes[i+steps*dir[0]] != null && this.cubes[i+steps*dir[0]][j+steps*dir[1]] != null && this.cubes[i+steps*dir[0]][j+steps*dir[1]][k+steps*dir[2]] != null){
                ray.push(this.cubes[i+steps*dir[0]][j+steps*dir[1]][k+steps*dir[2]].value);
              } else{
                ray.push(null);
              }
              steps++;
            }
            //console.log(ray);
            if(ray.includes(null)){
              let nullcount = 0;
              changed = true;
              for(let each of ray){
                if(each == null){
                  nullcount++;
                }
              }

              let newx = i+nullcount*dir[0];
              let newy = j+nullcount*dir[1];
              let newz = k+nullcount*dir[2];
              // console.log(this.cubes[i][j][k].pos)
              let oldpos = this.cubes[i][j][k].pos;
              for(let bruh = 0; bruh<3; bruh++){
                let urmom;
                if(grid.explodeList[bruh]){
                  urmom = explodeFac;
                } else{
                  urmom = 1;
                }
                this.cubes[i][j][k].slideTo[bruh] = urmom*((-(gridth-1)*cubesize) + 2*cubesize*[newx,newy,newz][bruh]);
              }
              this.cubes[i][j][k].slideFrom = oldpos;
              this.cubes[i][j][k].slideTimer = 0;
              //this.cubes[i][j][k].updatepoints(cubesize);
              // console.log(this.cubes[i][j][k].pos)
              newarray[newx][newy][newz] = this.cubes[i][j][k];
            } else {
              newarray[i][j][k] = this.cubes[i][j][k];
            }
          }
        }
      }
    }
    // console.log(this.cubes);
    // console.log(newarray);

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

function drawface(points, indeces, color){
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.fillStyle = color;
  ctx.moveTo(points[indeces[3]].x, points[indeces[3]].y);
  for(let index of indeces){
    ctx.lineTo(points[index].x, points[index].y);
  }
  ctx.fill();
  ctx.stroke();
}
