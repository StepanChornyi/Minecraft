import ImprovedNoise from '../../../libs/improved-noise';
import QueueFast from '../../../utils/queue-fast';
import { BLOCK_TRANSPARENCY, BLOCK_TYPE } from '../../block-type';
import CONFIG from '../config';
import BlockMeshGenerator from './block-mesh-generator';
import MeshGenerator from './mesh-generator';
import TorchMeshGenerator from './torch-mesh-generator';
import XMeshGenerator from './x-mesh-generator';

const CHUNK_SIZE = CONFIG.CHUNK_SIZE;

export default class ChunkMeshGenerator {
  constructor(world) {
    this.world = world;

    this.generators = {};

    this.generators[BLOCK_TYPE.GRASS_BLOCK] =
      this.generators[BLOCK_TYPE.DIRT] =
      this.generators[BLOCK_TYPE.STONE] =
      this.generators[BLOCK_TYPE.COAL] =
      this.generators[BLOCK_TYPE.IRON] =
      this.generators[BLOCK_TYPE.WOOD] =
      this.generators[BLOCK_TYPE.BEDROCK] =
      this.generators[BLOCK_TYPE.COBBLESTONE] =
      this.generators[BLOCK_TYPE.LEAVES] =
      this.generators[BLOCK_TYPE.STONE_BRICK] = new BlockMeshGenerator(world);

    this.generators[BLOCK_TYPE.GRASS] =
      this.generators[BLOCK_TYPE.ROSE] = new XMeshGenerator(world);

    this.generators[BLOCK_TYPE.TORCH] = new TorchMeshGenerator(world);
  }

  generateMesh(chunk) {
    const mesh = chunk.mesh;
    const world = this.world;

    chunk.updateMeshPos();

    mesh.vertices.splice(0);
    mesh.indices.splice(0);

    const arr = [];

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let y = CHUNK_SIZE - 1; y >= 0; y--) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          if (chunk.getBlock(x, y, z).isAir)
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

          this.generators[arr[13]].generate(x, y, z, chunk, arr)
          // this.generateBlockMesh(x, y, z, chunk, arr);
        }
      }
    }
  }
}