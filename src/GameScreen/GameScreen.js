import { Component, DisplayObject, Black } from 'black-engine';

import Camera from '../Utils3D/Camera';
import Cursor from './meshes/Cursor/Cursor';
import WEBGL_UTILS from '../utils/webgl-utils';
import World from './world/world';
import Player from './player';
import TileRaycaster3D from '../Utils3D/TileRaycaster3D';
import ResizeActionComponent from '../libs/resize-action-component';
import Vector3 from '../Utils3D/vector3';
import Ui from './ui/ui';
import { BLOCK_SOUND, BLOCK_TRANSPARENCY, BLOCK_TYPE, SOUND_VOL } from './block-type';
import PlayerMesh from './meshes/player-mesh';
import Blockk from './meshes/blockk';
import SelectedBlockMesh from './meshes/selected-block-mesh';
import SkyMesh from './meshes/sky-mesh';
import ParticlesMesh from './meshes/particles-mesh';
import BlocksManager from './world/blocks/BlocksManager';
import CONFIG from './world/config';
import FallingBlockEntity from './entities/FallingBlockEntity/FallingBlockEntity';
import Drop from './entities/Drop/Drop';
import FrameBuffer from '../Utils3D/FrameBuffer';
import Quad from './meshes/Quad/Quad';
import Shadow from './meshes/shadow/Shadow';

const canvas = document.getElementById("canvas3D");
const gl = WEBGL_UTILS.getWebGlContext(canvas);

