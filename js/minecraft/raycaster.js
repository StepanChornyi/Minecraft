import Vector3 from "../utils/vector3";

export default class Raycaster {
  constructor(world) {
    this.world = world;

    this.axisScale = new Vector3();
    this.axisOffset = new Vector3();
    this.axisLength = new Vector3();
    this.castDelta = new Vector3();

    this.checkPos = new Vector3();
    this.prevCheckPos = new Vector3();
  }

  cast(a, b, castRange = null) {
    const world = this.world;

    const D = this.castDelta.set(
      b.x - a.x,
      b.y - a.y,
      b.z - a.z,
    );

    castRange = castRange === null ? D.length() : castRange;

    const axisScale = this.axisScale.set(
      Math.abs(castRange / D.x),
      Math.abs(castRange / D.y),
      Math.abs(castRange / D.z),
    );

    const axisLength = this.axisLength.set(0, 0, 0);
    const prevCheckPos = this.prevCheckPos.set(0, 0, 0);
    const checkPos = this.checkPos.set(
      Math.floor(a.x),
      Math.floor(a.y),
      Math.floor(a.z),
    );

    const axisOffset = this.axisOffset.set(
      D.x < 0 ? a.x % 1 : 1 - a.x % 1,
      D.y < 0 ? a.y % 1 : 1 - a.y % 1,
      D.z < 0 ? a.z % 1 : 1 - a.z % 1,
    );

    axisOffset.x += (a.x < 0) ? sign(-D.x) : 0;
    axisOffset.y += (a.y < 0) ? sign(-D.y) : 0;
    axisOffset.z += (a.z < 0) ? sign(-D.z) : 0;

    let minDist = 0;

    while (true) {
      axisLength.x = Math.abs(axisScale.x * axisOffset.x);
      axisLength.y = Math.abs(axisScale.y * axisOffset.y);
      axisLength.z = Math.abs(axisScale.z * axisOffset.z);

      minDist = Math.min(axisLength.x, Math.min(axisLength.y, axisLength.z));

      if (minDist >= castRange) {
        return null;
      }

      prevCheckPos.copyFrom(checkPos);

      if (minDist === axisLength.x) {
        axisOffset.x++;
        checkPos.x += sign(D.x);
      } else if (minDist === axisLength.y) {
        axisOffset.y++;
        checkPos.y += sign(D.y);
      } else {
        axisOffset.z++;
        checkPos.z += sign(D.z);
      }

      const block = world.getBlock(checkPos.x, checkPos.y, checkPos.z);

      if (block && !block.isAir) {
        return [
          checkPos.x,
          checkPos.y,
          checkPos.z,
          prevCheckPos.x,
          prevCheckPos.y,
          prevCheckPos.z,
        ];
      }
    }
  }
}

function sign(x) {
  return x < 0 ? -1 : 1;
}