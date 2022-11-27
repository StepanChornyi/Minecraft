import { Black, CanvasRenderTexture, CapsStyle, ColorHelper, DisplayObject, Graphics, RGB, Sprite, Vector } from "black-engine";
import { BLOCK_COLOR, BLOCK_TYPES_TEST } from "./block-types-test";

const S = 16;

export class ChunkTest2D extends Sprite {
  constructor() {
    const texture = new CanvasRenderTexture(S, S, 1);

    super(texture);

    this._blocks = [];

    this._canvas = texture.native;
    this._ctx = this._canvas.getContext('2d');
    this._imageData = this._ctx.getImageData(0, 0, S, S);

      // const arr = [BLOCK_TYPES_TEST.GRASS, BLOCK_TYPES_TEST.ROCK, BLOCK_TYPES_TEST.WATER];

      // for (let y = 0; y < S; y++) {
      //   for (let x = 0; x < S; x++) {

      //     this.setBlock(x, y, rndPick(arr));
      //   }
      // }

      // this.updateView();
  }

  setBlock(x, y, val) {
    this._blocks[this._getBlockIndex(x, y)] = val;
  }

  setColor(x, y, { r, g, b }) {
    const pixel = this._getPixelIndex(x, y);

    this._imageData.data[pixel] = r;
    this._imageData.data[pixel + 1] = g;
    this._imageData.data[pixel + 2] = b;
    this._imageData.data[pixel + 3] = 255;
  }

  updateView() {
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const block = this._blocks[this._getBlockIndex(x, y)];

        if (!block)
          continue;

        this.setColor(x, y, BLOCK_COLOR[block]);
      }
    }

    this._ctx.putImageData(this._imageData, 0, 0);

  }

  _getBlockIndex(x, y) {
    return y * S + x;
  }

  _getPixelIndex(x, y) {
    return this._getBlockIndex(x, y) * 4;
  }
}

function rndPick(arr) {
  const index = Math.round((arr.length - 1) * Math.random());

  return arr[index];
}