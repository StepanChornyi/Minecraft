import ImprovedNoise from '../../../libs/improved-noise';
import QueueFast from '../../../utils/queue-fast';
import { BLOCK_TRANSPARENCY, BLOCK_TYPE } from '../../block-type';
import CONFIG from '../config';
import BlockMeshGenerator from './block-mesh-generator';
import CactusMeshGenerator from './cactus-mesh-generator';
import MeshGenerator from './mesh-generator';
import TorchMeshGenerator from './torch-mesh-generator';
import WaterMeshGenerator from './water-mesh-generator';
import XMeshGenerator from './x-mesh-generator';

const CHUNK_SIZE = CONFIG.CHUNK_SIZE;

export default class ChunkMeshGenerator {
  constructor(world) {
    this.world = world;

    this.defaultGenerator = new BlockMeshGenerator(world);
    this.waterGenerator = new WaterMeshGenerator(world);

    this.generators = {};

    this.generators[BLOCK_TYPE.GRASS] =
      this.generators[BLOCK_TYPE.ROSE] =
      this.generators[BLOCK_TYPE.DEAD_BUSH] =
      new XMeshGenerator(world);

    this.generators[BLOCK_TYPE.CACTUS] = new CactusMeshGenerator(world);

    this.generators[BLOCK_TYPE.TORCH] = new TorchMeshGenerator(world);
  }

  generateMesh(chunk) {
    const mesh = chunk.mesh;

    chunk.updateMeshPos();

    mesh.vertices.splice(0);
    mesh.indices.splice(0);

    const arr = [];

    for (let x = 0, b; x < CHUNK_SIZE; x++) {
      for (let y = CHUNK_SIZE - 1; y >= 0; y--) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          b = chunk.getBlock(x, y, z);

          if (b.isAir)
            continue;

          if (b.type === BLOCK_TYPE.WATER)
            continue;

          for (let xx = -1; xx <= 1; xx++) {
            for (let yy = -1; yy <= 1; yy++) {
              for (let zz = -1; zz <= 1; zz++) {
                const block = chunk.getBlock(x + xx, y + yy, z + zz);
                const blockIndex = (xx + 1) + (yy + 1) * 3 + (zz + 1) * 9;
                const isTransparent = block && block.isTransparent && block.transparency !== 2 && blockIndex !== 13;
                const light = isTransparent && block.light;

                arr[blockIndex] = isTransparent ? -light || 0 : (block && block.type);
              }
            }
          }

          (this.generators[arr[13]] || this.defaultGenerator).generate(x, y, z, chunk, arr)
          // this.generateBlockMesh(x, y, z, chunk, arr);
        }
      }
    }
  }

  generateTransparentMesh(chunk) {
    const transparentMesh = chunk.transparentMesh;

    chunk.updateMeshPos();

    transparentMesh.vertices.splice(0);
    transparentMesh.indices.splice(0);

    const arr = [];

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let y = CHUNK_SIZE - 1; y >= 0; y--) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          const block = chunk.getBlock(x, y, z);

          if (block.isAir)
            continue;

          if (block.type !== BLOCK_TYPE.WATER)
            continue;

          for (let xx = -1; xx <= 1; xx++) {
            for (let yy = -1; yy <= 1; yy++) {
              for (let zz = -1; zz <= 1; zz++) {
                const block = chunk.getBlock(x + xx, y + yy, z + zz);
                const blockIndex = (xx + 1) + (yy + 1) * 3 + (zz + 1) * 9;
                // const isTransparent = block && block.isTransparent && block.transparency !== 2 && blockIndex !== 13;
                // const light = isTransparent && block.light;

                // if (block.type === BLOCK_TYPE.WATER && Math.abs(xx) + Math.abs(yy) + Math.abs(zz) === 1) {
                //   arr[blockIndex] = null;
                //   continue;
                // }  

                arr[blockIndex] = block;// isTransparent ? -light || 0 : (block && block.type);
              }
            }
          }

          this.waterGenerator.generate(x, y, z, chunk, arr, block);
        }
      }
    }
  }
}