import { BLOCK_TRANSPARENCY, BLOCK_TYPE } from "../../block-type";
import CONFIG from "../config";
import MeshGenerator from "./mesh-generator";
import MESH_TEXTURES from "./mesh-textures";

const MAX_LIGHT = CONFIG.MAX_LIGHT;

export default class WaterMeshGenerator extends MeshGenerator {
  generate(x, y, z, chunk, blocks, block) {
    const mesh = chunk.transparentMesh;
    const blockType = blocks[CENTER_BLOCK_INDEX].type;
    const textureConfig = MESH_TEXTURES[blockType] || { all: [1000, 1000] };

    const vertNormal = [];
    const arr = [];

    for (let i = 0, block; i < blocks.length; i++) {
      block = blocks[i];

      const isTransparent = block && block.isTransparent && block.transparency !== 2 && i !== 13;
      const light = isTransparent && block.light;

      arr[i] = isTransparent ? -light || 0 : (block && block.type);
    }

    for (const key in blockData) {
      if (!Object.hasOwnProperty.call(blockData, key))
        continue;

      const data = blockData[key];
      const sideBlock = this.getBv(blocks, data.normal);

      if (sideBlock === null || sideBlock.transparency === 0 || sideBlock.is(BLOCK_TYPE.WATER)) {
        continue;
      }

      const vertices = data.vertices;
      const elementIndexOffset = mesh.vertices.length / this.floatsPerVertice;
      const cornerAo = [];

      mesh.vertices.push(...vertices);

      for (let i = mesh.vertices.length - vertices.length; i < mesh.vertices.length; i += this.floatsPerVertice) {
        const [u, v] = textureConfig[key] || textureConfig.all;

        mesh.vertices[i + 3] = this.textureCoord(u, mesh.vertices[i + 3]);
        mesh.vertices[i + 4] = this.textureCoord(v, mesh.vertices[i + 4]);

        mesh.vertices[i + 6] = chunk.getBlockIndex(x, y, z);

        vertNormal[0] = mesh.vertices[i];
        vertNormal[1] = mesh.vertices[i + 1];
        vertNormal[2] = mesh.vertices[i + 2];

        if (vertNormal[1] === 1) {
          mesh.vertices[i + 1] *= this.getVertHeight(blocks, vertNormal);
        }

        let { lb, ls, ao } = this.getVertexLight(arr, data.normal, vertNormal, this.getBv(arr, data.normal));

        mesh.vertices[i + 5] = (mesh.vertices[i + 5] * 0.1 + (Math.max(lb, ls) / MAX_LIGHT) * 0.9 * data.light) * ao;

        cornerAo.push(mesh.vertices[i + 5]);

        // mesh.vertices[i + 5] = Math.max(0, Math.min(1, mesh.vertices[i + 5]));

        mesh.vertices[i] = (mesh.vertices[i] + 1) * 0.5 + x;
        mesh.vertices[i + 1] = (mesh.vertices[i + 1] + 1) * 0.5 + y;
        mesh.vertices[i + 2] = (mesh.vertices[i + 2] + 1) * 0.5 + z;
      }

      const triangles = ((cornerAo[0] + cornerAo[2]) < (cornerAo[1] + cornerAo[3])) ? data.triangles.flipped : data.triangles.default;

      for (let i = 0; i < triangles.length; i++) {
        mesh.indices.push(triangles[i] + elementIndexOffset);
      }
    }
  }

  getVertHeight(blocks, vertNormal) {
    //     if (!blocks[13]._isSource) {
    //       console.log('------', vertNormal);
    // console.log(blocks);
    //       console.log(this.getHeight(blocks, 0, 0));
    //       console.log(this.getHeight(blocks, vertNormal[0], 0));
    //       console.log(this.getHeight(blocks, 0, vertNormal[2]));
    //       console.log(this.getHeight(blocks, vertNormal[0], vertNormal[2]));
    //     }

    return Math.max(Math.max(
      this.getHeight(blocks, 0, 0),
      this.getHeight(blocks, vertNormal[0], 0),
    ), Math.max(
      this.getHeight(blocks, 0, vertNormal[2]),
      this.getHeight(blocks, vertNormal[0], vertNormal[2]),
    ));
  }

