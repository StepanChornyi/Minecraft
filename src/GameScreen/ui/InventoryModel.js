import { Rectangle, DisplayObject, Black, Sprite, Graphics, MessageDispatcher } from 'black-engine';
import FixedSizeDisplayObject from '../../libs/FixedSizeDisplayObject';
import ItemIcon from './item-icon';

const itemsCols = 9;
const itemsRows = 4;
const slotsCount = itemsCols * itemsRows;

export default class InventoryModel extends MessageDispatcher {
  constructor() {
    super();

    this._items = [];
  }

  getItem(x, y) {
    return this._items[this.getSlotIndex(x, y)];
  }

  addItem(itemType) {

    for (let i = 0; i < slotsCount; i++) {
      const item = this._items[i];

      if (item && item.type === itemType) {
        item.count++;

        return this.post("change");
      }
    }

    for (let i = 0; i < slotsCount; i++) {
      const item = this._items[i];

      if (!item) {
        this._items[i] = new Item(itemType);

        return this.post("change");
      }
    }
  }

  get items() {
    return this._items;
  }

  getSlotIndex(x, y) {
    return y * itemsCols + x;
  }

  get itemsCols() {
    return itemsCols;
  }

  get itemsRows() {
    return itemsRows;
  }

  get slotsCount() {
    return slotsCount;
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
