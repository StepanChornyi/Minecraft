
import vs from './thick_sprite.vs.glsl';
import fs from './thick_sprite.fs.glsl';
import Mesh from '../mesh';
import WEBGL_UTILS from '../../../utils/webgl-utils';
import { Black } from 'black-engine';
import MeshGenerator from '../../world/mesh-generator/mesh-generator';
import MESH_TEXTURES from '../../world/mesh-generator/mesh-textures';
import { BLOCK_TYPE } from '../../block-type';

const mat4 = glMatrix.mat4;

let gl = null;
let program = null;
let texture = null;
let textureCanvas = null;
let textureCanvasCtx = null;

export default class ThickSprite extends Mesh {
  constructor(gl_context, _program) {
    gl = gl_context;
    program = _program || WEBGL_UTILS.createProgram(gl, vs, fs);

    ThickSprite._initTexture();

    super(gl, program);

    this.init();
    this.drawBuffersData();
  }

  _updateTransformMatrix() {
    mat4.identity(this._transformMatrix);
    mat4.translate(this._transformMatrix, this._transformMatrix, this._position);

    mat4.rotateX(this._transformMatrix, this._transformMatrix, this._euler[0]);
    mat4.rotateY(this._transformMatrix, this._transformMatrix, this._euler[1]);
    mat4.rotateZ(this._transformMatrix, this._transformMatrix, this._euler[2]);

    this._transformDirty = false;
  }

  init() {
    const size = 0.2;
    const thickness = size / 16;
    let indexOffset = 0;

    const [u, v] = MESH_TEXTURES[BLOCK_TYPE.DEAD_BUSH].all;

    for (let z = 0; z <= 1; z++) {
      for (let y = 0; y <= 1; y++) {
        for (let x = 0; x <= 1; x++) {
          this.vertices.push(
            (x * 2 - 1) * size,
            (y * 2 - 1) * size,
            (z * 2 - 1) * (thickness - 0.0001),
            MeshGenerator.textureCoord(u, 1 - x),
            MeshGenerator.textureCoord(v, 1 - y),
            0.9
          );
        }
      }

      this._addIndicesQuad(indexOffset, z === 0);
      indexOffset += 4;
    }

    const contour = this._getContour();
    const th = (thickness) * 2;

    for (let i = 0; i < contour.length; i++) {
      const { x, y, normalX, normalY } = contour[i];

      for (let i = 0; i <= 1; i++) {
        for (let j = 0; j <= 1; j++) {
          let offX = 0, offY = 0, offZ = 0, light = 1;

          if (normalX < 0) {
            offX = 0;
            offZ = (j - 0.5) * th;
            offY = i * th;
            light = 0.8;
          } else if (normalX > 0) {
            offX = th;
            offZ = (j - 0.5) * th;
            offY = i * th;
            light = 0.8;
          } else if (normalY < 0) {
            offX = i * th;
            offZ = (j - 0.5) * th;
            offY = 0;
            light = 1;
          } else {
            offX = i * th;
            offZ = (j - 0.5) * th;
            offY = th;
            light = 0.7;
          }

          const xx = size * (1 - x * 2);
          const yy = size * (1 - y * 2);

          this.vertices.push(
            xx - offX,
            yy - offY,
            - offZ,
            MeshGenerator.textureCoord(u, x + 0.5 / 16),
            MeshGenerator.textureCoord(v, y + 0.5 / 16),
            light
          );
        }
      }

      this._addIndicesQuad(indexOffset, normalX < 0 || normalY > 0);

      indexOffset += 4
    }
  }

  _addIndicesQuad(o, cullFaceFlip = false) {
    if (cullFaceFlip) {
      this.indices.push(1 + o, 0 + o, 2 + o, 1 + o, 2 + o, 3 + o);
    } else {
      this.indices.push(0 + o, 1 + o, 2 + o, 2 + o, 1 + o, 3 + o);
    }
  }

  _getContour() {
    const contour = [];
    const [u, v] = MESH_TEXTURES[BLOCK_TYPE.DEAD_BUSH].all;

    const spriteX = MeshGenerator.textureCoord(u, 0) * textureCanvas.width;
    const spriteY = MeshGenerator.textureCoord(v, 0) * textureCanvas.height;
    const spriteWidth = Math.ceil(MeshGenerator.textureCoord(u, 1) * textureCanvas.width - spriteX);
    const spriteHeight = Math.ceil(MeshGenerator.textureCoord(v, 1) * textureCanvas.height - spriteY);

    const imageData = textureCanvasCtx.getImageData(spriteX, spriteY, spriteWidth, spriteHeight);

    for (let y = 0; y < imageData.width; y++) {
      for (let x = 0; x < imageData.height; x++) {
        if (this._getAlpha(imageData, x, y) < 100)
          continue;

        for (let normalX = -1; normalX <= 1; normalX++) {
          for (let normalY = -1; normalY <= 1; normalY++) {
            if (normalX !== 0 && normalY !== 0) {
              continue;
            }

            if (normalX === normalY) {
              continue;
            }

            if (this._getAlpha(imageData, x + normalX, y + normalY) < 100) {
              contour.push({
                x: x / imageData.width,
                y: y / imageData.height,
                normalX,
                normalY
              });
            }
          }
        }
      }
    }

    return contour;
  }

  _getAlpha(imageData, x, y) {
    if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
      return 0;
    }

    return imageData.data[(y * imageData.width + x) * 4 + 3];
  }

  drawBuffersData() {
    gl.useProgram(this.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.DYNAMIC_DRAW);
  }

  render(camera) {
    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE)

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE0);

    gl.colorMask(true, true, true, false);
    gl.enable(gl.BLEND);

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    this.rotationY += 0.01;

    const matWorldUniformLocation = gl.getUniformLocation(this.program, 'mWorld');
    const matViewUniformLocation = gl.getUniformLocation(this.program, 'mView');
    const matProjUniformLocation = gl.getUniformLocation(this.program, 'mProj');

    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, camera.projectionMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, camera.viewMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, this.transformMatrix);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }

  updateAttribPointers() {
    super.updateAttribPointers();

    const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    const uvAttribLocation = gl.getAttribLocation(program, 'vertUv');
    const qq = gl.getAttribLocation(program, 'qq');

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    gl.vertexAttribPointer(
      positionAttribLocation,
      3,
      gl.FLOAT,
      gl.FALSE,
      6 * Float32Array.BYTES_PER_ELEMENT,
      0
    );

    gl.vertexAttribPointer(
      uvAttribLocation,
      2,
      gl.FLOAT,
      gl.FALSE,
      6 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.vertexAttribPointer(
      qq,
      1,
      gl.FLOAT,
      gl.FALSE,
      6 * Float32Array.BYTES_PER_ELEMENT,
      5 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(uvAttribLocation);
    gl.enableVertexAttribArray(qq);
  }

  static _initTexture() {
    if (texture !== null) {
      return;
    }

    gl.useProgram(program);

    texture = gl.createTexture();

    const img = Black.assets.getTexture('main').native;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    textureCanvas = document.createElement("canvas");
    textureCanvasCtx = textureCanvas.getContext("2d");

    textureCanvas.width = img.width;
    textureCanvas.height = img.height;

    textureCanvasCtx.drawImage(img, 0, 0);
  }
}