gl.clearColor(0.3, 0.3, 0.3, 1);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export default class GameScreen extends DisplayObject {
  constructor() {
    super();

    this.touchable = true;



    // console.log(gl.getSupportedExtensions());

    gl.getExtension('OES_standard_derivatives') ||
      gl.getExtension('MOZ_OES_standard_derivatives') ||
      gl.getExtension('WEBKIT_OES_standard_derivatives')

    // gl.getExtension('OES_standard_derivatives');

    this.camera = new Camera();
    this.cursor = new Cursor(gl);
    this.world = new World(gl, this.camera);
    this.player = new Player(this.world, this.camera);
    this.playerMesh = new PlayerMesh(gl);
    this.selectedBlock = new SelectedBlockMesh(gl);
    this.skyMesh = new SkyMesh(gl);
    this.blockk = new Blockk(gl, this.world);
    this.particles = new ParticlesMesh(gl, this.world);
    this.shadow = new Shadow(gl);

    const pos3D = glMatrix.vec4.create();
    const tmp = glMatrix.vec4.create();
    const tmp2 = glMatrix.vec4.create();

    pos3D[0] = 8;
    pos3D[1] = 25;
    pos3D[2] = 8;
    pos3D[3] = 1;

    const pp = this.particles.emitOne(pos3D[0], pos3D[1], pos3D[2], BLOCK_TYPE.CACTUS);

    pp.isStatic = true;
    // viewMatrix

    // projectionMatrix



    window.addEventListener("keydown", (e) => {
      if (e.code === "KeyR") {
        glMatrix.vec4.copy(tmp, pos3D);


        glMatrix.vec4.transformMat4(tmp, tmp, this.camera.viewMatrix);

        console.log("viewSpace: ", ...tmp);

        glMatrix.vec4.transformMat4(tmp, tmp, this.camera.projectionMatrix);



        // glMatrix.vec4.transformMat4(tmp, tmp, this.camera.projectionMatrix);

        // console.log("proj: ", ...tmp);
        // console.log("normalizedProjection: ", tmp[0]/tmp[3], tmp[1]/tmp[3], tmp[2]/tmp[3]);

        const ivsProj = glMatrix.mat4.invert(glMatrix.mat4.create(), this.camera.projectionMatrix)
        // const ivsView = glMatrix.mat4.invert(glMatrix.mat4.create(), this.camera.viewMatrix)


        console.log("proj: ", ...tmp);

        tmp[0] = tmp[0]/tmp[3];
        tmp[1] = tmp[1]/tmp[3];
        tmp[2] = tmp[2]/tmp[3];
        tmp[3] = 1;

        // const vec3 = glMatrix.vec4.create();

        // console.log([tmp[0]/tmp[3], tmp[1]/tmp[3], tmp[2]]);

        // glMatrix.vec4.transformMat4(tmp, tmp, ivsView);
        glMatrix.vec4.transformMat4(tmp, tmp, ivsProj);

        tmp[0] = tmp[0]/tmp[3];
        tmp[1] = tmp[1]/tmp[3];
        tmp[2] = tmp[2]/tmp[3];


        console.log("ViewRestore: ", ...tmp);

        // console.log("normalizedProjectionRestore: ",  tmp[0]/tmp[3], tmp[1]/tmp[3], tmp[2]/tmp[3]);


        // console.log([...tmp]);
        console.log("============");

      }


    });

    this.frameBuffer = new FrameBuffer(gl);
    this.quad = new Quad(gl);

    this.quad.texture = this.frameBuffer.renderBuffer;

    this.entities = [];

    this.world.on("createBlockEntity", (_, pos, blockType) => {
      const fallingBlockEntity = new FallingBlockEntity(gl, this.world, pos, blockType);

      fallingBlockEntity.messages.once('spawnBlock', (_, [x, y, z], blockType) => {
        this.world.setBlock(x, y, z, BlocksManager.create(blockType));
      });

      this.entities.push(fallingBlockEntity);
    });

    this.raycaster = new TileRaycaster3D((x, y, z) => {
      const block = this.world.getBlock(x, y, z);

      return block && !block.isAir;
    });

    this.ui = this.addChild(new Ui());

    this.isPaused = false;

    this._startTime = Date.now();

    this._lastFrameTime = 0;
    this._frameTime = 0;

    this.init();
    this.start();
  }

  start() {
    let prevTime = 0, dt, desiredDt = 16.66666666;

    const loop = (time) => {
      dt = Math.min(100, time - prevTime);

      this.update((isNaN(dt) ? 0 : dt) / desiredDt);

      prevTime = time;

      requestAnimationFrame(loop);
    };

    loop();
  }

  init() {
    this._initCompleted = false;

    this.world.on('initProgress', (_, val) => {
      this.post('initProgress', Math.min(1, val * 1.05));
    });

    this.world.on('initCompleted', () => {
      this._initCompleted = true;

      this.post('initCompleted');
    });

    const player = this.player;

    player.x = 8;
    player.z = 8;
    player.y = this.world.getGroundY(player.x, player.z) + 5;

    player.cameraRotation[0] = 0//-Math.PI * 0.3;
    player.cameraRotation[1] = Math.PI * 0.25;

    this.world.on("showParticles", (_, x, y, z, type) => {
      this.particles.emit(x, y, z, type, 15);
    });

    player.on('leftClick', () => {
      const intersection = this.castRayFromCamera();

      if (!intersection) {
        return;
      }

      const block = this.world.getBlock(intersection[0], intersection[1], intersection[2]);

      if (block && block.isType(BLOCK_TYPE.BEDROCK) && intersection[1] === 0) {
        return;
      }

      this.world.destroy(intersection[0], intersection[1], intersection[2]);

      const drop = new Drop(gl, this.world, block.type, player);

      drop.body.x = intersection[0] + 0.5;
      drop.body.y = intersection[1] + 0.5;
      drop.body.z = intersection[2] + 0.5;

      this.entities.push(drop);

      drop.once("collected", () => {
        Black.audio.play("item", "master", 0.4);

        this.ui.collectItem(drop.blockType);
      });

      if (BLOCK_SOUND[block.type]) {
        const dx = intersection[0] - player.x;
        const dy = intersection[1] - player.y;
        const dz = intersection[2] - player.z;

        const name = BLOCK_SOUND[block.type];
        const vol = SOUND_VOL[name] * Math.min(1, 1.5 / Math.sqrt(dx * dx, dy * dy, dz * dz));

        Black.audio.play(name + (Math.floor(Math.random() * 4) % 4 + 1), "master", vol);
      }
    });

    player.on('rightClick', () => {
      const intersection = this.castRayFromCamera();
      const blockType = this.ui.getActiveBlockType();

      if (intersection === null ||
        (intersection[4] < CONFIG.MIN_BLOCK_Y || intersection[4] > CONFIG.MAX_BLOCK_Y) ||
        (blockType !== BLOCK_TYPE.TORCH && player.isCollideWithBlock(intersection[3], intersection[4], intersection[5]))
      ) {
        return;
      }

      const currentBlock = this.world.getBlock(intersection[3], intersection[4], intersection[5]);

      if (intersection && (!currentBlock || currentBlock.isAir)) {
        this.world.setBlock(intersection[3], intersection[4], intersection[5], BlocksManager.create(blockType));

        if (BLOCK_SOUND[blockType]) {
          const dx = intersection[3] - player.x;
          const dy = intersection[4] - player.y;
          const dz = intersection[5] - player.z;

          const name = BLOCK_SOUND[blockType];
          const vol = SOUND_VOL[name] * Math.min(1, 1.5 / Math.sqrt(dx * dx, dy * dy, dz * dz));

          Black.audio.play(name + (Math.floor(Math.random() * 4) % 4 + 1), "master", vol);
        }
      }
    });
  }

  onAdded() {
    Black.engine.on('pause', () => {
      this.isPaused = true;
    });
    Black.engine.on('unpaused', () => {
      this.isPaused = false;
    });

    this.addComponent(new ResizeActionComponent(this.onResize, this));
  }

  renderGL() {
    const world = this.world;
    const camera = this.camera;

    this._frameTime = performance.now() - this._lastFrameTime;
    this._lastFrameTime = performance.now();

    this.skyMesh.render(camera);

    // const intersection = this.castRayFromCamera();

    // const { chunkX, chunkZ, blockX, blockZ } = intersection ? world.getChunkCoord(intersection[0], intersection[2]) : {};

    this.frameBuffer.bind()

    for (let i = 0; i < world.chunks.length; i++) {
      const chunk = world.chunks[i];

      if (!chunk.visible)
        continue;

      for (let j = 0; j < chunk.subChunks.length; j++) {
        // chunk.subChunks[j].mesh.render(camera);
        chunk.subChunks[j].mesh.renderShadow(camera);
      }

    }

    this.frameBuffer.unbind();

    
    for (let i = 0; i < world.chunks.length; i++) {
      const chunk = world.chunks[i];

      if (!chunk.visible)
        continue;

      for (let j = 0; j < chunk.subChunks.length; j++) {
        chunk.subChunks[j].mesh.render(camera);
        // chunk.subChunks[j].mesh.renderShadow(camera);
      }

    }

    this.shadow.texture = this.frameBuffer.renderBuffer;

    this.quad.render(camera);

    this.shadow.render(camera);

    this.particles.render(camera);

    for (let i = 0; i < world.chunks.length; i++) {
      const chunk = world.chunks[i];

      if (!chunk.visible)
        continue;

      for (let j = 0; j < chunk.subChunks.length; j++) {
        chunk.subChunks[j].transparentMesh.render(camera);
      }
    }


    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].render(camera);
    }

    // this.blockk.render(camera);
    // this.playerMesh.render(camera);


    if (this.selectedBlock.visible) {
      this.selectedBlock.render(camera);
    }

    this.cursor.render(camera);
  }

  update(dt) {
    this.world.onUpdate();

    if (!this._initCompleted)
      return;

    this.player.onUpdate(dt);

    this.skyMesh.position = this.player.position;

    const entities = [];

    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].onUpdate(dt);

      if (!this.entities[i].isDestroyed) {
        entities.push(this.entities[i]);
      }
    }

    this.entities = entities;

    this._updateSelectedBlock();

    // const selectedPos = Vector3.tmp.fromArr3(this.camera.direction).multiplyScalar(3).addArr3(this.camera.position);

    // this.playerMesh.onUpdate(dt);
    // this.blockk.onUpdate(dt);

    this._updateDebug();
  }

  _updateSelectedBlock() {
    const intersection = this.castRayFromCamera();

    if (intersection) {
      const { chunkX, chunkZ, blockX, blockZ } = this.world.getChunkCoord(intersection[0], intersection[2]);
      const blockY = intersection[1];
      const sel = this.selectedBlock;

      if (sel.prevIntersection.x !== blockX || sel.prevIntersection.y !== blockY || sel.prevIntersection.z !== blockZ) {
        const available = [];

        for (const key in directions) {
          if (Object.hasOwnProperty.call(directions, key)) {
            const block = this.world.getBlock(
              intersection[0] + directions[key][0],
              intersection[1] + directions[key][1],
              intersection[2] + directions[key][2],
            );

            if (block.isTransparent) {
              available.push(key);
            }
          }
        }

        this.selectedBlock.updateMesh(available);

        this.selectedBlock.x = chunkX * CONFIG.CHUNK_SIZE + blockX;
        this.selectedBlock.y = blockY;
        this.selectedBlock.z = chunkZ * CONFIG.CHUNK_SIZE + blockZ;
      }

      this.selectedBlock.visible = true;
    } else {
      this.selectedBlock.visible = false;
    }
  }

  _updateDebug() {
    const debugLog = this.ui.getDebugLog();

    debugLog.setPosition(this.player.x, this.player.y, this.player.z);
    debugLog.setRenderTime(this._frameTime);
  }

  castRayFromCamera() {
    const castRange = 15;
    const a = Vector3.new().fromArr3(this.camera.position);
    const b = Vector3.new()
      .fromArr3(this.camera.direction)
      .multiplyScalar(castRange)
      .add(a);

    const result = this.raycaster.cast(a, b, castRange);

    Vector3.releaseMul(a, b);

    return result;
  }

  onResize() {
    canvas.width = window.innerWidth * Black.device.pixelRatio;
    canvas.height = window.innerHeight * Black.device.pixelRatio;

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    gl.viewport(0, 0, canvas.width, canvas.height);

    this.camera.aspect = canvas.width / canvas.height;

    this.frameBuffer.setSize(canvas.width, canvas.height, 0.5);
  }
}

const directions = {
  right: [1, 0, 0],
  left: [-1, 0, 0],
  top: [0, 1, 0],
  bottom: [0, -1, 0],
  front: [0, 0, 1],
  back: [0, 0, -1],
}