  getHeight(blocks, x = 0, z = 0) {
    const block = this.getBv(blocks, [x, 0, z]);

    if (!block || block.type !== BLOCK_TYPE.WATER) {
      return -1;
    }

    const upperBlock = this.getBv(blocks, [x, 1, z]);

    if (upperBlock.type === BLOCK_TYPE.WATER) {
      return 1;
    }

    let H = block._liquidLevel / 7;

    H = 1 / 16 + (14 / 16) * H;
    H = H * 2 - 1;

    return H;
  }

  static get blockData() {
    return blockData;
  }
}

const CENTER_BLOCK_INDEX = 13;

const blockData = {
  left: {
    normal: [-1, 0, 0],
    light: 0.95,
    vertices: [
      -1.0, 1.0, 1.0, 1, 0,
      -1.0, -1.0, 1.0, 1, 1,
      -1.0, -1.0, -1.0, 0, 1,
      -1.0, 1.0, -1.0, 0, 0,
    ],
    triangles: {
      default: [
        1, 0, 2,
        2, 0, 3,
      ],
      flipped: [
        1, 0, 3,
        1, 3, 2,
      ]
    }
  },
  right: {
    normal: [1, 0, 0],
    light: 0.95,
    vertices: [
      1.0, 1.0, 1.0, 0, 0,
      1.0, -1.0, 1.0, 0, 1,
      1.0, -1.0, -1.0, 1, 1,
      1.0, 1.0, -1.0, 1, 0,
    ],
    triangles: {
      default: [
        0, 1, 2,
        0, 2, 3,
      ],
      flipped: [
        1, 2, 3,
        0, 1, 3,
      ]
    }
  },
  front: {
    normal: [0, 0, 1],
    light: 0.9,
    vertices: [
      1.0, 1.0, 1.0, 1, 0,
      1.0, -1.0, 1.0, 1, 1,
      -1.0, -1.0, 1.0, 0, 1,
      -1.0, 1.0, 1.0, 0, 0,
    ],
    triangles: {
      default: [
        1, 0, 2,
        3, 2, 0,
      ],
      flipped: [
        1, 0, 3,
        1, 3, 2,
      ]
    }
  },
  back: {
    normal: [0, 0, -1],
    light: 0.9,
    vertices: [
      1.0, 1.0, -1.0, 0, 0,
      1.0, -1.0, -1.0, 0, 1,
      -1.0, -1.0, -1.0, 1, 1,
      -1.0, 1.0, -1.0, 1, 0,
    ],
    triangles: {
      default: [
        0, 1, 2,
        0, 2, 3,
      ],
      flipped: [
        1, 2, 3,
        0, 1, 3,
      ]
    }
  },
  bottom: {
    normal: [0, -1, 0],
    light: 0.85,
    vertices: [
      -1.0, -1.0, -1.0, 0, 0,
      -1.0, -1.0, 1.0, 0, 1,
      1.0, -1.0, 1.0, 1, 1,
      1.0, -1.0, -1.0, 1, 0,
    ],
    triangles: {
      default: [
        1, 0, 2,
        2, 0, 3
      ],
      flipped: [
        0, 3, 1,
        1, 3, 2,
      ]
    }
  },
  top: {
    normal: [0, 1, 0],
    light: 1,
    vertices: [
      -1.0, 1.0, -1.0, 0, 0,
      -1.0, 1.0, 1.0, 0, 1,
      1.0, 1.0, 1.0, 1, 1,
      1.0, 1.0, -1.0, 1, 0,
    ],
    triangles: {
      default: [
        0, 1, 2,
        0, 2, 3,
      ],
      flipped: [
        1, 2, 3,
        1, 3, 0,
      ]
    }
  },
};

for (const key in blockData) {
  if (!Object.hasOwnProperty.call(blockData, key)) {
    continue;
  }

  blockData[key].triangles.flipped = blockData[key].triangles.flipped || blockData[key].triangles.default;

  for (let i = 0; i < blockData[key].vertices.length; i += MeshGenerator.floatsPerVertice) {
    blockData[key].vertices.splice(i + 5, 0, blockData[key].light);
    blockData[key].vertices.splice(i + 6, 0, 0);
  }
}

function clamp(min, max, val) {
  return val < min ? min : val > max ? max : val;
}

