import { BLOCK_TRANSPARENCY } from "../../block-type";
import CONFIG from "../config";
import MeshGenerator from "./mesh-generator";
import MESH_TEXTURES from "./mesh-textures";

const MAX_LIGHT = CONFIG.MAX_LIGHT;

export default class TorchMeshGenerator extends MeshGenerator {
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

      // if (BLOCK_TRANSPARENCY[sideBlock] === 0) {
      //   continue;
      // }

      const vertices = data.vertices;
      const triangles = data.triangles;
      const elementIndexOffset = mesh.vertices.length / this.floatsPerVertice;

      mesh.vertices.push(...vertices);

      const light = MAX_LIGHT//this.world.getLight(x, y, z);

      for (let i = mesh.vertices.length - vertices.length; i < mesh.vertices.length; i += this.floatsPerVertice) {

        const [u, v] = textureConfig[key] || textureConfig.all;

        mesh.vertices[i + 3] = this.blockSideUVOffset + (this.blockSideUVSize + this.blockSideUVOffset * 2) * u + mesh.vertices[i + 3] * (this.blockSideUVSize);
        mesh.vertices[i + 4] = this.blockSideUVOffset + (this.blockSideUVSize + this.blockSideUVOffset * 2) * v + mesh.vertices[i + 4] * (this.blockSideUVSize);

        mesh.vertices[i + 6] = chunk.getBlockIndex(x, y, z);

        vertNormal[0] = mesh.vertices[i];
        vertNormal[1] = mesh.vertices[i + 1];
        vertNormal[2] = mesh.vertices[i + 2];

        // let { l, ao } = this.getLight(blocks, data.normal, vertNormal, sideBlock && -sideBlock);

        mesh.vertices[i + 5] = Math.max(0, Math.min(1, mesh.vertices[i + 5] * 0.1 + (light / MAX_LIGHT) * 0.9));
        // mesh.vertices[i + 5] = Math.max(0, Math.min(1, mesh.vertices[i + 5]));

        mesh.vertices[i] = (mesh.vertices[i] + 1) * 0.5 + x;
        mesh.vertices[i + 1] = (mesh.vertices[i + 1] + 1) * 0.5 + y;
        mesh.vertices[i + 2] = (mesh.vertices[i + 2] + 1) * 0.5 + z;
      }

      for (let i = 0; i < triangles.length; i++) {
        mesh.indices.push(triangles[i] + elementIndexOffset);
      }
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
      -1.0, 0.25, -1.0, 0, 0,
      -1.0, 0.25, 1.0, 0, 1,
      1.0, 0.25, 1.0, 1, 1,
      1.0, 0.25, -1.0, 1, 0,
    ],
    triangles: [
      0, 1, 2,
      0, 2, 3,
    ]
  },
  left: {
    normal: [-1, 0, 0],
    light: 0.85,
    vertices: [
      -0.125, 1.0, 1.0, 1, 0,
      -0.125, -1.0, 1.0, 1, 1,
      -0.125, -1.0, -1.0, 0, 1,
      -0.125, 1.0, -1.0, 0, 0,
    ],
    triangles: [
      1, 0, 2,
      2, 0, 3,
    ]
  },
  right: {
    normal: [1, 0, 0],
    light: 0.85,
    vertices: [
      0.125, 1.0, 1.0, 0, 0,
      0.125, -1.0, 1.0, 0, 1,
      0.125, -1.0, -1.0, 1, 1,
      0.125, 1.0, -1.0, 1, 0,
    ],
    triangles: [
      0, 1, 2,
      0, 2, 3,
    ]
  },
  front: {
    normal: [0, 0, 1],
    light: 0.75,
    vertices: [
      1.0, 1.0, 0.125, 1, 0,
      1.0, -1.0, 0.125, 1, 1,
      -1.0, -1.0, 0.125, 0, 1,
      -1.0, 1.0, 0.125, 0, 0,
    ],
    triangles: [
      1, 0, 2,
      3, 2, 0,
    ]
  },
  back: {
    normal: [0, 0, -1],
    light: 0.75,
    vertices: [
      1.0, 1.0, -0.125, 0, 0,
      1.0, -1.0, -0.125, 0, 1,
      -1.0, -1.0, -0.125, 1, 1,
      -1.0, 1.0, -0.125, 1, 0,
    ],
    triangles: [
      0, 1, 2,
      0, 2, 3,
    ]
  },
  bottom: {
    normal: [0, -1, 0],
    light: 0.65,
    vertices: [
      -1.0, -1.0, -1.0, 0, 0,
      -1.0, -1.0, 1.0, 0, 1,
      1.0, -1.0, 1.0, 1, 1,
      1.0, -1.0, -1.0, 1, 0,
    ],
    triangles: [
      1, 0, 2,
      2, 0, 3
    ]
  }
};

for (const key in blockData) {
  if (!Object.hasOwnProperty.call(blockData, key)) {
    continue;
  }

  for (let i = 0; i < blockData[key].vertices.length; i += MeshGenerator.floatsPerVertice) {
    blockData[key].vertices.splice(i + 5, 0, blockData[key].light);
    blockData[key].vertices.splice(i + 6, 0, 0);
  }
}