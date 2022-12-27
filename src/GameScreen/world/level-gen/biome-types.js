const BIOME_TYPES = {
  PLAINS: 1,
  FOREST: 2,
  DESERT: 3,
  SWAMP: 4,
  MOUNTAINS: 5,
  TAIGA: 6,
  TUNDRA: 7,
};

const BIOME_WETHER_FACTOR = {};

BIOME_WETHER_FACTOR[BIOME_TYPES.PLAINS] = {
  correct: (v, t, h) => {
    return v;
  }
};

BIOME_WETHER_FACTOR[BIOME_TYPES.FOREST] = {
  correct: (v, t, h) => {
    return v;
  }
};

BIOME_WETHER_FACTOR[BIOME_TYPES.MOUNTAINS] = {
  correct: (v, t, h) => {
    return v;
  }
};

BIOME_WETHER_FACTOR[BIOME_TYPES.SWAMP] = {
  correct: (v, t, h) => {
    return v;
  }
};

BIOME_WETHER_FACTOR[BIOME_TYPES.TAIGA] = {
  correct: (v, t, h) => {
    return v;
  }
};

BIOME_WETHER_FACTOR[BIOME_TYPES.DESERT] = {
  correct: (v, t, h) => {
    return v;
  }
};

BIOME_WETHER_FACTOR[BIOME_TYPES.TUNDRA] = {
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

export { BIOME_TYPES, BIOME_WETHER_FACTOR };