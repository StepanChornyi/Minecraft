import { Rectangle, DisplayObject, Black, Sprite, Graphics, MessageDispatcher } from 'black-engine';
import ItemIcon from './item-icon';

export default class InventoryModel extends MessageDispatcher {
  constructor(cols, rows) {
    super();

    this.cols = cols;
    this.rows = rows;
    this.slotsCount = cols * rows;

    this._items = [];
  }

  getItem(x, y) {
    return  this.getItemByIndex(this.getSlotIndex(x, y));
  }

  getItemByIndex(index) {
    return this._items[index];
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

    if(this._items[index]){
      this.post("itemMove", index);
    }
  }

  indexOf(item) {
    return this._items.indexOf(item);
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

export class Item extends MessageDispatcher {
  constructor(type) {
    super();

    this._icon = new ItemIcon(type);

    this._type = type;
    this._count = Infinity;
  }

  get type() {
    return this._type;
  }

  get icon() {
    return this._icon;
  }
}
