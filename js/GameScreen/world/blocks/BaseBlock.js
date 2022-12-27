import { BLOCK_LIGHT, BLOCK_TRANSPARENCY, BLOCK_TYPE } from "../../block-type";

export default class BaseBlock {
  constructor(type) {
    this.type = type;
    this.light = 0;

    this._needsUpdate = false;
  }

  isType(type) {
    return this.is(type);
  }

  is(type) {
    return this.type === type;
  }

  reset() {
    this.type = BLOCK_TYPE.AIR;
    this.light = 0;
  }

  update(world, pos) {
    this._needsUpdate = false;
  }

  get isAir() {
    return this.isType(BLOCK_TYPE.AIR);
  }

  get transparency() {
    return BLOCK_TRANSPARENCY[this.type];
  }

  get isTransparent() {
    return this.transparency !== 0;
  }

  get needsUpdate() {
    return this._needsUpdate;
  }

  set needsUpdate(val) {
    this._needsUpdate = val;
  }

  get nonTransparent() {
    return this.transparency === 0;
  }

  get lightEmit() {
    return BLOCK_LIGHT[this.type];
  }

  get isLightEmitter() {
    return this.lightEmit !== 0;
  }

  static get pool() {
    return pool;
  }
}

const pool = [];