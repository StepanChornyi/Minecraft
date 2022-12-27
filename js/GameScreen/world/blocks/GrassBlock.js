import { BLOCK_LIGHT, BLOCK_TRANSPARENCY, BLOCK_TYPE } from "../../block-type";
import BaseBlock from "./BaseBlock";
import BlocksManager from "./BlocksManager";
import LightEngine from "../mesh-generator/LightEngine";

export default class GrassBlock extends BaseBlock {
  constructor(type) {
    super(type);

    this.needsUpdate = true;
    this._counter = 0;

    this._resetTime();
  }

  update(world, pos) {
    const top = world.getBlock(pos.x, pos.y + 1, pos.z);

    if (!top || (top.transparency > 0)) {
      this.needsUpdate = false;
      return;
    }

    if (this._counter > 0) {
      this._counter--;
      return;
    }

    world.setBlock(pos.x, pos.y, pos.z, BlocksManager.create(BLOCK_TYPE.DIRT));

    this.needsUpdate = false;
    this._resetTime();
  }

  _resetTime() {
    const rnd = Math.random();

    this._counter = 200 + Math.round(10000 * rnd * rnd * rnd * rnd * rnd);
  }
}