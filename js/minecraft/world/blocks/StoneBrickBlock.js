import { BLOCK_LIGHT, BLOCK_TRANSPARENCY, BLOCK_TYPE } from "../../block-type";
import BaseBlock from "./BaseBlock";
import BlocksManager from "./BlocksManager";
import LightEngine from "../mesh-generator/LightEngine";

export default class StoneBrickBlock extends BaseBlock {
  constructor() {
    super(BLOCK_TYPE.STONE_BRICK);

    this.needsUpdate = true;
  }

  update(world, pos) {
    const top = world.getBlock(pos.x, pos.y + 1, pos.z);

    if (top.is(BLOCK_TYPE.SAND)) {
      world.setBlock(pos.x, pos.y-1, pos.z, BlocksManager.create(BLOCK_TYPE.DIRT));
    }

    // if (!top || top.transparency > 0) {
    //   this._needsUpdate = false;
    //   return;
    // }

    // if (this._counter > 0) {
    //   this._counter--;
    //   return;
    // }

    this.needsUpdate = false;


    // world.setBlock(pos.x, pos.y, pos.z, BlocksManager.create(BLOCK_TYPE.DIRT));

    // this._needsUpdate = false;
    // this._resetTime();
  }


}