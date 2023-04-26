import { BLOCK_TYPE } from "../../block-type";

const MESH_TEXTURES = {};

MESH_TEXTURES[BLOCK_TYPE.GRASS_BLOCK] = {
  top: 2,
  bottom: 1,
  all: 0
};

MESH_TEXTURES[BLOCK_TYPE.DIRT] = { all: 1 };
MESH_TEXTURES[BLOCK_TYPE.STONE] = { all: 3 };
MESH_TEXTURES[BLOCK_TYPE.COAL] = { all: 4 };
MESH_TEXTURES[BLOCK_TYPE.IRON] = { all: 5 };
MESH_TEXTURES[BLOCK_TYPE.COBBLESTONE] = { all: 12 };
MESH_TEXTURES[BLOCK_TYPE.STONE_BRICK] = { all: 11 };
MESH_TEXTURES[BLOCK_TYPE.BEDROCK] = { all: 6 };
MESH_TEXTURES[BLOCK_TYPE.SAND] = { all: 19 };
MESH_TEXTURES[BLOCK_TYPE.TORCH] = { top: 14, bottom: 15, all: 13 };
MESH_TEXTURES[BLOCK_TYPE.WOOD] = {
  top: 8,
  bottom: 8,
  all: 7
};

MESH_TEXTURES[BLOCK_TYPE.CACTUS] = {
  top: 24,
  bottom: 24,
  all: 25
};

MESH_TEXTURES[BLOCK_TYPE.SANDSTONE] = {
  top: 22,
  bottom: 20,
  all: 21
};

MESH_TEXTURES[BLOCK_TYPE.DEAD_BUSH] = {
  all: 23
};

MESH_TEXTURES[BLOCK_TYPE.GRASS] = {
  all: 16
};

MESH_TEXTURES[BLOCK_TYPE.ROSE] = {
  all: 17
};

MESH_TEXTURES[BLOCK_TYPE.LEAVES] = {
  all: 9
};

MESH_TEXTURES[BLOCK_TYPE.WATER] = {
  all: 0
};

MESH_TEXTURES[BLOCK_TYPE.PLANKS] = {
  all: 26
};

const BLOCKS_PER_ROW = 8;

for (const blockType in MESH_TEXTURES) {
  if (!Object.hasOwnProperty.call(MESH_TEXTURES, blockType)) {
    continue;
  }

  for (const sideName in MESH_TEXTURES[blockType]) {
    if (!Object.hasOwnProperty.call(MESH_TEXTURES[blockType], sideName)) {
      continue;
    }

    const index = MESH_TEXTURES[blockType][sideName];

    const x = index % BLOCKS_PER_ROW;
    const y = Math.floor(index / BLOCKS_PER_ROW);

    MESH_TEXTURES[blockType][sideName] = [x, y];
  }
}

export default MESH_TEXTURES;