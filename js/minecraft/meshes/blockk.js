import { Black, ColorHelper, HSV, MathEx, RGB, Vector } from 'black-engine';
import Mesh from './mesh';
import WEBGL_UTILS from '../../utils/webgl-utils';
import Vector3 from '../../utils/vector3';
import AABBPhysics from '../aa-bb-physics';
import CONFIG from '../world/config';

let gl = null;
let program = null;
let texture = null;

const vertexShader = `
precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertColor;

varying vec3 fragColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
  fragColor = vertColor;

  vec4 glPos =  mProj * mView * mWorld * vec4(vertPosition, 1.0);

  gl_Position = glPos;
}
`;

const fragmentShader = `
precision mediump float;

varying vec3 fragColor;

void main() {
  gl_FragColor = vec4(fragColor, 1.0);
}
`;

const RED = 0xff5555;
const GREEN = 0x55FF55;

const w = 0.6;
const h = 1.8;

const KEY_CODES = { ARROW_UP: 38, ARROW_DOWN: 40, ARROW_LEFT: 37, ARROW_RIGHT: 39, ZERO: 96, RIGHT_CTRL: 17 };
const pressedKeys = window.pressedKeys = window.pressedKeys || {};

export default class Blockk extends Mesh {
  constructor(gl_context, world) {
    gl = gl_context;
    program = WEBGL_UTILS.createProgram(gl, vertexShader, fragmentShader);

    super(gl, program);

    this.world = world;
    this.color = RED;

    this.init();
    this.drawBuffersData();
  }

  init() {
    const floatsPerVertice = 6;

    const size = 10;

    for (let x = -size + 1; x < size; x++) {
      for (let z = -size + 1; z < size; z++) {

        const color = ColorHelper.hsv2rgb(new HSV(MathEx.lerp(0, 0.2, Math.random()), 0.8, 0.7));

        color.r /= 255;
        color.g /= 255;
        color.b /= 255;

        this.vertices.push(
          x * CONFIG.CHUNK_SIZE, 0, z * CONFIG.CHUNK_SIZE, color.r, color.g, color.b
        );

        this.vertices.push(
          x * CONFIG.CHUNK_SIZE, CONFIG.CHUNK_SIZE*4, z * CONFIG.CHUNK_SIZE, color.r, color.g, color.b
        );

        const elementIndexOffset = this.vertices.length / floatsPerVertice;

        this.indices.push(elementIndexOffset - 2);
        this.indices.push(elementIndexOffset - 1);
      }
    }
  }

  drawBuffersData() {
    gl.useProgram(this.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.DYNAMIC_DRAW);
  }

  render(camera) {
    this.camera = camera;

    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE)

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE0);

    gl.colorMask(true, true, true, false);
    gl.disable(gl.BLEND);

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    const matWorldUniformLocation = gl.getUniformLocation(this.program, 'mWorld');
    const matViewUniformLocation = gl.getUniformLocation(this.program, 'mView');
    const matProjUniformLocation = gl.getUniformLocation(this.program, 'mProj');

    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, camera.projectionMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, camera.viewMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, this.transformMatrix);

    gl.drawElements(gl.LINES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }

  updateAttribPointers() {
    super.updateAttribPointers();

    const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    const colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

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
      colorAttribLocation,
      3,
      gl.FLOAT,
      gl.FALSE,
      6 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
  }
}
const blockData = {
  top: {
    normal: [0, 1, 0],
    light: 1,
    vertices: [
      -1.0, 1.0, -1.0, 0, 0,
      -1.0, 1.0, 1.0, 0, 1,
      1.0, 1.0, 1.0, 1, 1,
      1.0, 1.0, -1.0, 1, 0,
    ],
    triangles: [
      0, 1, 2,
      0, 2, 3,
    ]
  },
  left: {
    normal: [-1, 0, 0],
    light: 0.8,
    vertices: [
      -1.0, 1.0, 1.0, 0, 0,
      -1.0, -1.0, 1.0, 0, 1,
      -1.0, -1.0, -1.0, 1, 1,
      -1.0, 1.0, -1.0, 1, 0,
    ],
    triangles: [
      1, 0, 2,
      2, 0, 3,
    ]
  },
  right: {
    normal: [1, 0, 0],
    light: 0.7,
    vertices: [
      1.0, 1.0, 1.0, 0, 0,
      1.0, -1.0, 1.0, 0, 1,
      1.0, -1.0, -1.0, 1, 1,
      1.0, 1.0, -1.0, 1, 0,
    ],
    triangles: [
      0, 1, 2,
      0, 2, 3,
    ]
  },
  front: {
    normal: [0, 0, 1],
    light: 0.7,
    vertices: [
      1.0, 1.0, 1.0, 0, 0,
      1.0, -1.0, 1.0, 0, 1,
      -1.0, -1.0, 1.0, 1, 1,
      -1.0, 1.0, 1.0, 1, 0,
    ],
    triangles: [
      1, 0, 2,
      3, 2, 0,
    ]
  },
  back: {
    normal: [0, 0, -1],
    light: 0.7,
    vertices: [
      1.0, 1.0, -1.0, 0, 0,
      1.0, -1.0, -1.0, 0, 1,
      -1.0, -1.0, -1.0, 1, 1,
      -1.0, 1.0, -1.0, 1, 0,
    ],
    triangles: [
      0, 1, 2,
      0, 2, 3,
    ]
  },
  bottom: {
    normal: [0, -1, 0],
    light: 0.6,
    vertices: [
      -1.0, -1.0, -1.0, 0, 0,
      -1.0, -1.0, 1.0, 0, 1,
      1.0, -1.0, 1.0, 1, 1,
      1.0, -1.0, -1.0, 1, 0,
    ],
    triangles: [
      1, 0, 2,
      2, 0, 3
    ]
  }
};
