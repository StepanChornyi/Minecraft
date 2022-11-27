import { MessageDispatcher, Vector } from 'black-engine';
import ChunkMeshGenerator from './mesh-generator/chunk-mesh-generator';
import ChunkStorage from './chunk-storage';
import Vector3 from '../../utils/vector3';
import LightEngine from './mesh-generator/LightEngine';
import { BLOCK_TYPE } from '../block-type';
import BlocksManager from './blocks/BlocksManager';
import CONFIG from './config';
import Chunk from './Chunks/Chunk';
import ChunkPos from '../../utils/chunk-pos';
import MathUtils from '../../utils/MathUtils';
import QueueFast from '../../utils/queue-fast';
import { CHUNK_DIR, CHUNK_DIR_VECTOR, DIAGONAL_DIR_ARR, getPerpendicular, invertChunkDir, isFilledBtwChunks, STRAIGHT_DIR_ARR } from './Chunks/ChunkDirections';
import LevelGen from './level-gen/LevelGen';

const CHUNK_SPAWN_DIST = CONFIG.CHUNK_SPAWN_DIST;
const CHUNK_REMOVE_DIST = CONFIG.CHUNK_REMOVE_DIST;

const CHUNK_SIZE = CONFIG.CHUNK_SIZE;
const WORLD_HEIGHT = CONFIG.WORLD_HEIGHT;

export default class World extends MessageDispatcher {
  constructor(gl, player) {
    super();

    this.gl = gl;

    this.player = player;

    this.chunksToInit = [];

    this.levelGen = new LevelGen();
    this.subChunkMeshGenerator = new ChunkMeshGenerator(this);
    this.chunkStorage = new ChunkStorage(this);
    this.updateQueue = new QueueFast();
    this.lightEngine = new LightEngine(this);

    this.chunks = this.chunkStorage.chunks;

    this.initialChunksCount = null;
    this.initedChunksCount = 0;

    setTimeout(() => this.init(), 50);
  }

  init() {
    this.initialChunksCount = 0;

    const initDist = CHUNK_REMOVE_DIST;
    const playerChunkX = Math.floor(this.player.x / CHUNK_SIZE);
    const playerChunkZ = Math.floor(this.player.z / CHUNK_SIZE);

    for (let x = -initDist + 1; x < initDist; x++) {
      for (let z = -initDist + 1; z < initDist; z++) {
        if (MathUtils.isOutOfRadiusAB(x, playerChunkX, z, playerChunkZ, initDist)) {
          continue;
        }

        const chunk = new Chunk(this, this.subChunkMeshGenerator);

        chunk.setPos(x, z);

        chunk.visible = false;

        this.chunkStorage.set(x, z, chunk);
        this.chunksToInit.push(new ChunkPos(x, z));

        // this.worldGenerator.fillChunk(chunk);

        this.levelGen.generateChunk(x, z);
        this.levelGen.fillChunk(chunk);

        // chunk.filled = true;

        // this.lightEngine.fillWithSkylight(chunk);

        this.initialChunksCount++;
      }
    }
  }

  getBlock(x, blockY, z) {
    const { chunkX, chunkZ, blockX, blockZ } = this.getChunkCoord(x, z);

    const chunk = this.chunkStorage.get(chunkX, chunkZ);

    if (blockY < 0) {
      return BlocksManager.create(BLOCK_TYPE.BEDROCK);
    }

    if (!chunk || !chunk.filled/* || !chunk.blocks.length*/) {
      return null;
    }

    return chunk.getBlock(blockX, blockY, blockZ, false);
  }

  setBlock(x, y, z, block) {
    const { chunkX, chunkY, chunkZ, blockX, blockY, blockZ } = this.getSubChunkCoord(x, y, z);

    const chunk = this.chunkStorage.get(chunkX, chunkZ);

    chunk.setBlock(blockX, y, blockZ, block);

    this.getSubChunk(chunkX, chunkY, chunkZ).dirty = true;
    this.lightEngine.update(x, y, z);

    this.getNeighborhoodSubChunks(chunkX, chunkY, chunkZ, this.getChunkDir(blockX), this.getChunkDir(blockY), this.getChunkDir(blockZ), (subChunk, d) => {
      if (subChunk) {
        if (d === 0) {
          subChunk.dirty = true;
        } else {
          subChunk.lightDirty = true;
        }
      }
    });
  }

  // getBlockAndLight(x, y, z) {
  //   const { chunkX, chunkY, chunkZ, blockX, blockY, blockZ } = this.getChunkCoord(x, y, z);

  //   const chunk = this.chunkStorage.get(chunkX, chunkY, chunkZ);

