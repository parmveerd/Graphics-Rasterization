import { Mat4 } from './math.js';
import { Parser } from './parser.js';
import { Scene } from './scene.js';
import { Renderer } from './renderer.js';
import { TriangleMesh } from './trianglemesh.js';
// DO NOT CHANGE ANYTHING ABOVE HERE

////////////////////////////////////////////////////////////////////////////////
// TODO: Implement createCube, createSphere, computeTransformation, and shaders
////////////////////////////////////////////////////////////////////////////////


// Example two triangle quad
const quad = {
  positions: [1, 1, 1, -1, 1, 1, -1, 1, -1, 
              1, 1, 1, 1, 1, -1, -1, 1, -1, 
              1, 1, 1, 1, 1, -1, 1, -1, -1, 
              1, 1, 1, 1, -1, 1, 1, -1, -1, 
              1, 1, 1, -1, 1, 1, -1, -1, 1, 
              1, 1, 1, 1, -1, 1, -1, -1, 1, 
              -1, -1, -1, -1, 1, -1, -1, 1, 1, 
              -1, -1, -1, -1, -1, 1, -1, 1, 1, 
              -1, -1, -1, -1, 1, -1, 1, 1, -1, 
              -1, -1, -1, 1, -1, -1, 1, 1, -1, 
              -1, -1, -1, 1, -1, -1, 1, -1, 1, 
              -1, -1, -1, -1, -1, 1, 1, -1, 1],
  normals: [0, 1, 0, 0, 1, 0, 0, 1, 0, 
            0, 1, 0, 0, 1, 0, 0, 1, 0, 
            1, 0, 0, 1, 0, 0, 1, 0, 0, 
            1, 0, 0, 1, 0, 0, 1, 0, 0, 
            0, 0, 1, 0, 0, 1, 0, 0, 1, 
            0, 0, 1, 0, 0, 1, 0, 0, 1, 
            -1, 0, 0, -1, 0, 0, -1, 0, 0, 
            -1, 0, 0, -1, 0, 0, -1, 0, 0, 
            0, 0, -1, 0, 0, -1, 0, 0, -1, 
            0, 0, -1, 0, 0, -1, 0, 0, -1, 
            0, -1, 0, 0, -1, 0, 0, -1, 0, 
            0, -1, 0, 0, -1, 0, 0, -1, 0],
  uvCoords: [0.5, 0, 0, 0, 0, 1/3, 
            0.5, 0, 0.5, 1/3, 0, 1/3, 
            0, 2/3, 0.5, 2/3, 0.5, 1/3, 
            0, 2/3, 0, 1/3, 0.5, 1/3, 
            0.5, 1, 0, 1, 0, 2/3, 
            0.5, 1, 0.5, 2/3, 0, 2/3, 
            0.5, 1/3, 0.5, 2/3, 1, 2/3, 
            0.5, 1/3, 1, 1/3, 1, 2/3, 
            1, 0, 1, 1/3, 0.5, 1/3, 
            1, 0, 0.5, 0, 0.5, 1/3, 
            0.5, 2/3, 1, 2/3, 1, 1, 
            0.5, 2/3, 0.5, 1, 1, 1]
}

TriangleMesh.prototype.createCube = function() {
  // TODO: populate unit cube vertex positions, normals, and uv coordinates
  this.positions = quad.positions;
  this.normals = quad.normals;
  this.uvCoords = quad.uvCoords;
}

TriangleMesh.prototype.createSphere = function(numStacks, numSectors) {
  // TODO: populate unit sphere vertex positions, normals, uv coordinates, and indices

  let x, y, z, xy;
  let radius = 1.0;
  let nx, ny, nz, lengthInv = 1.0/radius;
  let s, t;

  let sectorStep = 2*Math.PI/numSectors;
  let stackStep = Math.PI/numStacks;
  let sectorAngle, stackAngle;

  for (let i = 0; i <= numStacks; ++i) {
    stackAngle = Math.PI/2 - i*stackStep;
    xy = radius * Math.cos(stackAngle);
    z = radius * Math.sin(stackAngle);

    for (let j = 0; j <= numSectors; ++j) {
      sectorAngle = j*sectorStep;

      x = xy * Math.cos(sectorAngle);
      y = xy * Math.sin(sectorAngle);
      this.positions.push(x);
      this.positions.push(y);
      this.positions.push(z);

      nx = x*lengthInv;
      ny = y*lengthInv;
      nz = z*lengthInv;
      this.normals.push(nx);
      this.normals.push(ny);
      this.normals.push(nz);

      s = j/numSectors;
      t = i/numStacks;
      this.uvCoords.push(s);
      this.uvCoords.push(t);
    }
  }

  let k1, k2;
  for (let i = 0; i < numStacks; ++i) {
    k1 = i*(numSectors+1);
    k2 = k1 + numSectors + 1;

    for (let j = 0; j < numSectors; ++j, ++k1, ++k2) {
      if (i != 0) {
        this.indices.push(k1);
        this.indices.push(k2);
        this.indices.push(k1+1);
      }
      if (i != (numStacks-1)) {
        this.indices.push(k1+1);
        this.indices.push(k2);
        this.indices.push(k2+1);
      }
    }
  }
}

