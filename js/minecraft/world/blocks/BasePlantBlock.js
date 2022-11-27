import { BLOCK_LIGHT, BLOCK_TRANSPARENCY, BLOCK_TYPE } from "../../block-type";
import BaseBlock from "./BaseBlock";
import BlocksManager from "./BlocksManager";

export default class BasePlantBlock extends BaseBlock {
  update(world, pos) {
    const bottom = world.getBlock(pos.x, pos.y - 1, pos.z);

    if (bottom && !this.checkBottom(bottom)) {
      world.destroy(pos.x, pos.y, pos.z);
    }

    this._needsUpdate = false;
  }

  checkBottom(bottomBlock, types = []) {
    for (let i = 0; i < types.length; i++) {
      if (bottomBlock.is(types[i])) {
        return true;
      }
    }

    return false;

    // !bottom.is(BLOCK_TYPE.CACTUS) && !bottom.is(BLOCK_TYPE.SAND) && !bottom.is(BLOCK_TYPE.GRASS_BLOCK)
  }
}