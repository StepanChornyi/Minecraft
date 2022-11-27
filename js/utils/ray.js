import Object3D from "../minecraft/object3D";

export default class Ray extends Object3D {
  constructor() {
    super();

    this._direction = new Float32Array(3);
    this._directionDirty = true;
  }

  get direction() {
    this._directionDirty && this._updateDirection();

    return this._direction;
  }

  set direction([x, y, z]) {
    this._direction[0] = x;
    this._direction[1] = y;
    this._direction[2] = z;

    this._directionDirty = false;
  }

  _updateDirection() {
    const cosX = Math.cos(-this.rotationX);

    this._direction[0] = -Math.sin(this.rotationY) * cosX;
    this._direction[1] = Math.sin(this.rotationX);
    this._direction[2] = -Math.cos(this.rotationY) * cosX;

    this._directionDirty = false;
  }

  _setTransformDirty() {
    super._setTransformDirty();

    this._directionDirty = true;
  }
}