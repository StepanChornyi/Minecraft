
export default class Flags {
  constructor(initialValue = 0) {
    this._value = initialValue;
  }

  get(flags) {
    return (this._value & flags) === flags;
  }

  set(flags, val = true) {
    if (val) {
      this._value = this._value | flags;
    } else {
      this._value = (this._value | flags) ^ flags;
    }
  }

  remove(flags) {
    this.set(flags, false);
  }

  clear(newVal = 0) {
    this._value = newVal;
  }
}