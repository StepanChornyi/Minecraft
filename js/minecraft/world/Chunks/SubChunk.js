import ChunkMesh from '../../meshes/chunk-mesh';
import { BLOCK_TYPE } from '../../block-type';
import Vector3 from '../../../utils/vector3';
import LightEngine from '../mesh-generator/LightEngine';
import CONFIG from '../config';

const CHUNK_SIZE = CONFIG.CHUNK_SIZE;

export default class SubChunk {
  constructor(world, meshGenerator) {
    this.world = world;
    this.meshGenerator = meshGenerator;

    this.x = 0;
    this.y = 0;
    this.z = 0;

    this.blocks = [];

    this.mesh = new ChunkMesh(world.gl);

    //flags
    this.dirty = true;
    this.lightDirty = true;
  }

  updateMesh() {
    this.meshGenerator.generateMesh(this);
    this.mesh.drawBuffersData();
  }

  getBlock(x, y, z, boundsCheck = true) {
    if (boundsCheck && this.isOutOfBounds(x, y, z)) {
      return this.world.getBlock(
        x + this.x * CHUNK_SIZE,
        y + this.y * CHUNK_SIZE,
        z + this.z * CHUNK_SIZE
      );
    }

    return this.blocks[this.getBlockIndex(x, y, z)];
  }

  isOutOfBounds(x, y, z) {
    return x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_SIZE || z < 0 || z >= CHUNK_SIZE;
  }

  setBlock(x, y, z, block) {
    this.blocks[this.getBlockIndex(x, y, z)] = block;
  }

  getBlockIndex(x, y, z) {
    return x + y * CHUNK_SIZE + z * CHUNK_SIZE * CHUNK_SIZE;
  }

  // getBlockPos(index) {
  //   return new Vector3(
  //     index % CHUNK_SIZE,
  //     Math.floor(index / CHUNK_SIZE) % CHUNK_SIZE,
  //     Math.floor(index / (CHUNK_SIZE * CHUNK_SIZE))
  //   );
  // }

  setPos(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.updateMeshPos();
  }

  updateMeshPos() {
    this.mesh.x = this.x * CHUNK_SIZE;
    this.mesh.y = this.y * CHUNK_SIZE;
    this.mesh.z = this.z * CHUNK_SIZE;
  }

  clearLights() {
    for (let i = 0; i < this.blocks.length; i++) {
      this.blocks[i].light = 0;
    }
  }

  clear() {
    this.blocks = [];///TODO  Add blocks recycle
    this.mesh.vertices = [];
    this.mesh.indices = [];
  }
}