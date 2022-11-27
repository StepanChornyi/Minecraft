import { Black, CapsStyle, ColorHelper, DisplayObject, Graphics, RGB, Sprite, Vector } from "black-engine";
import ResizeActionComponent from "./../libs/resize-action-component";

const BOARD_SIZE = 60;
const BLOCK_SIZE = 15;
const LINE_WIDTH = 0.2;
const LIGHT_LEVELS = 15;

export class LightTest extends DisplayObject {
  constructor() {
    super();

    this.touchable = true;
    this.blocks = [];

    this.line = new Graphics();
    this.castPoint = new Graphics();

    const vec = new Vector(5, 5);
    const dir = new Vector().copyFrom(vec);

    dir.normalize();

    const unitX = Math.abs(dir.length() / dir.x);
    const unitY = Math.abs(dir.length() / dir.y);

    const unit = new Vector(
      unitX === Infinity ? 10000000000000 : unitX,
      unitY === Infinity ? 10000000000000 : unitY,
    );

    console.log(vec.length());
    console.log(unit.x * vec.x);

    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        const block = new LightBlock();

        block.xx = x;
        block.yy = y;

        block.x = x * BLOCK_SIZE + Black.stage.bounds.left;
        block.y = y * BLOCK_SIZE + Black.stage.bounds.top;

        block.on('pointerDown', (_, evt) => {
          if (evt.button === 2) {
            block.isSolid = !block.isSolid;
          } else if (block.emit) {
            block.emit = 0;
          } else {
            block.emit = LIGHT_LEVELS;
          }

          this.updateLights(true);
        });

        this.add(block);
        this.blocks[x + y * BOARD_SIZE] = block;
      }
    }

    this.add(this.line);
    this.add(this.castPoint);

    this.updateLights();
  }

  drawLine(x0, y0, x1, y1) {
    this.line.clear();
    this.line.lineStyle(1, 0x0066ff);
    this.line.beginPath();
    this.line.moveTo(x0, y0);
    this.line.lineTo(x1, y1);
    this.line.stroke();
    this.line.closePath();
  }

  drawPoint(x, y, color = 0x330033) {
    this.castPoint.fillStyle(color);
    this.castPoint.beginPath();
    this.castPoint.circle(x, y, 2);
    this.castPoint.closePath();
    this.castPoint.fill();
  }

  clearPoints() {
    this.castPoint.clear();
  }

  updateLights(debug = false) {
    for (let i = 0; i < this.blocks.length; i++) {
      this.blocks[i].light = 0;
    }

    for (let i = 0; i < this.blocks.length; i++) {
      if (!this.blocks[i].emit)
        continue;

      const x = i % BOARD_SIZE;
      const y = Math.floor(i / BOARD_SIZE);
      const b = this.getBlock(x, y);

      if (b.emit) {
        if (debug) {
          setTimeout(() => {
            this.arr = [];

            this.updateLFast(LIGHT_LEVELS - 1, x, y, 0, 0, 0, 0, debug);

            for (let i = 0, b; i < this.arr.length; i++) {
              b = this.getBlock(this.arr[i].x, this.arr[i].y);
              b.light = 0;
              b.refill();
            }

            console.log(this.arr.length);

            for (let i = 0, b; i < this.arr.length; i++) {
              setTimeout(() => {
                b = this.getBlock(this.arr[i].x, this.arr[i].y);
                b.light = this.arr[i].l;
                b.refill();

              }, 30 * i);
            }

          }, 300);
        } else {
          this.updateLFast(LIGHT_LEVELS - 1, x, y, 0, 0, 0, 0,);
        }
      }
    }

    for (let i = 0; i < this.blocks.length; i++) {
      this.blocks[i].refill();
    }
  }

  updateLFast(light, x, y, vx, vy, startX, startY, debug = false, fromLol = false) {
    const queue = [];

    const dir = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ];

    for (let i = 0, b; i < dir.length; i++) {
      const [offX, offY] = dir[i];

      b = this.getBlock(x + offX, y + offY);

      if (!b || b.light >= light || b.isSolid) {
        continue;
      }

      b.light = light - 1;

      this.arr.push({ x: x + offX, y: y + offY, l: b.light });

      queue.unshift({ x: x + offX, y: y + offY, l: light, vx: -offX, vy: -offY });
    }

    let count = 0;

    while (queue.length) {
      count++;

      // if (count <= 0) {
      //   console.warn("O__O");
      //   return;
      // }


      const conf = queue.pop();

      for (let i = 0, b; i < dir.length; i++) {
        const [offX, offY] = dir[i];

        if (offX === conf.vx && offY === conf.vy) {
          continue;
        }

        b = this.getBlock(conf.x + offX, conf.y + offY);

        if (!b || b.light >= conf.l - 1 || b.isSolid) {
          continue;
        }

        b.light = conf.l - 1;

        this.arr.push({ x: conf.x + offX, y: conf.y + offY, l: b.light });

        queue.unshift({ x: conf.x + offX, y: conf.y + offY, l: b.light, vx: conf.vx, vy: conf.vy });
      }
    }

    console.log(count);
  }

  updateL(light, x, y, vecX, vecY, startX, startY, debug = false, fromLol = false) {
    const dir = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ];

    for (let i = 0, b; i < dir.length; i++) {
      const [offX, offY] = dir[i];

      if (offX === vecX && offY === vecY)
        continue;

      b = this.getBlock(x + offX, y + offY);

      if (!b || b.light >= light || b.isSolid) {
        continue;
      }

      b.light = light;

      this.arr.push({ x: x + offX, y: y + offY, l: light });

      // if (debug) {
      //   b.refill();
      // }

      if (light > 1) {
        if (fromLol)
          return;

        this.updateL(light - 1, x + offX, y + offY, -offX, -offY, startX, startY, true);
      }
    }
  }

  getBlock(x, y) {
    if (x < 0 || x >= BOARD_SIZE)
      return null;

    if (y < 0 || y >= BOARD_SIZE)
      return null;

    return this.blocks[x + y * BOARD_SIZE];
  }
}

