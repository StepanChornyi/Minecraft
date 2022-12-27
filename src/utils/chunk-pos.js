export default class ChunkPos {
  constructor(x = 0, z = 0) {
    this.x = x;
    this.z = z;
  }

  set(x, z) {
    this.x = x;
    this.z = z;

    return this;
  }

  clone() {
    return new ChunkPos(this.x, this.z);
  }

  add(chunkPos) {
    this.x += chunkPos.x;
    this.z += chunkPos.z;

    return this;
  }

  addXZ(x, z) {
    this.x += x;
    this.z += z;

    return this;
  }

  addTo(chunkPos) {
    chunkPos.x += this.x;
    chunkPos.z += this.z;

    return this;
  }

  addScalar(val) {
    this.x += val;
    this.z += val;

    return this;
  }

  multiply(chunkPos) {
    this.x *= chunkPos.x;
    this.z *= chunkPos.z;

    return this;
  }

  multiplyScalar(val) {
    this.x *= val;
    this.z *= val;

    return this;
  }

  copyFrom(chunkPos) {
    this.x = chunkPos.x;
    this.z = chunkPos.z;

    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.z * this.z);
  }

  isInBounds(min, max) {
    return !(this.x < min.x || this.z < min.z || this.x > max.x || this.z > max.z);
  }

  static get tmp() {
    return tmp;
  }

  static new(x = 0, z = 0) {
    return pool.length ? pool.pop().set(x, z) : new ChunkPos(x, z);
  }

  static release(i) {
    if (i === tmp) {
      console.warn("Trying to release tmp chunkPos");

      return;
    }

    pool.push(i);
  }

  static releaseMul(...instances) {
    pool.push(...instances);
  }
}

const tmp = new ChunkPos();
const pool = [];