import { BLOCK_LIGHT, BLOCK_TRANSPARENCY, BLOCK_TYPE } from "../../block-type";
import BasePlantBlock from "./BasePlantBlock";
import BlocksManager from "./BlocksManager";

const ROSE_PLANT_SURVIVE_BASE = [
  BLOCK_TYPE.GRASS_BLOCK,
  BLOCK_TYPE.DIRT,
];

export default class RosePlantBlock extends BasePlantBlock {
  checkBottom(bottomBlock, types = ROSE_PLANT_SURVIVE_BASE) {
    return super.checkBottom(bottomBlock, types);
  }
}