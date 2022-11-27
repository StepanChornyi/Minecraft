import { Rectangle, DisplayObject, Black, FontStyle, FontWeight, TextStyle, TextField, Graphics } from 'black-engine';
import HELPERS from '../../utils/helpers';
import BLOCK_TYPE from '../block-type';

export default class DebugLog extends DisplayObject {
  constructor() {
    super();

    this.scale = 0.5;

    this._init();
  }

  setPosition(x, y, z) {
    this._positionText.text = this._generatePosStr(x, y, z);
  }

  _generatePosStr(x, y, z) {
    return `~{x}x: ${x.toFixed(1)} | ~{y}y: ${y.toFixed(1)} | ~{z}z: ${z.toFixed(1)} |`;
  }

  _init() {
    const positionText = this._positionText = new TextField(this._generatePosStr(0, 0, 0), 'arial', 0xffffff, 30);

    positionText.setStyle('x', new TextStyle('arial', 0xffffff, 30, FontStyle.NORMAL, FontWeight.NORMAL, 0.5, 0x000000));
    positionText.setStyle('y', new TextStyle('arial', 0xffffff, 30, FontStyle.NORMAL, FontWeight.NORMAL, 0.5, 0x000000));
    positionText.setStyle('z', new TextStyle('arial', 0xffffff, 30, FontStyle.NORMAL, FontWeight.NORMAL, 0.5, 0x000000));

    this.add(positionText);
  }
}