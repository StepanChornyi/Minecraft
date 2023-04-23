import { Rectangle, DisplayObject, Black, Sprite, Graphics, TextField, Vector } from 'black-engine';
import FixedSizeDisplayObject from '../../libs/FixedSizeDisplayObject';
import ItemIcon from './item-icon';
import InventoryModel from './InventoryModel';

const slotSize = 25;

export default class Inventory extends FixedSizeDisplayObject {
  constructor(model) {
    super();

    this.touchable = true;

    this._model = model;
    this._craftingModel = new InventoryModel(2, 2);
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
    const itemDNDContainer = this._itemDNDContainer = new DisplayObject();

    this.scale = 0.5;
    bg.touchable = true;
    // const slider = this._slider = new Sprite('inventoryBarSlider');

    // for (let i = 0; i < 9; i++) {
    //   const icon = new ItemIcon();

    //   this._setCenter(icon, i);

    //   this._icons.push(icon);
    // }  

    itemsContainer.touchable = true;
    itemDNDContainer.touchable = true;

    // slotsContainer.touchable = true;

    const slotsGroupBottom = new SlotsGroup(1, model.itemsCols);
    const slotsGroupTop = new SlotsGroup(model.itemsRows - 1, model.itemsCols);
    const slotsGroupCraft = this._slotsGroupCraft = new SlotsGroup(2, 2);
    const slotsGroupCraftResult = new SlotsGroup(1, 1);

    // this._slots[index] = slot;

    this._slots.push(...slotsGroupBottom.slots);
    this._slots.push(...slotsGroupTop.slots);

    this.slotGroups = [slotsGroupBottom, slotsGroupTop, slotsGroupCraft, slotsGroupCraftResult];

    slotsContainer.add(...this.slotGroups);

    slotsGroupCraft.x = 255;
    slotsGroupCraft.y = 69;

    slotsGroupCraftResult.x = 423;
    slotsGroupCraftResult.y = 99;

    slotsGroupBottom.x = 15;
    slotsGroupBottom.y = 417;

    slotsGroupTop.x = 15;
    slotsGroupTop.y = 243;

    this.overlay = new Graphics();

    const size = 48;

    this.overlay.fillStyle(0xffffff, 0.5);
    this.overlay.beginPath();
    this.overlay.rect(-size * 0.5, -size * 0.5, size, size);
    this.overlay.closePath();
    this.overlay.fill();
    this.overlay.visible = false;

    this.add(bg, slotsContainer, itemsContainer, this.overlay, itemDNDContainer);

    slotsGroupBottom.on("hover", this._onHover, this);
    slotsGroupTop.on("hover", this._onHover, this);
    slotsGroupCraft.on("hover", this._onHover, this);
    slotsGroupCraftResult.on("hover", this._onHover, this);
  }

  _onHover(_, p) {
    const localPoint = this.globalToLocal(p);

    this.overlay.x = localPoint.x;
    this.overlay.y = localPoint.y;
    this.overlay.visible = true;
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

        item.on("pressed", () => {
          item.parent.removeChild(item);
          this._itemDNDContainer.addChild(item);
        });

        item.on('released', () => {
          item.parent.removeChild(item);
          this._itemsContainer.addChild(item);

          const slot = this._getSlot(item.x, item.y);
          let newItemIndex = this._slots.indexOf(slot);

          if (newItemIndex < 0) {
            newItemIndex = this._slotsGroupCraft.slots.indexOf(slot);

            if (newItemIndex < 0) {
              this._alignItem(i);
            } else {
              this._model.removeItem(item.type);
              this._alignItem(i, slot);
            }
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

  onUpdate() {
    this.overlay.visible = false;
  }

  _alignItem(index, slot = this._slots[index]) {
    const item = this._items[index];

    const slotCenter = item.parent.globalToLocal(slot.parent.localToGlobal(slot.bounds.center()));

    item.scale = 0.85 * 2;

    item.x = slotCenter.x;
    item.y = slotCenter.y;
  }

  _getSlot(x, y) {
    for (let i = 0; i < this.slotGroups.length; i++) {
      if (this.slotGroups[i].bounds.containsXY(x, y)) {
        const local = this.slotGroups[i].globalToLocal(this.localToGlobal(new Vector(x, y)));

        for (let j = 0; j < this.slotGroups[i].slots.length; j++) {
          if (this.slotGroups[i].slots[j].bounds.containsXY(local.x, local.y)) {
            return this.slotGroups[i].slots[j];
          }
        }

        break;
      }
    }

    return null;
  }

  _getFixedBounds(outRect) {
    return outRect.set(0, 0, this._bg.width, this._bg.height);
  }
}

class ItemSlot extends Sprite {
  constructor() {
    super("slot");

    this._itemIcon = null;
  }
}

class SlotsGroup extends DisplayObject {
  constructor(rows, cols) {
    super();

    this.slots = [];

    for (let yy = 0; yy < rows; yy++) {
      for (let xx = 0; xx < cols; xx++) {

        const slot = new ItemSlot()

        slot.x = slot.width * xx;
        slot.y = slot.height * yy;

        this.slots.push(slot)
      }
    }

    this.add(...this.slots);
  }

  onUpdate() {
    const local = this.globalToLocal(Black.input.pointerPosition);

    for (let i = 0; i < this.slots.length; i++) {
      const { x, y, width, height } = this.slots[i];

      if (new Rectangle(x, y, width, height).containsXY(local.x, local.y)) {
        this.post("hover", this.localToGlobal(new Vector(x + width * 0.5, y + height * 0.5)))

        return;
      }
    }
  }

  setColor(val) {
    for (let i = 0; i < this.slots.length; i++) {
      this.slots[i].color = val;
    }
  }
}