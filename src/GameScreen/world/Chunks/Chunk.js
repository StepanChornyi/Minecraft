import ChunkMesh from '../../meshes/chunk-mesh';
import { BLOCK_TYPE } from '../../block-type';
import Vector3 from '../../../Utils3D/vector3';
import LightEngine from '../mesh-generator/LightEngine';
import CONFIG from '../config';
import SubChunk from './SubChunk';
import BlocksManager from '../blocks/BlocksManager';
import { CHUNK_DIR, CHUNK_DIR_VECTOR, STRAIGHT_DIR_ARR } from './ChunkDirections';
import Flags from '../../../utils/Flags';
import ChunkCap from './ChunkCap';

const CHUNK_SIZE = CONFIG.CHUNK_SIZE;
const SUB_CHUNKS = CONFIG.WORLD_SUB_CHUNKS_HEIGHT;

export default class Chunk {
  constructor(world, meshGenerator) {
    this.world = world;
    this.meshGenerator = meshGenerator;

    this.x = 0;
    this.z = 0;

    this.subChunks = [];
    this.topCapChunk = null;
    this.bottomCapChunk = null;

    this.lightSidesFilled = new Flags();
    this.lightFilled = false;

    this._initSubChunks();

    //flags
    this.visible = true;
    this.filled = false;
    this.updated = false;
  }

  get isLighted() {
    return this.lightSidesFilled.get(CHUNK_DIR.ALL);
  }

  // get straightUnlightedDir() {
  //   const res = 0;

  //   for (let i = 0; i < STRAIGHT_DIR_ARR.length; i++) {
  //     if (!this.lightSidesFilled.get(STRAIGHT_DIR_ARR[i]))
  //       res = res & STRAIGHT_DIR_ARR[i];
  //   }

  //   return res;
  // }

  _initSubChunks() {
    for (let y = 0; y < SUB_CHUNKS; y++) {
      this.subChunks[y] = new SubChunk(this.world, this.meshGenerator);
    }

    this.topCapChunk = new ChunkCap(this.world).clearLights(true);
    this.bottomCapChunk = new ChunkCap(this.world);
  }

  getBlock(x, y, z, outsideTest = true) {
    if (outsideTest && this.isOutsideChunk(x, z)) {
      const blockWorldX = x + this.x * CHUNK_SIZE;
      const blockWorldZ = z + this.z * CHUNK_SIZE;

      return this.world.getBlock(blockWorldX, y, blockWorldZ);
    }

    if (y > CONFIG.MAX_BLOCK_Y) {
      return this.topCapChunk.getBlock(x, z);
    } else if (y < CONFIG.MIN_BLOCK_Y) {
      return this.bottomCapChunk.getBlock(x, z);
    } else {
      return this.subChunks[this.getSubChunkY(y)]
        .getBlock(x, this.getSubChunkLocalY(y), z);
    }
  }

  setBlock(x, y, z, block) {
    this.subChunks[this.getSubChunkY(y)]
      .setBlock(x, this.getSubChunkLocalY(y), z, block);
  }

  isOutsideChunk(x, z) {
    return x < 0 || x >= CHUNK_SIZE || z < 0 || z >= CHUNK_SIZE;
  }

  // getBlockIndex(x, y, z) {
  //   return x + y * CHUNK_SIZE + z * CHUNK_SIZE * CHUNK_SIZE;
  // }

  getSubChunkY(worldY) {
    return Math.floor(worldY / CHUNK_SIZE);
  }

  getSubChunkLocalY(worldY) {
    return worldY - this.getSubChunkY(worldY) * CHUNK_SIZE;
  }

  setPos(x, z) {
    this.x = x;
    this.z = z;

    for (let y = 0; y < this.subChunks.length; y++) {
      this.subChunks[y].setPos(x, y, z);
    }
  }

  updateMeshPos() {
    for (let y = 0; y < this.subChunks.length; y++) {
      this.subChunks[y].updateMeshPos();
    }
  }

  clearLights() {
    for (let y = 0; y < this.subChunks.length; y++) {
      this.subChunks[y].clearLights();
    }

    this.topCapChunk.clearLights(true);
    this.bottomCapChunk.clearLights(false);
  }

  clear() {
    for (let y = 0; y < this.subChunks.length; y++) {
      this.subChunks[y].clear();
    }
  }

  get dirty() {
    for (let y = 0; y < this.subChunks.length; y++) {
      if (this.subChunks[y].dirty) {
        return true;
      }
    }

    return false;
  }

  set dirty(val) {
    for (let y = 0; y < this.subChunks.length; y++) {
      this.subChunks[y].dirty = val;
    }
  }

  static get pool() {
    return pool;
  }
}

const pool = [];