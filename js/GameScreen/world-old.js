import { MessageDispatcher } from 'black-engine';
import ImprovedNoise from './../libs/improved-noise';
import { BLOCK_TYPE } from './block-type';
import ChunkMesh from './meshes/chunk-mesh';
import HELPERS from '../utils/helpers';

const CHUNK_SPAWN_DIST = 40;
const CHUNK_REMOVE_DIST = 80;

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 16;

const heightNoise = new ImprovedNoise();
const oreNoise = new ImprovedNoise();
const cavesNoise = new ImprovedNoise();

let gl;

export default class WorldOld extends MessageDispatcher {
  constructor(_gl, player) {
    super();

    this.gl = gl = _gl;

    this.player = player;
    this.chunks = [];
    this.chunksToInit = [];
    this.chunksToRemove = [];

    this.initialChunksCount = null;
    this.initedChunksCount = 0;

    setTimeout(() => this.init(), 50);
  }

  init() {
    this.initialChunksCount = 0;

    const initDist = CHUNK_REMOVE_DIST + 50;
    const chunkViewDistance = Math.ceil(initDist / CHUNK_SIZE);

    for (let x = -chunkViewDistance + 1; x < chunkViewDistance; x++) {
      for (let z = -chunkViewDistance + 1; z < chunkViewDistance; z++) {
        if (isDistBigger(x * CHUNK_SIZE, this.player.x, z * CHUNK_SIZE, this.player.z, initDist)) {
          continue;
        }

        const chunk = new Chunk(this);

        chunk.setPos(x, z);

        chunk.visible = false;

        this.chunks.push(chunk);
        this.chunksToInit.push(chunk);

        this.initialChunksCount++;
      }
    }

    console.time('Generate Time');
  }

  getBlock(x, y, z) {
    const { chunkX, chunkZ, blockX, blockZ } = this.getChunkCoord(x, z);

    const chunk = this.getChunk(chunkX, chunkZ);

    if (!chunk || !chunk.visible || !chunk.blocks.length) {
      return getBlock(x, y, z);
    }

    return chunk.getBlock(blockX, y, blockZ, this);
  }

  // getBlockAndLight(x, y, z) {
  //   const { chunkX, chunkZ, blockX, blockZ } = this.getChunkCoord(x, z);

  //   const chunk = this.getChunk(chunkX, chunkZ);

  //   if (!chunk || !chunk.visible || !chunk.blocks.length) {
  //     return [getBlock(x, y, z), 0];
  //   }

  //   return [chunk.getBlock(blockX, y, blockZ, this), chunk.getLight(blockX, y, blockZ)];
  // }

  setLight(x, blockY, z, val) {
    const { chunkX, chunkZ, blockX, blockZ } = this.getChunkCoord(x, z);

    const chunk = this.getChunk(chunkX, chunkZ);

    if (chunk) {
      chunk.setLight(blockX, blockY, blockZ, val);
      chunk.dirty = true;
    }
  }

  getLight(x, blockY, z) {
    const { chunkX, chunkZ, blockX, blockZ } = this.getChunkCoord(x, z);

    const chunk = this.getChunk(chunkX, chunkZ);

    if (chunk) {
      return chunk.getLight(blockX, blockY, blockZ, this);
    }
  }

  setBlock(x, blockY, z, val) {
    const { chunkX, chunkZ, blockX, blockZ } = this.getChunkCoord(x, z);

    const chunk = this.getChunk(chunkX, chunkZ);

    chunk.setBlock(blockX, blockY, blockZ, val);
    chunk.dirty = true;

    if (blockX === 0 || blockX === CHUNK_SIZE - 1) {
      const offsetX = blockX === 0 ? -1 : 1;
      const chunk = this.getChunk(chunkX + offsetX, chunkZ);

      if (chunk) {
        chunk.dirty = true;
      }
    }

    if (blockZ === 0 || blockZ === CHUNK_SIZE - 1) {
      const offsetZ = blockZ === 0 ? -1 : 1;
      const chunk = this.getChunk(chunkX, chunkZ + offsetZ);

      if (chunk) {
        chunk.dirty = true;
      }
    }
  }

