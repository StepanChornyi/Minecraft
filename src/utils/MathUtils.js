export default class MathUtils {
  static isOutOfRadiusAB(ax, ay, bx, by, r) {
    return MathUtils.isOutOfRadius(ax - bx, ay - by, r);
  }

  static isOutOfRadius(distX, distY, r) {
    distX = MathUtils.abs(distX);
    distY = MathUtils.abs(distY);

    if (distX > r || distY > r) {
      return true;
    }

    if (distX + distY < r) {
      return false;
    }

    return Math.sqrt(distX * distX + distY * distY) > r;
  }

  static isOutOfRadiusManhattan(distX, distY, r) {
    return MathUtils.abs(distX) + MathUtils.abs(distY) > r;
  }

  static abs(v) {
    return v < 0 ? -v : v;
  }
}