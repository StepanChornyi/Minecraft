import { Black } from 'black-engine';
import BaseMesh from '../../../libs/BaseMesh';
import WEBGL_UTILLS from '../../../utils/webgl-utils';

import vs from './loading-bar.vs.glsl';
import fs from './loading-bar.fs.glsl';
import Object3D from '../../../Utils3D/Object3D';

let gl = null;
let program = null;

const meshConfig = {
  attributes: {
    vertPosition: {
      size: 4,
      stride: 7,
      offset: 0
    },
    vertColor: {
      size: 3,
      stride: 7,
      offset: 4
    },
  },
  uniforms: {
    mWorld: {},
    mProj: {},
    loadProgress: {},
  }
};

export default class LoadingBar extends BaseMesh {
  constructor(gl_context) {
    gl = gl_context;
    program = program || WEBGL_UTILLS.createProgram(gl, vs, fs);

    super(gl, program, meshConfig);

    this.object3D = new Object3D();

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

    gl.uniformMatrix4fv(this.uniforms.mProj.location, gl.FALSE, camera.projectionMatrix);
    gl.uniformMatrix4fv(this.uniforms.mWorld.location, gl.FALSE, this.object3D.transformMatrix);
    gl.uniform1f(this.uniforms.loadProgress.location, this.loadProgress);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}