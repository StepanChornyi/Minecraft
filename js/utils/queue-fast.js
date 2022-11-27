export default class QueueFast {
  constructor() {
    this._array = [];
    this._headIndex = 0;
  }

  add(e) {
    this._array.push(e);
  }

  peek() {
    return this._array[this._headIndex++];
  }

  reset() {
    if (this._array.length)
      this._array = [];

    this._headIndex = 0;
  }

  get length() {
    return this._array.length - this._headIndex;
  }
}
