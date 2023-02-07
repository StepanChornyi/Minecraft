import { Black } from 'black-engine';
import BaseMesh from '../../../libs/BaseMesh';
import WEBGL_UTILS from '../../../utils/webgl-utils';

import vs from './quad.vs.glsl';
import fs from './quad.fs.glsl';

let gl = null;
let program = null;
let texture = null;

const meshConfig = {
  attributes: {
    vertPosition: {
      size: 2,
      stride: 2,
      offset: 0
    }
  },
  uniforms: {
    mProj: {}
  }
};

export default class Quad extends BaseMesh {
  constructor(gl_context) {
    gl = gl_context;
    program = program || WEBGL_UTILS.createProgram(gl, vs, fs);

    Quad._initTexture(gl);

    super(gl, program, meshConfig);

    this._initTargets();

    const size = 1;

    this.vertices = [
      -size, size,
      -size, -size,
      size, size,
      size, -size,
    ];

    this.indices = [
      1, 2, 0,
      2, 1, 3
    ];

    this.drawBuffersData();
  }

  _initTargets() {
    const targetTextureWidth = gl.canvas.width;
    const targetTextureHeight = gl.canvas.height;
    const targetTexture = this.targetTexture = gl.createTexture();
    // const depthTexture = this.depthTexture = gl.createTexture();

    this.resizeTexture = (targetTextureWidth, targetTextureHeight) => {
      gl.bindTexture(gl.TEXTURE_2D, targetTexture);

      // define size and format of level 0
;      const level = 0;
      const internalFormat = gl.RGBA;
      const border = 0;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;
      const data = null;
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        targetTextureWidth, targetTextureHeight, border,
        format, type, data)

      // set the filtering so we don't need mips
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      // gl.bindTexture(gl.TEXTURE_2D, depthTexture);

      // // define size and format of level 0
      // gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
      //   targetTextureWidth, targetTextureHeight, border,
      //   format, type, data);

      // // set the filtering so we don't need mips
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    // this.resizeTexture(targetTextureWidth, targetTextureHeight);
    this.resizeTexture(1024, 1024);

  }

  render(camera) {
    gl.useProgram(this.program);
    gl.colorMask(true, true, true, true);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.bindTexture(gl.TEXTURE_2D, this.targetTexture);
    gl.activeTexture(gl.TEXTURE0);

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    // gl.uniformMatrix4fv(this.uniforms.mProj.location, gl.FALSE, camera.projectionMatrix);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }

  static _initTexture(gl_context = gl) {
    const gl = gl_context;

    if (Black.assets.getGLTexture('test01')) {
      texture = Black.assets.getGLTexture('test01');
    }

    if (texture !== null) {
      return texture;
    }

    const image = Black.assets.getTexture('test').native;

    texture = gl.createTexture();

    Black.assets.addGLTexture('test01', texture);

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