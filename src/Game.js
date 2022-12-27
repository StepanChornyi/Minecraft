import { LoaderType, AssetManager, GameObject, AssetType, Asset, Debug } from 'black-engine';

import { Preloader } from './preloader';

import GameScreen from './GameScreen/GameScreen';
import LoadingScreen from './LoadingScreen/LoadingScreen';

export class Game extends GameObject {
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
}

