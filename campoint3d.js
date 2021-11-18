//this file contains the Cam and Point classes and the updatefov function.

//MATH SOURCES:
  //plane from a point and a normal vector: https://www.youtube.com/watch?v=2sZKZHyaQJ8&ab_channel=TheOrganicChemistryTutor
  //3d line from two points: https://www.youtube.com/watch?v=JlRagTNGBF0&ab_channel=DavidLippman
  //point where line intersects plane: https://www.youtube.com/watch?v=qVvvy5hsQwk&ab_channel=patrickJMT
  //change of basis vectors: https://www.youtube.com/watch?v=P2LTAUO1TdA&ab_channel=3Blue1Brown

class Cam{
  constructor(x,y,z){
    this.pos = [x,y,z];
    this.origin = [0,0,0];
    this.vector = [0,0,0]; //also doubles as plane abc

    this.pdist = initcamdist*planetosize;
    this.ppoint = [0,0,0];
    this.pconst = 0;
    this.pdistratio = 0;

    this.ihat = [0,0,0];
    this.jhat = [0,0,0];

    this.yaw = Math.atan(this.pos[1]/this.pos[0]);
    this.pitch = 0; //IDKK???
  }
  update(){
    for(var i = 0; i < 3; i++){
      this.vector[i] = this.pos[i]-this.origin[i];
    }
    let dist = Math.hypot(this.vector[0], this.vector[1], this.vector[2]);
    this.pdistratio = 1+this.pdist/dist;
    this.pconst = 0;
    for(var i = 0; i < 3; i++){
      this.ppoint[i] = this.vector[i]*this.pdistratio; //find the plane point via similar triangles
      this.pconst += this.vector[i]*this.ppoint[i]; //axp + byp + czp
    }

    this.ihat = [this.vector[1], -this.vector[0], 0];
    // plane: ax + by + cz = pconst
    // plane: z = (pconst - ax - by)/c
    // deltaz = z - pconst/c <-- plane at x=0, y=0, cancel out things to get below
    let deltaz = (this.vector[0]*this.vector[0] + this.vector[1]*this.vector[1])/this.vector[2];

    this.jhat = [-this.vector[0], -this.vector[1], deltaz];

    let idist = Math.hypot(this.ihat[0], this.ihat[1], this.ihat[2]); //normalize
    let jdist = Math.hypot(this.jhat[0], this.jhat[1], this.jhat[2]);
    for(var i = 0; i < 3; i++){
      this.ihat[i] /= idist;
      this.jhat[i] /= jdist;
    }
    //console.log(Math.hypot(this.ihat[0], this.ihat[1], this.ihat[2]),Math.hypot(this.jhat[0], this.jhat[1], this.jhat[2])) both should be 1 (proves vectors normalized)

  }
  orbit(yaw, pitch){ //yaw is side to side, pitch is up and down
      //yaw doesnt effect Z, so it is basically 2d rotation
      //pitch.... dagnabbit
      //given an angle, move x this way and y this way along circle with radius _.
      let topradius = Math.hypot(this.pos[0]-this.origin[0], this.pos[1]-this.origin[1]);

      this.yaw+=yaw;
      if(this.yaw >= 2*Math.PI){
        this.yaw -= 2*Math.PI;
      } else if(this.yaw < 0){
        this.yaw += 2*Math.PI;
      }

      this.pos[0] = topradius * Math.cos(this.yaw);
      this.pos[1] = topradius * Math.sin(this.yaw);


      // end yaw, start pitch

      // 1. yaw back theta so that theta = 0
      // 2. do what was done for yaw but upwards on plane z and x (since +x axis is the universal 0 angle)
      // 3. yaw forward theta

      let flatx = this.pos[0]*Math.cos(-this.yaw) - this.pos[1]*Math.sin(-this.yaw); // step 1
      if(flatx >= 0){
        this.pitch = Math.atan(this.pos[2]/flatx);
      } else {
        this.pitch = Math.atan(this.pos[2]/flatx)+Math.PI;
      }
      // let flaty = this.pos[1]*Math.cos(-this.yaw) + this.pos[0]*Math.sin(-this.yaw); // (this makes y = 0) the point is now on the xz plane
      let sideradius = Math.hypot(flatx-this.origin[0], this.pos[2]-this.origin[2]);

      this.pitch+=pitch;
      if(this.pitch >= 2*Math.PI){
        this.pitch -= 2*Math.PI;
      } else if(this.pitch < 0){
        this.pitch += 2*Math.PI;
      }

      if(this.pitch > 0.5*Math.PI && this.pitch < Math.PI){
        this.pitch = 0.5*Math.PI-0.0000001;
      } else if(this.pitch < 1.5*Math.PI && this.pitch > Math.PI){
        this.pitch = 1.5*Math.PI+0.0000001;
      }
      //console.log(this.pitch);

      let newflatx = sideradius * Math.cos(this.pitch);
      let newflatz = sideradius * Math.sin(this.pitch);

      this.pos[0] = newflatx*Math.cos(this.yaw);
      this.pos[1] = newflatx*Math.sin(this.yaw);
      this.pos[2] = newflatz;




  }
  slide(x,y){

  }
  zoom(inout, amt){
    let vect = [0,0,0];
    for(var i = 0; i < 3; i++){
      vect[i] = this.vector[i]/(initcamdist);
      this.pos[i]+=Math.sqrt(0.004*initcamdist**2*amt)*vect[i]*inout;
    }
    initcamdist += Math.sqrt(0.012*initcamdist**2*amt)*inout;
    updatefov();
    zoomfac = 1/Math.sqrt(initcamdist);

  }
}

