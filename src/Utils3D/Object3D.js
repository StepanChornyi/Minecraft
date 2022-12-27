import { MessageDispatcher } from "black-engine";

const mat4 = glMatrix.mat4;

const zeroVec3 = [0, 0, 0];
const oneVec3 = [1, 1, 1];

export default class Object3D extends MessageDispatcher {
  constructor() {
    super();

    this._position = new Float32Array(zeroVec3);
    this._euler = new Float32Array(zeroVec3);
    // this._quaternion = glMatrix.quat.fromEuler(new Float32Array(4), this._euler);
    this._scale = new Float32Array(oneVec3);

    this._transformMatrix = mat4.identity(new Float32Array(16));
    this._transformDirty = true;
  }

  get transformMatrix() {
    this._transformDirty && this._updateTransformMatrix();

    return this._transformMatrix;
  }

  get position() {
    return this._position;
  }

  set position([x, y, z]) {
    this._position[0] = x;
    this._position[1] = y;
    this._position[2] = z;

    this._setTransformDirty();
  }

  get x() {
    return this._position[0];
  }

  get y() {
    return this._position[1];
  }

  get z() {
    return this._position[2];
  }

  set x(val) {
    this._setPosition(0, val);
  }

  set y(val) {
    this._setPosition(1, val);
  }

  set z(val) {
    this._setPosition(2, val);
  }

  get rotationX() {
    return this._euler[0];
  }

  get rotationY() {
    return this._euler[1];
  }

  get rotationZ() {
    return this._euler[2];
  }

  set rotationX(val) {
    this._setRotation(0, val);
  }

  set rotationY(val) {
    this._setRotation(1, val);
  }

  set rotationZ(val) {
    this._setRotation(2, val);
  }

  translate([dx, dy, dz], mult = 1) {
    if (mult !== 1) {
      dx *= mult;
      dy *= mult;
      dz *= mult;
    }

    this._position[0] += dx;
    this._position[1] += dy;
    this._position[2] += dz;
  }

  rotate([dx, dy, dz]) {
    this._rotation[0] += dx;
    this._rotation[1] += dy;
    this._rotation[2] += dz;
  }

  reset() {
    this._position[0] = this._position[1] = this._position[2] = 0;
    this._rotation[0] = this._rotation[1] = this._rotation[2] = 0;

    this._setTransformDirty();
  }

  _updateTransformMatrix() {
    mat4.identity(this._transformMatrix);
    mat4.translate(this._transformMatrix, this._transformMatrix, this._position);
    mat4.rotateX(this._transformMatrix, this._transformMatrix, this._euler[0]);
    mat4.rotateY(this._transformMatrix, this._transformMatrix, this._euler[1]);
    mat4.rotateZ(this._transformMatrix, this._transformMatrix, this._euler[2]);

    this._transformDirty = false;
  }

  _setPosition(index, val) {
    this._position[index] = val;
    this._setTransformDirty();
  }

  _setRotation(index, val) {
    this._euler[index] = val;
    this._setTransformDirty();
  }

  _setTransformDirty() {
    this._transformDirty = true;
  }
}