export default class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  }

  fromArr3(vec3) {
    this.x = vec3[0];
    this.y = vec3[1];
    this.z = vec3[2];

    return this;
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  add(vector3) {
    this.x += vector3.x;
    this.y += vector3.y;
    this.z += vector3.z;

    return this;
  }

  addXYZ(x, y, z) {
    this.x += x;
    this.y += y;
    this.z += z;

    return this;
  }

  addArr3(arr3) {
    this.x += arr3[0];
    this.y += arr3[1];
    this.z += arr3[2];

    return this;
  }

  addTo(vector3) {
    vector3.x += this.x;
    vector3.y += this.y;
    vector3.z += this.z;

    return this;
  }

  addScalar(val) {
    this.x += val;
    this.y += val;
    this.z += val;

    return this;
  }

  multiply(vector) {
    this.x *= vector.x;
    this.y *= vector.y;
    this.z *= vector.z;

    return this;
  }

  multiplyScalar(val) {
    this.x *= val;
    this.y *= val;
    this.z *= val;

    return this;
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);

    return this;
  }

  copyFrom(vector3) {
    this.x = vector3.x;
    this.y = vector3.y;
    this.z = vector3.z;

    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  isInBounds(min, max) {
    return !(this.x < min.x || this.y < min.y || this.z < min.z || this.x > max.x || this.y > max.y || this.z > max.z);
  }

  static get tmp() {
    return tmp;
  }

  static new(x = 0, y = 0, z = 0) {
    return pool.length ? pool.pop().set(x, y, z) : new Vector3(x, y, z);
  }

  static release(i) {
    if (i === tmp) {
      console.warn("Trying to release tmp vector3");

      return;
    }

    pool.push(i);
  }

  static releaseMul(...instances) {
    pool.push(...instances);
  }
}

const tmp = new Vector3();
const pool = [];