import { Rectangle, DisplayObject, Black, Sprite, Graphics, TextField, Vector } from 'black-engine';
import FixedSizeDisplayObject from '../../../libs/FixedSizeDisplayObject';
import ItemIcon from './item-icon';
import InventoryModel from './InventoryModel';
import SlotsGroup from './SlotGroup';
import CraftingSection from './CraftingSection';
import InventorySection from './InventorySection';

export default class Inventory extends FixedSizeDisplayObject {
  constructor() {
    super();

    this.touchable = true;
    this.scale = 0.5;

    this._bg = null;
    this._sections = [];

    this._init();

    this.pressedItem = null;
    this.pressedItemStartPos = new Vector();
    this.pressedItemParent = null;
    this.pressedItemSection = null;
  }

  getModel() {
    return this._inventorySection.getModel();
  }

  addItem(itemType) {
    this._inventorySection.addItemByType(itemType);
  }

  _init() {
    const bg = this._bg = new Sprite('craftingMenu');
    const itemDNDContainer = this._itemDNDContainer = new DisplayObject();
    const sectionsContainer = this._sectionsContainer = new DisplayObject();

    sectionsContainer.touchable = true;

    this._inventorySection = this._addSection(new InventorySection());

    this._addSection(new CraftingSection());

    this.add(bg, sectionsContainer, itemDNDContainer);
  }

  _addSection(section) {
    this._sections.push(section);
    this._sectionsContainer.addChild(section);

    section.on("itemPressed", (_, item) => this._onItemPressed(item, section));

    return section;
  }

  _onItemPressed(item, section) {
    this.pressedItem = item;
    this.pressedItemParent = item.icon.parent;
    this.pressedItemStartPos.copyFrom(item.icon);

    item.icon.parent.removeChild(item.icon);

    this._itemDNDContainer.addChild(item.icon);

    this.pressedItemSection = section;
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

    this._itemDNDContainer.removeChild(item.icon);

    let section = this.pressedItemSection, slotIndex = -1;

    for (let i = 0; i < this._sections.length; i++) {
      slotIndex = this._sections[i].slotHit(globalItemPos);

      if (slotIndex > 0) {
        section = this._sections[i]
        break;
      }
    }

    section.addItem(item, slotIndex);

    this.pressedItem = null;
  }

  _getFixedBounds(outRect) {
    return outRect.set(0, 0, this._bg.width, this._bg.height);
  }
}

