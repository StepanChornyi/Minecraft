export default class ChunkStorage {
  constructor() {
    this.chunks = [];
    this.chunkArrays = [
      [],//  x,  z
      [],// -x,  z
      [],//  x, -z
      [],// -x, -z
    ];
  }

  get(x, z) {
    return this.chunkArrays[this._getChunkArrayIndex(x, z)][this._getChunkIndex(x, z)];
  }

  set(x, z, chunk) {
    if (this.chunks.indexOf(chunk) < 0) {
      this.chunks.push(chunk);
    }

    return this.chunkArrays[this._getChunkArrayIndex(x, z)][this._getChunkIndex(x, z)] = chunk;
  }

  remove(x, z) {
    const chunkArray = this.chunkArrays[this._getChunkArrayIndex(x, z)];
    const chunk = chunkArray[this._getChunkIndex(x, z)];

    chunkArray[this._getChunkIndex(x, z)] = undefined;

    if (chunk) {
      const chunkIndex = this.chunks.indexOf(chunk);

      if (chunkIndex >= 0)
        this.chunks.splice(chunkIndex, 1);
    }

    return chunk;
  }

  _getChunkArrayIndex(x, z) {
    return (x < 0 ? 0 : 1) + (z < 0 ? 0 : 2);
  }

  _getChunkIndex(x, z) {//16 bits for x and z
    return abs(x) << 16 | abs(z);
  }
}

function abs(a) {
  return a < 0 ? -a : a;
}