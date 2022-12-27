import QueueFast from '../../../utils/queue-fast';
import Vector3 from '../../../utils/vector3';
import CONFIG from '../config';

const WORLD_HEIGHT = CONFIG.WORLD_HEIGHT;
const CHUNK_SIZE = CONFIG.CHUNK_SIZE;
const MAX_LIGHT = CONFIG.MAX_LIGHT;
const SKY_LIGHT_FACTOR = 0.9;

export default class LightEngine {
  constructor(world) {
    this.world = world;
  }

  update(x, y, z) {
    const world = this.world;
    const block = world.getBlock(x, y, z);

    if (!block.isLightEmitter) {
      this.setBlockLight(x, y, z, 0);
      reverseQueue.add(Vector3.new(x, y, z));
      this.reverseBlockLight();
    } else {
      this.setBlockLight(x, y, z, packBlockLight(block.lightEmit, 0, 1));
      traverseQueue.add(Vector3.new(x, y, z));
    }

    this.traverseBlockLight();

    if (block.transparency === 1) {///TODO fix this line
      skyLightTraverseQueue.add(Vector3.new(x, y, z));

      for (let i = 0; i < directionsArr.length; i++) {
        const norm = normals[directionsArr[i]];
        const b = world.getBlock(x + norm.x, y + norm.y, z + norm.z);

        if (b && dataToSkyLight(b.light) > 0) {
          skyLightTraverseQueue.add(Vector3.new(x + norm.x, y + norm.y, z + norm.z));
        }
      }

      this.traverseSkyLight();
    } else {
      this.setSkyLight(x, y, z, 0);

      skyLightReverseQueue.add(Vector3.new(x, y, z));

      this.reverseSkyLight();
    }

    this.traverseSkyLight();

    reverseQueue.reset();
    traverseQueue.reset();

    skyLightReverseQueue.reset();
    skyLightTraverseQueue.reset();
  }

  setBlockLight(x, y, z, val, data = this.world.getLightData(x, y, z)) {
    this.world.setLightData(x, y, z, clearBlockLight(data) | val);
  }

  setSkyLight(x, y, z, val, data = this.world.getLightData(x, y, z)) {
    this.world.setLightData(x, y, z, clearSkyLight(data) | val);
  }

  fillChunkLight(chunk) {
    for (let x = 0, block; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        skyLightTraverseQueue.add(Vector3.new(x, WORLD_HEIGHT, z));

        for (let y = 0; y < WORLD_HEIGHT; y++) {
          block = chunk.getBlock(x, y, z, false);

          if (block.isLightEmitter) {
            block.light = clearBlockLight(block.light) | packBlockLight(block.lightEmit, 0, 1);
            traverseQueue.add(Vector3.new(x, y, z));
          }
        }
      }
    }

    this._traverseChunkSkyLight(skyLightTraverseQueue, this._traverseProcessSkyLight.bind(this), dataToSkyLight, chunk);
    this._traverseChunkBlockLight(traverseQueue, chunk);

