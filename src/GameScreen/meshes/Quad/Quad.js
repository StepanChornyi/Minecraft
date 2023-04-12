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

    super(gl, program, meshConfig);

    this.texture = null;

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

  render(camera) {
    gl.useProgram(this.program);
    gl.colorMask(true, true, true, true);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    if (this.texture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    // gl.uniformMatrix4fv(this.uniforms.mProj.location, gl.FALSE, camera.projectionMatrix);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}