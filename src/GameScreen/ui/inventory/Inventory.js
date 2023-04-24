import { Rectangle, DisplayObject, Black, Sprite, Graphics, TextField, Vector } from 'black-engine';
import FixedSizeDisplayObject from '../../../libs/FixedSizeDisplayObject';
import ItemIcon from './item-icon';
import InventoryModel from './InventoryModel';
import SlotsGroup from './SlotGroup';
import InventoryCrafting from './InventoryCrafting';

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

    this.pressedItem = null;
    this.pressedItemStartPos = new Vector();
    this.pressedItemParent = null;
    this.pressedItemGroup = null;

    // model.on("change", () => {
    //   this._update();
    // })

    this._update();
  }

  _init() {
    const model = this._model;
    const bg = this._bg = new Sprite('craftingMenu');
    const slotsContainer = this._slotsContainer = new DisplayObject();
    const itemsContainer = this._itemsContainer = new DisplayObject();
    const itemDNDContainer = this._itemDNDContainer = new DisplayObject();

    this.scale = 0.5;
    bg.touchable = true;

    itemsContainer.touchable = true;

    slotsContainer.touchable = true;

    const slotsGroupBottom = this.slotsGroupBottom = new SlotsGroup(1, model.itemsCols);
    const slotsGroupTop = this.slotsGroupTop = new SlotsGroup(model.itemsRows - 1, model.itemsCols);

    const craftingSection = this._craftingSection = new InventoryCrafting();

    this._slots.push(...slotsGroupBottom.slots);
    this._slots.push(...slotsGroupTop.slots);

    this.slotGroups = [slotsGroupBottom, slotsGroupTop];

    slotsContainer.add(...this.slotGroups);
    slotsContainer.add(craftingSection);

    slotsGroupBottom.x = 15;
    slotsGroupBottom.y = 417;

    slotsGroupTop.x = 15;
    slotsGroupTop.y = 243;
    slotsGroupTop.indexOffset = 9;

    slotsGroupBottom.on("itemPressed", (_, item) => this._onItemPressed(item, slotsGroupBottom));
    slotsGroupTop.on("itemPressed", (_, item) => this._onItemPressed(item, slotsGroupTop));

    this.add(bg, slotsContainer, itemsContainer, itemDNDContainer);

    this._model.on("itemMove", (_, index) => {
      const item = this._model.getItemByIndex(index);

      slotsGroupTop.removeItem(item);
      slotsGroupBottom.removeItem(item);

      if (index < slotsGroupTop.indexOffset) {
        slotsGroupBottom.addItem(item, index);
      } else {
        slotsGroupTop.addItem(item, index - slotsGroupTop.indexOffset);
      }
    });
  }

  _onItemPressed(item, group) {
    this.pressedItem = item;
    this.pressedItemParent = item.icon.parent;
    this.pressedItemStartPos.copyFrom(item.icon);

    item.icon.parent.removeChild(item.icon);

    this._itemDNDContainer.addChild(item.icon);

    this.pressedItemGroup = group;
  }

  _update() {
    const model = this._model;
    const modelItems = model.items;

    for (let i = 0; i < model.slotsCount; i++) {
      if (!modelItems[i])
        continue;

      if (!this.slotsGroupBottom.getItem(i) && i < this.slotsGroupBottom.slots.length) {
        this.slotsGroupBottom.addItem(modelItems[i], i);
        continue;
      }

      const index = i - this.slotsGroupTop.indexOffset;

      if (!this.slotsGroupTop.getItem(index)) {
        this.slotsGroupTop.addItem(modelItems[i], index);
      }
    }
  }

  onUpdate() {
    if (!this.pressedItem)
      return;

    if (!Black.input.isPointerDown)
      return this._onItemReleased();

    const currPos = Black.input.pointerPosition;
    const newPos = this.pressedItem.icon.parent.globalToLocal(currPos);

    this.pressedItem.icon.x = newPos.x;
    this.pressedItem.icon.y = newPos.y;
  }

  _onItemReleased() {
    const item = this.pressedItem;
    const globalItemPos = item.icon.parent.localToGlobal(item.icon.xy);

    let group = null;
    let slotIndex = -1;

    slotIndex = this.slotsGroupBottom.slotHit(globalItemPos);

    if (slotIndex >= 0) {
      group = this.slotsGroupBottom;
    }

    if (slotIndex < 0) {
      slotIndex = this.slotsGroupTop.slotHit(globalItemPos);

      if (slotIndex >= 0) {
        group = this.slotsGroupTop;
      }
    }

    this._itemDNDContainer.removeChild(item.icon);

    if (slotIndex < 0) {
      this.pressedItemParent.addChild(item.icon)
      this.pressedItemStartPos.copyTo(item.icon);
    } else {
      this.pressedItemGroup.removeItem(item);

      this._model.moveItem(this._model.indexOf(item), slotIndex + group.indexOffset);

      group.addItem(item, slotIndex);
    }

    this.pressedItem = null;
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

