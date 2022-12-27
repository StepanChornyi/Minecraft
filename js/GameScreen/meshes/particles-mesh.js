import { Black, ColorHelper, HSV, MathEx } from 'black-engine';
import Mesh from './mesh';
import WEBGL_UTILS from '../../utils/webgl-utils';
import Vector3 from '../../utils/vector3';
import MESH_TEXTURES from '../world/mesh-generator/mesh-textures';
import LightEngine from '../world/mesh-generator/LightEngine';
import CONFIG from '../world/config';
import AABBPhysics from '../aa-bb-physics';

let gl = null;
let program = null;
let texture = null;

const vs = `
precision mediump float;

attribute vec3 vertPosition;
attribute vec4 textureCoord;
attribute float pointSize;
attribute float pointLight;

uniform mat4 mView;
uniform mat4 mProj;

varying float fragLight;
varying vec4 texCoord;

void main() {
  texCoord = textureCoord;
  fragLight = pointLight;

  gl_Position =  mProj * mView * vec4(vertPosition, 1.0);
  gl_PointSize = pointSize / gl_Position.z;

  if(gl_Position.z < 0.1){
    gl_PointSize = 0.0; 
  }
}
`;

const fs = `
precision mediump float;

varying float fragLight;
varying vec4 texCoord;
uniform sampler2D spriteTexture; 

void main() {
  vec3 color = vec3(1.00, 0.26, 0.58);
  vec4 fragCol =texture2D(spriteTexture,vec2( texCoord.x + (texCoord.z-texCoord.x)*gl_PointCoord.x,  texCoord.y + (texCoord.w-texCoord.y)*gl_PointCoord.y));

  if(fragCol.w < 0.5){
    discard;
  }

  fragCol.w = 1.0;

  gl_FragColor = fragCol*fragLight;
}
`;

// let matWorldUniformLocation;
let matViewUniformLocation;
let matProjUniformLocation;

class Particle {
  constructor() {
    this.position = new Vector3();
    this.velocity = new Vector3();
    this.size = 0;
    this.rnd = 0;
    this.texture = { x: 0, y: 0 };
  }
}

const textureSize = 512;
const blockSideUVSize = 16 / textureSize;
const blockSideUVOffset = 24 / textureSize;
const pixelSize = 1 / textureSize;
const pixelOffset = 0.001 / textureSize;
const sizeMultiplier = 20;

export default class ParticlesMesh extends Mesh {
  constructor(gl_context, world) {
    gl = gl_context;

    if (!program) {
      program = WEBGL_UTILS.createProgram(gl, vs, fs);

      // matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
      matViewUniformLocation = gl.getUniformLocation(program, 'mView');
      matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
    }

    super(gl, program);

    this.world = world;

    this._particles = [];
  }

  emit(x, y, z, type, count) {
    for (let i = 0; i < count; i++) {
      this.emitOne(x + btw(0.1, 0.9), y + btw(0.1, 0.9), z + btw(0.1, 0.9), type);
    }
  }

  emitOne(x, y, z, type) {
    const p = new Particle();

    p.position.set(x, y, z);
    p.velocity.set(range(0.03), 0.02 + Math.random() * 0.08, range(0.03));
    p.size = btw(3, 5);
    p.rnd = btwInt(0, 8);

    let keys = [];

    for (const key in MESH_TEXTURES[type]) {
      if (Object.hasOwnProperty.call(MESH_TEXTURES[type], key)) {
        keys.push(key);
      }
    }

    const key = rndPick(keys);

    p.texture.x = blockSideUVOffset + MESH_TEXTURES[type][key][0] * (blockSideUVSize + blockSideUVOffset * 2);
    p.texture.y = blockSideUVOffset + MESH_TEXTURES[type][key][1] * (blockSideUVSize + blockSideUVOffset * 2);

    this._particles.push(p);
  }

  _update() {
    const particles = [];

    for (let i = 0; i < this._particles.length; i++) {
      const p = this._particles[i];

      const prevSize = Math.round(p.size);

      p.size *= 0.997;

      if (p.size <= 3) {
        continue;
      }

      if (prevSize !== Math.round(p.size)) {
        p.rnd = btwInt(0, 8);
      }

      p.velocity.addXYZ(0, -0.005, 0);
      p.velocity.multiplyScalar(0.99);

      AABBPhysics.collidePointWithWorld(p.position, p.velocity, this.world);
      // p.position.add(p.velocity);

      particles.push(p);
    }

    this._particles = particles;

    this.vertices.splice(0);

    for (let i = 0, p; i < particles.length; i++) {
      p = particles[i];

      const block = this.world.getBlock(Math.floor(p.position.x), Math.floor(p.position.y), Math.floor(p.position.z));

      if (!block.isTransparent) {
        p.size = 0;
        continue;
      }

      const light = 0.1 + (LightEngine.getLight(block.light) / CONFIG.MAX_LIGHT) * 0.9;
      const size = Math.round(p.size);
      const textureMinX = p.texture.x + pixelSize * p.rnd + pixelOffset;
      const textureMinY = p.texture.y + pixelSize * p.rnd + pixelOffset;
      const textureMaxX = textureMinX + pixelSize * size - pixelOffset * 2;
      const textureMaxY = textureMinY + pixelSize * size - pixelOffset * 2;

      this.vertices.push(
        p.position.x,
        p.position.y,
        p.position.z,
        textureMinX,
        textureMinY,
        textureMaxX,
        textureMaxY,
        size * sizeMultiplier,
        light
      );
    }

    if (particles.length)
      this.drawBuffersData();
  }

  drawBuffersData() {
    gl.useProgram(this.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);

    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.DYNAMIC_DRAW);
  }

  render(camera, blockIndex = null) {
    this._update();

    if (!this.vertices.length)
      return;

    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    gl.disable(gl.BLEND);
    gl.colorMask(true, true, true, false);

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, camera.projectionMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, camera.viewMatrix);
    // gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, this.transformMatrix);

    gl.drawArrays(gl.POINTS, 0, this.vertices.length / 9);
  }

  updateAttribPointers() {
    super.updateAttribPointers();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    const texCoordAttribLocation = gl.getAttribLocation(program, 'textureCoord');
    const sizeAttribLocation = gl.getAttribLocation(program, 'pointSize');
    const lightAttribLocation = gl.getAttribLocation(program, 'pointLight');

    gl.vertexAttribPointer(
      positionAttribLocation,
      3,
      gl.FLOAT,
      gl.FALSE,
      9 * Float32Array.BYTES_PER_ELEMENT,
      0
    );

    gl.vertexAttribPointer(
      texCoordAttribLocation,
      4,
      gl.FLOAT,
      gl.FALSE,
      9 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );


    gl.vertexAttribPointer(
      sizeAttribLocation,
      1,
      gl.FLOAT,
      gl.FALSE,
      9 * Float32Array.BYTES_PER_ELEMENT,
      7 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.vertexAttribPointer(
      lightAttribLocation,
      1,
      gl.FLOAT,
      gl.FALSE,
      9 * Float32Array.BYTES_PER_ELEMENT,
      8 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);
    gl.enableVertexAttribArray(sizeAttribLocation);
    gl.enableVertexAttribArray(lightAttribLocation);
  }
}

function btw(min, max) {
  return min + Math.random() * (max - min);
}

function btwInt(min, max) {
  return Math.round(btw(min, max));
}

function rndPick(arr) {
  return arr[btwInt(0, arr.length - 1)];
}

function range(val) {
  return (Math.random() * 2 - 1) * val;
}