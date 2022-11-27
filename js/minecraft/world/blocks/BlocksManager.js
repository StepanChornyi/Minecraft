import { BLOCK_TYPE } from "../../block-type";
import BaseBlock from "./BaseBlock";

const BLOCK_CLASSES = {};

BLOCK_CLASSES[BLOCK_TYPE.AIR] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.GRASS_BLOCK] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.DIRT] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.STONE] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.COAL] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.IRON] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.WOOD] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.BEDROCK] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.COBBLESTONE] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.STONE_BRICK] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.TORCH] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.LEAVES] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.GRASS] = BaseBlock;
BLOCK_CLASSES[BLOCK_TYPE.ROSE] = BaseBlock;

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