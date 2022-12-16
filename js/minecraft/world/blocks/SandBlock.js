import { BLOCK_LIGHT, BLOCK_TRANSPARENCY, BLOCK_TYPE } from "../../block-type";
import LightEngine from "../mesh-generator/LightEngine";
import BaseBlock from "./BaseBlock";
import BlocksManager from "./BlocksManager";

export default class SandBlock extends BaseBlock {
  constructor(type = BLOCK_TYPE.SAND) {
    super(type);

    this.needsUpdate = false;
  }

  update(world, pos) {
    const bottom = world.getBlock(pos.x, pos.y - 1, pos.z);

    if (bottom && bottom.isAir) {
      world.setBlock(pos.x, pos.y, pos.z, BlocksManager.create(BLOCK_TYPE.AIR));
      world.post("createBlockEntity", [pos.x, pos.y, pos.z], this.type);
    }

    this.needsUpdate = false;
  }
}