import { Black, CapsStyle, DisplayObject, FontStyle, FontWeight, Graphics, TextField, Vector, Rectangle, ColorHelper, Sprite, Texture } from "black-engine";
import ImprovedNoise from "./../libs/improved-noise";
import ResizeActionComponent from "./../libs/resize-action-component";
import Worley from "./../libs/worley-noise";

const KEY_CODES = { W: 87, A: 65, S: 83, D: 68, ARROW_UP: 38, ARROW_DOWN: 40, ARROW_LEFT: 37, ARROW_RIGHT: 39 };
const pressedKeys = window.pressedKeys = window.pressedKeys || {};

window.onkeyup = (e) => { pressedKeys[e.keyCode] = false; }
window.onkeydown = (e) => { pressedKeys[e.keyCode] = true; }

const SIZE = 550;

export class NoiseTest extends DisplayObject {
  constructor() {
    super();

    this._canvas = document.createElement('canvas');
    this._ctx = this._canvas.getContext("2d");

    this._canvas.width = this._canvas.height = SIZE;
    this._noise = new ImprovedNoise();

    this._worley = new Worley();

    this._fillNoise();

    this._init();
  }

  _init() {
    this.background = this.addChild(new Graphics());
    this.view = this.addChild(new Sprite(new Texture(this._canvas)));
  }

  _fillNoise() {
    const ctx = this._ctx;
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;

    let min = Infinity;
    let max = -Infinity;

    const c1 = 0xff8e47;
    const c2 = 0x701d0a;

    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        const i = (y * imageData.width + x) * 4;
        const n = this._getCavesNoise(x, 0, y);
        const v = n * 255;
        const l = Math.round(n * 255) > 80;
        const lf = Math.round(n * 255) > 73 ? (80 - n * 255) / 7 : 1;

        min = Math.min(min, v);
        max = Math.max(max, v);

        const vv = (n * 255) / 80;

        const color = ColorHelper.hex2rgb(ColorHelper.lerpHSV(c1, c2, vv));

        data[i] =  color.r;
        data[i + 1] = color.g;
        data[i + 2] =  color.b;
        data[i + 3] = lf * 255;
      }
    }

    console.log("min ", min);
    console.log("max ", max);

    ctx.putImageData(imageData, 0, 0);

    // ctx.fillStyle = "#FF0000";
    // ctx.fillRect(0, 0, 100, 100);
  }

  _getNoise(x, y, z) {
    let res = 0;
    let q = 12;
    let iter = 3;

    for (var j = 0; j < iter; j++) {
      res += this._noise.noise(x / q, y / q, z / q) * 0.5 + 0.5;
      q *= 1.5;
    }

    return (res / iter);
  }

  _getCavesNoise(x, y, z) {

    const s = 0.04;

    const n = this._worley.Euclidean(x * s, y * s, z * s);

    return n[0];
    let noise = 0;
    let quality = 4;
    let iter = 1;

    x += 100;
    z += 100;

    for (var j = 0; j < iter; j++) {
      // if (j > 0) {
      //   const val = cavesNoise.noise(x / quality, y / quality, z / quality) * quality;

      //   if (val < 0) {
      //     noise -= val;
      //   }
      // } else {
      noise += this._noise.noise(x / quality, y / quality, z / quality);
      // }

      quality *= 2.7;
    }

    return noise / iter;
  }

  onAdded() {
    this.addComponent(new ResizeActionComponent(this.onResize, this));
  }

  onResize() {
    const stageBounds = Black.stage.bounds;
    const screenBounds = new Rectangle(
      -stageBounds.width * 0.5 / this.scaleX,
      -stageBounds.height * 0.5 / this.scaleY,
      stageBounds.width / this.scaleX,
      stageBounds.height / this.scaleX,
    );

    this.x = stageBounds.left;
    this.y = stageBounds.top;

    this.background.clear();
    this.background.fillStyle(0x000000);
    this.background.beginPath();
    this.background.rect(0, 0, screenBounds.width, screenBounds.height);
    this.background.closePath();
    this.background.fill();
  }
}