import { Rectangle, DisplayObject, Black, Sprite, Graphics, TextField, Vector } from 'black-engine';
import FixedSizeDisplayObject from '../../../libs/FixedSizeDisplayObject';
import ItemIcon from './item-icon';
import InventoryModel, { Item } from './InventoryModel';
import SlotsGroup from './SlotGroup';
import { BLOCK_TYPE } from '../../block-type';

export default class CraftingSection extends FixedSizeDisplayObject {
  constructor() {
    super();

    this._craftingModel = new InventoryModel(2, 2);
    this._resultItem = new Item(BLOCK_TYPE.AIR);

    this.touchable = true;

    this._init();
  }

  slotHit(globalItemPos) {
    return this._slotsGroupCraft.slotHit(globalItemPos);
  }

  addItem(item, slotIndex) {
    this._craftingModel.setItem(item, slotIndex);
    this._slotsGroupCraft.addItem(item, slotIndex);

    this._updateCraft();
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

  _updateCraft() {
    const newItem = this._getCraftResult();

    if (newItem === BLOCK_TYPE.AIR) {
      this._slotsGroupCraftResult.removeItem(this._resultItem);
    } else {
      this._resultItem.type = newItem;
      this._slotsGroupCraftResult.addItem(this._resultItem, 0);
    }
  }

  _getCraftResult() {
    const craftingSize = 2;

    for (let i = 0; i < RECIPES.length; i++) {
      const recipe = RECIPES[i];

      if (recipe.size > craftingSize)
        continue;

      let offsetsCount = craftingSize - recipe.size + 1;

      for (let y = 0; y < offsetsCount; y++) {
        for (let x = 0; x < offsetsCount; x++) {
          const offset = y * offsetsCount + x;

          if (this._match(recipe.ingredients, offset)) {
            return recipe.result;
          }
        }
      }
    }

    return BLOCK_TYPE.AIR;
  }

  _match(ingredients, offset) {
    let items = new Array(4).fill(null);

    for (let i = 0; i < items.length; i++) {
      if (this._craftingModel._items[i]) {
        items[i] = this._craftingModel._items[i];
      }
    }

    items = items.map((e) => {
      if (!e) {
        return BLOCK_TYPE.AIR;
      }

      return e.type;
    })

    const checkArr = new Array(4).fill(BLOCK_TYPE.AIR);

    checkArr.splice(offset, ingredients.length, ...ingredients);

    for (let i = 0; i < items.length; i++) {
      if (items[i] !== checkArr[i]) {
        return false;
      }
    }

    return true;
  }

  // _getFixedBounds(outRect) {
  //   return outRect.set(0, 0, this._bg.width, this._bg.height);
  // }
}

class Recipe {
  constructor(ingredients, result) {
    this.size = Math.sqrt(ingredients.length);
    this.ingredients = ingredients;
    this.result = result;
  }
}

const RECIPES = [
  new Recipe([BLOCK_TYPE.WOOD], BLOCK_TYPE.PLANKS),
  new Recipe([BLOCK_TYPE.AIR, BLOCK_TYPE.AIR, BLOCK_TYPE.ROSE, BLOCK_TYPE.GRASS], BLOCK_TYPE.COAL),
];