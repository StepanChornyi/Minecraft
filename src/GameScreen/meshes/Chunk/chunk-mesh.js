import { Black } from 'black-engine';
import Mesh from '../mesh';
import WEBGL_UTILS from '../../../utils/webgl-utils';

import vs from './chunk.vs.glsl';
import fs from './chunk.fs.glsl';

import vsShadowMap from './chunk-shadow-map.vs.glsl';
import fsShadowMap from './chunk-shadow-map.fs.glsl';

let gl = null;
let program = null;
let programShadow = null;
let texture = null;

let positionAttribLocation;
let texCoordAttribLocation;
let faceLightAttribLocation;
let blockIndexAttribLocation;

let hightLightIndexUniformLocation;
let matWorldUniformLocation;
let matViewUniformLocation;
let matProjUniformLocation;

export default class ChunkMesh extends Mesh {
  constructor(gl_context,) {
    gl = gl_context;

    if (!program) {
      program = WEBGL_UTILS.createProgram(gl, vs, fs);
      programShadow = WEBGL_UTILS.createProgram(gl, vsShadowMap, fsShadowMap);

      // program = programShadow;

      positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
      texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
      faceLightAttribLocation = gl.getAttribLocation(program, 'faceLight');
      blockIndexAttribLocation = gl.getAttribLocation(program, 'blockIndex');

      hightLightIndexUniformLocation = gl.getUniformLocation(program, 'hightLightIndex');
      matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
      matViewUniformLocation = gl.getUniformLocation(program, 'mView');
      matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
    }

    ChunkMesh._initTexture();

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
    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.disable(gl.BLEND);
    gl.colorMask(true, true, true, false);

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
  }

  renderShadow(camera, blockIndex) {
    this.program = programShadow;
    this.render(camera, blockIndex);
    this.program = program;
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

  static _initTexture(gl_context = gl) {
    const gl = gl_context;

    if (Black.assets.getGLTexture('texture01')) {
      texture = Black.assets.getGLTexture('texture01');
    }

    if (texture !== null) {
      return texture;
    }

    const image = Black.assets.getTexture('main').native;

    texture = gl.createTexture();

    Black.assets.addGLTexture('texture01', texture);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
  }
}

function scaleDown2x(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.width;
  canvas.height = img.height;

  setPixelated(ctx);

  ctx.drawImage(img, 0, 0);

  const srcImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const srcData = srcImageData.data;

  canvas.width = img.width * 0.5;
  canvas.height = img.height * 0.5;

  const resImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const resData = resImageData.data;

  for (let y = 0, srcIndex, resIndex, r, g, b, a; y < resImageData.height; y++) {
    for (let x = 0; x < resImageData.width; x++) {

      resIndex = (y * resImageData.width + x) * 4;

      r = g = b = a = 0;

      for (let i = 0; i < 4; i++) {
        srcIndex = ((y * 2 + Math.floor(i / 2)) * srcImageData.width + x * 2 + i % 2) * 4;

        r += srcData[srcIndex];
        g += srcData[srcIndex + 1];
        b += srcData[srcIndex + 2];
        a += srcData[srcIndex + 3];
      }

      resData[resIndex] = r * 0.25;
      resData[resIndex + 1] = g * 0.25;
      resData[resIndex + 2] = b * 0.25;
      resData[resIndex + 3] = a * 0.25;
    }
  }

  ctx.putImageData(resImageData, 0, 0);

  return canvas;
}

function setPixelated(context) {
  context['imageSmoothingEnabled'] = false;       /* standard */
  context['mozImageSmoothingEnabled'] = false;    /* Firefox */
  context['oImageSmoothingEnabled'] = false;      /* Opera */
  context['webkitImageSmoothingEnabled'] = false; /* Safari */
  context['msImageSmoothingEnabled'] = false;     /* IE */
}