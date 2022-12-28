import { LoaderType, AssetManager, GameObject, AssetType, Asset, Debug, DisplayObject } from 'black-engine';

import { Preloader } from './preloader';

import GameScreen from './GameScreen/GameScreen';
import LoadingScreen from './LoadingScreen/LoadingScreen';
import WEBGL_UTILS from './utils/webgl-utils';

const canvas = document.getElementById("canvas3D");
const gl = WEBGL_UTILS.getWebGlContext(canvas);

gl.clearColor(0.3, 0.3, 0.3, 1);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export class Game extends DisplayObject {
  constructor() {
    super();

    const preloader = this.addChild(new Preloader());

    preloader.loadPreloader();

    preloader.once('complete', () => {
      this._loadingScreen = this.addChild(new LoadingScreen());

      preloader.load();
      preloader.once('complete', this.onAssetsLoadded, this);
    });
  }

  onAssetsLoadded() {
    this.touchable = true;

    const loadingScreen = this._loadingScreen;
    const gameScreen = new GameScreen();

    gameScreen.on("initProgress", (_, val) => {
      loadingScreen.setProgress(val);
    })

    gameScreen.on("initCompleted", () => {
      loadingScreen.visible = false;
      gameScreen.visible = true;
    })

    gameScreen.visible = false;

    this.addChildAt(gameScreen, 0);
  }

  onRender() {
    gl.colorMask(false, false, false, false);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.colorMask(true, true, true, false);

    this._renderGL(this);
  }

  _renderGL(gameObject) {
    for (let i = 0; i < gameObject.mChildren.length; i++) {
      const child = gameObject.mChildren[i];

      if (child.visible) {
        child.renderGL && child.renderGL();

        this._renderGL(child);
      }
    }
  }
}

