import { ColorHelper } from "black-engine";

const BLOCK_TYPES_TEST = {
  PLAINS: 1,
  FOREST: 2,
  DESERT: 3,
  SWAMP: 4,
  MOUNTAINS: 5,
  TAIGA: 6,
  TUNDRA: 7,
};

const BLOCK_COLOR = {};

BLOCK_COLOR[BLOCK_TYPES_TEST.PLAINS] = ColorHelper.hex2rgb(0x9df25c);
BLOCK_COLOR[BLOCK_TYPES_TEST.FOREST] = ColorHelper.hex2rgb(0x43de48);
BLOCK_COLOR[BLOCK_TYPES_TEST.MOUNTAINS] = ColorHelper.hex2rgb(0x7a7a7a);
BLOCK_COLOR[BLOCK_TYPES_TEST.SWAMP] = ColorHelper.hex2rgb(0x3a6670);
BLOCK_COLOR[BLOCK_TYPES_TEST.DESERT] = ColorHelper.hex2rgb(0xfff34f);
BLOCK_COLOR[BLOCK_TYPES_TEST.TAIGA] = ColorHelper.hex2rgb(0x458265);
BLOCK_COLOR[BLOCK_TYPES_TEST.TUNDRA] = ColorHelper.hex2rgb(0xededed);

const BIOME_WETHER_FACTOR = {};

BIOME_WETHER_FACTOR[BLOCK_TYPES_TEST.PLAINS] = {
  correct: (v, t, h) => {
    return v;
  }
};

BIOME_WETHER_FACTOR[BLOCK_TYPES_TEST.FOREST] = {
  correct: (v, t, h) => {
    return v;
  }
};

BIOME_WETHER_FACTOR[BLOCK_TYPES_TEST.MOUNTAINS] = {
  correct: (v, t, h) => {
    return v;
  }
};

BIOME_WETHER_FACTOR[BLOCK_TYPES_TEST.SWAMP] = {
  correct: (v, t, h) => {
    return v;
  }
};

BIOME_WETHER_FACTOR[BLOCK_TYPES_TEST.TAIGA] = {
  correct: (v, t, h) => {
    return v;
  }
};

BIOME_WETHER_FACTOR[BLOCK_TYPES_TEST.DESERT] = {
  correct: (v, t, h) => {
    return v;
  }
};

BIOME_WETHER_FACTOR[BLOCK_TYPES_TEST.TUNDRA] = {
  correct: (v, t, h) => {
    return v;
  }
};



/**
 * PLAINS
 * FOREST
 * DESERT
 * SWAMP
 * MOUNTAINS
 * TAIGA
 * TUNDRA
 */

export { BLOCK_TYPES_TEST, BLOCK_COLOR, BIOME_WETHER_FACTOR };