import { Black } from 'black-engine';
import Mesh from '../../../libs/Mesh';
import WEBGL_UTILS from '../../../utils/webgl-utils';

import vs from './cursor.vs.glsl';
import fs from './cursor.fs.glsl';

let gl = null;
let program = null;

const meshConfig = {
  attributes: {
    vertPosition: {
      size: 3,
      stride: 3,
      offset: 0
    }
  },
  uniforms: {
    mProj: {}
  }
};

export default class Cursor extends Mesh {
  constructor(gl_context) {
    gl = gl_context;
    program = program || WEBGL_UTILS.createProgram(gl, vs, fs);

    super(gl, program, meshConfig);

    const lineSize = 0.16;
    const lineWidth = 0.015;
    const cursorZ = -8.0;

    this.vertices = [
      -lineSize, lineWidth, cursorZ,
      -lineSize, -lineWidth, cursorZ,
      lineSize, lineWidth, cursorZ,
      lineSize, -lineWidth, cursorZ,

      -lineWidth, lineSize, cursorZ,
      -lineWidth, -lineSize, cursorZ,
      lineWidth, lineSize, cursorZ,
      lineWidth, -lineSize, cursorZ,
    ];

    this.indices = [
      1, 2, 0,
      2, 1, 3,
      4, 5, 6,
      6, 5, 7,
    ];

    this.drawBuffersData();
  }

  render(camera) {
    gl.useProgram(this.program);
    gl.colorMask(true, true, true, true);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.uniformMatrix4fv(this.uniforms.mProj.location, gl.FALSE, camera.projectionMatrix);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}