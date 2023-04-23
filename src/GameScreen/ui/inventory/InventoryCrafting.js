import { Rectangle, DisplayObject, Black, Sprite, Graphics, TextField, Vector } from 'black-engine';
import FixedSizeDisplayObject from '../../../libs/FixedSizeDisplayObject';
import ItemIcon from './item-icon';
import InventoryModel from './InventoryModel';
import SlotsGroup from './SlotGroup';

export default class InventoryCrafting extends FixedSizeDisplayObject {
  constructor() {
    super();

    this.touchable = true;

    this._init();
  }

  _init() {
    const slotsGroupCraft = new SlotsGroup(2, 2);
    const slotsGroupCraftResult = new SlotsGroup(1, 1);

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

