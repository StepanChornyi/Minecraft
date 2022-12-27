import { Black } from 'black-engine';
import Mesh from './mesh';
import WEBGL_UTILS from '../../utils/webgl-utils';

const mat4 = glMatrix.mat4;

let gl = null;
let program = null;
let texture = null;

const vertexShader = `
precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertColor;
attribute float vertLight;

varying vec3 fragColor;
varying float fragLight;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
  fragColor = vertColor;

  gl_Position =  mProj * mView * mWorld * vec4(vertPosition, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

varying vec3 fragColor;
varying float fragLight;

uniform sampler2D sampler;

void main() {
  gl_FragColor = vec4(fragColor, 1.0);
}
`;

let c = 0;

export default class PlayerMesh extends Mesh {
  constructor(gl_context, _program) {
    gl = gl_context;
    program = _program || WEBGL_UTILS.createProgram(gl, vertexShader, fragmentShader);

    PlayerMesh._initTexture();

    super(gl, program);

    this.wireFrameIndexStart = 0;

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
    const radius = 0.1;
    const height = 0.2;
    const segments = 20;
    const floatsPerVertice = 6;

    this.vertices.push(
      0,
      -height * 0.5, 0, 1, 1, 1,
    );

    this.vertices.push(
      0,
      height * 0.5, 0, 1, 1, 1,
    );

    for (let j = -1; j < 2; j++) {
      if (j === 0)
        continue;

      const y = height * 0.5 * j;

      for (let i = 0; i < segments; i++) {
        const angle1 = (((i) % segments) / segments) * Math.PI * 2;

        const sin = Math.sin(angle1);
        const cos = Math.cos(angle1);

        this.vertices.push(
          radius * cos,
          y,
          radius * sin,
          0.255,
          0.451,
          0.910
        );
      }
    }

    for (let i = 0; i < segments; i++) {
      const vertIndex1 = i + 2;
      const vertIndex2 = (i + 1) % (segments) + 2;
      const vertIndex3 = i + 2 + segments;
      const vertIndex4 = (i + 1) % (segments) + 2 + segments;

      this.indices.push(0, vertIndex1, vertIndex2);
      this.indices.push(1, vertIndex3, vertIndex4);

      this.indices.push(vertIndex1, vertIndex2, vertIndex3);
      this.indices.push(vertIndex2, vertIndex4, vertIndex3);
    }

    this.wireFrameIndexStart = this.indices.length;
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
    gl.disable(gl.CULL_FACE)

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE0);

    gl.colorMask(true, true, true, false);
    gl.disable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    const matWorldUniformLocation = gl.getUniformLocation(this.program, 'mWorld');
    const matViewUniformLocation = gl.getUniformLocation(this.program, 'mView');
    const matProjUniformLocation = gl.getUniformLocation(this.program, 'mProj');

    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, camera.projectionMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, camera.viewMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, this.transformMatrix);

    gl.drawElements(gl.TRIANGLES, this.wireFrameIndexStart, gl.UNSIGNED_SHORT, 0);
  }

  onUpdate(dt) {
    c += dt;


  }

  _updateMovement() {
    const SPEED = this.isState(STATES.FLYING) ? FLY_SPEED : WALK_SPEED;

    if (!this.isState(STATES.FALLING)) {
      if (pressedKeys[KEY_CODES.A]) {
        this.velocity[0] = -SPEED;
      } else if (pressedKeys[KEY_CODES.D]) {
        this.velocity[0] = SPEED;
      }

      if (pressedKeys[KEY_CODES.W]) {
        this.velocity[2] = -SPEED;
      } else if (pressedKeys[KEY_CODES.S]) {
        this.velocity[2] = SPEED;
      }
    }

    if (this.isState(STATES.FLYING)) {
      if (pressedKeys[KEY_CODES.SPACEBAR]) {
        this.velocity[1] = SPEED;
      } else if (pressedKeys[KEY_CODES.LEFT_SHIFT]) {
        this.velocity[1] = -SPEED;
      }
    } else if (this.isState(STATES.WALKING)) {
      if (pressedKeys[KEY_CODES.SPACEBAR]) {
        this.velocity[1] = JUMP_SPEED;

        this.state = STATES.FALLING;
      }
    }
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

  static _initTexture() {
    if (texture !== null) {
      return;
    }

    gl.useProgram(program);

    texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, Black.assets.getTexture('main').native);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}

const BLOCK = {
  AIR: 0,
  GRASS_BLOCK: 1,
  DIRT: 2,
  ROCK: 3,
  COAL: 4,
  IRON: 5,
  BEDROCK: 6
};

const BLOCK_TEXTURE_CONFIG = {};

BLOCK_TEXTURE_CONFIG[BLOCK.GRASS_BLOCK] = {
  top: [2, 0],
  bottom: [1, 0],
  all: [0, 0],
};

BLOCK_TEXTURE_CONFIG[BLOCK.DIRT] = { all: [1, 0] };
BLOCK_TEXTURE_CONFIG[BLOCK.ROCK] = { all: [3, 0] };
BLOCK_TEXTURE_CONFIG[BLOCK.COAL] = { all: [4, 0] };
BLOCK_TEXTURE_CONFIG[BLOCK.IRON] = { all: [5, 0] };
BLOCK_TEXTURE_CONFIG[BLOCK.BEDROCK] = { all: [6, 0] };

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
    light: 0.9,
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
    light: 0.9,
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
    light: 0.75,
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
    light: 0.75,
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
    light: 0.7,
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