  getGroundY(x, z) {
    x = Math.floor(x);
    z = Math.floor(z);

    for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
      if (this.getBlock(x, y, z)) {
        return y;
      }
    }

    return 5;
  }

  getChunkCoord(x, z) {
    const chunkX = x < 0 ? -Math.floor(1 - (x + 1) / CHUNK_SIZE) : Math.floor(x / CHUNK_SIZE);
    const chunkZ = z < 0 ? -Math.floor(1 - (z + 1) / CHUNK_SIZE) : Math.floor(z / CHUNK_SIZE);

    const blockX = x < 0 ? x - CHUNK_SIZE * chunkX : x % CHUNK_SIZE;
    const blockZ = z < 0 ? z - CHUNK_SIZE * chunkZ : z % CHUNK_SIZE;

    return { chunkX, chunkZ, blockX, blockZ };
  }

  onUpdate() {
    if (this.initialChunksCount === null)
      return;

    if (this.chunksToInit.length) {
      const chunk = this.chunksToInit.shift();

      fillChunk(chunk);
      generateMesh(chunk, this);
      chunk.mesh.drawBuffersData();
      chunk.visible = true;
      chunk.dirty = false;

      this.initedChunksCount++;

      if (this.initedChunksCount < this.initialChunksCount) {
        this.post('initProgress', this.initedChunksCount / this.initialChunksCount);
      }
    } else if (this.initedChunksCount === this.initialChunksCount) {
      this.initedChunksCount++;
      console.timeEnd('Generate Time');

      this.post('initCompleted');
    }

    this.deleteChunks();

    for (let i = 0; i < this.chunks.length; i++) {
      if (this.chunks[i].visible && this.chunks[i].dirty) {
        generateMesh(this.chunks[i], this);
        this.chunks[i].mesh.drawBuffersData();
        this.chunks[i].dirty = false;
      }
    }

    this.spawnChunks();
  }

  deleteChunks() {
    const playerX = this.player.x;
    const playerZ = this.player.z;

    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      const isDead = HELPERS.isOutOfRadius(chunk.mesh.x - playerX, chunk.mesh.z - playerZ, CHUNK_REMOVE_DIST);

      if (isDead) {
        const deletedChunk = this.chunks.splice(i, 1)[0];
        deletedChunk.visible = 0;
        chunksPool.unshift(deletedChunk);

        i--;
      }
    }
  }

  spawnChunks() {
    const playerChunkPosX = Math.floor(this.player.x / CHUNK_SIZE);
    const playerChunkPosZ = Math.floor(this.player.z / CHUNK_SIZE);
    const chunkViewDistance = Math.ceil(CHUNK_SPAWN_DIST / CHUNK_SIZE);

    for (let x = -chunkViewDistance + 1; x < chunkViewDistance; x++) {
      for (let z = -chunkViewDistance + 1; z < chunkViewDistance; z++) {
        if (HELPERS.isOutOfRadius(x, z, chunkViewDistance)) {
          continue;
        }

        const chunkX = playerChunkPosX + x;
        const chunkZ = playerChunkPosZ + z;

        let chunk = this.getChunk(chunkX, chunkZ);

        if (chunk)
          continue;

        chunk = chunksPool.pop() || new Chunk(this);

        chunk.setPos(chunkX, chunkZ);

        chunk.visible = false;

        this.chunks.push(chunk);
        this.chunksToInit.push(chunk);
      }
    }
  }

  getChunk(x, z) {
    for (let i = 0; i < this.chunks.length; i++) {
      if (this.chunks[i].x === x && this.chunks[i].z === z) {
        return this.chunks[i];
      }
    }
  }

  setChunk(x, z) {
    for (let i = 0; i < this.chunks.length; i++) {
      if (this.chunks[i].x === x && this.chunks[i].z === z) {
        return this.chunks[i];
      }
    }
  }

  getChunkIndex(x, z) {
    return (x < 0 ? -x : x) << 64 | (z < 0 ? -z : z) << 31
  }

  getBlockIndex(x, y, z) {
    return x + y * CHUNK_SIZE + z * CHUNK_SIZE * CHUNK_HEIGHT;
  }
}

