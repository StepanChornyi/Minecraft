import { Rectangle, DisplayObject, Black, Sprite, Graphics, TextField, Vector } from 'black-engine';
import FixedSizeDisplayObject from '../../../libs/FixedSizeDisplayObject';
import ItemIcon from './item-icon';
import InventoryModel from './InventoryModel';
import SlotsGroup from './SlotGroup';

export default class CraftingSection extends FixedSizeDisplayObject {
  constructor() {
    super();

    this._craftingModel = new InventoryModel(2, 2);

    this.touchable = true;

    this._init();
  }

  slotHit(globalItemPos) {
    return this._slotsGroupCraft.slotHit(globalItemPos);
  }

  addItem(item, slotIndex) {
    this._slotsGroupCraft.addItem(item, slotIndex);
  }

  _init() {
    const slotsGroupCraft = this._slotsGroupCraft = new SlotsGroup(2, 2);
    const slotsGroupCraftResult = this._slotsGroupCraftResult = new SlotsGroup(1, 1);

    slotsGroupCraft.x = 255;
    slotsGroupCraft.y = 69;

    slotsGroupCraftResult.x = 423;
    slotsGroupCraftResult.y = 99;

    this.add(slotsGroupCraft, slotsGroupCraftResult);
  }

  // _getFixedBounds(outRect) {
  //   return outRect.set(0, 0, this._bg.width, this._bg.height);
  // }
}

