import ChunkMesh from '../../meshes/Chunk/chunk-mesh';
import { BLOCK_TYPE } from '../../block-type';
import Vector3 from '../../../Utils3D/vector3';
import LightEngine from '../mesh-generator/LightEngine';
import CONFIG from '../config';
import BlocksManager from '../blocks/BlocksManager';

const CHUNK_SIZE = CONFIG.CHUNK_SIZE;

export default class ChunkCap {
  constructor(world) {
    this.world = world;

    this.x = 0;
    this.z = 0;

    this.blocks = [];

    this._init();
  }

  _init(){
    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        this.setBlock(x, z, BlocksManager.create(BLOCK_TYPE.AIR));  
      }
    }
  }

  getBlock(x, z) {
    return this.blocks[this.getBlockIndex(x, z)];
  }

  isOutOfBounds(x, y, z) {
    return x < 0 || x >= CHUNK_SIZE || z < 0 || z >= CHUNK_SIZE;
  }

  setBlock(x, z, block) {
    this.blocks[this.getBlockIndex(x, z)] = block;
  }

  getBlockIndex(x, z) {
    return x + z * CHUNK_SIZE;
  }

  // getBlockPos(index) {
  //   return new Vector3(
  //     index % CHUNK_SIZE,
  //     Math.floor(index / CHUNK_SIZE) % CHUNK_SIZE,
  //     Math.floor(index / (CHUNK_SIZE * CHUNK_SIZE))
  //   );
  // }

  setPos(x, z) {
    this.x = x;
    this.z = z;
  }

  clearLights(skyLightFill = false) {
    for (let i = 0; i < this.blocks.length; i++) {
      this.blocks[i].light = skyLightFill ? LightEngine.getLightData(CONFIG.MAX_LIGHT, 0, 1) : 0;
    }

    return this;
  }
}