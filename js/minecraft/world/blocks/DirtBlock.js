import { BLOCK_LIGHT, BLOCK_TRANSPARENCY, BLOCK_TYPE } from "../../block-type";
import LightEngine from "../mesh-generator/LightEngine";
import BaseBlock from "./BaseBlock";
import BlocksManager from "./BlocksManager";

export default class DirtBlock extends BaseBlock {
  constructor(type = BLOCK_TYPE.DIRT) {
    super(type);

    this.needsUpdate = true;
    this._counter = 0;

    this._resetTime();
  }

  update(world, pos) {
    const top = world.getBlock(pos.x, pos.y + 1, pos.z);

    if (!top || LightEngine.getSkyLight(top.light) < 5) {
      this.needsUpdate = false;

      return;
    }

    if (this._counter > 0) {
      this._counter--;
      return;
    }

    world.setBlock(pos.x, pos.y, pos.z, BlocksManager.create(BLOCK_TYPE.GRASS_BLOCK));

    this.needsUpdate = false;
  }

  _resetTime() {
    const rnd = Math.random();

    this._counter = 200 + Math.round(10000 * rnd * rnd * rnd * rnd * rnd);
  }
}