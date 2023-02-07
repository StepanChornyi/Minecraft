import { DisplayObject, Rectangle } from 'black-engine';

export default class FixedSizeDisplayObject extends DisplayObject {
  constructor(width = 0, height = 0) {
    super();

    this._width = width;
    this._height = height;
  }

  _getFixedBounds(outRect) {
    return outRect.set(0, 0, this._width, this._height);
  }

  onGetLocalBounds(outRect = new Rectangle()) {
    return this._getFixedBounds(outRect);
  }

  get bounds() {
    return this.getBounds();
  }

  getBounds(...args) {
    return super.getBounds(args[0], false, args[2]);
  }
}