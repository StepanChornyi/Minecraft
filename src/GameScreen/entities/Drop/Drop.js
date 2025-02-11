import { Black, MessageDispatcher } from 'black-engine';

import Vector3 from '../../../Utils3D/vector3';
import WEBGL_UTILS from '../../../utils/webgl-utils';
import { BLOCK_TYPE } from '../../block-type';
import ChunkMesh from '../../meshes/Chunk/chunk-mesh';
import Mesh from '../../meshes/mesh';
import PhysicsBody from '../../../Physics/physics-body';
import CONFIG from '../../world/config';
import BlockMeshGenerator from '../../world/mesh-generator/block-mesh-generator';
import LightEngine from '../../world/mesh-generator/LightEngine';
import MeshGenerator from '../../world/mesh-generator/mesh-generator';

import MESH_TEXTURES from '../../world/mesh-generator/mesh-textures';

import vs from './drop.vs.glsl';
import fs from './drop.fs.glsl';
import MathUtils from '../../../utils/MathUtils';
import ThickSprite from '../../meshes/thickSprite/ThickSprite';
import CactusMeshGenerator from '../../world/mesh-generator/cactus-mesh-generator';
import TorchMeshGenerator from '../../world/mesh-generator/torch-mesh-generator';

let gl = null;
let program = null;

let positionAttribLocation;
let texCoordAttribLocation;
let faceLightAttribLocation;
let blockIndexAttribLocation;

let lightUniformLocation;
let matWorldUniformLocation;
let matViewUniformLocation;
let matProjUniformLocation;

const size = new Vector3(0.3, 0.5, 0.3);

const sprites = [
  BLOCK_TYPE.DEAD_BUSH,
  BLOCK_TYPE.ROSE,
  BLOCK_TYPE.GRASS,
];

const specialMeshGenerators = {
  [BLOCK_TYPE.TORCH]: TorchMeshGenerator,
  [BLOCK_TYPE.CACTUS]: CactusMeshGenerator,
};

export default class Drop extends Mesh {
  constructor(_gl, world, blockType = BLOCK_TYPE.SAND, player) {
    gl = _gl;

    if (!program) {
      program = WEBGL_UTILS.createProgram(gl, vs, fs);

      positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
      texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
      faceLightAttribLocation = gl.getAttribLocation(program, 'faceLight');
      blockIndexAttribLocation = gl.getAttribLocation(program, 'blockIndex');

      lightUniformLocation = gl.getUniformLocation(program, 'hightLightIndex');
      matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
      matViewUniformLocation = gl.getUniformLocation(program, 'mView');
      matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
    }

    super(gl, program);

    this.world = world;
    this.player = player;
    this.body = new PhysicsBody(world, size);
    this.texture = ChunkMesh._initTexture(gl);
    this.messages = new MessageDispatcher();
    this.blockType = blockType;

    this.body.velocity.x = MathUtils.rndBtw(0, 0.07) * MathUtils.rndSign();
    this.body.velocity.y = MathUtils.rndBtw(0.05, 0.07);
    this.body.velocity.z = MathUtils.rndBtw(0, 0.07) * MathUtils.rndSign();
    this.body.gravity *= 0.6;

    this._shadow = null;
    this._time = Math.random();
    this._light = 0;
    this._collectVelocity = 0;

    this.isDestroyed = false;
    this.snapped = false;

    if (sprites.includes(blockType)) {
      this._thickSprite = new ThickSprite(gl, blockType);
    }

    this._init();
  }

  attachShadow(shadow) {
    this._shadow = shadow;
  }

