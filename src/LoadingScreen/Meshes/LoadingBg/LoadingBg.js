import { Black } from 'black-engine';
import WEBGL_UTILLS from '../../../utils/webgl-utils';
import BaseMesh from '../../../libs/BaseMesh';
import vs from  './loading-bg.vs.glsl';
import fs from  './loading-bg.fs.glsl';

let gl = null;
let program = null;
let texture = null;

const meshConfig = {
  attributes: {
    vertPosition: {
      size: 3,
      stride: 5,
      offset: 0
    },
    vertTexCoord: {
      size: 2,
      stride: 5,
      offset: 0
    }

  },
  uniforms: {
    mProj: {}
  }
};

export default class LoadingBg extends BaseMesh {
  constructor(gl_context) {
    gl = gl_context;
    program = program || WEBGL_UTILLS.createProgram(gl, vs, fs);

    LoadingBg._initTexture();

    super(gl, program, meshConfig);

    const size = 2;
    const scale = 250;

    this.vertices = [
      size, size, 0, 0, 0,
      size, -size, 0, 0, scale,
      -size, size, 0, scale, 0,
      -size, -size, 0, scale, scale,
    ];

    this.indices = [
      1, 2, 0,
      3, 2, 1,
    ];

    this.drawBuffersData();
  }

  updateAttribPointers() {
    super.updateAttribPointers();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    const positionAttribLocation = gl.getAttribLocation(this.program, 'vertPosition');
    const texCoordAttribLocation = gl.getAttribLocation(this.program, 'vertTexCoord');

    gl.vertexAttribPointer(
      positionAttribLocation,
      3,
      gl.FLOAT,
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT,
      0
    );

    gl.vertexAttribPointer(
      texCoordAttribLocation,
      2,
      gl.FLOAT,
      gl.FALSE,
      5 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);
  }

  render(camera) {
    gl.useProgram(this.program);
    gl.colorMask(true, true, true, false);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE0);

    // const matWorldUniformLocation = gl.getUniformLocation(this.program, 'mWorld');

    gl.uniformMatrix4fv(this.uniforms.mProj.location, gl.FALSE, camera.projectionMatrix);
    // gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, this.transformMatrix);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }

  static _initTexture() {
    if (Black.assets.getGLTexture('dirt01')) {
      texture = Black.assets.getGLTexture('dirt01');
    }

    if (texture !== null) {
      return;
    }

    gl.useProgram(program);

    texture = gl.createTexture();

    Black.assets.addGLTexture('dirt01', texture);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, Black.assets.getTexture('dirt').native);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}