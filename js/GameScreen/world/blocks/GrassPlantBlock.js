import { BLOCK_LIGHT, BLOCK_TRANSPARENCY, BLOCK_TYPE } from "../../block-type";
import BasePlantBlock from "./BasePlantBlock";
import BlocksManager from "./BlocksManager";

const GRASS_PLANT_SURVIVE_BASE = [
  BLOCK_TYPE.GRASS_BLOCK,
  BLOCK_TYPE.DIRT,
];

export default class GrassPlantBlock extends BasePlantBlock {
  checkBottom(bottomBlock, types = GRASS_PLANT_SURVIVE_BASE) {
    return super.checkBottom(bottomBlock, types);
  }
}