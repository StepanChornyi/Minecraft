import Vector3 from '../../utils/vector3';
import WEBGL_UTILS from '../../utils/webgl-utils';
import { BLOCK_TYPE } from '../block-type';
import ChunkMesh from '../meshes/chunk-mesh';
import Mesh from '../meshes/mesh';
import PhysicsBody from '../physics-body';
import CONFIG from '../world/config';
import BlockMeshGenerator from '../world/mesh-generator/block-mesh-generator';
import LightEngine from '../world/mesh-generator/LightEngine';
import MeshGenerator from '../world/mesh-generator/mesh-generator';
import Object3D from './../object3D';

import vs from './block_shader.vs.glsl';
import fs from './block_shader.fs.glsl';
import MESH_TEXTURES from '../world/mesh-generator/mesh-textures';
import { MessageDispatcher } from 'black-engine';

let gl = null;
let program = null;

let positionAttribLocation;
let texCoordAttribLocation;
let faceLightAttribLocation;
let blockIndexAttribLocation;

let hightLightIndexUniformLocation;
let matWorldUniformLocation;
let matViewUniformLocation;
let matProjUniformLocation;

const size = new Vector3(0.5, 1, 0.5);

export default class FallingBlockEntity extends Mesh {
  constructor(_gl, world, [x, y, z] = [0, 0, 0], blockType = BLOCK_TYPE.SAND) {
    gl = _gl;

    if (!program) {
      program = WEBGL_UTILS.createProgram(gl, vs, fs);

      positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
      texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
      faceLightAttribLocation = gl.getAttribLocation(program, 'faceLight');
      blockIndexAttribLocation = gl.getAttribLocation(program, 'blockIndex');

      hightLightIndexUniformLocation = gl.getUniformLocation(program, 'hightLightIndex');
      matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
      matViewUniformLocation = gl.getUniformLocation(program, 'mView');
      matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
    }

    super(gl, program);

    this.world = world;
    this.body = new PhysicsBody(world, size);
    this.texture = ChunkMesh._initTexture(gl);
    this.messages = new MessageDispatcher();
    this.blockType = blockType;

    this.body.position = this.position = [x + 0.5, y + 0.5, z + 0.5];

    this.isDestroyed = false;

    this._init();
  }

  onUpdate(dt) {
    if (this.isDestroyed)
      return;

    this.body.onUpdate(dt);

    this.position = this.body.position;

    if (this.body.isCollideBottom) {
      this.messages.post("spawnBlock", [
        Math.floor(this.x),
        Math.floor(this.y),
        Math.floor(this.z),
      ], this.blockType);

      this.isDestroyed = true;
    }
  }

  render(camera) {
    gl.useProgram(program);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.FRONT);

    gl.disable(gl.BLEND);
    gl.colorMask(true, true, true, false);

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.activeTexture(gl.TEXTURE0);

    gl.uniform1f(hightLightIndexUniformLocation, -1);

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

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
    const blockData = BlockMeshGenerator.blockData;
    const blockType = this.blockType;
    const textureConfig = MESH_TEXTURES[blockType] || { all: [1000, 1000] };

    const block = this.world.getBlock(Math.floor(this.x), Math.floor(this.y - 1), Math.floor(this.z));
    const light = block ? 0.1 + (LightEngine.getLight(block.light) / CONFIG.MAX_LIGHT) * 0.9 : 1;

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

        this.vertices[i + 5] = light * data.light;

        // mesh.vertices[i + 5] = Math.max(0, Math.min(1, mesh.vertices[i + 5]));

        this.vertices[i] = (this.vertices[i]) * 0.5;
        this.vertices[i + 1] = (this.vertices[i + 1]) * 0.5;
        this.vertices[i + 2] = (this.vertices[i + 2]) * 0.5;
      }

      for (let i = 0; i < data.triangles.default.length; i++) {
        this.indices.push(data.triangles.default[i] + elementIndexOffset);
      }
    }

    this.drawBuffersData();
  }
}