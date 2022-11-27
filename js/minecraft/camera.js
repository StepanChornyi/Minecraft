import Ray from '../utils/ray';

const mat4 = glMatrix.mat4;

export default class Camera extends Ray {
  constructor(fov = Math.PI * 0.55, aspect = 1, near = 0.1, far = 1000) {
    super();
    
    this._fov = fov;
    this._aspect = aspect;
    this._near = near;
    this._far = far;

    this._viewMatrix = new Float32Array(16);
    this._projectionMatrix = new Float32Array(16);

    this._projectionDirty = true;
    this._viewMatrixDirty = true;
  }

  get projectionMatrix() {
    if (this._projectionDirty) {
      mat4.perspective(this._projectionMatrix, this._fov, this._aspect, this._near, this._far);
      this._projectionDirty = false;
    }

    return this._projectionMatrix;
  }

  get viewMatrix() {
    if (this._viewMatrixDirty) {
      mat4.identity(this._viewMatrix);
      mat4.rotateX(this._viewMatrix, this._viewMatrix, -this._euler[0]);
      mat4.rotateY(this._viewMatrix, this._viewMatrix, -this._euler[1]);
      mat4.rotateZ(this._viewMatrix, this._viewMatrix, -this._euler[2]);
      mat4.translate(this._viewMatrix, this._viewMatrix, [
        -this._position[0],
        -this._position[1],
        -this._position[2],
      ]);

      this._viewMatrixDirty = false;
    }

    return this._viewMatrix;
  }

  get fov() {
    return this._fov;
  }

  set fov(val) {
    this._setUpdatedValDirty(this._fov, this._fov = val);
  }

  get aspect() {
    return this._aspect;
  }

  set aspect(val) {
    this._setUpdatedValDirty(this._aspect, this._aspect = val);
  }

  get near() {
    return this._near;
  }

  set near(val) {
    this._setUpdatedValDirty(this._near, this._near = val);
  }

  get far() {
    return this._far;
  }

  set far(val) {
    this._setUpdatedValDirty(this._far, this._far = val);
  }

  _setUpdatedValDirty(oldVal, newVal) {
    if (oldVal !== newVal) {
      this._projectionDirty = true;
    }
  }

  _setPosition(index, val) {
    super._setPosition(index, val);

    this._viewMatrixDirty = true;
  }
}