class Point{
  constructor(x, y, z, color){
    this.pos = [x,y,z];
    this.slopes = [0,0,0]; //direction vector
    this.psect = [0,0,0]; //intersect with camera plane
    this.jscale = 0;
    this.iscale = 0;
    this.x = 0;
    this.y = 0;
    this.color = color;
  }
  project(cam){ // Note: process explanation below may not be 100% accurate
    // r(t) = {x0, y0, z0} + t{xc-x0, xc-y0, xc-z0} example: x0 + t(xc-x0) = x(t) is x component of the line where x0y0z0 is POINT
    // plane: a(x-xp) + b(y-yp) + c(z-zp) = 0 where xpypzp is planepoint and abc is vector
    // plane: ax + by + cz = axp + byp + czp
    // plane: a(x0 + t(xc-x0)) + b(y0 + t(yc-y0)) + c(z0 + t(zc-z0)) = pconst <-- (axp + byp + czp)
    // plane: t(a(slopes[0]) + b(slopes[1]) + b(slopes[2])) = pconst -ax0-by0-cz0 <-- slopes[0] is (xc-x0) and x0 is POINT
    // t = (pconst-ax0-by0-cz0) / (a(slopes[0]) + b(slopes[1]) + c(slopes[2])) YAY!
    // t = (stepone) / (steptwo) YAY!
    // 1: find plane point and vector
    // 2: find plane
    // 3: find line from projecting point to camera focus
    // 4: find the intersection between line and plane
    // 5: find the new basis vectors for the plane and use them to convert to flat
    let stepone = cam.pconst;
    let steptwo = 0;
    for(var i = 0; i < 3; i++){
      stepone -= cam.vector[i]*this.pos[i];
      this.slopes[i] = cam.pos[i]-this.pos[i];//cam.pos[i]-this.pos[i];
      steptwo += cam.vector[i]*this.slopes[i];
    }
    let t = stepone/steptwo;
    let newvector = [0,0,0];
    for(var i = 0; i < 3; i++){
      this.psect[i] = this.pos[i] + this.slopes[i]*t;
      newvector[i] = this.psect[i] - cam.ppoint[i];
    }
    //console.log(cam.vector, this.slopes, cam.pconst, this.psect, cam.ppoint, cam.pdistratio);

    this.jscale = newvector[2]/cam.jhat[2]
    for(var i = 0; i < 3; i++){
      newvector[i] -= this.jscale*cam.jhat[i]
    }
    this.iscale = newvector[0]/cam.ihat[0];
    //console.log(newvector[0]/cam.ihat[0]); this and
    //console.log(newvector[1]/cam.ihat[1]); this are the SAME thing!! (proves that dimention was eliminated)
    //console.log(newvector, cam.jhat, cam.ihat, this.jscale, this.iscale, cam.ppoint, this.psect)
    this.x = this.iscale*bigness + xcenter;
    this.y = this.jscale*bigness*Math.sign(cam.vector[2]) + ycenter; //math.sign is a TEMPORARY FIX!!!!
  }
  draw(dotrad = dotradius){
    // let pointsize = 200/Math.hypot(this.slopes[0], this.slopes[1],this.slopes[2]);
    // if(pointsize >= 6){
    // 	pointsize = 6;
    // } //issue: pointsize would change with the perspective disortion
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, dotrad, 0, 2 * Math.PI);
    ctx.fill();
    //console.log("ok")
  }
}

function updatefov(){
  let scalefac = (initcamdist*camdistort/50)/(Math.hypot(camera.vector[0], camera.vector[1], camera.vector[2]));
  camera.pdist *= scalefac;
  for(var i = 0; i < 3; i++){
    camera.pos[i] *= scalefac;
  }
}
