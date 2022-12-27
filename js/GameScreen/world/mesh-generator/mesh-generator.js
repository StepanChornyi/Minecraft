import { BLOCK_TRANSPARENCY, BLOCK_TYPE, MAX_LIGHT } from "../../block-type";
import LightEngine from "./LightEngine";

const textureSize = 512;
const floatsPerVertice = 7;
const blockSideUVSize = 16 / textureSize;
const blockSideUVOffset = 24 / textureSize;
const pixelOffset = 0.001 / textureSize;

export default class MeshGenerator {
  constructor(world) {
    this.world = world;
  }

  generate(mesh, blocks, index) {

  }

  get floatsPerVertice() {
    return floatsPerVertice;
  }

  get blockSideUVSize() {
    return blockSideUVSize;
  }

  get blockSideUVOffset() {
    return blockSideUVOffset;
  }

  textureCoord(axis, offset) {
    return MeshGenerator.textureCoord(axis, offset);
  }

  getBv(blocks, vec3) {
    return getBv(blocks, vec3);
  }

  getVertexLight(blocks, normal, vertNormal, b0) {
    b1 = BLOCK_TYPE.AIR;
    ao = 0;

    if (normal[0] !== 0) {
      b2 = getB(blocks, vertNormal[0], 0, vertNormal[2]);
      b3 = getB(blocks, vertNormal[0], vertNormal[1], 0);
    } else if (normal[1] !== 0) {
      b2 = getB(blocks, 0, vertNormal[1], vertNormal[2]);
      b3 = getB(blocks, vertNormal[0], vertNormal[1], 0);
    } else if (normal[2] !== 0) {
      b2 = getB(blocks, 0, vertNormal[1], vertNormal[2]);
      b3 = getB(blocks, vertNormal[0], 0, vertNormal[2]);
    }

    s1 = BLOCK_TRANSPARENCY[b1] === 0;
    s2 = BLOCK_TRANSPARENCY[b2] === 0;
    s3 = BLOCK_TRANSPARENCY[b3] === 0;

    if (b2 < 0 || !s2 || b3 < 0 || !s3) {
      b1 = getBv(blocks, vertNormal);
      s1 = BLOCK_TRANSPARENCY[b1] === 0;
    }

    if (s2 && s3) {
      ao = 0.6;
      count = 1;
    } else if (s2 && s1 || s3 && s1) {
      ao = 0.7;
      count = 2;
    } else if (s2 || s3) {
      ao = 0.8;
      count = 3;
    } else if (s1) {
      count = 3;
      ao = 0.8;
    } else {
      count = 4;
      ao = 1;
    }

    b0 = clampAndInvert(b0);
    b1 = clampAndInvert(b1);
    b2 = clampAndInvert(b2);
    b3 = clampAndInvert(b3);

    if (isAnyBlockEmit(b0, b1, b2, b3)) {
      blockLight = max4(LightEngine.getBlockLight(b0), LightEngine.getBlockLight(b1), LightEngine.getBlockLight(b2), LightEngine.getBlockLight(b3));
    } else {
      blockLight = (LightEngine.getBlockLight(b0) + LightEngine.getBlockLight(b1) + LightEngine.getBlockLight(b2) + LightEngine.getBlockLight(b3)) / count;
    }

    if (isAnySkyEmit(b0, b1, b2, b3)) {
      sunLight = max4(LightEngine.getSkyLight(b0), LightEngine.getSkyLight(b1), LightEngine.getSkyLight(b2), LightEngine.getSkyLight(b3));
    } else {
      sunLight = (LightEngine.getSkyLight(b0) + LightEngine.getSkyLight(b1) + LightEngine.getSkyLight(b2) + LightEngine.getSkyLight(b3)) / count;
    }

    /// to hard light look
    // sunLight = LightEngine.getSkyLight(b0);
    // blockLight = LightEngine.getBlockLight(b0);

    return { lb: blockLight, ls: sunLight, ao };
  }

  static get floatsPerVertice() {
    return floatsPerVertice;
  }

  static textureCoord(axis, offset) {
    return blockSideUVOffset + (blockSideUVSize + blockSideUVOffset * 2) * axis + offset * (blockSideUVSize) + (offset ? -pixelOffset : pixelOffset);
  }
}

let b1, b2, b3, s1, s2, s3, blockLight, sunLight, count, lSum, ao;

function clampAndInvert(a) {
  return a < 0 ? -a : 0;
}

function max4(a, b, c, d) {
  a = a > b ? a : b;
  c = c > d ? c : d;

  return a > c ? a : c;
}

function getB(blocks, x, y, z) {
  return blocks[x + 1 + y * 3 + 3 + z * 9 + 9] || BLOCK_TYPE.BEDROCK;
}

function getBv(blocks, vec3) {
  return blocks[vec3[0] + 1 + vec3[1] * 3 + 3 + vec3[2] * 9 + 9];
}

function isAnyBlockEmit(b0, b1, b2, b3) {
  return LightEngine.isBlockEmit(b0) || LightEngine.isBlockEmit(b1) || LightEngine.isBlockEmit(b2) || LightEngine.isBlockEmit(b3);
}

function isAnySkyEmit(b0, b1, b2, b3) {
  return LightEngine.isSkyEmit(b0) || LightEngine.isSkyEmit(b1) || LightEngine.isSkyEmit(b2) || LightEngine.isSkyEmit(b3);
}