  //   if (!chunk || !chunk.visible || !chunk.blocks.length) {
  //     return [this.worldGenerator.getBlock(x, y, z), 0];
  //   }

  //   return [chunk.getBlock(blockX, blockY, blockZ, this), chunk.getLightData(blockX, blockY, blockZ)];
  // }

  setLightData(x, y, z, val) {
    const { chunkX, chunkY, chunkZ, blockX, blockY, blockZ } = this.getSubChunkCoord(x, y, z);

    const chunk = this.chunkStorage.get(chunkX, chunkZ);

    if (!chunk || !chunk.lightFilled) {
      return;
    }

    chunk.getBlock(blockX, y, blockZ).light = val;

    const subChunk = this.getSubChunk(chunkX, chunkY, chunkZ);

    if (subChunk) {
      subChunk.dirty = true;
    }

    // this.lightEngine.update(x, y, z);

    this.getNeighborhoodSubChunks(chunkX, chunkY, chunkZ, this.getChunkDir(blockX), this.getChunkDir(blockY), this.getChunkDir(blockZ), (subChunk, d) => {
      if (subChunk) {
        if (d === 0) {
          subChunk.dirty = true;
        } else {
          subChunk.lightDirty = true;
        }
      }
    });
  }

  getLightData(x, y, z) {
    // const { chunkX, chunkY, chunkZ, blockX, blockY, blockZ } = this.getChunkCoord(x, y, z);

    // const chunk = this.chunkStorage.get(chunkX, chunkY, chunkZ);

    // if (chunk && chunk.filled) {
    //   return chunk.getLightData(blockX, blockY, blockZ, this);
    // }

    // return 0b0000000011110001;
    const block = this.getBlock(x, y, z);

    if (!block) {
      return 0;
    }

    return block.light;
  }

  getLight(x, y, z) {//used for particles
    return this.lightEngine.getLight(this.getLightData(x, y, z));
  }

  getSubChunk(subChunkX, subChunkY, subChunkZ) {
    const chunk = this.chunkStorage.get(subChunkX, subChunkZ);

    if (chunk)
      return chunk.subChunks[subChunkY];

    return null;
  }

  getNeighborhoodSubChunks(chunkX, chunkY, chunkZ, xOffset, yOffset, zOffset, clb) {
    if (xOffset) {
      clb(this.getSubChunk(chunkX + xOffset, chunkY, chunkZ), 0);
    }

    if (zOffset) {
      clb(this.getSubChunk(chunkX, chunkY, chunkZ + zOffset), 0);
    }

    if (yOffset) {
      clb(this.getSubChunk(chunkX, chunkY + yOffset, chunkZ), 0);
    }

    if (xOffset && yOffset) {
      clb(this.getSubChunk(chunkX + xOffset, chunkY + yOffset, chunkZ), 1);
    }

    if (xOffset && zOffset) {
      clb(this.getSubChunk(chunkX + xOffset, chunkY, chunkZ + zOffset), 1);
    }

    if (yOffset && zOffset) {
      clb(this.getSubChunk(chunkX, chunkY + yOffset, chunkZ + zOffset), 1);
    }

    if (xOffset && yOffset && zOffset) {
      clb(this.getSubChunk(chunkX + xOffset, chunkY + yOffset, chunkZ + zOffset), 2);
    }
  }

  getGroundY(x, z) {
    // return this.worldGenerator.getHeightNoise(x, z) - 1;
    return WORLD_HEIGHT;

    // x = Math.floor(x);
    // z = Math.floor(z);

    // for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
    //   if (this.getBlock(x, y, z)) {
    //     return y;
    //   }
    // }

    // return CHUNK_HEIGHT - 1;
  }

  getSubChunkCoord(x, y, z) {
    const chunkX = this.getChunkAxisCoord(x, CHUNK_SIZE);
    const chunkY = this.getChunkAxisCoord(y, CHUNK_SIZE);
    const chunkZ = this.getChunkAxisCoord(z, CHUNK_SIZE);

    return {
      chunkX, chunkY, chunkZ,
      blockX: this.getSubChunkLocalCoord(x, chunkX),
      blockY: this.getSubChunkLocalCoord(y, chunkY),
      blockZ: this.getSubChunkLocalCoord(z, chunkZ)
    };
  }

  getChunkCoord(x, z) {
    const chunkX = this.getChunkAxisCoord(x, CHUNK_SIZE);
    const chunkZ = this.getChunkAxisCoord(z, CHUNK_SIZE);

    return {
      chunkX, chunkZ,
      blockX: this.getSubChunkLocalCoord(x, chunkX),
      blockZ: this.getSubChunkLocalCoord(z, chunkZ)
    };
  }

