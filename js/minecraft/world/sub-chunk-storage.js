export default class SubChunkStorage {
  constructor() {
    this.chunks = [];
    this.chunkArrays = [
      [],//  x,  y,  z
      [],// -x,  y,  z
      [],//  x,  y, -z
      [],// -x,  y, -z
    ];
  }

  get(x, y, z) {
    return this.chunkArrays[this._getChunkArrayIndex(x, z)][this._getChunkIndex(x, y, z)];
  }

  set(x, y, z, chunk) {
    if (this.chunks.indexOf(chunk) < 0) {
      this.chunks.push(chunk);
    }

    return this.chunkArrays[this._getChunkArrayIndex(x, z)][this._getChunkIndex(x, y, z)] = chunk;
  }

  remove(x, y, z) {
    const chunkArray = this.chunkArrays[this._getChunkArrayIndex(x, z)];
    const chunk = chunkArray[this._getChunkIndex(x, y, z)];

    chunkArray[this._getChunkIndex(x, y, z)] = undefined;

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

  _getChunkIndex(x, y, z) {//14 bits for x and z, 4 bits for y (32 bit int)
    return abs(x) << 18 | abs(y) << 14 | abs(z);
  }
}

function abs(a) {
  return a < 0 ? -a : a;
}