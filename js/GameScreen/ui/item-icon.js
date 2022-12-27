import { Rectangle, DisplayObject, Black, Sprite, Graphics, Texture } from 'black-engine';
import { BLOCK_TYPE } from '../block-type';

export default class ItemIcon extends DisplayObject {
  constructor() {
    super();

    this._texture = new Texture(Black.assets.getTexture('iconsSheet').native);
    this._textureRegion = new Rectangle();

    this._icon = null;

    this.setBlockType(BLOCK_TYPE.GRASS_BLOCK);

    this._init();
  }

  setBlockType(blockType) {
    this._updateTexture(blockType);
  }

  _updateTexture(blockType) {
    const texture = this._texture;
    const textureRegion = this._textureRegion;

    const regionIndex = ICONS_MAP[blockType];
    const regionSize = 32;
    const regionsCount = 16;

    textureRegion.set(
      regionSize * (regionIndex % regionsCount),
      regionSize * (Math.floor(regionIndex / regionsCount)),
      regionSize,
      regionSize
    );

    texture.set(texture.native, textureRegion);
  }

  _init() {
    const icon = this._icon = new Sprite(this._texture);

    icon.scale = 0.85;
    icon.alignAnchor();

    this.add(icon);
  }
}

const ICONS_MAP = {};

ICONS_MAP[BLOCK_TYPE.AIR] = -1;

ICONS_MAP[BLOCK_TYPE.STONE] = 0;
ICONS_MAP[BLOCK_TYPE.GRASS_BLOCK] = 1;
ICONS_MAP[BLOCK_TYPE.DIRT] = 2;
ICONS_MAP[BLOCK_TYPE.COAL] = 15;
ICONS_MAP[BLOCK_TYPE.IRON] = 14;
ICONS_MAP[BLOCK_TYPE.WOOD] = 16;
ICONS_MAP[BLOCK_TYPE.COBBLESTONE] = 3;
ICONS_MAP[BLOCK_TYPE.STONE_BRICK] = 90;
ICONS_MAP[BLOCK_TYPE.BEDROCK] = 8;
ICONS_MAP[BLOCK_TYPE.TORCH] = 214;
ICONS_MAP[BLOCK_TYPE.LEAVES] = 23;
ICONS_MAP[BLOCK_TYPE.WATER] = 9;

