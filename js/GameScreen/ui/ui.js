import { Component, DisplayObject, Black, Sprite, Rectangle } from 'black-engine';
import ResizeActionComponent from '../../libs/resize-action-component';
import { BLOCK_TYPE } from '../block-type';
import HELPERS from '../../utils/helpers';
import DebugLog from './debug-log';
import InventoryBar from './inventory-bar';

export default class Ui extends DisplayObject {
  constructor() {
    super();

    this.touchable = true;

    this._inventoryBar = null;

    this._activeItemPos = 0;
    this._items = [
      BLOCK_TYPE.GRASS_BLOCK,
      BLOCK_TYPE.DIRT,
      BLOCK_TYPE.STONE,
      BLOCK_TYPE.IRON,
      BLOCK_TYPE.LEAVES,
      BLOCK_TYPE.WOOD,
      BLOCK_TYPE.TORCH,
      BLOCK_TYPE.WATER,
      BLOCK_TYPE.STONE_BRICK,
    ];

    this._init();
  }

  getDebugLog() {
    return this._debugLog;
  }

  getActiveBlockType() {
    return this._items[this._activeItemPos];
  }

  _init() {
    const inventoryBar = this._inventoryBar = new InventoryBar();
    const debugLog = this._debugLog = new DebugLog();

    inventoryBar.setItems(this._items);
    inventoryBar.setSliderPosition(this._activeItemPos);

    this.add(inventoryBar, debugLog);
  }

  onAdded() {
    document.addEventListener("onwheel" in document ? "wheel" : "mousewheel", (e) => {
      if (!HELPERS.isPointerLocked(document.body))
        return;

      this._activeItemPos += Math.round(e.deltaY / 100);
      this._activeItemPos = (this._activeItemPos + this._items.length) % this._items.length;

      this._inventoryBar.setSliderPosition(this._activeItemPos);
    });

    this.addComponent(new ResizeActionComponent(this.onResize, this));
  }

  onResize() {
    this.x = this.stage.bounds.left;
    this.y = this.stage.bounds.top;

    const bounds = new Rectangle(0, 0, this.stage.bounds.width, this.stage.bounds.height);
    const inventoryBar = this._inventoryBar;

    inventoryBar.alignAnchor(0.5, 1);
    inventoryBar.x = bounds.center().x;
    inventoryBar.y = bounds.bottom;

    this._debugLog && this._debugLog.onResize(bounds.clone());
  }
}