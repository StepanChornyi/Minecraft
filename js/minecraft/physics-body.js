import { Vector } from 'black-engine';
import Object3D from './object3D';
import AABBPhysics from './aa-bb-physics';
import HELPERS from '../utils/helpers';
import Vector3 from '../utils/vector3';

const GRAVITY = -0.01;

export default class PhysicsBody extends Object3D {
  constructor(world, size = new Vector3(1, 1, 1)) {
    super();

    this.world = world;
    this.size = size;

    this.velocity = new Vector3();
    this.acceleration = new Vector3();
    this.dampingWalk = new Vector3(0.87, 0.99, 0.87);
    this.dampingStand = new Vector3(0.85, 0.99, 0.85);
    this.dampingFall = new Vector3(0.83, 0.99, 0.83);

    this.isCollideBottom = false;
  }

  onUpdate(dt) {
    this.acceleration.y = GRAVITY;

    this.acceleration.clone()
      .multiplyScalar(dt)
      .addTo(this.velocity);

    this._checkCollision();

    this.velocity.addTo(this);

    if (this.isCollideBottom) {
      if (this.acceleration.x || this.acceleration.z) {
        this.velocity.multiply(this.dampingWalk);
      } else {
        this.velocity.multiply(this.dampingStand);
      }
    } else {
      this.velocity.multiply(this.dampingFall);
    }
  }

  isCollideWithBlock(x, y, z) {
    const position = new Vector3(this.x - 0.5 * this.size.x, this.y - 0.5 * this.size.y, this.z - 0.5 * this.size.z);

    const playerBox = new AABBPhysics.BoxCollider(
      position.x,
      position.y,
      position.z,
      position.x + this.size.x,
      position.y + this.size.y,
      position.z + this.size.z
    );

    const offset = 0.01;

    const boxCollider = new AABBPhysics.BoxCollider(
      x + offset,
      y + offset,
      z + offset,
      x + 1 - offset * 2,
      y + 1 - offset * 2,
      z + 1 - offset * 2
    );

    return AABBPhysics.AA_BB(playerBox, boxCollider);
  }

  _checkCollision() {
    const position = new Vector3(this.x - 0.5 * this.size.x, this.y - 0.5 * this.size.y, this.z - 0.5 * this.size.z);
    const collideOffset = AABBPhysics.collideWithWorld(position, this.size, this.velocity, this.world);

    for (let i = 0; i < AABBPhysics.AXIS_KEYS.length; i++) {
      const axis = AABBPhysics.AXIS_KEYS[i];

      if (collideOffset[axis]) {
        this[axis] += this.velocity[axis] + collideOffset[axis];
        this.velocity[axis] = 0;
      }
    }

    this.isCollideBottom = !!collideOffset.y;

    return collideOffset;
  }
}