import { Black } from 'black-engine';
import Mesh from './mesh';
import WEBGL_UTILS from '../../utils/webgl-utils';

let gl = null;
let program = null;

export default class Cursor extends Mesh {
  constructor(gl_context) {
    gl = gl_context;
    program = program || WEBGL_UTILS.createProgram(gl, Black.assets.getXHRAsset('cursor-vs'), Black.assets.getXHRAsset('cursor-fs'));

    super(gl, program);

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

  updateAttribPointers() {
    super.updateAttribPointers();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    const positionAttribLocation = gl.getAttribLocation(this.program, 'vertPosition');

    gl.vertexAttribPointer(
      positionAttribLocation,
      3,
      gl.FLOAT,
      gl.FALSE,
      3 * Float32Array.BYTES_PER_ELEMENT,
      0
    );

    gl.enableVertexAttribArray(positionAttribLocation);
  }

  render(camera) {
    gl.useProgram(this.program);
    gl.colorMask(true, true, true, true);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    const matProjUniformLocationCursor = gl.getUniformLocation(this.program, 'mProj');

    gl.uniformMatrix4fv(matProjUniformLocationCursor, gl.FALSE, camera.projectionMatrix);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}