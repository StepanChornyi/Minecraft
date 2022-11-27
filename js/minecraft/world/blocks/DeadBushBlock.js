import { BLOCK_LIGHT, BLOCK_TRANSPARENCY, BLOCK_TYPE } from "../../block-type";
import BasePlantBlock from "./BasePlantBlock";
import BlocksManager from "./BlocksManager";

const DEAD_BUSH_SURVIVE_BASE = [
  BLOCK_TYPE.SAND,
  BLOCK_TYPE.GRASS_BLOCK,
  BLOCK_TYPE.DIRT,
];

export default class DeadBushBlock extends BasePlantBlock {
  checkBottom(bottomBlock, types = DEAD_BUSH_SURVIVE_BASE) {
    return super.checkBottom(bottomBlock, types);
  }
}