class LightBlock extends Graphics {
  constructor() {
    super();

    this._emit = 0;
    this._light = 0;
    this._isSolid = false;

    this.myColor = 0xffffff;

    this.touchable = true;

    this.refill();
  }

  get emit() {
    return this._isSolid ? 0 : this._emit;
  }

  set emit(val) {
    if (val === 0) {
      this._emit = val;
    } else {
      this._emit = LIGHT_LEVELS;
    }
  }

  get light() {
    return this._light;
  }

  set light(val) {
    this._light = val;
  }

  get isSolid() {
    return this._isSolid;
  }

  set isSolid(val) {
    this._isSolid = val;
  }

  refill() {
    this.clear();

    // this.fillStyle(this.emit > 0 ? 0xffffff : 0x000000);
    this.fillStyle(0x000000);
    this.beginPath();
    this.rect(0, 0, BLOCK_SIZE, BLOCK_SIZE);
    this.closePath();
    this.fill();

    const rgb = lerpRGB(minRGB, ColorHelper.hex2rgb(this.myColor), Math.max(this.light, this.emit) / LIGHT_LEVELS);

    if (this.isSolid) {
      rgb.r = 28;
      rgb.g = 10;
      rgb.b = 10;
    }

    this.fillStyle(ColorHelper.rgb2hex(rgb));
    this.beginPath();
    this.rect(LINE_WIDTH, LINE_WIDTH, BLOCK_SIZE - LINE_WIDTH * 2, BLOCK_SIZE - LINE_WIDTH * 2);
    this.closePath();
    this.fill();
  }
}

const minRGB = new RGB(51, 51, 51);
const maxRGB = new RGB(242, 223, 170);

function lerpRGB(rgbA, rbgB, t) {
  return new RGB(
    lerp(rgbA.r, rbgB.r, t),
    lerp(rgbA.g, rbgB.g, t),
    lerp(rgbA.b, rbgB.b, t),
  );
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function sign(x) {
  return x < 0 ? -1 : 1;
}

