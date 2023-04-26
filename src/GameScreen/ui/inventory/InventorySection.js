import { Rectangle, DisplayObject, Black, Sprite, Graphics, TextField, Vector } from 'black-engine';
import FixedSizeDisplayObject from '../../../libs/FixedSizeDisplayObject';
import ItemIcon from './item-icon';
import InventoryModel from './InventoryModel';
import SlotsGroup from './SlotGroup';

export default class InventorySection extends FixedSizeDisplayObject {
  constructor() {
    super();

    this._inventoryModel = new InventoryModel(9, 4);

    this.touchable = true;

    this._init();
  }

  getModel() {
    return this._inventoryModel;
  }

  slotHit(globalItemPos) {
    let slotPos = this.slotsGroupTop.slotHit(globalItemPos);

    if (slotPos >= 0) {
      return slotPos + this.slotsGroupTop.indexOffset
    }

    return this.slotsGroupBottom.slotHit(globalItemPos);
  }

  addItem(item, slotIndex) {
    if (slotIndex < 0) {
      slotIndex = this._inventoryModel.indexOf(item);
    }

    this._inventoryModel.moveItem(this._inventoryModel.indexOf(item), slotIndex);
  
    const group = this._getGroup(slotIndex);

    group.addItem(item, slotIndex - group.indexOffset);
  }


  _getGroup(slotIndex) {
    if (slotIndex < this.slotsGroupTop.indexOffset) {
      return this.slotsGroupBottom;
    } else {
      return this.slotsGroupTop;
    }
  }

  addItemByType(itemType) {
    const itemIndex = this._inventoryModel.addItem(itemType);
    const item = this._inventoryModel.getItem(itemIndex);

    this.addItem(item, itemIndex);
  }

  _init() {
    const slotsGroupBottom = this.slotsGroupBottom = new SlotsGroup(1, this._inventoryModel.itemsCols);
    const slotsGroupTop = this.slotsGroupTop = new SlotsGroup(this._inventoryModel.itemsRows - 1, this._inventoryModel.itemsCols);

    slotsGroupBottom.x = 15;
    slotsGroupBottom.y = 417;

    slotsGroupTop.x = 15;
    slotsGroupTop.y = 243;
    slotsGroupTop.indexOffset = 9;

    this.add(slotsGroupBottom, slotsGroupTop);
  }

  // _getFixedBounds(outRect) {
  //   return outRect.set(0, 0, this._bg.width, this._bg.height);
  // }
}

