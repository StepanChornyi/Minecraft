import { Rectangle, DisplayObject, Black, FontStyle, FontWeight, TextStyle, TextField, Graphics } from 'black-engine';
import HELPERS from '../../utils/helpers';
import BLOCK_TYPE from '../block-type';

export default class DebugLog extends DisplayObject {
  constructor() {
    super();

    this.scale = 0.5;

    this._positionText = null;
    this._renderTimeText = null;

    this._init();
    this.setRenderTime(15);
  }

  setPosition(x, y, z) {
    this._positionText.text = this._generatePosStr(x, y, z);
  }

  setRenderTime(timeMs) {
    this._renderTimeText.text = `${timeMs.toFixed(2)}`;
  }

  onResize(bounds) {
    bounds.scale(1 / this.scale);

    const renderTimeText = this._renderTimeText;

    renderTimeText.alignAnchor(1, 0);
    renderTimeText.x = bounds.right - 100;
  }

  _generatePosStr(x, y, z) {
    return `~{x}x: ${x.toFixed(1)} | ~{y}y: ${y.toFixed(1)} | ~{z}z: ${z.toFixed(1)} |`;
  }

  _init() {
    const positionText = this._positionText = new TextField("", 'arial', 0xffffff, 30);
    const renderTimeText = this._renderTimeText = new TextField("", 'arial', 0xffffff, 30);

    positionText.setStyle('x', new TextStyle('arial', 0xffffff, 30, FontStyle.NORMAL, FontWeight.NORMAL, 0.5, 0x000000));
    positionText.setStyle('y', new TextStyle('arial', 0xffffff, 30, FontStyle.NORMAL, FontWeight.NORMAL, 0.5, 0x000000));
    positionText.setStyle('z', new TextStyle('arial', 0xffffff, 30, FontStyle.NORMAL, FontWeight.NORMAL, 0.5, 0x000000));

    this.add(positionText);
    this.add(renderTimeText);
  }
}