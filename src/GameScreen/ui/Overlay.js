import { Graphics } from 'black-engine';

export default class Overlay extends Graphics {
  constructor(alpha = 0.5) {
    super();

    this._alpha = alpha;
  }

  set(bounds) {
    this.clear();
    this.fillStyle(0x000000, this._alpha);
    this.beginPath();
    this.rect(0, 0, bounds.width, bounds.height);
    this.closePath();
    this.fill();

    this.x = bounds.left;
    this.y = bounds.top;
  }
}