  onUpdate(dt) {
    if (this.isDestroyed) {
      if (this._shadow)
        this._shadow.isActive = false;

      return;
    }

    this.body.onUpdate(dt);

    this._time += dt;

    this.position = this.body.position;
    this.y += (Math.sin(this._time * 0.02) + 1) * 0.01 - 0.03
    this.rotationY = this._time * 0.02;

    const block = this.world.getBlock(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
    this._light = block ? 0.1 + (LightEngine.getLight(block.light) / CONFIG.MAX_LIGHT) * 0.9 : 1;

    const snapDist = 1.3;
    const collectDist = 0.1;

    if (!this.snapped) {
      if (Math.abs(this.player.x - this.x) < snapDist && Math.abs(this.player.y - this.y) < snapDist && Math.abs(this.player.z - this.z) < snapDist) {
        if (glMatrix.vec3.dist(this.position, this.player.position) < snapDist) {
          this.snapped = true;
        }
      }
    }

    if (this.snapped) {
      this.body.checkCollision = false;
      this.body.enableDamping = false;
      this.body.gravity = 0;

      this.body.x = MathUtils.lerp(this.body.x, this.player.x, this._collectVelocity);
      this.body.y = MathUtils.lerp(this.body.y, this.player.y, this._collectVelocity);
      this.body.z = MathUtils.lerp(this.body.z, this.player.z, this._collectVelocity);

      this.position = this.body.position;

      this._collectVelocity += 0.05;

      if (Math.abs(this.player.x - this.x) < collectDist && Math.abs(this.player.y - this.y) < collectDist && Math.abs(this.player.z - this.z) < collectDist) {
        this.isDestroyed = true;

        this.post('collected');
      }
    }

    this._shadow.x = this.x;
    this._shadow.y = this.y - size.y * 0.5;
    this._shadow.z = this.z;

    if (this._thickSprite) {
      this._thickSprite.x = this.x;
      this._thickSprite.y = this.y;
      this._thickSprite.z = this.z;
      this._thickSprite.rotationY = this.rotationY;
    }
  }

  render(camera) {
    if (this._thickSprite) {
      this._thickSprite.render(camera);
      return;
    }

    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.FRONT);

    gl.disable(gl.BLEND);
    gl.colorMask(true, true, true, false);

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.activeTexture(gl.TEXTURE0);

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.uniform1f(lightUniformLocation, this._light);

    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, camera.projectionMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, camera.viewMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, this.transformMatrix);

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

    gl.cullFace(gl.BACK);
  }

  updateAttribPointers() {
    super.updateAttribPointers();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    gl.vertexAttribPointer(
      positionAttribLocation,
      3,
      gl.FLOAT,
      gl.FALSE,
      7 * Float32Array.BYTES_PER_ELEMENT,
      0
    );

    gl.vertexAttribPointer(
      texCoordAttribLocation,
      2,
      gl.FLOAT,
      gl.FALSE,
      7 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.vertexAttribPointer(
      faceLightAttribLocation,
      1,
      gl.FLOAT,
      gl.FALSE,
      7 * Float32Array.BYTES_PER_ELEMENT,
      5 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.vertexAttribPointer(
      blockIndexAttribLocation,
      1,
      gl.FLOAT,
      gl.FALSE,
      7 * Float32Array.BYTES_PER_ELEMENT,
      6 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);
    gl.enableVertexAttribArray(faceLightAttribLocation);
    gl.enableVertexAttribArray(blockIndexAttribLocation);
  }

  _init() {
    const blockData = (specialMeshGenerators[this.blockType] || BlockMeshGenerator).blockData;
    const blockType = this.blockType;
    const textureConfig = MESH_TEXTURES[blockType] || { all: [1000, 1000] };

    const block = this.world.getBlock(Math.floor(this.x), Math.floor(this.y - 1), Math.floor(this.z));
    const light = block ? 0.1 + (LightEngine.getLight(block.light) / CONFIG.MAX_LIGHT) * 0.9 : 1;
    const scale = 0.25;

    this.vertices.splice(0);
    this.indices.splice(0);

    for (const key in blockData) {
      if (!Object.hasOwnProperty.call(blockData, key))
        continue;

      const elementIndexOffset = this.vertices.length / MeshGenerator.floatsPerVertice;

      const data = blockData[key];

      const vertices = data.vertices;

      this.vertices.push(...vertices);

      for (let i = this.vertices.length - vertices.length; i < this.vertices.length; i += MeshGenerator.floatsPerVertice) {
        const [u, v] = textureConfig[key] || textureConfig.all;

        this.vertices[i + 3] = MeshGenerator.textureCoord(u, this.vertices[i + 3]);
        this.vertices[i + 4] = MeshGenerator.textureCoord(v, this.vertices[i + 4]);

        this.vertices[i + 6] = 0;

        this.vertices[i + 5] = data.light;

        // mesh.vertices[i + 5] = Math.max(0, Math.min(1, mesh.vertices[i + 5]));

        this.vertices[i] = (this.vertices[i]) * 0.5 * scale;
        this.vertices[i + 1] = (this.vertices[i + 1]) * 0.5 * scale;
        this.vertices[i + 2] = (this.vertices[i + 2]) * 0.5 * scale;
      }

      const triangles = data.triangles.default || data.triangles;

      for (let i = 0; i < triangles.length; i++) {
        this.indices.push(triangles[i] + elementIndexOffset);
      }
    }

    this.drawBuffersData();
  }
}