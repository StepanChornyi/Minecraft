import BlocksManager from "../blocks/BlocksManager";
import ChunkStorage from "../chunk-storage";
import CONFIG from "../config";
import WorldGenerator from "./world-generator";
import LevelGenChunk from "./LevelGenChunk";

const CHUNK_SIZE = CONFIG.CHUNK_SIZE;
const CHUNK_HEIGHT = CONFIG.CHUNK_HEIGHT;

export default class LevelGen {
  constructor() {
    this._chunkStorage = new ChunkStorage();
    this._chunks = this._chunkStorage.chunks;

    this._worldGen = new WorldGenerator();
  }

  isChunkReady(x, z) {
    const chunkGen = this.getChunkGen(x, z);

    if (chunkGen && chunkGen.isReady) {
      return true;
    }

    return false;
  }

  generateChunk(chunkX, chunkZ) {
    const chunkGen = new LevelGenChunk();

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        chunkGen.setHeightMap(x, z, this._worldGen.getHeightNoise(x + chunkX * CHUNK_SIZE, z + chunkZ * CHUNK_SIZE));
      }
    }

    for (let x = 0, blockType; x < CHUNK_SIZE; x++) {
      for (let y = 0; y < CHUNK_HEIGHT; y++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          blockType = this._worldGen.getBlockType(x + chunkX * CHUNK_SIZE, y, z + chunkZ * CHUNK_SIZE, chunkGen.getHeightMap(x, z));

          chunkGen.setBlock(x, y, z, BlocksManager.create(blockType));
        }
      }
    }

    this._worldGen.placeTree(chunkGen);

    this._chunkStorage.set(chunkX, chunkZ, chunkGen);
  }

  fillChunk(chunk) {
    const chunkGen = this.getChunkGen(chunk.x, chunk.z);

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let y = 0; y < CHUNK_HEIGHT; y++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          chunk.setBlock(x, y, z, chunkGen.getBlock(x, y, z));
        }
      }
    }
  }

  getChunkGen(x, z) {
    return this._chunkStorage.get(x, z);
  }
}