    traverseQueue.reset();
    skyLightTraverseQueue.reset();
  }

  fillBtwChunks(chunkA, chunkB) {
    const dz = chunkA.z - chunkB.z;
    const dx = chunkA.x - chunkB.x;

    let aX, bX, aZ, bZ;

    if (dx === 0) {
      aZ = chunkA.z * CHUNK_SIZE + (dz < 0 ? CHUNK_SIZE - 1 : 0);
      bZ = chunkB.z * CHUNK_SIZE + (dz < 0 ? 0 : CHUNK_SIZE - 1);
    } else {
      aX = chunkA.x * CHUNK_SIZE + (dx < 0 ? CHUNK_SIZE - 1 : 0);
      bX = chunkB.x * CHUNK_SIZE + (dx < 0 ? 0 : CHUNK_SIZE - 1);
    }

    let blockA, blockB, skyLightA, blockLightA, skyLightB, blockLightB;

    for (let k = 0, oX = chunkA.x * CHUNK_SIZE, oZ = chunkA.z * CHUNK_SIZE; k < CHUNK_SIZE; k++) {
      if (dx === 0) {
        aX = bX = oX + k;
      } else {
        aZ = bZ = oZ + k;
      }

      for (let y = 0; y < WORLD_HEIGHT; y++) {
        blockA = this.world.getBlock(aX, y, aZ);

        if (!blockA || blockA.nonTransparent)
          continue;

        blockB = this.world.getBlock(bX, y, bZ);

        if (!blockB || blockB.nonTransparent)
          continue;

        if (blockA.light === blockB.light)
          continue;

        skyLightA = dataToSkyLight(blockA.light);
        blockLightA = dataToBlockLight(blockA.light);

        skyLightB = dataToSkyLight(blockB.light);
        blockLightB = dataToBlockLight(blockB.light);

        if (skyLightA !== skyLightB) {
          if (skyLightA) {
            skyLightTraverseQueue.add(Vector3.new(aX, y, aZ));
          }

          if (skyLightB) {
            skyLightTraverseQueue.add(Vector3.new(bX, y, bZ));
          }
        }

        if (blockLightA !== blockLightB) {
          if (blockLightA) {
            traverseQueue.add(Vector3.new(aX, y, aZ));
          }

          if (blockLightB) {
            traverseQueue.add(Vector3.new(bX, y, bZ));
          }
        }
      }
    }

    this.traverseSkyLight();
    skyLightTraverseQueue.reset();

    this.traverseBlockLight();
    traverseQueue.reset();
  }

  traverseBlockLight() {
    this._traverse(traverseQueue, this._traverseProcessBlockLight.bind(this), dataToBlockDir);
  }

  traverseSkyLight() {
    this._traverse(skyLightTraverseQueue, this._traverseProcessSkyLight.bind(this), dataToSkyLight);
  }

  reverseBlockLight() {
    this._reverse(reverseQueue, this._reverseProcessBlockLight.bind(this));
  }

  reverseSkyLight() {
    this._reverse(skyLightReverseQueue, this._reverseProcessSkyLight.bind(this));
  }

  _traverseProcessBlockLight(pos, currDir, prevLightData, prevDir, prevDirIvs) {
    const block = this.world.getBlock(pos.x, pos.y, pos.z);

    if (!block) {
      return false;
    }

    const lightData = block.light;

    const blockLight = dataToBlockLight(lightData);

    let light = dataToBlockLight(prevLightData) - 1;

    if (currDir !== prevDir && prevDir) {
      prevNormIvs = normals[prevDirIvs];
      prevNorm = normals[prevDir];

      const b1 = this.world.getBlock(pos.x + prevNormIvs.x, pos.y + prevNormIvs.y, pos.z + prevNormIvs.z);
      const b2 = this.world.getBlock(pos.x + prevNormIvs.x, pos.y + prevNormIvs.y, pos.z + prevNormIvs.z);

      if (
        b1 && b1.nonTransparent &&
        b2 && b2.nonTransparent
      ) {
        light = Math.ceil(light * 0.9 - 1);
      }
    }

    if (block.transparency === 2) {
      light = Math.ceil(light * 0.7) - 1;
    }

    if (block.nonTransparent || blockLight >= light)
      return false;

    this.setBlockLight(pos.x, pos.y, pos.z, packBlockLight(light, currDir, block.isLightEmitter ? 1 : 0), lightData);

    return true;
  }

  _traverseProcessSkyLight(pos, currDir, prevLightData, prevDir, prevDirIvs) {
    const block = this.world.getBlock(pos.x, pos.y, pos.z);

    if (!block) {
      return false;
    }

    const lightData = block.light;
    const blockLight = dataToSkyLight(lightData);
    let light, isSource = 0;

    if (dataToSkyEmit(prevLightData) && currDir === directions.bottom) {
      light = dataToSkyLight(prevLightData);
      isSource = 1;
    } else {
      // light = Math.ceil(dataToSkyLight(prevLightData) * 0.85) - 1;
      light = dataToSkyLight(prevLightData) - 1;

      //SOMEHOW FIX THIS SHIT 
      // if (currDir !== prevDir && prevDir) {
      //   prevNormIvs = normals[prevDirIvs];
      //   prevNorm = normals[prevDir];

      //   if (
      //     this.world.getBlock(pos.x + prevNormIvs.x, pos.y + prevNormIvs.y, pos.z + prevNormIvs.z).nonTransparent &&
      //     this.world.getBlock(pos.x + prevNorm.x, pos.y + prevNorm.y, pos.z + prevNorm.z).nonTransparent
      //   ) {
      //     light = Math.ceil(light * 0.9 - 1);
      //   }
      // }
    }

    if (block.transparency === 2) {
      light = Math.floor(light * 0.7);
    }

    if (block.nonTransparent || blockLight >= light) {
      // if (blockLight > dataToSkyLight(prevLightData)){
      //   skyLightTraverseQueue.add(Vector3.new().copyFrom(pos));
      // }

      return false;
    }

    this.setSkyLight(pos.x, pos.y, pos.z, packSkyLight(light, currDir, isSource), lightData);

    return true;
  }

  _traverse(queue, callback, dataToDir) {
    const world = this.world;

    let count = 0;

    let light, prevPos, prevLightData, prevDir, prevDirIvs, prevNorm, prevNormIvs, pos, dir;

    while (queue.length) {
      if (++count > 100000) {
        console.warn("Light calculation error o__O");
        return;
      }

      prevPos = queue.peek();
      prevLightData = world.getLightData(prevPos.x, prevPos.y, prevPos.z);

      prevDir = dataToDir(prevLightData);
      prevDirIvs = invertDir(prevDir);

      for (let i = 0; i < directionsArr.length; i++) {
        dir = directionsArr[i];

        if (dir === prevDirIvs) {
          continue;
        }

        pos = Vector3.tmp
          .copyFrom(normals[directionsArr[i]])
          .add(prevPos);

        if (pos.y > WORLD_HEIGHT || pos.y < -1) {///skip not existing top/bottom blocks
          continue;
        }

        const addToQueue = callback(pos, dir, prevLightData, prevDir, prevDirIvs);

        if (addToQueue) {
          queue.add(Vector3.new().copyFrom(pos));
        }
      }

      Vector3.release(prevPos);

      count++;
    }
  }

  _traverseChunkSkyLight(queue, callback, dataToDir, chunk) {
    let count = 0;

    let light, prevPos, prevLightData, prevDir, prevDirIvs, prevNorm, prevNormIvs, pos, dir;

    while (queue.length) {
      if (++count > 100000) {
        console.warn("Light calculation error o__O");
        return;
      }

      prevPos = queue.peek();
      prevLightData = chunk.getBlock(prevPos.x, prevPos.y, prevPos.z, false).light;

      prevDir = dataToDir(prevLightData);
      prevDirIvs = invertDir(prevDir);

      for (let i = 0; i < directionsArr.length; i++) {
        dir = directionsArr[i];

        if (dir === prevDirIvs) {
          continue;
        }

        pos = Vector3.tmp
          .copyFrom(normals[directionsArr[i]])
          .add(prevPos);

        if (pos.y > WORLD_HEIGHT || pos.y < -1) {///skip not existing top/bottom blocks
          continue;
        }

        if (pos.x < 0 || pos.x >= CHUNK_SIZE || pos.z < 0 || pos.z >= CHUNK_SIZE) {///skip not existing top/bottom blocks
          continue;
        }

        const block = chunk.getBlock(pos.x, pos.y, pos.z, false);
        if (!block) {
          console.log(chunk, pos.x, pos.y, pos.z);
        }

        const lightData = block.light;
        const blockLight = dataToSkyLight(lightData);
        let light, isSource = 0;

        if (dataToSkyEmit(prevLightData) && dir === directions.bottom) {
          light = dataToSkyLight(prevLightData);
          isSource = 1;
        } else {
          light = dataToSkyLight(prevLightData) - 1;
        }

        if (block.transparency === 2) {
          light = Math.floor(light * 0.7);
        }

        if (block.nonTransparent || blockLight >= light) {
          continue;
        }

        block.light = clearSkyLight(block.light) | packSkyLight(light, dir, isSource)

        queue.add(Vector3.new().copyFrom(pos));
      }

      Vector3.release(prevPos);

      count++;
    }
  }

  _traverseChunkBlockLight(queue, chunk) {
    let count = 0;

    let light, prevPos, prevLightData, prevDir, prevDirIvs, prevNorm, prevNormIvs, pos, dir;

    while (queue.length) {
      if (++count > 100000) {
        console.warn("Light calculation error o__O");
        return;
      }

      prevPos = queue.peek();
      prevLightData = chunk.getBlock(prevPos.x, prevPos.y, prevPos.z, false).light;

      prevDir = dataToBlockDir(prevLightData);
      prevDirIvs = invertDir(prevDir);

      for (let i = 0; i < directionsArr.length; i++) {
        dir = directionsArr[i];

        if (dir === prevDirIvs) {
          continue;
        }

        pos = Vector3.tmp
          .copyFrom(normals[directionsArr[i]])
          .add(prevPos);

        if (pos.y > WORLD_HEIGHT || pos.y < -1) {///skip not existing top/bottom blocks
          continue;
        }

        if (pos.x < 0 || pos.x >= CHUNK_SIZE || pos.z < 0 || pos.z >= CHUNK_SIZE) {///skip not existing top/bottom blocks
          continue;
        }

        const block = chunk.getBlock(pos.x, pos.y, pos.z, false);
        if (!block) {
          console.log(chunk, pos.x, pos.y, pos.z);
        }

        const lightData = block.light;
        const blockLight = dataToBlockLight(lightData);
        let light = dataToBlockLight(prevLightData) - 1;

        prevNormIvs = normals[prevDirIvs];
        prevNorm = normals[prevDir];

        if (dir !== prevDir && prevDir && !chunk.isOutsideChunk(pos.x + prevNormIvs.x, pos.z + prevNormIvs.z) && !chunk.isOutsideChunk(pos.x + prevNorm.x, pos.z + prevNorm.z)) {
          if (
            chunk.getBlock(pos.x + prevNormIvs.x, pos.y + prevNormIvs.y, pos.z + prevNormIvs.z, false).nonTransparent &&
            chunk.getBlock(pos.x + prevNorm.x, pos.y + prevNorm.y, pos.z + prevNorm.z, false).nonTransparent
          ) {
            light = Math.ceil(light * 0.9 - 1);
          }
        }


        if (block.transparency === 2) {
          light = Math.ceil(light * 0.7) - 1;
        }

        if (block.nonTransparent || blockLight >= light) {
          continue;
        }

        block.light = clearBlockLight(block.light) | packBlockLight(light, dir, block.isLightEmitter ? 1 : 0);

        queue.add(Vector3.new().copyFrom(pos));
      }

      Vector3.release(prevPos);

      count++;
    }
  }

  _reverseProcessBlockLight(pos, dir) {
    const block = this.world.getBlock(pos.x, pos.y, pos.z);

    if (!block || block.nonTransparent) {
      return false;
    }

    const lightData = block.light;

    const blockDir = dataToBlockDir(lightData);
    const blockLight = dataToBlockLight(lightData);

    if (blockLight === 0) {
      return false;
    }

    if (blockDir !== dir) {
      traverseQueue.add(Vector3.new().copyFrom(pos));
      return false;
    }

    let newBlockLight = block.isLightEmitter ? packBlockLight(block.lightEmit, 0, 1) : 0;

    this.setBlockLight(pos.x, pos.y, pos.z, newBlockLight, lightData);

    return true;
  }

  _reverseProcessSkyLight(pos, dir) {
    const block = this.world.getBlock(pos.x, pos.y, pos.z);

    if (!block || block.nonTransparent) {
      return false;
    }

    const lightData = block.light;

    const blockDir = dataToSkyDir(lightData);
    const skyLight = dataToSkyLight(lightData);

    if (skyLight === 0) {
      return false;
    }

    // const isSunRay = dataToSkyEmit(lightData) && dir === directions.bottom;

    if (blockDir !== dir) {  //&& !isSunRay) {
      skyLightTraverseQueue.add(Vector3.new().copyFrom(pos));
      return false;
    }

    this.setSkyLight(pos.x, pos.y, pos.z, 0, lightData);

    return true;
  }

  _reverse(queue, processBlock) {
    let count = 0;

    while (queue.length) {
      if (++count > 100000) {
        console.warn("Light calculation error o__O");
        return;
      }

      const prevBlockPos = queue.peek();

      for (let i = 0; i < directionsArr.length; i++) {
        const dir = directionsArr[i];

        const pos = Vector3.tmp
          .copyFrom(normals[dir])
          .add(prevBlockPos);

        if (pos.y > WORLD_HEIGHT || pos.y < -1) {///skip not existing top/bottom blocks
          continue;
        }

        const addToQueue = processBlock(pos, dir);

        if (addToQueue) {
          queue.add(Vector3.new().copyFrom(pos));
        }
      }

      Vector3.release(prevBlockPos);
    }
  }

  getLight(lightData) {
    return dataToLight(lightData);
  }

  static isEmit(lightData) {
    return dataToBlockEmit(lightData) || dataToSkyEmit(lightData);
  }

  static getLight(lightData) {
    return dataToLight(lightData);
  }

  static getSkyLight(lightData) {
    return dataToSkyLight(lightData);
  }

  static getBlockLight(lightData) {
    return dataToBlockLight(lightData);
  }

  static isSkyEmit(lightData) {
    return dataToSkyEmit(lightData);
  }

  static isBlockEmit(lightData) {
    return dataToBlockEmit(lightData);
  }

  static getLightData(skyLight, skyLightDir, skyLightSource, blockLight, blockLightDir, blockLightSource) {
    return packBlockLight(blockLight, blockLightDir, blockLightSource) | packSkyLight(skyLight, skyLightDir, skyLightSource);
  }
}

