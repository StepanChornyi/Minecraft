
import Mesh from '../mesh';
import WEBGL_UTILS from '../../../utils/webgl-utils';

import vs from './shadow.vs.glsl';
import fs from './shadow.fs.glsl';

// let matWorldUniformLocation;
let matViewUniformLocation;
let matProjUniformLocation;
let mapTextureUniformLocation;

let gl = null;
let program = null;
let texture = null;

export default class Shadow extends Mesh {
  constructor(gl_context) {
    gl = gl_context;

    if (!program) {
      program = WEBGL_UTILS.createProgram(gl, vs, fs);

      matViewUniformLocation = gl.getUniformLocation(program, 'mView');
      matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
      mapTextureUniformLocation = gl.getUniformLocation(program, 'shadowMap');
    }

    super(gl, program);

    this.texture = null;

    this.vertices.push(
      8,
      24,
      8,
      500
    );

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
    if (!this.vertices.length)
      return;

    gl.useProgram(program);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    gl.enable(gl.BLEND);
    gl.colorMask(true, true, true, true);

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, camera.projectionMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, camera.viewMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'mProjIvs'), gl.FALSE, glMatrix.mat4.invert(glMatrix.mat4.create(), camera.projectionMatrix));
    gl.uniform2f(gl.getUniformLocation(program, 'screenSize'), window.innerWidth, window.innerHeight);

    if(this.texture){
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.activeTexture(gl.TEXTURE0);
    }

    // gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, this.transformMatrix);

    gl.drawArrays(gl.POINTS, 0, this.vertices.length / 4);
  }

  updateAttribPointers() {
    super.updateAttribPointers();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    const sizeAttribLocation = gl.getAttribLocation(program, 'pointSize');

    gl.vertexAttribPointer(
      positionAttribLocation,
      3,
      gl.FLOAT,
      gl.FALSE,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0
    );

    gl.vertexAttribPointer(
      sizeAttribLocation,
      1,
      gl.FLOAT,
      gl.FALSE,
      4 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );
  
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(sizeAttribLocation);
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