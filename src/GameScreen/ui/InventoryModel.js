import { Rectangle, DisplayObject, Black, Sprite, Graphics, MessageDispatcher } from 'black-engine';

export default class InventoryModel extends MessageDispatcher {
  constructor(cols, rows) {
    super();

    this.cols = cols;
    this.rows = rows;
    this.slotsCount = cols * rows;

    this._items = [];
  }

  getItem(x, y) {
    return this._items[this.getSlotIndex(x, y)];
  }

  addItem(itemType) {

    for (let i = 0; i < this.slotsCount; i++) {
      const item = this._items[i];

      if (item && item.type === itemType) {
        item.count++;

        return this.post("change");
      }
    }

    for (let i = 0; i < this.slotsCount; i++) {
      const item = this._items[i];

      if (!item) {
        this._items[i] = new Item(itemType);

        return this.post("change");
      }
    }
  }

  removeItem(item) {
    const index = this._items.indexOf(item);

    if (index >= 0) {
      this._items[index] = null;
      this.post("change");
    }
  }

  moveItem(index, newIndex) {
    const item = this._items[index];

    this._items[index] = this._items[newIndex];
    this._items[newIndex] = item;

    this.post("change");
  }

  get items() {
    return this._items;
  }

  getSlotIndex(x, y) {
    return y * this.cols + x;
  }

  get itemsCols() {
    return this.cols;
  }

  get itemsRows() {
    return this.rows;
  }
}

class Item extends MessageDispatcher {
  constructor(type) {
    super();

    this._type = type;
    this._count = Infinity;
  }

  get type() {
    return this._type;
  }
}