  // getChunkWorldZYX(x, y, z) {
  //   const chunkX = this.getChunkAxisCoord(x, CHUNK_SIZE);
  //   const chunkZ = this.getChunkAxisCoord(z, CHUNK_SIZE);

  //   return this.chunkStorage.get(chunkX, 0, chunkZ);
  // }

  getSubChunkLocalCoord(wCoord, chCoord) {
    return wCoord < 0 ? wCoord - CHUNK_SIZE * chCoord : wCoord % CHUNK_SIZE;
  }

  getChunkAxisCoord(wCoord) {
    return ((wCoord < 0 ? (wCoord - CHUNK_SIZE + 1) : wCoord) / CHUNK_SIZE) >> 0;
  }

  onUpdate() {
    if (this.initialChunksCount === null)
      return;

    this.deleteChunks();

    let isChunkFilled = this.initChunk();

    this.initChunksLight();

    if (!isChunkFilled)
      this.updateChunks();

    this.spawnChunks();
  }

  initChunk() {
    let isChunkFilled = false;

    if (this.chunksToInit.length) {
      const maxInitCount = 1;
      let initCounter = 0;

      while (this.chunksToInit.length && initCounter++ < maxInitCount) {
        const chunkPos = this.chunksToInit.shift();
        const chunk = this.chunkStorage.get(chunkPos.x, chunkPos.z);

        if (!chunk) {
          return isChunkFilled;
        }

        if (!chunk.filled) {
          this.levelGen.generateChunk(chunk.x, chunk.z);
          this.levelGen.fillChunk(chunk);

          // this.worldGenerator.fillChunk(chunk);
          isChunkFilled = true;
        }

        this.lightEngine.fillChunkLight(chunk);

        chunk.lightFilled = true;
        chunk.visible = true;
        chunk.filled = true;

        this.initedChunksCount++;

        if (this.initedChunksCount < this.initialChunksCount) {
          this.post('initProgress', this.initedChunksCount / this.initialChunksCount);
        }
      }
    } else if (this.initedChunksCount >= this.initialChunksCount) {
      this.initedChunksCount++;
      this.post('initCompleted');
    }

    return isChunkFilled;
  }

  isChunkLightReady(chunk) {
    return chunk && chunk.lightFilled;
  }