const chunksPool = [];

class Chunk {
  constructor(world) {
    this.world = world;
    this.x = 0;
    this.z = 0;
    this.blocks = [];
    this.lights = [];
    this.mesh = new ChunkMesh(gl);
    this.visible = true;
    this.dirty = true;
  }

  getBlock(x, y, z, world) {
    if (y < 0 || y >= CHUNK_HEIGHT) {
      return BLOCK_TYPE.AIR;
    }

    if (x < 0 || x >= CHUNK_SIZE || z < 0 || z >= CHUNK_SIZE) {
      const blockWorldX = x + this.x * CHUNK_SIZE;
      const blockWorldZ = z + this.z * CHUNK_SIZE;

      return world.getBlock(blockWorldX, y, blockWorldZ);
    }

    return this.blocks[this.getBlockIndex(x, y, z)];
  }

  getLight(x, y, z) {
    if (y < 0 || y >= CHUNK_HEIGHT) {
      return 0;
    }

    if (x < 0 || x >= CHUNK_SIZE || z < 0 || z >= CHUNK_SIZE) {
      const blockWorldX = x + this.x * CHUNK_SIZE;
      const blockWorldZ = z + this.z * CHUNK_SIZE;

      return this.world.getLight(blockWorldX, y, blockWorldZ);
    }

    return this.lights[this.getBlockIndex(x, y, z)];
  }

  setLight(x, y, z, val) {
    this.lights[this.getBlockIndex(x, y, z)] = val;
  }

  setBlock(x, y, z, val) {
    this.blocks[this.getBlockIndex(x, y, z)] = val;
  }

  getBlockIndex(x, y, z) {
    return x + y * CHUNK_SIZE + z * CHUNK_SIZE * CHUNK_HEIGHT;
  }

  setPos(x, z) {
    this.x = x;
    this.z = z;

    this.updateMeshPos();
  }

  updateMeshPos() {
    this.mesh.x = this.x * CHUNK_SIZE;
    this.mesh.z = this.z * CHUNK_SIZE;
  }
}

function getHeightNoise(x, y, z) {
  let noise = 0;
  let quality = 1;

  for (var j = 0; j < 5; j++) {
    noise += heightNoise.noise(x / quality, y / quality, z / quality) * quality;
    quality *= 4;
  }

  return noise;
}

function getOreNoise(x, y, z) {
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

function getCavesNoise(x, y, z) {
  let noise = 0;
  let quality = 8;

  for (var j = 0; j < 4; j++) {
    // if (j > 0) {
    //   const val = cavesNoise.noise(x / quality, y / quality, z / quality) * quality;

    //   if (val < 0) {
    //     noise -= val;
    //   }
    // } else {
    noise += cavesNoise.noise(x / quality, y / quality, z / quality) * quality;
    // }

    quality *= 1.5;
  }

  return noise;
}

function isDistBigger(x0, x1, z0, z1, val) {
  const distX = Math.abs(x0 - x1);
  const distZ = Math.abs(z0 - z1);

  if (distX > val || distZ > val) {
    return true;
  }

  if (distX + distZ < val) {
    return false;
  }

  return Math.sqrt(distX * distX + distZ * distZ) > val;
}

function fillChunk(chunk) {
  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let z = 0; z < CHUNK_SIZE; z++) {
      const heightNoise = Math.round(Math.abs(getHeightNoise(x + chunk.x * CHUNK_SIZE, 500, z + chunk.z * CHUNK_SIZE) * 0.5));
      const currHeight = CHUNK_HEIGHT - heightNoise - 1;

      for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
        let blockType = getBlock(x + chunk.x * CHUNK_SIZE, y, z + chunk.z * CHUNK_SIZE, currHeight);

        if (blockType === BLOCK_TYPE.GRASS_BLOCK && y !== CHUNK_HEIGHT && chunk.getBlock(x, y + 1, z) !== BLOCK_TYPE.AIR) {
          blockType = BLOCK_TYPE.DIRT;
        }

        chunk.blocks[chunk.getBlockIndex(x, y, z)] = blockType;
      }
    }
  }
}

