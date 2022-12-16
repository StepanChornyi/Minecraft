import { Vector } from 'black-engine';
import Object3D from './object3D';
import AABBPhysics from './aa-bb-physics';
import HELPERS from '../utils/helpers';
import Vector3 from '../utils/vector3';
import PhysicsBody from './physics-body';

const vec3 = glMatrix.vec3;

const KEY_CODES = { W: 87, A: 65, S: 83, D: 68, SPACEBAR: 32, LEFT_SHIFT: 16 };
const pressedKeys = window.pressedKeys = window.pressedKeys || {};

window.onkeyup = (e) => { pressedKeys[e.keyCode] = false; }
window.onkeydown = (e) => { pressedKeys[e.keyCode] = true; }

const size = new Vector3(0.6, 1.8, 0.6);

export default class Player extends Object3D {
  constructor(world, camera) {
    super();

    this.world = world;
    this.camera = camera;

    this.velocity = new Vector3();
    this.acceleration = new Vector3();
    this.dampingWalk = new Vector3(0.87, 0.99, 0.87);
    this.dampingStand = new Vector3(0.85, 0.99, 0.85);
    this.dampingFall = new Vector3(0.83, 0.99, 0.83);

    this.body = new PhysicsBody(world, size);

    this.cameraRotation = [0, 0, 0];

    this.state = STATES.FLYING;

    this.init();
  }

  init() {
    const sensitivity = 0.0017;

    document.onclick = () => HELPERS.requestPointerLock(document.body);

    document.onkeydown = (e) => {
      if (e.keyCode !== 69)
        return;

      if (HELPERS.isPointerLocked(document.body)) {
        HELPERS.exitPointerLock();
      } else {
        HELPERS.requestPointerLock(document.body)
      }
    }

    document.addEventListener('pointermove', (evt) => {
      if (!HELPERS.isPointerLocked(document.body))
        return;

      this.cameraRotation[0] -= evt.movementY * sensitivity;
      this.cameraRotation[1] -= evt.movementX * sensitivity;
      this.cameraRotation[0] = Math.min(Math.PI * 0.5, Math.max(-Math.PI * 0.5, this.cameraRotation[0]));
    });

    document.addEventListener('mousedown', (evt) => {
      if (HELPERS.isPointerLocked(document.body)) {
        switch (evt.which) {
          case 1: return this.post('leftClick');
          case 3: return this.post('rightClick');
        }
      }
    }, true);

    window.addEventListener("blur", () => {
      HELPERS.exitPointerLock();
    });
  }

  onUpdate(dt) {
    this.camera.rotationX = HELPERS.lerp(this.camera.rotationX, this.cameraRotation[0], 0.6);
    this.camera.rotationY = HELPERS.lerp(this.camera.rotationY, this.cameraRotation[1], 0.6);

    if (!HELPERS.isPointerLocked(document.body)) {
      for (const key in pressedKeys)
        if (Object.hasOwnProperty.call(pressedKeys, key))
          pressedKeys[key] = false;
    }

    this._updateMovement();

    this.body.onUpdate(dt);

    this.position = this.body.position;

    this.camera.position = [this.x, this.y+ 0.7, this.z];
    this.camera.y = this.y + 0.7;
    this.camera.z = this.z;
  }

  _setTransformDirty() {
    this.body.position = this.position;

    super._setTransformDirty();
  }

  isCollideWithBlock(x, y, z) {
    return this.body.isCollideWithBlock(x, y, z);
  }

  _updateMovement() {
    let a = new Vector();

    if (pressedKeys[KEY_CODES.A]) {
      a.x = -1;
    } else if (pressedKeys[KEY_CODES.D]) {
      a.x = 1;
    }
    if (pressedKeys[KEY_CODES.W]) {
      a.y = -1;
    } else if (pressedKeys[KEY_CODES.S]) {
      a.y = 1;
    }

    // const horizontalAcceleration = 0.0087;
    const horizontalAcceleration = 0.0095;

    a.normalize().multiplyScalar(horizontalAcceleration);
    a.setRotation(-this.camera.rotationY)

    this.body.acceleration.x = a.x;
    this.body.acceleration.z = a.y;

    if (this.body.isCollideBottom) {
      if (pressedKeys[KEY_CODES.SPACEBAR]) {
        this.body.velocity.y = 0.17;
      } else if (pressedKeys[KEY_CODES.LEFT_SHIFT]) {
        // this.acceleration.y = -SPEED;
      }
    }
  }

  isState(state) {
    return this.state === state;
  }
}

const STATES = {
  FLYING: 'FLYING',
  FALLING: 'FALLING',
  WALKING: 'WALKING'
};