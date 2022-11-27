import CONFIG from "../config";

const CHUNK_SIZE = CONFIG.CHUNK_SIZE;
const CHUNK_HEIGHT = CONFIG.CHUNK_HEIGHT;

export default class LevelGenChunk {
  constructor() {
    this.heightMap = [];
    this.biomeMap = [];

    this._blocks = [];

    this.isReady = false;
  }

  getBlock(x, y, z) {
    return this._blocks[this.getBlockIndex(x, y, z)];
  }

  setBlock(x, y, z, val) {
    this._blocks[this.getBlockIndex(x, y, z)] = val;
  }

  getBlockIndex(x, y, z) {
    return x + y * CHUNK_SIZE + z * CHUNK_SIZE * CHUNK_HEIGHT;
  }

  getBiome(x, z) {
    return this.biomeMap[this._getMapIndex(x, z)];
  }

  setBiome(x, z, val) {
    this.biomeMap[this._getMapIndex(x, z)] = val;
  }

  getHeightMap(x, z) {
    return this.heightMap[this._getMapIndex(x, z)];
  }

  setHeightMap(x, z, val) {
    this.heightMap[this._getMapIndex(x, z)] = val;
  }

  _getMapIndex(x, z) {
    return x + z * CHUNK_SIZE;
  }
}