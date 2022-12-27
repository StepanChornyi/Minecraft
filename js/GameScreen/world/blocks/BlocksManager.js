import { BLOCK_TYPE } from "../../block-type";
import BaseBlock from "./BaseBlock";
import CactusBlock from "./CactusBlock";
import DeadBushBlock from "./DeadBushBlock";
import DirtBlock from "./DirtBlock";
import GrassBlock from "./GrassBlock";
import GrassPlantBlock from "./GrassPlantBlock";
import RosePlantBlock from "./RosePlantBlock";
import SandBlock from "./SandBlock";
import StoneBrickBlock from "./StoneBrickBlock";
import WaterBlock from "./WaterBlock";

const BLOCK_CLASSES = {};

BLOCK_CLASSES[BLOCK_TYPE.AIR] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.GRASS_BLOCK] = GrassBlock;
BLOCK_CLASSES[BLOCK_TYPE.DIRT] = DirtBlock;
BLOCK_CLASSES[BLOCK_TYPE.STONE] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.COAL] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.IRON] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.WOOD] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.BEDROCK] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.COBBLESTONE] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.STONE_BRICK] = StoneBrickBlock;
BLOCK_CLASSES[BLOCK_TYPE.TORCH] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.LEAVES] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.GRASS] = GrassPlantBlock;
BLOCK_CLASSES[BLOCK_TYPE.ROSE] = RosePlantBlock;
BLOCK_CLASSES[BLOCK_TYPE.SAND] = SandBlock;
BLOCK_CLASSES[BLOCK_TYPE.SANDSTONE] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.DEAD_BUSH] = DeadBushBlock;
BLOCK_CLASSES[BLOCK_TYPE.CACTUS] = CactusBlock;
BLOCK_CLASSES[BLOCK_TYPE.WATER] = WaterBlock;

export default class BlocksManager {
  constructor() {
    console.warn("Instance of BlocksManager can't be created");
  }

  static create(blockType) {
    const BlockClass = BLOCK_CLASSES[blockType];
    const block = BlockClass.pool.pop() || new BlockClass(blockType);

    block.type = blockType;

    return block;
  }

  static recycle(block) {
    block.reset();

    BLOCK_CLASSES[block.type].pool.push(block);
  }
}