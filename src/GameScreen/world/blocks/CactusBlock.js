import { BLOCK_LIGHT, BLOCK_TRANSPARENCY, BLOCK_TYPE } from "../../block-type";
import BasePlantBlock from "./BasePlantBlock";
import BlocksManager from "./BlocksManager";

const CACTUS_SURVIVE_BASE = [
  BLOCK_TYPE.CACTUS,
  BLOCK_TYPE.SAND,
  BLOCK_TYPE.GRASS_BLOCK,
];

export default class CactusBlock extends BasePlantBlock {
  checkBottom(bottomBlock, types = CACTUS_SURVIVE_BASE) {
    return super.checkBottom(bottomBlock, types);
  }
}