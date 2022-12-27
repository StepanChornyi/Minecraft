import { LoaderType, AssetManager, GameObject, AssetType, Asset, Debug } from 'black-engine';

import { Preloader } from './preloader';

import GameScreen from './GameScreen/GameScreen';

export class Game extends GameObject {
  constructor() {
    super();

    // Pick default AssetManager
    const preloader = this.addChild(new Preloader());


    preloader.on('complete', this.onAssetsLoadded, this);

    preloader.load();
  }

  onAssetsLoadded() {
    this.touchable = true;

    this.add(new GameScreen());

    // this.add(new LevelGenTest());


  }
}

