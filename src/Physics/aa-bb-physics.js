import Vector3 from '../Utils3D/vector3';

export default class AABBPhysics {
  constructor() {
    console.warn("Instance of 'AABBPhysics' cannot be created!");
  }

  static collideWithWorld(position, size, velocity, world) {
    const checkSize = 3;
    const maxOffset = new Vector3();

    for (let i = 0; i < AXIS_KEYS.length; i++) {
      const axis = AXIS_KEYS[i];
      const next = new Vector3().copyFrom(position);

      next[axis] += velocity[axis];

      const boxCollider = new BoxCollider(
        next.x,
        next.y,
        next.z,
        next.x + size.x,
        next.y + size.y,
        next.z + size.z
      );

      for (let i = 0, x = Math.floor(next.x), y = Math.floor(next.y), z = Math.floor(next.z); i < 27; i++) {
        const boxX = x + i % checkSize;
        const boxY = y + Math.floor(i / checkSize) % checkSize;
        const boxZ = z + Math.floor(i / (checkSize * checkSize)) % checkSize;
        const block = world.getBlock(boxX, boxY, boxZ);

        if (!block || block.isAir || block.transparency === 1) {
          continue;
        }

        const box = new BoxCollider(boxX, boxY, boxZ, boxX + 1, boxY + 1, boxZ + 1);

        if (AA_BB(boxCollider, box)) {
          const offset = getMinDist(boxCollider, box);

          if (Math.abs(offset[axis]) > Math.abs(maxOffset[axis])) {
            maxOffset[axis] = offset[axis];
          }
        }
      }
    }

    return maxOffset;
  }

  static collidePointWithWorld(position, velocity, world) {
    const next = new Vector3().copyFrom(position).add(velocity);
    const nextBlockPos = next.clone().floor();
    const block = world.getBlock(nextBlockPos.x, nextBlockPos.y, nextBlockPos.z);

    if (!block || block.isAir || block.transparency === 1) {
      position.copyFrom(next);
      return;
    }

    const distX = nextBlockPos.x + 0.5 - next.x;
    const distY = nextBlockPos.y + 0.5 - next.y;
    const distZ = nextBlockPos.z + 0.5 - next.z;

    const distXAbs = Math.abs(distX);
    const distYAbs = Math.abs(distY);
    const distZAbs = Math.abs(distZ);

    position.add(velocity);


    if (distXAbs > distYAbs && distXAbs > distZAbs) {
      velocity.x *= -1;
      position.x += (distX - 0.5 * sign(distX));
    } else if (distYAbs > distXAbs && distYAbs > distZAbs) {
      velocity.y *= -1;
      position.y += (distY - 0.5 * sign(distY));
    } else {
      velocity.z *= -1;
      position.z += (distZ - 0.5 * sign(distZ));
    }


    velocity.multiplyScalar(0.3);
  }

  static AA_BB(boxA, boxB) {
    return AA_BB(boxA, boxB);
  }

  static get AXIS_KEYS() {
    return AXIS_KEYS;
  }

  static get BoxCollider() {
    return BoxCollider;
  }
}

const AXIS_KEYS = ['x', 'y', 'z'];

class BoxCollider {
  constructor(minX, minY, minZ, maxX, maxY, maxZ) {
    this.minX = minX;
    this.minY = minY;
    this.minZ = minZ;
    this.maxX = maxX;
    this.maxY = maxY;
    this.maxZ = maxZ;
  }
}

function AA_BB(boxA, boxB) {
  return (
    boxA.minX < boxB.maxX &&
    boxA.maxX > boxB.minX &&
    boxA.minY < boxB.maxY &&
    boxA.maxY > boxB.minY &&
    boxA.minZ < boxB.maxZ &&
    boxA.maxZ > boxB.minZ
  );
}

function getMinDist(boxA, boxB, outVector = new Vector3()) {
  const distX = getMinDist1D(boxA.minX, boxA.maxX, boxB.minX, boxB.maxX);
  const distY = getMinDist1D(boxA.minY, boxA.maxY, boxB.minY, boxB.maxY);
  const distZ = getMinDist1D(boxA.minZ, boxA.maxZ, boxB.minZ, boxB.maxZ);

  if (Math.abs(distX) < Math.abs(distY) && Math.abs(distX) < Math.abs(distZ)) {
    outVector.x = distX;
  } else if (Math.abs(distY) < Math.abs(distZ)) {
    outVector.y = distY;
  } else {
    outVector.z = distZ;
  }

  return outVector;
}

function getMinDist1D(aMin, aMax, bMin, bMax) {
  return ((aMin + aMax) * 0.5 - (bMin + bMax) * 0.5 < 0) ? bMin - aMax : bMax - aMin;
}

function sign(v) {
  return v < 0 ? -1 : 1;
}