/**
 * Light data structure ↯
 * 
 *  BlockLightVal  isSource   SkyLightVal  isSource 
 *               ↘        ↘    ↙        ↙   
 *                0101 010 1  0101 010 1    
 *                    ↗              ↖
 *        BlockLightDir              SkyLightDir
 */

function dataToLight(v) {
  return Math.max(dataToBlockLight(v), dataToSkyLight(v) * SKY_LIGHT_FACTOR);
}

function dataToBlockLight(v) {
  return v >> 12 & 0xf;
}

function dataToBlockDir(v) {
  return v >> 9 & 0x7;
}

function dataToBlockEmit(v) {
  return v >> 8 & 0x1;
}

function dataToSkyLight(v) {
  return v >> 4 & 0xf;
}

function dataToSkyDir(v) {
  return v >> 1 & 0x7;
}

function dataToSkyEmit(v) {
  return v & 0x1;
}

function clearBlockLight(v) {
  return (v | 0xff00) ^ 0xff00;
}

function clearSkyLight(v) {
  return (v | 0x00ff) ^ 0x00ff;
}

function invertDir(dir) {
  return dir ^ 0x7;
}

function packBlockLight(v, d, s) {
  return packLight(v, d, s) << 8;
}

function packSkyLight(v, d, s) {
  return packLight(v, d, s);
}

