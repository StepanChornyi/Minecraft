import { Rectangle, DisplayObject, Black, Sprite, Graphics } from 'black-engine';
import ItemIcon from './item-icon';

export default class InventoryBar extends DisplayObject {
  constructor() {
    super();

    this._bg = null;
    this._slider = null;
    this._icons = [];

    this._init();

    this.setSliderPosition(5);
  }

  setSliderPosition(pos) {
    const slider = this._slider;

    slider.alignAnchor(0.5, 0.5);

    this._setCenter(slider, pos);
  }

  setItems(items) {
    for (let i = 0; i < 9; i++) {
      const icon = this._icons[i];
      const item = items[i];

      if (item) {
        icon.visible = true;
        icon.setBlockType(item.type);
      } else {
        icon.visible = false;
      }
    }
  }

  _setCenter(obj, pos) {
    obj.x = 20 + 35.7 * pos;
    obj.y = 20;
  }

  _init() {
    const bg = this._bg = new Sprite('inventoryBar');
    const slider = this._slider = new Sprite('inventoryBarSlider');

    for (let i = 0; i < 9; i++) {
      const icon = new ItemIcon();

      this._setCenter(icon, i);

      this._icons.push(icon);
    }

    this.add(bg, slider, ...this._icons);
  }

  getBounds(...args) {
    return super.getBounds(args[0], false, args[2]);
  }

  get bounds() {
    return this.getBounds();
  }

  onGetLocalBounds(outRect = new Rectangle()) {
    return outRect.set(0, 0, this._bg.width, this._bg.height);
  }
}