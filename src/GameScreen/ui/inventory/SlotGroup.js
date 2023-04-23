import { DisplayObject, Black, Sprite, Vector, Graphics } from 'black-engine';
import FixedSizeDisplayObject from '../../../libs/FixedSizeDisplayObject';

const SLOT_SIZE = 54;
const SLOT_INNER_SIZE = SLOT_SIZE - 6;
const SLOT_SIZE_IVS = 1 / SLOT_SIZE;

class ItemSlot extends Sprite {
  constructor() {
    super("slot");

    this._itemIcon = null;
  }
}

export default class SlotsGroup extends FixedSizeDisplayObject {
  constructor(rows, cols) {
    super();

    this.touchable = true;

    this.rows = rows;
    this.cols = cols;
    this.slots = [];
    this.items = [];
    this.indexOffset = 0;

    for (let yy = 0; yy < rows; yy++) {
      for (let xx = 0; xx < cols; xx++) {

        const slot = new ItemSlot()

        slot.width = SLOT_SIZE;
        slot.height = SLOT_SIZE;

        slot.x = SLOT_SIZE * xx;
        slot.y = SLOT_SIZE * yy;

        this.slots.push(slot)
      }
    }

    this.add(...this.slots);

    this.on("pointerDown", (_, pointerInfo) => {
      const local = this.globalToLocal(pointerInfo);
      const item = this.items[this._getSlotIndex(local)];

      if (item) {
        this.post("~itemPressed", item);
      }
    });

    this.itemsContainer = this.addChild(new DisplayObject());
    this.overlay = this.addChild(this._createOverlay());
  }

  addItem(item, slotIndex) {
    this.items[slotIndex] = item;

    this.itemsContainer.addChild(item.icon);

    item.icon.width = SLOT_INNER_SIZE;
    item.icon.height = SLOT_INNER_SIZE;

    this._alignOnSlot(item.icon, this.slots[slotIndex]);
  }

  getItem(slotIndex) {
    return this.items[slotIndex];
  }

  removeItem(item) {
    this.itemsContainer.removeChild(item.icon);

    const index = this.items.indexOf(item);

    if (index >= 0) {
      this.items[index] = null;
    }
  }

  onUpdate() {
    this._updateHover();
  }

  setColor(val) {
    for (let i = 0; i < this.slots.length; i++) {
      this.slots[i].color = val;
    }
  }

  slotHit(globalPos) {
    return this._getSlotIndex(this.globalToLocal(globalPos));
  }

  _alignOnSlot(displayObject, slot) {
    displayObject.x = slot.x + slot.width * 0.5;
    displayObject.y = slot.y + slot.height * 0.5;
  }

  _updateHover() {
    const local = this.globalToLocal(Black.input.pointerPosition);
    const slot = this.slots[this._getSlotIndex(local)];

    if (slot) {
      this._alignOnSlot(this.overlay, slot);
      this.overlay.visible = true;
    } else {
      this.overlay.visible = false;
    }
  }

  _getSlotIndex(localPosition) {
    const xx = Math.floor(localPosition.x * SLOT_SIZE_IVS);
    const yy = Math.floor(localPosition.y * SLOT_SIZE_IVS);

    if (xx >= 0 && xx < this.cols && yy >= 0 && yy < this.rows) {
      return yy * this.cols + xx;
    }

    return -1;
  }

  _createOverlay() {
    const overlay = new Graphics();

    overlay.fillStyle(0xffffff, 0.5);
    overlay.beginPath();
    overlay.rect(-SLOT_INNER_SIZE * 0.5, -SLOT_INNER_SIZE * 0.5, SLOT_INNER_SIZE, SLOT_INNER_SIZE);
    overlay.closePath();
    overlay.fill();

    return overlay;
  }

  _getFixedBounds(outRect) {
    return outRect.set(0, 0, this.cols * SLOT_SIZE, this.rows * SLOT_SIZE);
  }
}