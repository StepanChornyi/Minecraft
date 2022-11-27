import { Black, CapsStyle, DisplayObject, FontStyle, FontWeight, Graphics, TextField, Vector, Rectangle, ColorHelper } from "black-engine";
import ResizeActionComponent from "./../libs/resize-action-component";
import ChunkStorage from "../minecraft/world/chunk-storage";
import HELPERS from "../utils/helpers";

const GRID_SIZE = 500;
const TILE_SIZE = 15;
const LINE_WIDTH = 0.4;

const CHUNK_SPAWN_DIST = 80;
let CURR_CHUNK_SPAWN_DIST = CHUNK_SPAWN_DIST;
const CHUNK_REMOVE_DIST = CHUNK_SPAWN_DIST + 1;

class Chunk2D extends Graphics {
  constructor() {
    super();

    this.gridX = 0;
    this.gridY = 0;

    this._hsv = ColorHelper.rgb2hsv(ColorHelper.hex2rgb(0x88ff88));

    this._isReady = false;
    this._updateView();
  }

  get isReady() {
    return this._isReady;
  }

  set isReady(val) {
    if (this._isReady === val) {
      return;
    }

    this._isReady = val;
    this._updateView();
  }

  _updateView() {
    this._hsv.h = this.isReady ? 0.95 : 0.1;

    this.fillStyle(ColorHelper.rgb2hex(ColorHelper.hsv2rgb(this._hsv)));
    this.beginPath();
    this.rect(LINE_WIDTH, LINE_WIDTH, TILE_SIZE - LINE_WIDTH * 2, TILE_SIZE - LINE_WIDTH * 2);
    this.closePath();
    this.fill();
    // this.stroke();
  }

  static get pool() {
    return pool;
  }
}

const pool = [];

export class InfiniteTest extends DisplayObject {
  constructor() {
    super();

    this.touchable = true;

    this.worldBounds = new Rectangle();
    this.chunkStorage = new ChunkStorage();
    this.chunks = this.chunkStorage.chunks;

    this.pointerInfo = null;

    this._init();
  }

  _init() {
    this.background = this.addChild(new Graphics());
    this.dd = this.addChild(new Graphics());

    this.background.touchable = true;

    this.text = this.addChild(new TextField(' ', 'arial', 0xffffff, 30));
    this.text.scale = 0.5;

    this.on('pointerMove', (_, pointerInfo) => {
      this.onMove(pointerInfo);
    })
  }

  onAdded() {
    this.addComponent(new ResizeActionComponent(this.onResize, this));
  }

  onMove(pointerInfo) {
    pointerInfo = this.globalToLocal(pointerInfo);
    this.pointerInfo = pointerInfo;
  }

  onUpdate() {
    if (this.pointerInfo === null) {
      return;
    }

    const pointerInfo = this.pointerInfo;

    this.deleteChunks(pointerInfo.x, pointerInfo.y);
    this.spawnChunks(pointerInfo.x, pointerInfo.y);
    this.updateReadyStatus();

    this.text.text = `${this.chunks.length}`;
  }

  deleteChunks(playerX, playerY) {
    const playerChunkPosX = Math.floor(playerX / TILE_SIZE);
    const playerChunkPosY = Math.floor(playerY / TILE_SIZE);
    const chunkViewDistance = Math.ceil(Math.max(CURR_CHUNK_SPAWN_DIST, CHUNK_REMOVE_DIST) / TILE_SIZE);

    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];

      if (!chunk || !chunk.visible)
        continue;

      if (HELPERS.isOutOfRadius(chunk.gridX - playerChunkPosX, chunk.gridY - playerChunkPosY, chunkViewDistance)) {
        this.chunkStorage.remove(chunk.gridX, chunk.gridY);

        chunk.visible = false;
        this.removeChild(chunk)
        // Chunk2D.pool.push(chunk);

        i--;
      }
    }
  }

  spawnChunks(playerX, playerY) {
    const playerChunkPosX = Math.floor(playerX / TILE_SIZE);
    const playerChunkPosY = Math.floor(playerY / TILE_SIZE);
    const chunkViewDistance = Math.ceil(CURR_CHUNK_SPAWN_DIST / TILE_SIZE);

    for (let x = -chunkViewDistance + 1; x < chunkViewDistance; x++) {
      for (let y = -chunkViewDistance + 1; y < chunkViewDistance; y++) {
        if (HELPERS.isOutOfRadius(x, y, chunkViewDistance)) {
          continue;
        }

        const chunkX = playerChunkPosX + x;
        const chunkY = playerChunkPosY + y;

        let chunk = this.chunkStorage.get(chunkX, chunkY);

        if (chunk)
          continue;

        chunk = Chunk2D.pool.pop() || this.addChild(new Chunk2D(this));

        chunk.visible = true;
        chunk.isReady = false;

        chunk.gridX = chunkX;
        chunk.gridY = chunkY;
        chunk.x = chunkX * TILE_SIZE;
        chunk.y = chunkY * TILE_SIZE;

        this.chunkStorage.set(chunkX, chunkY, chunk);
      }
    }
  }

  updateReadyStatus() {
    const chunksAround = [
      new Vector(-1, -1),
      new Vector(0, -1),
      new Vector(1, -1),
      new Vector(-1, 0),
      new Vector(1, 0),
      new Vector(-1, 1),
      new Vector(0, 1),
      new Vector(1, 1),
    ];

    for (let i = 0, skip; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];

      if (chunk.isReady) {
        continue;
      }

      skip = false;

      for (let i = 0; i < chunksAround.length; i++) {
        const { x: offsetX, y: offsetY } = chunksAround[i];

        if (!this.chunkStorage.get(chunk.gridX + offsetX, chunk.gridY + offsetY)) {
          chunk.isReady = false;
          skip = true;
          break;
        }
      }

      if (skip)
        continue;

      chunk.isReady = true;
    }
  }

  onResize() {
    const stageBounds = Black.stage.bounds;
    const screenBounds = this.worldBounds.set(
      -stageBounds.width * 0.5 / this.scaleX,
      -stageBounds.height * 0.5 / this.scaleY,
      stageBounds.width / this.scaleX,
      stageBounds.height / this.scaleX,
    );

    this.x = stageBounds.left;
    this.y = stageBounds.top;

    this.background.clear();
    this.background.fillStyle(0x333333);
    this.background.beginPath();
    this.background.rect(0, 0, screenBounds.width, screenBounds.height);
    this.background.closePath();
    this.background.fill();
  }
}