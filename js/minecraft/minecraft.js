import { Component, DisplayObject, Black } from 'black-engine';

import Camera from './camera';
import Cursor from './meshes/cursor';
import WEBGL_UTILS from '../utils/webgl-utils';
import World from './world/world';
import Player from './player';
import LoadingMesh from './meshes/loading-mesh';
import LoadingBg from './meshes/loading-bg';
import Raycaster from './raycaster';
import ResizeActionComponent from '../libs/resize-action-component';
import Vector3 from '../utils/vector3';
import Ui from './ui/ui';
import { BLOCK_SOUND, BLOCK_TRANSPARENCY, BLOCK_TYPE, SOUND_VOL } from './block-type';
import PlayerMesh from './meshes/player-mesh';
import Blockk from './meshes/blockk';
import SelectedBlockMesh from './meshes/selected-block-mesh';
import SkyMesh from './meshes/sky-mesh';
import ParticlesMesh from './meshes/particles-mesh';
import BlocksManager from './world/blocks/BlocksManager';
import CONFIG from './world/config';

const canvas = document.getElementById("canvas3D");
const gl = WEBGL_UTILS.getWebGlContext(canvas);

gl.clearColor(0.3, 0.3, 0.3, 1);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export default class Minecraft extends DisplayObject {
  constructor() {
    super();

    // console.log(gl.getSupportedExtensions());

    gl.getExtension('OES_standard_derivatives') ||
      gl.getExtension('MOZ_OES_standard_derivatives') ||
      gl.getExtension('WEBKIT_OES_standard_derivatives')

    // gl.getExtension('OES_standard_derivatives');

    this.camera = new Camera();
    this.cursor = new Cursor(gl);
    this.world = new World(gl, this.camera);
    this.player = new Player(this.world, this.camera);
    this.loadingBg = new LoadingBg(gl);
    this.loadingMesh = new LoadingMesh(gl);
    this.playerMesh = new PlayerMesh(gl);
    this.selectedBlock = new SelectedBlockMesh(gl);
    this.skyMesh = new SkyMesh(gl);
    this.blockk = new Blockk(gl, this.world);
    this.particles = new ParticlesMesh(gl, this.world);

    this.raycaster = new Raycaster(this.world);

    this.ui = this.addChild(new Ui());

    this.ui.visible = false;

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
    this.loadingMesh.visible = true;
    this.loadingMesh.setProgress(0);
    this.loadingMesh.render(this.camera);

    this.world.on('initProgress', (_, val) => {
      document.getElementById("loadingBar").style.width = `${Math.min(1, val * 1.05) * 100}%`;
      document.getElementById("loading").style.display = "none"

      this.loadingMesh.setProgress(Math.min(1, val * 1.05));
    });

    this.world.on('initCompleted', () => {
      document.getElementById("loading").style.display = "none"
      this.loadingMesh.visible = false;
      this.ui.visible = true;

      // setTimeout(() => {
      //   const torchX = 2;
      //   const torchZ = 2;
      //   const torchY = this.world.getGroundY(torchX, torchZ) + 1;

      //   if (!this.world.getBlock(torchX, torchY, torchZ)) {
      //     this.world.setBlock(torchX, torchY, torchZ, BLOCK_TYPE.TORCH);
      //   }
      // }, 50);
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

  onRender() {
    const world = this.world;
    const camera = this.camera;

    this._frameTime = performance.now() - this._lastFrameTime;
    this._lastFrameTime = performance.now();

    gl.colorMask(false, false, false, false);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.colorMask(true, true, true, false);

    if (this.loadingMesh.visible) {
      this.loadingBg.render(camera);
      this.loadingMesh.render(camera);
      return;
    }

    this.skyMesh.render(camera);

    // const intersection = this.castRayFromCamera();

    // const { chunkX, chunkZ, blockX, blockZ } = intersection ? world.getChunkCoord(intersection[0], intersection[2]) : {};

    for (let i = 0; i < world.chunks.length; i++) {
      const chunk = world.chunks[i];

      if (!chunk.visible)
        continue;

      for (let j = 0; j < chunk.subChunks.length; j++) {
        chunk.subChunks[j].mesh.render(camera);
      }

    }

    this.particles.render(camera);

    for (let i = 0; i < world.chunks.length; i++) {
      const chunk = world.chunks[i];

      if (!chunk.visible)
        continue;

      for (let j = 0; j < chunk.subChunks.length; j++) {
        chunk.subChunks[j].transparentMesh.render(camera);
      }
    }

    // this.blockk.render(camera);
    // this.playerMesh.render(camera);


    if (this.selectedBlock.visible) {
      this.selectedBlock.render(camera);
    }

    this.cursor.render(camera);
  }

  update(dt) {
    if(  (Date.now()-this._startTime)/1000 <300 ){
      this.world.onUpdate();
    }
    if (this.loadingMesh.visible)
      return;

    this.player.onUpdate(dt);

    this.skyMesh.x = this.player.x;
    this.skyMesh.y = this.player.y;
    this.skyMesh.z = this.player.z;

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