import { Black, ColorHelper, HSV, MathEx } from 'black-engine';
import Mesh from './mesh';
import WEBGL_UTILS from '../../utils/webgl-utils';
import uvSphere from 'primitive-sphere';
import SunMesh from './sun-mesh';

let gl = null;
let program = null;
let texture = null;

const vs = `
precision mediump float;

attribute vec3 vertPosition;
// attribute vec3 vertColor;

varying vec3 fragColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
  vec3 skyColor = vec3(0.55, 0.74, 1.00);
  vec3 fogColor = vec3(0.69, 0.82, 0.96);
  vec3 sunsetColor = vec3(0.80, 0.36, 0.22);

  float skyFactor = 1.0;


  float sunFactor = min(1.0, 220.0 / distance(vertPosition, vec3(0.0, 1000.0, 0.0)));
  
  fragColor = (vertPosition.y > 150.0 ? skyColor  : fogColor)*skyFactor;

  fragColor = fragColor + sunsetColor * sunFactor*0.0;

  vec4 glPos = mProj * mView * mWorld * vec4(vertPosition, 1.0);
  
  glPos.z = 1.0;

  gl_Position = glPos;
}
`;

const fs = `
precision mediump float;

varying vec3 fragColor;

void main() {
  gl_FragColor = vec4(fragColor, 1.0);
}
`;
//0xafd2f6
//0x8bbdff
const rgb = ColorHelper.hex2rgb(0xff4294);
//0xcd5d38
rgb.r /= 255;
rgb.g /= 255;
rgb.b /= 255;

console.log(rgb.r.toFixed(2) + ', ' + rgb.g.toFixed(2) + ', ' + rgb.b.toFixed(2));

let matWorldUniformLocation;
let matViewUniformLocation;
let matProjUniformLocation;

export default class SkyMesh extends Mesh {
  constructor(gl_context,) {
    gl = gl_context;

    if (!program) {
      program = WEBGL_UTILS.createProgram(gl, vs, fs);

      matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
      matViewUniformLocation = gl.getUniformLocation(program, 'mView');
      matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
    }

    super(gl, program);

    this.sun = new SunMesh(gl);

    this._init();
  }

  _init() {
    const radius = 1000;

    const { positions, cells } = uvSphere(radius, { segments: 16 });

    for (let i = 0; i < positions.length; i++) {
      this.vertices.push(...positions[i]);
    }

    for (let i = 0; i < cells.length; i++) {
      cells[i].reverse();

      this.indices.push(...cells[i]);
    }

    this.rotationX = MathEx.DEG2RAD * 0;


    // for (let i = 0; i < vertices.length; i += 3) {
    //   const v0 = vertices[i];
    //   const v1 = vertices[i + 1];
    //   const v2 = vertices[i + 2];
    //   // const color = ColorHelper.hsv2rgb(new HSV(MathEx.lerp(0, 0.5, Math.random()), 0.8, 0.7));

    //   // color.r /= 255;
    //   // color.g /= 255;
    //   // color.b /= 255;

    //   this.vertices.push(v0 * radius, v1 * radius, v2 * radius);
    // }

    // this.indices.push(...triangles);

    this.drawBuffersData();
  }

  drawBuffersData() {
    gl.useProgram(this.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.DYNAMIC_DRAW);
  }

  render(camera, blockIndex = null) {
    gl.useProgram(program);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    gl.disable(gl.BLEND);
    gl.colorMask(true, true, true, false);

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, camera.projectionMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, camera.viewMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, this.transformMatrix);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

    this.sun.x = this.x;
    this.sun.y = this.y;
    this.sun.z = this.z;

    this.sun.render(camera);
  }

  updateAttribPointers() {
    super.updateAttribPointers();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    // const colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
      positionAttribLocation,
      3,
      gl.FLOAT,
      gl.FALSE,
      3 * Float32Array.BYTES_PER_ELEMENT,
      0
    );

    // gl.vertexAttribPointer(
    //   colorAttribLocation,
    //   3,
    //   gl.FLOAT,
    //   gl.FALSE,
    //   6 * Float32Array.BYTES_PER_ELEMENT,
    //   3 * Float32Array.BYTES_PER_ELEMENT
    // );

    gl.enableVertexAttribArray(positionAttribLocation);
    // gl.enableVertexAttribArray(colorAttribLocation);
  }
}