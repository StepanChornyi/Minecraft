import { Black, ColorHelper, Vector } from 'black-engine';
import Mesh from './mesh';
import WEBGL_UTILS from '../../utils/webgl-utils';
import Vector3 from '../../utils/vector3';
import AABBPhysics from '../aa-bb-physics';

let gl = null;
let program = null;
let texture = null;

const vertexShader = `
precision mediump float;

attribute vec3 vertPosition;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
  vec4 glPos = mProj * mView * mWorld * vec4(vertPosition, 1.0);

  glPos.z -= 0.0001;

  gl_Position = glPos;
}
`;

const fragmentShader = `
precision mediump float;

void main() {
  gl_FragColor = vec4(0.0, 0.0, 0.0, 0.5);
}
`;

export default class SelectedBlockMesh extends Mesh {
  constructor(gl_context) {
    gl = gl_context;
    program = WEBGL_UTILS.createProgram(gl, vertexShader, fragmentShader);

    super(gl, program);

    this.prevIntersection = new Vector3(-0.5);

    this.visible = false;
  }

  updateMesh(sides) {
    const floatsPerVertice = 3;

    this.vertices.splice(0);
    this.indices.splice(0);

    for (let i = 0; i < sides.length; i++) {
      if (!Object.hasOwnProperty.call(blockData, sides[i]))
        continue;

      const data = blockData[sides[i]];
      const vertices = data.vertices;
      const elementIndexOffset = this.vertices.length / floatsPerVertice;

      this.vertices.push(...vertices);

      for (let i = this.vertices.length - vertices.length; i < this.vertices.length; i += floatsPerVertice) {
        this.vertices[i] = (this.vertices[i]) * 0.5 + 0.5;
        this.vertices[i + 1] = (this.vertices[i + 1]) * 0.5 + 0.5;
        this.vertices[i + 2] = (this.vertices[i + 2]) * 0.5 + 0.5;
      }

      for (let i = 0; i < 4; i++) {
        this.indices.push(elementIndexOffset + i);
        this.indices.push(elementIndexOffset + (i + 1) % 4);
      }
    }

    this.drawBuffersData();
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

    gl.colorMask(true, true, true, true);
    gl.disable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

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
}

const blockData = {
  top: {
    vertices: [
      -1.0, 1.0, -1.0,
      -1.0, 1.0, 1.0,
      1.0, 1.0, 1.0,
      1.0, 1.0, -1.0,
    ],
  },
  left: {
    vertices: [
      -1.0, 1.0, 1.0,
      -1.0, -1.0, 1.0,
      -1.0, -1.0, -1.0,
      -1.0, 1.0, -1.0,
    ],
  },
  right: {
    vertices: [
      1.0, 1.0, 1.0,
      1.0, -1.0, 1.0,
      1.0, -1.0, -1.0,
      1.0, 1.0, -1.0,
    ],
  },
  front: {
    vertices: [
      1.0, 1.0, 1.0,
      1.0, -1.0, 1.0,
      -1.0, -1.0, 1.0,
      -1.0, 1.0, 1.0,
    ],
  },
  back: {
    vertices: [
      1.0, 1.0, -1.0,
      1.0, -1.0, -1.0,
      -1.0, -1.0, -1.0,
      -1.0, 1.0, -1.0,
    ],
  },
  bottom: {
    vertices: [
      -1.0, -1.0, -1.0,
      -1.0, -1.0, 1.0,
      1.0, -1.0, 1.0,
      1.0, -1.0, -1.0,
    ],
  }
};