function getBlock(x, y, z, currHeight = null) {
  if (currHeight === null) {
    const heightNoise = Math.round(Math.abs(getHeightNoise(x, 500, z) * 0.5));
    currHeight = CHUNK_HEIGHT - heightNoise - 1;
  }

  // currHeight = CHUNK_HEIGHT - 5;

  let blockType = BLOCK_TYPE.AIR;

  // if (y > 0 && getCavesNoise(x, y, z) > 15) {
  //   return BLOCK.AIR;
  // }

  const oreNoise = 0//getOreNoise(x, y, z);
  const isIron = oreNoise > 8.7;
  const isCoal = oreNoise < -7.5;

  if (y < 1) {
    blockType = BLOCK_TYPE.BEDROCK;
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

  return blockType;
}

const floatsPerVertice = 7;
const blockSideUVSize = 16 / 256;
const blockSideUVOffset = 24 / 256;

const maxLight = 15;

function generateMesh(chunk, world) {
  const mesh = chunk.mesh;

  chunk.updateMeshPos();

  mesh.vertices.splice(0);
  mesh.indices.splice(0);

  // if ((chunk.x === 1 && chunk.z === 1) || (chunk.x === 0 && chunk.z === 0)) {
  //   let lightX = chunk.x * CHUNK_SIZE + 8;
  //   let lightY = null;
  //   let lightZ = chunk.z * CHUNK_SIZE + 8;

  //   for (let i = 0; i < chunk.lights.length; i++) {
  //     chunk.lights[i] = 0;
  //   }

  //   if (lightY === null) {
  //     lightY = CHUNK_HEIGHT - 1;

  //     for (; lightY >= 0; lightY--) {
  //       if (chunk.getBlock(8, lightY, 8, world)) {
  //         lightY++;

  //         break;
  //       }
  //     }
  //   }

  //   world.setLight(lightX, lightY, lightZ, maxLight);

  //   calcLight(world, maxLight - 1, lightX, lightY, lightZ, 0, 0, 0, 0, 0, 0, 0);
  // }

  const arr = [];

  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        if (chunk.blocks[chunk.getBlockIndex(x, y, z)] === BLOCK_TYPE.AIR)
          continue;

        for (let xx = -1; xx <= 1; xx++) {
          for (let yy = -1; yy <= 1; yy++) {
            for (let zz = -1; zz <= 1; zz++) {
              const block = chunk.getBlock(x + xx, y + yy, z + zz, world);
              const light = !block && chunk.getLight(x + xx, y + yy, z + zz, world);

              arr[(xx + 1) + (yy + 1) * 3 + (zz + 1) * 9] = block || (!light ? 0 : -light);
            }
          }
        }

        generateBlockMesh(x, y, z, chunk, world, arr);

        continue;
        /////////////
        const blockType = chunk.blocks[chunk.getBlockIndex(x, y, z)];
        const textureConfig = BLOCK_TEXTURE_CONFIG[blockType] || { all: [1000, 1000] };

        for (const key in blockData) {
          if (!Object.hasOwnProperty.call(blockData, key))
            continue;

          const data = blockData[key];
          const sideBlock = chunk.getBlock(data.normal[0] + x, data.normal[1] + y, data.normal[2] + z, world);

          if (sideBlock !== BLOCK_TYPE.AIR) {
            continue;
          }

          const light = chunk.getLight(data.normal[0] + x, data.normal[1] + y, data.normal[2] + z, world) || 0;

          const vertices = data.vertices;
          const triangles = data.triangles;
          const elementIndexOffset = mesh.vertices.length / floatsPerVertice;

          mesh.vertices.push(...vertices);

          for (let i = mesh.vertices.length - vertices.length; i < mesh.vertices.length; i += floatsPerVertice) {
            mesh.vertices[i] = mesh.vertices[i] * 0.5 + x;
            mesh.vertices[i + 1] = mesh.vertices[i + 1] * 0.5 + y;
            mesh.vertices[i + 2] = mesh.vertices[i + 2] * 0.5 + z;

            const [u, v] = textureConfig[key] || textureConfig.all;

            mesh.vertices[i + 3] = blockSideUVOffset + (blockSideUVSize + blockSideUVOffset * 2) * u + mesh.vertices[i + 3] * blockSideUVSize;
            mesh.vertices[i + 4] = blockSideUVOffset + (blockSideUVSize + blockSideUVOffset * 2) * v + mesh.vertices[i + 4] * blockSideUVSize;
            mesh.vertices[i + 5] *= 1// 0.1 + (light / maxLight) * 0.9;
            mesh.vertices[i + 6] = world.getBlockIndex(x, y, z);
          }

          for (let i = 0; i < triangles.length; i++) {
            mesh.indices.push(triangles[i] + elementIndexOffset);
          }
        }
      }
    }
  }
}

