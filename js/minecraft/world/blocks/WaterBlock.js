import { BLOCK_LIGHT, BLOCK_TRANSPARENCY, BLOCK_TYPE } from "../../block-type";
import BaseBlock from "./BaseBlock";
import BlocksManager from "./BlocksManager";

const MAX_LIQUID_LEVEL = 7;
const UPDATE_TIME = 10;

const DESTROY_TYPES = [
  BLOCK_TYPE.AIR,
  BLOCK_TYPE.DEAD_BUSH,
  BLOCK_TYPE.GRASS,
  BLOCK_TYPE.ROSE,
  BLOCK_TYPE.TORCH
];

export default class WaterBlock extends BaseBlock {
  constructor() {
    super(BLOCK_TYPE.WATER);

    this._liquidLevel = MAX_LIQUID_LEVEL;
    this.needsUpdate = true;
    this._isSource = true;
    this._isFall = false;
    this._resetTime();
  }

  update(world, pos) {
    if (this._counter > 0) {
      this._counter--;
      return;
    }

    const top = world.getBlock(pos.x, pos.y + 1, pos.z);
    const bottom = world.getBlock(pos.x, pos.y - 1, pos.z);
    const isBottomEmpty = bottom.isAir || bottom.is(BLOCK_TYPE.WATER);

    let lb = this._updateWater(world, pos, -1, 0, 0, !isBottomEmpty);
    let rb = this._updateWater(world, pos, 1, 0, 0, !isBottomEmpty);
    let bb = this._updateWater(world, pos, 0, 0, -1, !isBottomEmpty);
    let fb = this._updateWater(world, pos, 0, 0, 1, !isBottomEmpty);

    if (isBottomEmpty)
      this._updateWater(world, pos, 0, -1, 0, true);

    if (!lb && !rb && !bb && !fb && !this._isSource && !top.is(BLOCK_TYPE.WATER)) {
      this._liquidLevel -= 2;

      if (this._isFall) {
        this._liquidLevel = -1;
      }

      if (this._liquidLevel < 0) {
        world.setBlock(pos.x, pos.y, pos.z, BlocksManager.create(BLOCK_TYPE.AIR));
      } else {
        world.setBlock(pos.x, pos.y, pos.z, this);
      }
    } else {
      this.needsUpdate = false;
    }

    this._resetTime();
  }

  _resetTime() {
    this._counter = UPDATE_TIME;
  }

  _updateWater(world, pos, dx, dy, dz, canSpread) {
    const side = world.getBlock(pos.x + dx, pos.y + dy, pos.z + dz);

    if (!side)
      return true;

    if (DESTROY_TYPES.includes(side.type)) {
      if (canSpread && (!!dy || this._liquidLevel > 0)) {
        const newWater = BlocksManager.create(BLOCK_TYPE.WATER);

        newWater._isSource = false;

        if (!!dy) {
          newWater._liquidLevel = MAX_LIQUID_LEVEL;
          newWater._isFall = true;
        } else if (this._liquidLevel > 0) {
          newWater._liquidLevel = this._liquidLevel - 1;
        }

        world.destroy(pos.x + dx, pos.y + dy, pos.z + dz, newWater);
      }

      return false;
    }

    if (side._isSource || side._liquidLevel > this._liquidLevel) {
      return true;
    }
  }
}