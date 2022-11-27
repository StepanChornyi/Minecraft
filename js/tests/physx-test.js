import { Black, CapsStyle, DisplayObject, FontStyle, FontWeight, Graphics, TextField, Vector, Rectangle, ColorHelper } from "black-engine";
import ResizeActionComponent from "./../libs/resize-action-component";

const GRID_SIZE = 100;
const TILE_SIZE = 40;
const LINE_WIDTH = 0.4;

const KEY_CODES = { W: 87, A: 65, S: 83, D: 68, ARROW_UP: 38, ARROW_DOWN: 40, ARROW_LEFT: 37, ARROW_RIGHT: 39 };
const pressedKeys = window.pressedKeys = window.pressedKeys || {};

window.onkeyup = (e) => { pressedKeys[e.keyCode] = false; }
window.onkeydown = (e) => { pressedKeys[e.keyCode] = true; }

export class PhysXTest extends DisplayObject {
  constructor() {
    super();

    this.touchable = true;

    this.tiles = [];

    this.acceleration = new Vector();
    this.velocity = new Vector();
    this.damping = new Vector(0.5, 0.5, 0.5);

    this.worldBounds = new Rectangle();

    this._init();
  }

  _init() {
    this.background = this.addChild(new Graphics());

    this.view = this.addChild(new Graphics());
    this.rect1 = new Rectangle(100, 100, 150, 150);
    this.rect2 = new Rectangle(500, 300, 200, 200);
  }

  onAdded() {
    this.addComponent(new ResizeActionComponent(this.onResize, this));
  }

  onUpdate() {
    this._checkControls();

    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;

    this._updateCollision();

    this.rect1.x += this.velocity.x;
    this.rect1.y += this.velocity.y;

    this.velocity.x *= this.damping.x;
    this.velocity.y *= this.damping.y;
  }

  _updateCollision() {
    const rect1 = this.rect1;
    const rect2 = this.rect2;

    let oldX = rect1.x;
    let oldY = rect1.y;

    rect1.x += this.velocity.x;
    rect1.y += this.velocity.y;

    if (AA_BB(rect1, rect2)) {
      const dist = getMinDist(rect1, rect2);

      // } else {
      // }



      console.log(dist.x.toFixed(2), dist.y.toFixed(2));

      oldX += this.velocity.x + dist.x;
      oldY += this.velocity.y + dist.y;

      if (dist.x) {
        this.velocity.x = 0;
      } else {
        this.velocity.y = 0;
      }
    }


    this.rect1.x = oldX;
    this.rect1.y = oldY;
  }

  _checkControls() {
    const SPEED = 2.543;

    let a = new Vector();

    if (pressedKeys[KEY_CODES.A] || pressedKeys[KEY_CODES.ARROW_LEFT]) {
      a.x = -1;
    } else if (pressedKeys[KEY_CODES.D] || pressedKeys[KEY_CODES.ARROW_RIGHT]) {
      a.x = 1;
    }
    if (pressedKeys[KEY_CODES.W] || pressedKeys[KEY_CODES.ARROW_UP]) {
      a.y = -1;
    } else if (pressedKeys[KEY_CODES.S] || pressedKeys[KEY_CODES.ARROW_DOWN]) {
      a.y = 1;
    }

    a.normalize().multiplyScalar(SPEED);

    this.acceleration.x = a.x;
    this.acceleration.y = a.y;
  }

  onRender() {
    const rects = [this.rect1, this.rect2];
    const hsv = ColorHelper.rgb2hsv(ColorHelper.hex2rgb(0x88ff88));

    this.view.clear();

    for (let i = 0; i < rects.length; i++) {
      this.view.fillStyle(ColorHelper.rgb2hex(ColorHelper.hsv2rgb(hsv)));
      this.view.beginPath();
      this.view.rect(rects[i].x, rects[i].y, rects[i].width, rects[i].height);
      this.view.closePath();
      this.view.fill();

      hsv.h += i + 0.3;
      hsv.h %= 1;
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

function AA_BB(boxA, boxB) {
  return (
    boxA.left < boxB.right &&
    boxA.right > boxB.left &&
    boxA.top < boxB.bottom &&
    boxA.bottom > boxB.top
  );
}

function getMinDist(boxA, boxB) {
  const distX = getMinDist1D(boxA.left, boxA.right, boxB.left, boxB.right);
  const distY = getMinDist1D(boxA.top, boxA.bottom, boxB.top, boxB.bottom);

  const outVector = new Vector();

  if (Math.abs(distX) < Math.abs(distY)) {
    outVector.x = distX;
  } else {
    outVector.y = distY;
  }

  return outVector;
}

function getMinDist1D(aMin, aMax, bMin, bMax) {
  return ((aMin + aMax) * 0.5 - (bMin + bMax) * 0.5 < 0) ? bMin - aMax : bMax - aMin;
}
