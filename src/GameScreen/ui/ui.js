import { Component, DisplayObject, Black, Sprite, Rectangle } from 'black-engine';
import ResizeActionComponent from '../../libs/resize-action-component';
import { BLOCK_TYPE } from '../block-type';
import HELPERS from '../../utils/helpers';
import DebugLog from './debug-log';
import InventoryBar from './inventory/inventory-bar';
import Inventory from './inventory/Inventory';
import Overlay from './Overlay';
import InventoryModel from './inventory/InventoryModel';

export default class Ui extends DisplayObject {
  constructor() {
    super();

    this.touchable = true;

    this._inventoryBar = null;

    this._activeItemPos = 0;

    this._init();
  }

  getDebugLog() {
    return this._debugLog;
  }

  getActiveBlockType() {
    return this._inventoryModel.items[this._activeItemPos].type;
  }

  collectItem(blockType) {
    this._inventory.addItem(blockType);
  }

  _init() {
    const inventoryBar = this._inventoryBar = new InventoryBar();
    const debugLog = this._debugLog = new DebugLog();
    const overlay = this._overlay = new Overlay(0);
    const inventoryOverlay = this._inventoryOverlay = new Overlay(0.6);
    const inventory = this._inventory = new Inventory();
    const inventoryContainer = this._inventoryContainer = new DisplayObject();

    this._inventoryModel = inventory.getModel();

    this._inventory.addItem(BLOCK_TYPE.TORCH);
    this._inventory.addItem(BLOCK_TYPE.CACTUS);
    // this._inventory.addItem(BLOCK_TYPE.WATER);
    this._inventory.addItem(BLOCK_TYPE.DEAD_BUSH);
    this._inventory.addItem(BLOCK_TYPE.LEAVES);
    this._inventory.addItem(BLOCK_TYPE.ROSE);
    this._inventory.addItem(BLOCK_TYPE.SANDSTONE);
    this._inventory.addItem(BLOCK_TYPE.GRASS);
    this._inventory.addItem(BLOCK_TYPE.WOOD);
    this._inventory.addItem(BLOCK_TYPE.BEDROCK);
    this._inventory.addItem(BLOCK_TYPE.STONE_BRICK);
    this._inventory.addItem(BLOCK_TYPE.IRON);


    inventoryContainer.touchable = true;
    inventoryContainer.add(inventoryOverlay, inventory);
    inventoryContainer.visible = false;

    overlay.touchable = true;
    overlay.on('pointerDown', () => {
      // HELPERS.requestPointerLock(document.body)
      this.switchInventory();
    });

    // inventoryOverlay.touchable = true;
    // inventoryOverlay.on('pointerDown', ()=>{
    //   HELPERS.requestPointerLock(document.body)
    // });

    document.onkeydown = (e) => {
      if (e.keyCode === 69)
        this.switchInventory();

      // if (e.keyCode === 27)
      //   this.switchInventory(true);

      // e.preventDefault();
    }

    this._inventoryContainer.visible = true;

    inventoryBar.setItems(this._inventoryModel.items);
    inventoryBar.setSliderPosition(this._activeItemPos);

    this._inventoryModel.on('change', () => {
      inventoryBar.setItems(this._inventoryModel.items);
    });

    this.add(overlay, inventoryBar, debugLog, inventoryContainer);
  }

  switchInventory(exitOnly = false) {
    if (HELPERS.isPointerLocked(document.body) && !exitOnly) {
      HELPERS.exitPointerLock();
      this._inventoryContainer.visible = true;
    } else if (!HELPERS.isPointerLocked(document.body)) {
      HELPERS.requestPointerLock(document.body);
      this._inventoryContainer.visible = false;
    }
  }

  onAdded() {
    document.addEventListener("onwheel" in document ? "wheel" : "mousewheel", (e) => {
      if (!HELPERS.isPointerLocked(document.body))
        return;

      this._activeItemPos += Math.round(e.deltaY / 100);
      this._activeItemPos = (this._activeItemPos + 9) % 9;

      this._inventoryBar.setSliderPosition(this._activeItemPos);
    });

    this.addComponent(new ResizeActionComponent(this.onResize, this));
  }

  onResize() {
    this.x = this.stage.bounds.left;
    this.y = this.stage.bounds.top;

    const bounds = new Rectangle(0, 0, this.stage.bounds.width, this.stage.bounds.height);
    const inventoryBar = this._inventoryBar;
    const inventory = this._inventory;

    inventoryBar.alignAnchor(0.5, 1);
    inventoryBar.x = bounds.center().x;
    inventoryBar.y = bounds.bottom;

    inventory.alignAnchor(0.5);
    inventory.x = bounds.center().x;
    inventory.y = bounds.center().y - inventoryBar.height;

    this._overlay.set(bounds);
    this._inventoryOverlay.set(bounds);

    this._debugLog && this._debugLog.onResize(bounds.clone());
  }
}