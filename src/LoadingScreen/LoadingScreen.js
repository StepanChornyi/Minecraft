import { Component, DisplayObject, Black, Sprite } from 'black-engine';
import LoadingBar from './Meshes/LoadingBar/LoadingBar';
import LoadingBg from './Meshes/LoadingBg/LoadingBg';
import ResizeActionComponent from '../libs/resize-action-component';
import WEBGL_UTILS from '../utils/webgl-utils';
import Camera from '../Utils3D/Camera';

const canvas = document.getElementById("canvas3D");
const gl = WEBGL_UTILS.getWebGlContext(canvas);

export default class LoadingScreen extends DisplayObject {
  constructor() {
    super();

    this.camera = new Camera();

    this._loadingBg = new LoadingBg(gl);
    this._loadingBar = new LoadingBar(gl);
  }

  setProgress(val) {
    this._loadingBar.setProgress(val);
  }

  onRender() {
    const camera = this.camera;

    gl.colorMask(false, false, false, false);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.colorMask(true, true, true, false);

    if (this.visible) {
      this._loadingBg.render(camera);
      this._loadingBar.render(camera);
    }
  }

  onAdded() {
    this.addComponent(new ResizeActionComponent(this.onResize, this));
  }

  onResize() {
    canvas.width = window.innerWidth * Black.device.pixelRatio;
    canvas.height = window.innerHeight * Black.device.pixelRatio;

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    gl.viewport(0, 0, canvas.width, canvas.height);

    this.camera.aspect = canvas.width / canvas.height;
  }
}