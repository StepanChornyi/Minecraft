import { Black, ColorHelper, HSV, MathEx } from 'black-engine';
import Mesh from './mesh';
import WEBGL_UTILS from '../../utils/webgl-utils';

let gl = null;
let program = null;
let texture = null;

const vs = `
precision mediump float;

attribute vec3 vertPosition;
attribute vec2 texturePos;

varying vec2 fragTexPos;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
  fragTexPos = texturePos;
  
  vec4 glPos = mProj * mView * mWorld * vec4(vertPosition, 1.0);
  
  glPos.z = 1.0;

  gl_Position = glPos;
}
`;

const fs = `
precision mediump float;

varying vec2 fragTexPos;

uniform sampler2D sampler;

void main() {
  gl_FragColor = texture2D(sampler, fragTexPos);
}
`;

let matWorldUniformLocation;
let matViewUniformLocation;
let matProjUniformLocation;

export default class SunMesh extends Mesh {
  constructor(gl_context,) {
    gl = gl_context;

    if (!program) {
      program = WEBGL_UTILS.createProgram(gl, vs, fs);

      matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
      matViewUniformLocation = gl.getUniformLocation(program, 'mView');
      matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
    }

    if (!texture) {
      texture = SunMesh._initSunTexture(gl);
    }

    super(gl, program);

    this._init();
  }

  _init() {
    const offsetY = 950;
    const size = 250;

    this.vertices.push(
      size, offsetY, size, 0, 0,
      size, offsetY, -size, 0, 1,
      -size, offsetY, size, 1, 0,
      -size, offsetY, -size, 1, 1,
    );

    this.indices.push(0, 1, 2, 1, 2, 3);

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

    gl.enable(gl.BLEND);
    gl.colorMask(true, true, true, true);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE0);

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, camera.projectionMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, camera.viewMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, this.transformMatrix);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }

  updateAttribPointers() {
    super.updateAttribPointers();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    const textureAttribLocation = gl.getAttribLocation(program, 'texturePos');

    gl.vertexAttribPointer(
      positionAttribLocation,
      3,
      gl.FLOAT,
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT,
      0
    );

    gl.vertexAttribPointer(
      textureAttribLocation,
      2,
      gl.FLOAT,
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(textureAttribLocation);
  }

  static _initSunTexture(gl) {
    const image = Black.assets.getTexture('sun').native;

    gl.useProgram(program);

    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
  }
}