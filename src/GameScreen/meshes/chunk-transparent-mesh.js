import { Black } from 'black-engine';
import Mesh from './mesh';
import WEBGL_UTILS from '../../utils/webgl-utils';

import vs from './chunk_transparent.vs.glsl';
import fs from './chunk_transparent.fs.glsl';

let gl = null;
let program = null;
let texture = null;

let positionAttribLocation;
let texCoordAttribLocation;
let faceLightAttribLocation;
let blockIndexAttribLocation;

let hightLightIndexUniformLocation;
let matWorldUniformLocation;
let matViewUniformLocation;
let matProjUniformLocation;

export default class ChunkTransparentMesh extends Mesh {
  constructor(gl_context,) {
    gl = gl_context;

    if (!program) {
      program = WEBGL_UTILS.createProgram(gl, vs, fs);

      positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
      texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
      faceLightAttribLocation = gl.getAttribLocation(program, 'faceLight');
      blockIndexAttribLocation = gl.getAttribLocation(program, 'blockIndex');

      hightLightIndexUniformLocation = gl.getUniformLocation(program, 'hightLightIndex');
      matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
      matViewUniformLocation = gl.getUniformLocation(program, 'mView');
      matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
    }

    ChunkTransparentMesh._initTexture();

    super(gl, program);

    this.vertices = [];
    this.indices = [];
  }

  drawBuffersData() {
    gl.useProgram(this.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.DYNAMIC_DRAW);
  }

  render(camera, blockIndex = null) {
    if (this.vertices.length === 0)
      return;

    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    gl.depthMask(false);

    gl.enable(gl.BLEND);
    gl.colorMask(true, true, true, true);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE0);

    if (blockIndex === null) {
      gl.uniform1f(hightLightIndexUniformLocation, -1);
    } else {
      gl.uniform1f(hightLightIndexUniformLocation, blockIndex);
    }

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, camera.projectionMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, camera.viewMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, this.transformMatrix);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

    gl.depthMask(true);
  }

  updateAttribPointers() {
    super.updateAttribPointers();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    gl.vertexAttribPointer(
      positionAttribLocation,
      3,
      gl.FLOAT,
      gl.FALSE,
      7 * Float32Array.BYTES_PER_ELEMENT,
      0
    );

    gl.vertexAttribPointer(
      texCoordAttribLocation,
      2,
      gl.FLOAT,
      gl.FALSE,
      7 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.vertexAttribPointer(
      faceLightAttribLocation,
      1,
      gl.FLOAT,
      gl.FALSE,
      7 * Float32Array.BYTES_PER_ELEMENT,
      5 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.vertexAttribPointer(
      blockIndexAttribLocation,
      1,
      gl.FLOAT,
      gl.FALSE,
      7 * Float32Array.BYTES_PER_ELEMENT,
      6 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);
    gl.enableVertexAttribArray(faceLightAttribLocation);
    gl.enableVertexAttribArray(blockIndexAttribLocation);
  }

  static _initTexture() {
    if (Black.assets.getGLTexture('texture02')) {
      texture = Black.assets.getGLTexture('texture02');
    }

    if (texture !== null) {
      return;
    }

    const image = Black.assets.getTexture('transparentTexture').native;

    gl.useProgram(program);

    texture = gl.createTexture();

    Black.assets.addGLTexture('texture02', texture);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}