  initChunksLight() {
    for (let i = 0, j, dir, vec, sideChunk, diagonalChunk; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];

      if (!this.isChunkLightReady(chunk)) {
        continue;
      }

      if (chunk.lightSidesFilled.get(CHUNK_DIR.ALL)) {
        continue;
      }

      for (j = 0; j < STRAIGHT_DIR_ARR.length; j++) {
        dir = STRAIGHT_DIR_ARR[j];

        if (chunk.lightSidesFilled.get(dir))
          continue;

        vec = CHUNK_DIR_VECTOR[dir];
        sideChunk = this.chunkStorage.get(chunk.x + vec.x, chunk.z + vec.z);

        if (!this.isChunkLightReady(sideChunk))
          continue;

        this.lightEngine.fillBtwChunks(chunk, sideChunk);

        chunk.lightSidesFilled.set(dir);
        sideChunk.lightSidesFilled.set(invertChunkDir(dir));
      }

      if (!chunk.lightSidesFilled.get(CHUNK_DIR.ALL_STRAIGHT))
        continue;

      for (j = 0; j < DIAGONAL_DIR_ARR.length; j++) {
        dir = DIAGONAL_DIR_ARR[j];

        if (chunk.lightSidesFilled.get(dir))
          continue;

        vec = CHUNK_DIR_VECTOR[dir];
        diagonalChunk = this.chunkStorage.get(chunk.x + vec.x, chunk.z + vec.z);

        if (!this.isChunkLightReady(diagonalChunk))
          continue;

        sideChunk = this.chunkStorage.get(chunk.x + vec.x, chunk.z);

        if (!this.isChunkLightReady(sideChunk))
          continue;

        if (!isFilledBtwChunks(diagonalChunk, sideChunk))
          continue;

        sideChunk = this.chunkStorage.get(chunk.x, chunk.z + vec.z);

        if (!this.isChunkLightReady(sideChunk))
          continue;

        if (!isFilledBtwChunks(diagonalChunk, sideChunk))
          continue;

        chunk.lightSidesFilled.set(dir);
        diagonalChunk.lightSidesFilled.set(invertChunkDir(dir));

        if (chunk.lightSidesFilled.get(CHUNK_DIR.ALL)) {
          this._afterLightInitUpdate(chunk);
        }

        if (diagonalChunk.lightSidesFilled.get(CHUNK_DIR.ALL)) {
          this._afterLightInitUpdate(diagonalChunk);
        }
      }
    }
  }

  _afterLightInitUpdate(chunk) {
    for (let x = 0, b1, b2; x < CHUNK_SIZE; x++) {
      for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          b1 = chunk.getBlock(x, y, z);

          if (b1.is(BLOCK_TYPE.DIRT)) {
            b2 = chunk.getBlock(x, y + 1, z);

            if (b2.isAir && LightEngine.getSkyLight(b2.light) > 5) {
              chunk.setBlock(x, y, z, BlocksManager.create(BLOCK_TYPE.GRASS_BLOCK));
            }
          }

          if (b1.is(BLOCK_TYPE.GRASS)) {
            b2 = chunk.getBlock(x, y - 1, z);

            if (!b2.is(BLOCK_TYPE.GRASS_BLOCK) && !b2.is(BLOCK_TYPE.DIRT)) {
              b2 = BlocksManager.create(BLOCK_TYPE.AIR);
              b2.light = b1.light;

              chunk.setBlock(x, y, z,b2);
            }
          }
        }
      }
    }
  }

  updateChunks() {
    const playerChunkX = Math.floor(this.player.x / CHUNK_SIZE);
    const playerChunkZ = Math.floor(this.player.z / CHUNK_SIZE);
    const playerChunk = this.chunkStorage.get(playerChunkX, playerChunkZ);

    if (!playerChunk)
      return;

    this.updateQueue.add(playerChunk);

    for (let i = 0; i < this.chunks.length; i++) {
      this.chunks[i].updated = false;
    }

    const dir = [
      new ChunkPos(1, 0),
      new ChunkPos(-1, 0),
      new ChunkPos(0, 1),
      new ChunkPos(0, -1)
    ];

    while (this.updateQueue.length) {
      const chunk = this.updateQueue.peek();

      chunk.updated = true;

      if (chunk.visible && chunk.dirty && chunk.lightSidesFilled.get(CHUNK_DIR.ALL)) {
        this.updateChunk(chunk, false);

        break;
      }

      for (let i = 0; i < dir.length; i++) {
        const { x, z } = dir[i];
        const sideChunk = this.chunkStorage.get(chunk.x + x, chunk.z + z);

        if (sideChunk && !sideChunk.updated) {
          this.updateQueue.add(sideChunk);
        }
      }
    }

    this.updateQueue.reset();
  }

  updateChunk(chunk, all = true) {
    for (let y = 0; y < chunk.subChunks.length; y++) {
      const subChunk = chunk.subChunks[y];

      if (subChunk.dirty) {
        subChunk.updateMesh();
        subChunk.dirty = false;

        if (!all) {
          return;
        }
      }
    }
  }

  deleteChunks() {
    const playerChunkX = Math.floor(this.player.x / CHUNK_SIZE);
    const playerChunkZ = Math.floor(this.player.z / CHUNK_SIZE);
    const chunkViewDistance = CHUNK_REMOVE_DIST;

    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];

      if (!chunk || !chunk.visible)
        continue;

      if (MathUtils.isOutOfRadius(chunk.x - playerChunkX, chunk.z - playerChunkZ, chunkViewDistance)) {
        this.chunkStorage.remove(chunk.x, chunk.z);

        chunk.visible = false;
        chunk.dirty = true;
        chunk.filled = false;
        chunk.lightFilled = false;
        chunk.lightSidesFilled.clear();
        chunk.clearLights();
        chunk.clear();
        Chunk.pool.push(chunk);

        i--;
      }
    }
  }

  spawnChunks() {
    const playerChunkX = Math.floor(this.player.x / CHUNK_SIZE);
    const playerChunkZ = Math.floor(this.player.z / CHUNK_SIZE);

    for (let x = -CHUNK_SPAWN_DIST + 1; x < CHUNK_SPAWN_DIST; x++) {
      for (let z = -CHUNK_SPAWN_DIST + 1; z < CHUNK_SPAWN_DIST; z++) {
        if (MathUtils.isOutOfRadius(x, z, CHUNK_SPAWN_DIST)) {
          continue;
        }

        const chunkX = playerChunkX + x;
        const chunkZ = playerChunkZ + z;

        let chunk = this.chunkStorage.get(chunkX, chunkZ);

        if (chunk)
          continue;

        chunk = Chunk.pool.pop() || new Chunk(this, this.subChunkMeshGenerator);

        chunk.visible = false;

        chunk.setPos(chunkX, chunkZ);

        this.chunkStorage.set(chunkX, chunkZ, chunk);
        this.chunksToInit.push(new ChunkPos(chunkX, chunkZ));
      }
    }
  }

  getChunkDir(blockCoord) {
    return blockCoord === 0 ? -1 : (blockCoord === CHUNK_SIZE - 1 ? 1 : 0);
  }
}