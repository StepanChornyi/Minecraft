import { ColorHelper, RGB } from "black-engine";

class Helpers {
  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  isOutOfRadius(x, y, r) {
    return Math.abs(x) > r || Math.abs(y) > r || Math.sqrt(x * x + y * y) > r;
  }

  isPointerLocked(domElement) {
    return document.pointerLockElement === domElement ||
      document.mozPointerLockElement === domElement ||
      document.webkitPointerLockElement === domElement;
  }

  requestPointerLock(domElement) {
    domElement.requestPointerLock = domElement.requestPointerLock ||
      domElement.mozRequestPointerLock ||
      domElement.webkitRequestPointerLock;

    domElement.requestPointerLock()
  }

  exitPointerLock() {
    document.exitPointerLock = document.exitPointerLock ||
      document.mozExitPointerLock ||
      document.webkitExitPointerLock;

    document.exitPointerLock();
  }

  getDOMBackgroundColor(){
    const color = document.body.style.backgroundColor;

    if (color && color.indexOf("rgb(") >= 0) {
      const [r, g, b] = color.split('(')[1].split(')')[0].split(', ');

      return ColorHelper.rgb2hex(new RGB(parseInt(r), parseInt(g), parseInt(b)));
    }

    return null;
  }
}

const HELPERS = new Helpers();

export default HELPERS;