function packLight(v, d, s) {
  return v << 4 | d << 1 | s;
}

const directions = {
  top: 0b010,//2
  bottom: 0b101,//5
  right: 0b100,//4
  left: 0b011,//3
  front: 0b001,//1
  back: 0b110,//6
};

const directionKeys = {}//Can be used for debug purpose

directionKeys[directions.top] = "top";
directionKeys[directions.bottom] = "bottom";
directionKeys[directions.right] = "right";
directionKeys[directions.left] = "left";
directionKeys[directions.front] = "front";
directionKeys[directions.back] = "back";

const directionsArr = [
  directions.top,
  directions.bottom,
  directions.right,
  directions.left,
  directions.front,
  directions.back,
];

const normals = {};

normals[directions.top] = new Vector3(0, 1, 0);
normals[directions.bottom] = new Vector3(0, -1, 0);
normals[directions.right] = new Vector3(1, 0, 0);
normals[directions.left] = new Vector3(-1, 0, 0);
normals[directions.front] = new Vector3(0, 0, 1);
normals[directions.back] = new Vector3(0, 0, -1);

const traverseQueue = new QueueFast();
const reverseQueue = new QueueFast();

const skyLightTraverseQueue = new QueueFast();
const skyLightReverseQueue = new QueueFast();

const infinityVec3 = Vector3.new(Infinity, Infinity, Infinity);
const minusInfinityVec3 = Vector3.new(-Infinity, -Infinity, -Infinity);

let prevNorm, prevNormIvs;