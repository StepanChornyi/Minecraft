import Worley from '../../../libs/worley-noise';
import ImprovedNoise from '../../../libs/improved-noise';
import { BLOCK_TYPE } from '../../block-type';
import BlocksManager from '../blocks/BlocksManager';
import CONFIG from '../config';
import MathUtils from '../../../utils/MathUtils';

const CHUNK_SIZE = CONFIG.CHUNK_SIZE;
const WORLD_HEIGHT = CONFIG.WORLD_HEIGHT;

export default class WorldGenerator {
  constructor() {
    this.heightNoise = new ImprovedNoise();
    this.oreNoise = new ImprovedNoise();
    this.cavesNoise = new ImprovedNoise();

    this.worleyNoise = new Worley();
  }

  fillChunk(chunk) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const heightNoise = this.getHeightNoise(x + chunk.x * CHUNK_SIZE, z + chunk.z * CHUNK_SIZE);

        for (let worldY = WORLD_HEIGHT - 1; worldY >= 0; worldY--) {
          let blockType = this.getBlockType(x + chunk.x * CHUNK_SIZE, worldY, z + chunk.z * CHUNK_SIZE, heightNoise);

          const upperBlock = chunk.getBlock(x, worldY + 1, z);


          if (blockType === BLOCK_TYPE.GRASS_BLOCK && (upperBlock && !upperBlock.isAir)) {
            blockType = BLOCK_TYPE.DIRT;
          }

          chunk.setBlock(x, worldY, z, BlocksManager.create(blockType));

          // if (blockType === BLOCK_TYPE.AIR &&  y < heightNoise) {
          //   chunk.lights[chunk.getBlockIndex(x, y, z)] = 0b0000000011110001;
          // }
        }
      }
    }
  }

  placeTree(chunkGen) {
    const placeX1 = CHUNK_SIZE * 0.5 + Math.round((Math.random() * 2 - 1) * 5);
    const placeZ1 = CHUNK_SIZE * 0.5 + Math.round((Math.random() * 2 - 1) * 5);

    const placeX2 = CHUNK_SIZE * 0.5 + Math.round((Math.random() * 2 - 1) * 5);
    const placeZ2 = CHUNK_SIZE * 0.5 + Math.round((Math.random() * 2 - 1) * 5);

    this._placeTree(chunkGen, placeX1, placeZ1);

    if (MathUtils.isOutOfRadiusAB(placeX1, placeZ1, placeX2, placeZ2, 3))
      this._placeTree(chunkGen, placeX2, placeZ2);
  }

  _placeTree(chunkGen, placeX, placeZ) {
    const placeY = chunkGen.getHeightMap(placeX, placeZ) + 1;

    const blockBellow = chunkGen.getBlock(placeX, placeY - 1, placeZ);

    if (!blockBellow.is(BLOCK_TYPE.DIRT) && !blockBellow.is(BLOCK_TYPE.GRASS_BLOCK)) {
      return;
    }

    const trunkHeight = 4;
    const leavesRadius = 2;
    const leavesHeight = 4;
    const leavesOffset = 2;

    for (let y = 0; y < trunkHeight; y++) {
      chunkGen.setBlock(placeX, placeY + y, placeZ, BlocksManager.create(BLOCK_TYPE.WOOD));
    }

    for (let x = -leavesRadius; x <= leavesRadius; x++) {
      for (let y = 0; y < leavesHeight; y++) {
        for (let z = -leavesRadius; z <= leavesRadius; z++) {
          if (MathUtils.isOutOfRadiusManhattan(x, z, (1 - y / leavesHeight) * leavesRadius * 2)) {
            continue;
          }

          const block = chunkGen.getBlock(placeX + x, placeY + y + leavesOffset, placeZ + z);

          if (block && block.isAir) {
            chunkGen.setBlock(placeX + x, placeY + y + leavesOffset, placeZ + z, BlocksManager.create(BLOCK_TYPE.LEAVES));
          }
        }
      }
    }
  }

  getBlockType(x, y, z, heightNoise = this.getHeightNoise(x, z)) {
    // return this.getBlockType_LIGHT_TEST(x, y, z);
    // currHeight = CHUNK_HEIGHT - 6;



    let blockType = BLOCK_TYPE.AIR;

    // if (y === 2 || y === 3) {
    //   if (!(x % 10) || !(z % 10)) {
    //     return BLOCK_TYPE.STONE_BRICK;
    //   } else {
    //     return BLOCK_TYPE.AIR;
    //   }
    // } else if (y === 1 || y === 4) {
    //   return BLOCK_TYPE.STONE_BRICK;
    // }

    // return y > 10 ? BLOCK_TYPE.AIR : BLOCK_TYPE.STONE;

    // if (y > 0 && getCavesNoise(x, y, z) > 15) {
    //   return BLOCK.AIR;
    // }

    if (y < 1) {
      return BLOCK_TYPE.BEDROCK;
    }

    if (y > heightNoise + 1) {
      return BLOCK_TYPE.AIR;
    }

    const cave = this.getCavesNoise(x, y, z);

    if (y > heightNoise) {
      if (Math.floor(cave * 100 % 3)) {
        return BLOCK_TYPE.AIR;
      }

      if (!Math.floor(cave * 1000 % 300)) {
        return BLOCK_TYPE.ROSE;
      }

      return BLOCK_TYPE.GRASS;
    }

    if (cave < -2) {//-3
      // if (cave > -0.1) {
      //   return BLOCK_TYPE.LEAVES;
      // }

      return BLOCK_TYPE.AIR;
    }


    if (y > heightNoise - 5) {
      // if (y === heightNoise && w < 0.01) {
      //   return BLOCK_TYPE.WOOD;
      // }

      if (y === heightNoise) {
        return BLOCK_TYPE.GRASS_BLOCK;
      }

      return BLOCK_TYPE.DIRT;
    }

    const w = this.getWorley(x, y, z);

    if (w < 0.016) {
      return BLOCK_TYPE.IRON;
    }

    return BLOCK_TYPE.STONE;


    if (y < 1) {
      return BLOCK_TYPE.BEDROCK;
    } else if (y < currHeight * 0.6) {
      if (isIron) {
        blockType = BLOCK_TYPE.IRON;
      } else if (isCoal) {
        blockType = BLOCK_TYPE.COAL;
      } else {
        blockType = BLOCK_TYPE.STONE;
      }

    } else if (y < currHeight * 0.9) {
      blockType = BLOCK_TYPE.GRASS_BLOCK;
    } else {
      blockType = BLOCK_TYPE.AIR;
    }

    const oreNoise = 0//getOreNoise(x, y, z);
    const isIron = oreNoise > 8.7;
    const isCoal = oreNoise < -7.5;



    return blockType;
  }

  getBlockType_LIGHT_TEST(x, y, z) {
    if (y > WORLD_HEIGHT - 5) {
      return BLOCK_TYPE.AIR;
    }

    if (y === 0) {
      return BLOCK_TYPE.BEDROCK;
    }

    const ddx = (x + CHUNK_SIZE * 100) % CHUNK_SIZE;
    const ddz = (z + CHUNK_SIZE * 100) % CHUNK_SIZE;

    if (ddx === 0 && ddz === 0) {
      return BLOCK_TYPE.WOOD;
    }

    if (y === WORLD_HEIGHT - 5) {
      if (ddx === CHUNK_SIZE - 2 && ddz === CHUNK_SIZE - 2) {
        return BLOCK_TYPE.COBBLESTONE;
      }

      if ((ddx > 0) && (ddx < 4) && (ddz > 0) && (ddz < 4)) {
        return BLOCK_TYPE.AIR;
      }

      return BLOCK_TYPE.STONE;
    }

    if ((x + CHUNK_SIZE * 0.5) % CHUNK_SIZE === 0 || (z + CHUNK_SIZE * 0.5) % CHUNK_SIZE === 0) {
      return BLOCK_TYPE.STONE;
    }


    return BLOCK_TYPE.AIR;
  }

  getHeightNoise(x, z) {
    // let noise = 0;
    // let quality = 1;

    // for (var j = 0; j < 4; j++) {
    //   noise += this.heightNoise.noise(x / quality, 1 / quality, z / quality) * quality;
    //   quality *= 4;
    // }

    // return noise;

    let res = 0;
    let q = 12;
    let iter = 3;

    for (var j = 0; j < iter; j++) {
      res += this.heightNoise.noise(x / q, 0, z / q) * 0.5 + 0.5;
      q *= 1.3;
    }

    return Math.round(((res / iter) * 0.6 + 0.4) * WORLD_HEIGHT);
  }

  getWorley(x, y, z) {
    const s = 0.1;

    return this.worleyNoise.Euclidean(x * s, y * s, z * s)[0];
  }

  getOreNoise(x, y, z) {
    let noise = 0;
    let quality = 1;

    for (var j = 0; j < 3; j++) {
      noise += oreNoise.noise(x / quality, y / quality, z / quality) * quality;
      quality *= 2;
    }

    quality += 2;
    noise += oreNoise.noise(x / quality, y / quality, z / quality) * quality;

    return noise;
  }

  getCavesNoise(x, y, z) {
    let noise = 0;
    let quality = 4;

    for (var j = 0; j < 4; j++) {
      // if (j > 0) {
      //   const val = cavesNoise.noise(x / quality, y / quality, z / quality) * quality;

      //   if (val < 0) {
      //     noise -= val;
      //   }
      // } else {
      noise += this.cavesNoise.noise(x / quality, y / quality, z / quality) * quality;
      // }

      quality *= 1.25;
    }

    return noise;
  }
}