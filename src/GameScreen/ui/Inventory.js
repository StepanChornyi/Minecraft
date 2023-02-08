import { Rectangle, DisplayObject, Black, Sprite, Graphics, TextField } from 'black-engine';
import FixedSizeDisplayObject from '../../libs/FixedSizeDisplayObject';
import ItemIcon from './item-icon';

const slotSize = 25;

export default class Inventory extends FixedSizeDisplayObject {
  constructor(model) {
    super();

    this.touchable = true;

    this._model = model;
    this._bg = null;
    this._slots = [];
    this._items = [];

    this._init();

    model.on("change", () => {
      this._update();
    })


    this._update();

    // this.setSliderPosition(5);
  }

  // setSliderPosition(pos) {
  //   const slider = this._slider;

  //   slider.alignAnchor(0.5, 0.5);

  //   this._setCenter(slider, pos);
  // }

  // setItems(items) {
  //   for (let i = 0; i < items.length; i++) {
  //     this._icons[i].setBlockType(items[i]);
  //   }
  // }

  // _setCenter(obj, pos) {
  //   obj.x = 20 + 35.7 * pos;
  //   obj.y = 20;
  // }

  _init() {
    const model = this._model;
    const bg = this._bg = new Sprite('craftingMenu');
    const slotsContainer = this._slotsContainer = new DisplayObject();
    const itemsContainer = this._itemsContainer = new DisplayObject();

    bg.scale = 0.5;
    bg.touchable = true;
    // const slider = this._slider = new Sprite('inventoryBarSlider');

    // for (let i = 0; i < 9; i++) {
    //   const icon = new ItemIcon();

    //   this._setCenter(icon, i);

    //   this._icons.push(icon);
    // }  

    itemsContainer.touchable = true;
  
    // slotsContainer.touchable = true;

    for (let y = 0; y < model.itemsRows; y++) {
      for (let x = 0; x < model.itemsCols; x++) {
        const slot = new ItemSlot();
        const index = model.getSlotIndex(x, y);

        slot.touchable = true;

        slot._text && (slot._text.text = `${index}`);

        this._slots[index] = slot;

        this._alignSlot(slot, x, y, index);

        slotsContainer.add(slot);
      }
    }

    this.add(bg, slotsContainer, itemsContainer);
  }

  _update() {
    const model = this._model;
    const modelItems = model.items;
    const items = this._items;
    const slots = this._slots;

    for (let i = 0, item; i < model.slotsCount; i++) {
      if (!modelItems[i] && !items[i])
        continue;

      if (!modelItems[i] && items[i]) {
        this._itemsContainer.removeChild(items[i]);
        items[i] = null;
        continue;
      }

      if (modelItems[i] && !items[i]) {
        item = items[i] = new ItemIcon();

        this._itemsContainer.addChild(item);

        item.on('released', () => {
          const newItemIndex = this._getSlotIndex(item.x, item.y);

          if (newItemIndex < 0) {
            this._alignItem(i);
          } else {
            this._model.moveItem(i, newItemIndex);
          }
        })
      }

      item = items[i];

      this._alignItem(i);

      item.setBlockType(modelItems[i].type);
    }
  }

  _alignItem(index) {
    const item = this._items[index];

    item.scale = 0.85;

    item.x = this._slots[index].x + slotSize * 0.5;
    item.y = this._slots[index].y + slotSize * 0.5;
  }

  _getSlotIndex(x, y) {
    for (let i = 0; i < this._slots.length; i++) {
      const slot = this._slots[i];

      if (x > slot.x && x < slot.x + slotSize && y > slot.y && y < slot.y + slotSize) {
        return i;
      }
    }

    return -1;
  }

  _alignSlot(slot, x, y, index) {
    const offsetTop = 122;
    const offsetLeft = 8;
    const size = 25;
    const offset = 2;

    // slot.draw(size);

    slot.x = offsetLeft + x * (size + offset);

    if (index < 9) {
      slot.y = offsetTop + 87;
    } else {
      slot.y = offsetTop + (y - 1) * (size + offset);
    }
  }

  _getFixedBounds(outRect) {
    return outRect.set(0, 0, this._bg.width, this._bg.height);
  }
}

class ItemSlot extends Graphics {
  constructor() {
    super();

    // const text = this._text = new TextField("ASD");

    // this.addChild(text);


    this._itemIcon = null;
  }

  draw(size) {
    this.fillStyle(0xff0000, 0.5)
    this.beginPath();
    this.rect(0, 0, size, size);
    this.closePath();
    this.fill();
  }
}