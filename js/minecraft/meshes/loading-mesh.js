import { Black } from 'black-engine';
import Mesh from './mesh';
import WEBGL_UTILLS from '../../utils/webgl-utils';

let gl = null;
let program = null;

const vs = `
precision mediump float;

attribute vec4 vertPosition;
attribute vec3 vertColor;

uniform mat4 mWorld;
uniform mat4 mProj;
uniform float loadProgress;

varying vec3 fragColor;

void main() {
  fragColor = vertColor;
  gl_Position = mProj * mWorld * vec4(
    vertPosition.w + ( vertPosition.x-vertPosition.w)*loadProgress,
    vertPosition.yz, 1.0);
}
`;

const fs = `
precision mediump float;

varying vec3 fragColor;

void main() {
  gl_FragColor = vec4(fragColor, 1.0);
}
`;

export default class LoadingMesh extends Mesh {
  constructor(gl_context) {
    gl = gl_context;
    program = program || WEBGL_UTILLS.createProgram(gl, vs, fs);
    
    super(gl, program);

    this.loadProgress = 0;

    const lineWidth = 0.15;
    const lineHeight = 0.004;
    const z = -0.5;

    this.vertices = [
      -lineWidth, lineHeight, z, -lineWidth, 0.5, 0.5, 0.5,
      -lineWidth, -lineHeight, z, -lineWidth, 0.5, 0.5, 0.5,
      lineWidth, lineHeight, z, lineWidth, 0.5, 0.5, 0.5,
      lineWidth, -lineHeight, z, lineWidth, 0.5, 0.5, 0.5,

      -lineWidth, lineHeight, z, -lineWidth, 0.5, 1, 0.5,
      -lineWidth, -lineHeight, z, -lineWidth, 0.5, 1, 0.5,
      lineWidth, lineHeight, z, -lineWidth, 0.5, 1, 0.5,
      lineWidth, -lineHeight, z, -lineWidth, 0.5, 1, 0.5,
    ];

    this.indices = [
      1, 2, 0,
      2, 1, 3,

      5, 6, 4,
      6, 5, 7,
    ];

    this.drawBuffersData();
  }

  updateAttribPointers() {
    super.updateAttribPointers();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    const positionAttribLocation = gl.getAttribLocation(this.program, 'vertPosition');
    const colorAttribLocation = gl.getAttribLocation(this.program, 'vertColor');

    gl.vertexAttribPointer(
      positionAttribLocation,
      4,
      gl.FLOAT,
      gl.FALSE,
      7 * Float32Array.BYTES_PER_ELEMENT,
      0
    );

    gl.vertexAttribPointer(
      colorAttribLocation,
      3,
      gl.FLOAT,
      gl.FALSE,
      7 * Float32Array.BYTES_PER_ELEMENT,
      4 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
  }

  setProgress(val) {
    this.loadProgress = val;
  }

  render(camera) {
    gl.useProgram(this.program);
    gl.colorMask(true, true, true, false);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    const matWorldUniformLocation = gl.getUniformLocation(this.program, 'mWorld');
    const matProjUniformLocationCursor = gl.getUniformLocation(this.program, 'mProj');
    const progressUniformLocationCursor = gl.getUniformLocation(this.program, 'loadProgress');

    gl.uniformMatrix4fv(matProjUniformLocationCursor, gl.FALSE, camera.projectionMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, this.transformMatrix);
    gl.uniform1f(progressUniformLocationCursor, this.loadProgress);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}