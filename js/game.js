import { LoaderType, AssetManager, GameObject, AssetType, Asset, Debug } from 'black-engine';

import inventoryBar from 'assets/textures/inventory_bar.png';
import inventoryBarSlider from 'assets/textures/bar_slider.png';
import iconsSheet from 'assets/textures/icons_sheet.png';

import mainTexture from 'assets/textures/texture.png';
import sunTexture from 'assets/textures/sun.png';
import testTex from 'assets/textures/tex_test.png';

import cursorVsGLSL from 'shaders/cursor/cursor.vs.glsl';
import cursorFsGLSL from 'shaders/cursor/cursor.fs.glsl';
import chunkVsGLSL from 'shaders/chunk/chunk.vs.glsl';
import chunkFsGLSL from 'shaders/chunk/chunk.fs.glsl';

import CustomAssetManager from './custom-asset-manager';

// import { Scene3D } from './scene3d';
// import { Start } from './rebuild/start';
import Minecraft from './minecraft/minecraft';
// import { LightTest } from './tests/light-test';
// import { LightTestNew } from './tests/light-test-new';
// import { NoiseTest } from './tests/noise-test';
// import { Umbrella } from './tests/umbrella';
// import { TileRaycaster2dDemo } from './tests/tile-raycaster';
// import { PhysXTest } from './tests/physx-test';
// import { InfiniteTest } from './tests/infinite-test';

export class Game extends GameObject {
  constructor() {
    super();

    // Pick default AssetManager
    const assets = new CustomAssetManager();

    // load images, make sure to import them first
    // assets.enqueueImage('anvil', anvil);
    assets.enqueueImage('main', mainTexture);
    assets.enqueueImage('sun', sunTexture);
    assets.enqueueImage('inventoryBar', inventoryBar);
    assets.enqueueImage('inventoryBarSlider', inventoryBarSlider);
    assets.enqueueImage('iconsSheet', iconsSheet);
    assets.enqueueImage('testTex', testTex);

    assets.enqueueImage('dirt', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkY4NTg4RUQ1RUQ1QzExRTg4QjM3QzgwQjI1QTRBQUZGIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkY4NTg4RUQ2RUQ1QzExRTg4QjM3QzgwQjI1QTRBQUZGIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Rjg1ODhFRDNFRDVDMTFFODhCMzdDODBCMjVBNEFBRkYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Rjg1ODhFRDRFRDVDMTFFODhCMzdDODBCMjVBNEFBRkYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7zo4CAAAABmklEQVR42lySQUtCURCFn+8ZKGlqEiolliKBUUZBC0kIIgoiaNOuRX+jH9AvatWusF0g5sKVWhRiUqSJlQRi3/PAJXpc7p0zd+acmbnPc3Vx2mi/W5b13Omx76yn/8LHl+5iPCL/daXJ7iSjgVDAV7p/CAf8XIzG44/54t3tDZDr4LSv/zmUv9poV+ptGy9k0EAmu1++BIrS6MB4drCJ3ynkFlqB3H7W3xsMRSNuCkMZ+mQsbHs8x9sreIA2BMFOGUAQNMX8Eh642YHsNSvNToCgs5aaQzEVj3QH3zDBighqT5M6iWg3amjCLWW3B82ENbNxpH4ol6XhyKAw6Xg51KKLW6VQLEwOJRGBskYsRuW4TSPHHR3jVaNAylvNJMyD8FEqTq/k1JBpVNWbUOlL1jncygJIxUsc7TJBzRdD7wNkJNby3mu9ahsmytVwNdNoflceI8uDkuw5PylwMH7TViYxq5x/nwpzFRSN0Xz7wYBVmfpZ2M1PybKTkznqbmr0hQE0rRspY3h18DqGmOcrtkpm/KTJL95fAQYAwOc7nVrRgVcAAAAASUVORK5CYII=');

    assets.enqueueXHR('cursor-vs', cursorVsGLSL);
    assets.enqueueXHR('cursor-fs', cursorFsGLSL);

    assets.enqueueXHR('chunk-vs', chunkVsGLSL);
    assets.enqueueXHR('chunk-fs', chunkFsGLSL);

    // const data = 0b1101100111010010;

    // pb(data);
    // pb(clearBlockLight(data));

    // function clearBlockLight(v) {
    //   return (v | 0x00ff) ^ 0x00ff;
    // }

    // function pb(number, l = 16) {
    //   let s = number.toString(2);

    //   while (s.length < l) {
    //     s = '0' + s;
    //   }

    //   console.log(s);
    // }

    // XHRAssetLoader

    // load font
    // assets.enqueueGoogleFont('Titillium Web');

    // Listen for a complete message
    assets.on('complete', this.onAssetsLoadded, this);

    // Start preloading all enqueued assets
    assets.loadQueue();
  }

  onAssetsLoadded() {
    this.touchable = true;


    // this.add(new Scene3D());
    // this.add(new Start());

    this.add(new Minecraft());

    // this.add(new InfiniteTest());
    // this.add(new PhysXTest());
    // this.add(new NoiseTest());
    // this.add(new LightTestNew());
    // this.add(new Umbrella());
    // this.add(new LightTest());
    // this.add(new TileRaycaster2dDemo());
  }
}