Scene.prototype.computeTransformation = function(transformSequence) {
  // TODO: go through transform sequence and compose into overallTransform
  let overallTransform = Mat4.create();  // identity matrix

  // loop through entire transfrom sequence and multiply matrices
  for (let i = 0; i < transformSequence.length; i++) {
    let temp = Mat4.create();
    if (transformSequence[i][0] == 'T') {
      temp[3] = transformSequence[i][1];
      temp[7] = transformSequence[i][2];
      temp[11] = transformSequence[i][3];
      Mat4.multiply(overallTransform, overallTransform, temp);
    }
    else if (transformSequence[i][0] == 'S') {
      temp[0] = transformSequence[i][1];
      temp[5] = transformSequence[i][2];
      temp[10] = transformSequence[i][3];
      Mat4.multiply(overallTransform, overallTransform, temp);
    }
    else if (transformSequence[i][0] == 'Rz') {
      let rad = transformSequence[i][1]*Math.PI/180;
      temp[0] = Math.cos(rad);
      temp[1] = -Math.sin(rad);
      temp[4] = Math.sin(rad);
      temp[5] = Math.cos(rad);
      Mat4.multiply(overallTransform, overallTransform, temp);
    }
    else if (transformSequence[i][0] == 'Ry') {
      let rad = transformSequence[i][1]*Math.PI/180;
      temp[0] = Math.cos(rad);
      temp[2] = Math.sin(rad);
      temp[8] = -Math.sin(rad);
      temp[10] = Math.cos(rad);
      Mat4.multiply(overallTransform, overallTransform, temp);
    }
    else if (transformSequence[i][0] == 'Rx') {
      let rad = transformSequence[i][1]*Math.PI/180;
      temp[5] = Math.cos(rad);
      temp[6] = -Math.sin(rad);
      temp[9] = Math.sin(rad);
      temp[10] = Math.cos(rad);
      Mat4.multiply(overallTransform, overallTransform, temp);
    }
  }
  
  Mat4.transpose(overallTransform, overallTransform);
  return overallTransform;
}

Renderer.prototype.VERTEX_SHADER = `
precision mediump float;
attribute vec3 position, normal;
attribute vec2 uvCoord;
uniform vec3 lightPosition;
uniform mat4 projectionMatrix, viewMatrix, modelMatrix;
uniform mat3 normalMatrix;
varying vec2 vTexCoord;

// TODO: implement vertex shader logic below

varying vec3 fNormal;
varying vec3 fPosition;

void main() {

  fNormal = normalize(normalMatrix * normal);
  vec3 new_pos = vec3(position.x, position.y, position.z);
  vec4 pos = viewMatrix * modelMatrix * vec4(position, 1.0);
  fPosition = pos.xyz;
  gl_Position = projectionMatrix * pos;
}
`;

Renderer.prototype.FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 ka, kd, ks, lightIntensity;
uniform float shininess;
uniform sampler2D uTexture;
uniform bool hasTexture;
varying vec2 vTexCoord;

// TODO: implement fragment shader logic below

varying vec3 fNormal;
varying vec3 fPosition;

void main() {

  vec3 light_dir = vec3(1.0, 1.0, 1.0);
  vec3 light_col = vec3(1.0, 1.0, 1.0);

  vec3 ca = ka * lightIntensity;

  float n_dot_l = dot(fNormal, light_dir);
  vec3 cd = kd * light_col * max(0.0, n_dot_l);

  vec3 v = -normalize(fPosition);
  vec3 r = reflect(-light_dir, fNormal);
  float v_dot_r = dot(v, r);
  vec3 cs = pow(max(0.0, v_dot_r), shininess) * ks;

  vec3 col = ca + cd + cs;

  if (hasTexture) {
    gl_FragColor = texture2D(uTexture, vTexCoord) * vec4(col, 1.0);
  }
  else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////
const DEF_INPUT = [
  "c,myCamera,perspective,5,5,5,0,0,0,0,1,0;",
  "l,myLight,point,0,5,0,2,2,2;",
  "p,unitCube,cube;",
  "p,unitSphere,sphere,20,20;",
  "m,redDiceMat,0.3,0,0,0.7,0,0,1,1,1,15,dice.jpg;",
  "m,grnDiceMat,0,0.3,0,0,0.7,0,1,1,1,15,dice.jpg;",
  "m,bluDiceMat,0,0,0.3,0,0,0.7,1,1,1,15,dice.jpg;",
  "m,globeMat,0.3,0.3,0.3,0.7,0.7,0.7,1,1,1,5,globe.jpg;",
  "o,rd,unitCube,redDiceMat;",
  "o,gd,unitCube,grnDiceMat;",
  "o,bd,unitCube,bluDiceMat;",
  "o,gl,unitSphere,globeMat;",
  "X,rd,Rz,75;X,rd,Rx,90;X,rd,S,0.5,0.5,0.5;X,rd,T,-1,0,2;",
  "X,gd,Ry,45;X,gd,S,0.5,0.5,0.5;X,gd,T,2,0,2;",
  "X,bd,S,0.5,0.5,0.5;X,bd,Rx,90;X,bd,T,2,0,-1;",
  "X,gl,S,1.5,1.5,1.5;X,gl,Rx,90;X,gl,Ry,-150;X,gl,T,0,1.5,0;",
].join("\n");

// DO NOT CHANGE ANYTHING BELOW HERE
export { Parser, Scene, Renderer, DEF_INPUT };