function generateBlockMesh(x, y, z, chunk, world, blocks) {
  const mesh = chunk.mesh;
  const blockType = blocks[13];
  const textureConfig = BLOCK_TEXTURE_CONFIG[blockType] || { all: [1000, 1000] };

  const vertNormal = [];

  for (const key in blockData) {
    if (!Object.hasOwnProperty.call(blockData, key))
      continue;

    const data = blockData[key];
    const sideBlock = getBv(blocks, data.normal);

    if (sideBlock > BLOCK_TYPE.AIR) {
      continue;
    }

    const vertices = data.vertices;
    const triangles = data.triangles;
    const elementIndexOffset = mesh.vertices.length / floatsPerVertice;

    mesh.vertices.push(...vertices);

    for (let i = mesh.vertices.length - vertices.length; i < mesh.vertices.length; i += floatsPerVertice) {

      const [u, v] = textureConfig[key] || textureConfig.all;

      mesh.vertices[i + 3] = blockSideUVOffset + (blockSideUVSize + blockSideUVOffset * 2) * u + mesh.vertices[i + 3] * (blockSideUVSize);
      mesh.vertices[i + 4] = blockSideUVOffset + (blockSideUVSize + blockSideUVOffset * 2) * v + mesh.vertices[i + 4] * (blockSideUVSize);

      mesh.vertices[i + 6] = world.getBlockIndex(x, y, z);

      vertNormal[0] = mesh.vertices[i];
      vertNormal[1] = mesh.vertices[i + 1];
      vertNormal[2] = mesh.vertices[i + 2];

      let { l, ao } = getLight(blocks, data.normal, vertNormal, sideBlock && -sideBlock);

      l = maxLight;

      mesh.vertices[i + 5] = Math.max(0, Math.min(1, mesh.vertices[i + 5] * 0.1 + (l / maxLight) * 0.9 * ao));
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

let b1, b2, b3, lSum, lCount, ao;

function getLight(blocks, normal, vertNormal, baseLight) {
  b1 = 1;
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

  if (b2 <= 0 || b3 <= 0) {
    b1 = getBv(blocks, vertNormal);
  }

  if (b2 > 0 && b3 > 0) {
    ao = 0.5;
  } else if (b2 > 0 && b1 > 0 || b3 > 0 && b1 > 0) {
    ao = 0.7;
  } else if (b2 > 0 || b3 > 0) {
    ao = 0.9;
  } else if (b1) {
    ao = 0.9;
  } else {
    ao = 1;
  }

  lSum = (b1 < 0 ? -b1 : 0) * 0.5 + (b2 < 0 ? -b2 : 0) + (b3 < 0 ? -b3 : 0) + baseLight;
  lCount = (b1 <= 0 ? 1 : 0) + (b2 <= 0 ? 1 : 0) + (b3 <= 0 ? 1 : 0) + 1;

  // lSum = (b2 < 0 ? -b2 : 0) + (b3 < 0 ? -b3 : 0) + baseLight - ambientOcclusion;
  // lCount = (b2 <= 0 ? 1 : 0) + (b3 <= 0 ? 1 : 0) + 1;

  // return (lSum < 0) ? 0 : baseLight;
  return { l: (lSum < 0) ? 0 : lSum / lCount, ao };
  return maxLight - ao;
}

function getB(blocks, x, y, z) {
  return blocks[x + 1 + y * 3 + 3 + z * 9 + 9];
}

function getBv(blocks, vec3) {
  return blocks[vec3[0] + 1 + vec3[1] * 3 + 3 + vec3[2] * 9 + 9];
}

const lightPopulateDirections = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

function calcLight(world, light, x, y, z, vecX, vecY, vecZ, sVx, sVy, sVz, depth) {
  if (depth >= maxLight) {
    return;
  }

  for (let i = 0, l = light, eX, eY, eZ; i < lightPopulateDirections.length; i++, l = light) {
    const [offX, offY, offZ] = lightPopulateDirections[i];

    eX = offX === sVx;
    eY = offY === sVy;
    eZ = offZ === sVz;

    if (eX && eY && eZ) {
      l = Math.floor(l * 0.7);
    } else if (eX && eY || eY && eZ || eX && eZ) {
      l = Math.floor(l * 0.9);
    }

    if (offX === vecX && offY === vecY && offZ === vecZ)
      continue;

    const block = world.getBlock(x + offX, y + offY, z + offZ);
    const blockLight = world.getLight(x + offX, y + offY, z + offZ);

    if (block || blockLight >= l)
      continue;

    world.setLight(x + offX, y + offY, z + offZ, l);

    if (!depth) {
      sVx = -offX;
      sVy = -offY;
      sVz = -offZ;
    }

    if (l > 1) {
      calcLight(world, l - 1, x + offX, y + offY, z + offZ, -offX, -offY, -offZ, sVx, sVy, sVz, depth + 1);
    }

    if (!depth) {
      sVx = sVy = sVz = 0;
    }
  }
}

function calcLightFast(world, light, x, y, z) {
  const queue = [];

  for (let i = 0; i < lightPopulateDirections.length; i++) {
    const [offX, offY, offZ] = lightPopulateDirections[i];

    const block = world.getBlock(x + offX, y + offY, z + offZ);
    const blockLight = world.getLight(x + offX, y + offY, z + offZ);

    if (block || blockLight >= light)
      continue;

    world.setLight(x + offX, y + offY, z + offZ, light);

    if (light > 1) {
      queue.unshift({ x: x + offX, y: y + offY, z: z + offZ, vx: -offX, vy: -offY, vz: -offZ, l: light - 1 });

      // calcLight(world, light - 1, x + offX, y + offY, z + offZ, -offX, -offY, -offZ, depth + 1);
    }
  }

  let count = 0;

  while (queue.length) {
    count++;

    if (count > 15000) {
      console.warn("o__O");
      return;
    }

    const conf = queue.pop();

    for (let i = 0, b; i < lightPopulateDirections.length; i++) {
      const [offX, offY, offZ] = lightPopulateDirections[i];

      if (offX === conf.vx && offY === conf.vy && offZ === conf.vz) {
        continue;
      }

      const block = world.getBlock(conf.x + offX, conf.y + offY, conf.z + offZ);
      const blockLight = world.getLight(conf.x + offX, conf.y + offY, conf.z + offZ);

      if (block || blockLight >= conf.l)
        continue;

      world.setLight(conf.x + offX, conf.y + offY, conf.z + offZ, conf.l);

      if (conf.l > 1) {
        queue.unshift({ x: conf.x + offX, y: conf.y + offY, z: conf.z + offZ, l: conf.l - 1, vx: conf.vx, vy: conf.vy });
      }
    }
  }

  console.log(count);
}

const BLOCK_TEXTURE_CONFIG = {};

BLOCK_TEXTURE_CONFIG[BLOCK_TYPE.GRASS_BLOCK] = {
  top: 2,
  bottom: 1,
  all: 0,
};

BLOCK_TEXTURE_CONFIG[BLOCK_TYPE.DIRT] = { all: 1 };
BLOCK_TEXTURE_CONFIG[BLOCK_TYPE.STONE] = { all: 3 };
BLOCK_TEXTURE_CONFIG[BLOCK_TYPE.COAL] = { all: 4 };
BLOCK_TEXTURE_CONFIG[BLOCK_TYPE.IRON] = { all: 5 };
BLOCK_TEXTURE_CONFIG[BLOCK_TYPE.COBBLESTONE] = { all: 12 };
BLOCK_TEXTURE_CONFIG[BLOCK_TYPE.STONE_BRICK] = { all: 11 };
BLOCK_TEXTURE_CONFIG[BLOCK_TYPE.BEDROCK] = { all: 6 };
BLOCK_TEXTURE_CONFIG[BLOCK_TYPE.WOOD] = {
  top: 8,
  bottom: 8,
  all: 7
};

const BLOCKS_PER_ROW = 4;

for (const blockType in BLOCK_TEXTURE_CONFIG) {
  if (!Object.hasOwnProperty.call(BLOCK_TEXTURE_CONFIG, blockType)) {
    continue;
  }

  for (const sideName in BLOCK_TEXTURE_CONFIG[blockType]) {
    if (!Object.hasOwnProperty.call(BLOCK_TEXTURE_CONFIG[blockType], sideName)) {
      continue;
    }

    const index = BLOCK_TEXTURE_CONFIG[blockType][sideName];

    const x = index % BLOCKS_PER_ROW;
    const y = Math.floor(index / BLOCKS_PER_ROW);


    BLOCK_TEXTURE_CONFIG[blockType][sideName] = [x, y];
  }
}

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
    triangles: [
      0, 1, 2,
      0, 2, 3,
    ]
  },
  left: {
    normal: [-1, 0, 0],
    light: 0.85,
    vertices: [
      -1.0, 1.0, 1.0, 0, 0,
      -1.0, -1.0, 1.0, 0, 1,
      -1.0, -1.0, -1.0, 1, 1,
      -1.0, 1.0, -1.0, 1, 0,
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
      1.0, 1.0, 1.0, 0, 0,
      1.0, -1.0, 1.0, 0, 1,
      1.0, -1.0, -1.0, 1, 1,
      1.0, 1.0, -1.0, 1, 0,
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
      1.0, 1.0, 1.0, 0, 0,
      1.0, -1.0, 1.0, 0, 1,
      -1.0, -1.0, 1.0, 1, 1,
      -1.0, 1.0, 1.0, 1, 0,
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
      1.0, 1.0, -1.0, 0, 0,
      1.0, -1.0, -1.0, 0, 1,
      -1.0, -1.0, -1.0, 1, 1,
      -1.0, 1.0, -1.0, 1, 0,
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

  for (let i = 0; i < blockData[key].vertices.length; i += floatsPerVertice) {
    blockData[key].vertices.splice(i + 5, 0, blockData[key].light);
    blockData[key].vertices.splice(i + 6, 0, 0);
  }
}