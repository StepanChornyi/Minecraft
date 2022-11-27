import { BLOCK_TRANSPARENCY } from "../../block-type";
import CONFIG from "../config";
import MeshGenerator from "./mesh-generator";
import MESH_TEXTURES from "./mesh-textures";

const MAX_LIGHT = CONFIG.MAX_LIGHT;

export default class CactusMeshGenerator extends MeshGenerator {
  generate(x, y, z, chunk, blocks) {
    const mesh = chunk.mesh;
    const blockType = blocks[CENTER_BLOCK_INDEX];
    const textureConfig = MESH_TEXTURES[blockType] || { all: [1000, 1000] };

    const vertNormal = [];

    for (const key in blockData) {
      if (!Object.hasOwnProperty.call(blockData, key))
        continue;

      const data = blockData[key];
      const sideBlock = this.getBv(blocks, data.normal);

      if (sideBlock === null || (BLOCK_TRANSPARENCY[sideBlock] === 0 && !data.normal[0] && !data.normal[2])) {
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

        let { lb, ls, ao } = this.getVertexLight(blocks, data.normal, vertNormal, sideBlock);

        mesh.vertices[i + 5] = (mesh.vertices[i + 5] * 0.1 + (Math.max(lb, ls) / MAX_LIGHT) * 0.9 * data.light) * ao;

        cornerAo.push(mesh.vertices[i + 5]);

        // mesh.vertices[i + 5] = Math.max(0, Math.min(1, mesh.vertices[i + 5]));
        let fx = 1;
        let fy = 1;
        let fz = 1;

        if (data.normal[0] !== 0) {
          fx = 7 / 8 - 0.001;
        } else if (data.normal[2] !== 0) {
          fz = 7 / 8 - 0.001;
        }

        mesh.vertices[i] = (mesh.vertices[i] * fx + 1) * 0.5 + x;
        mesh.vertices[i + 1] = (mesh.vertices[i + 1] * fy + 1) * 0.5 + y;
        mesh.vertices[i + 2] = (mesh.vertices[i + 2] * fz + 1) * 0.5 + z;
      }

      const triangles = ((cornerAo[0] + cornerAo[2]) < (cornerAo[1] + cornerAo[3])) ? data.triangles.flipped : data.triangles.default;

      for (let i = 0; i < triangles.length; i++) {
        mesh.indices.push(triangles[i] + elementIndexOffset);
      }

      // if ((cornerAo[0] || cornerAo[2]) && !(cornerAo[1] || cornerAo[3])) {
      //   const index = mesh.indices.length - 6;
      //   const triangles = [
      //     mesh.indices[index + 1],
      //     mesh.indices[index + 2],
      //     mesh.indices[index + 5],
      //     mesh.indices[index + 1],
      //     mesh.indices[index + 5],
      //     mesh.indices[index]
      //   ];

      //   mesh.indices.splice(index, 6, ...triangles);
      // }
    }
  }

  static get blockData() {
    return blockData;
  }
}

const CENTER_BLOCK_INDEX = 13;

const blockData = {
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
  }
};

function clamp(min, max, val) {
  return val < min ? min : val > max ? max : val;
}

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