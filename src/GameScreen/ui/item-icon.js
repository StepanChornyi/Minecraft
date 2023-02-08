import { Rectangle, DisplayObject, Black, Sprite, Graphics, Texture } from 'black-engine';
import { BLOCK_TYPE } from '../block-type';

export default class ItemIcon extends DisplayObject {
  constructor() {
    super();

    this.touchable = true;

    this._texture = new Texture(Black.assets.getTexture('iconsSheet').native);
    this._textureRegion = new Rectangle();

    this._icon = null;

    this.setBlockType(BLOCK_TYPE.GRASS_BLOCK);

    this._init();
  }

  setBlockType(blockType) {
    this._updateTexture(blockType);
  }

  _init() {
    const icon = this._icon = new Sprite(this._texture);

    icon.scale = 0.85;
    icon.alignAnchor();

    this.add(icon);

    icon.touchable = true;

    let isPressed = false;

    this.on("pointerDown", () => {
      isPressed = true;

      this.parent.setChildIndex(this, this.parent.numChildren - 1);
    });

    this.on("pointerUp", () => {
      isPressed = false;
      this.post("released");
    });

    Black.stage.on("pointerMove", () => {
      if (isPressed) {
        const local = this.parent.globalToLocal(Black.input.pointerPosition);

        this.x = local.x;
        this.y = local.y;
      }
    })
  }

  _updateTexture(blockType) {
    const texture = this._texture;
    const textureRegion = this._textureRegion;

    let regionIndex = ICONS_MAP[blockType];
    const regionSize = 32;
    const regionsCount = 16;


    if (isNaN(regionIndex)) {
      regionIndex = 250
    }

    textureRegion.set(
      regionSize * (regionIndex % regionsCount),
      regionSize * (Math.floor(regionIndex / regionsCount)),
      regionSize,
      regionSize
    );

    texture.set(texture.native, textureRegion);
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
ICONS_MAP[BLOCK_TYPE.SAND] = 11;
ICONS_MAP[BLOCK_TYPE.SANDSTONE] = 29;
ICONS_MAP[BLOCK_TYPE.ROSE] = 226;
ICONS_MAP[BLOCK_TYPE.GRASS] = 227;
ICONS_MAP[BLOCK_TYPE.DEAD_BUSH] = 228;
ICONS_MAP[BLOCK_TYPE.CACTUS] = 75;

