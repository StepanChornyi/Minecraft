// import { Vector } from 'black-engine';
// import Object3D from './object3D';
// import AABBPhysics from './aa-bb-physics';
// import HELPERS from '../utils/helpers';
// import Vector3 from '../utils/vector3';

// const vec3 = glMatrix.vec3;

// const KEY_CODES = { W: 87, A: 65, S: 83, D: 68, SPACEBAR: 32, LEFT_SHIFT: 16 };
// const pressedKeys = window.pressedKeys = window.pressedKeys || {};

// window.onkeyup = (e) => { pressedKeys[e.keyCode] = false; }
// window.onkeydown = (e) => { pressedKeys[e.keyCode] = true; }

// const GRAVITY_Y = -0.013;
// const WALK_SPEED = 0.25;
// const FLY_SPEED = 0.1;
// const JUMP_SPEED = 0.2;
// const OFFSET_FROM_GROUND = 1.55;

// const GRAVITY = -0.01;

// const size = new Vector3(0.6, 1.8, 0.6);

// export default class Player extends Object3D {
//   constructor(world, camera) {
//     super();

//     this.world = world;
//     this.camera = camera;

//     this.velocity = new Vector3();
//     this.acceleration = new Vector3();
//     this.dampingWalk = new Vector3(0.87, 0.99, 0.87);
//     this.dampingStand = new Vector3(0.85, 0.99, 0.85);
//     this.dampingFall = new Vector3(0.83, 0.83, 0.83);

//     this.cameraRotation = [0, 0, 0];

//     this.state = STATES.FLYING;

//     this.init();
//   }

//   init() {
//     const sensitivity = 0.0017;

//     document.onclick = () => HELPERS.requestPointerLock(document.body);

//     document.onkeydown = (e) => {
//       if (e.keyCode !== 69)
//         return;

//       if (HELPERS.isPointerLocked(document.body)) {
//         HELPERS.exitPointerLock();
//       } else {
//         HELPERS.requestPointerLock(document.body)
//       }
//     }

//     document.addEventListener('pointermove', (evt) => {
//       if (!HELPERS.isPointerLocked(document.body))
//         return;

//       this.cameraRotation[0] -= evt.movementY * sensitivity;
//       this.cameraRotation[1] -= evt.movementX * sensitivity;
//       this.cameraRotation[0] = Math.min(Math.PI * 0.5, Math.max(-Math.PI * 0.5, this.cameraRotation[0]));
//     });

//     document.addEventListener('mousedown', (evt) => {
//       if (HELPERS.isPointerLocked(document.body)) {
//         switch (evt.which) {
//           case 1: return this.post('leftClick');
//           case 3: return this.post('rightClick');
//         }
//       }
//     }, true);

//     window.addEventListener("blur", () => {
//       HELPERS.exitPointerLock();
//     });
//   }

//   onUpdate(dt) {
//     this.camera.rotationX = HELPERS.lerp(this.camera.rotationX, this.cameraRotation[0], 0.5);
//     this.camera.rotationY = HELPERS.lerp(this.camera.rotationY, this.cameraRotation[1], 0.5);

//     if (!HELPERS.isPointerLocked(document.body)) {
//       for (const key in pressedKeys)
//         if (Object.hasOwnProperty.call(pressedKeys, key))
//           pressedKeys[key] = false;
//     }

//     this._updateMovement();

//     this._updatePhysics(dt);

//     this.camera.x = this.x;
//     this.camera.y = this.y + 0.7;
//     this.camera.z = this.z;
//   }

//   _updatePhysics(dt) {
//     // this.acceleration.y = GRAVITY;

//     this.acceleration.clone()
//       .multiplyScalar(dt)
//       .addTo(this.velocity);

//     // this._checkCollision();

//     this.velocity.addTo(this);

//     if (this.isCollideBottom) {
//       if (this.acceleration.x || this.acceleration.z) {
//         this.velocity.multiply(this.dampingWalk);
//       } else {
//         this.velocity.multiply(this.dampingStand);
//       }
//     } else {
//       this.velocity.multiply(this.dampingFall);
//     }
//   }

//   _checkCollision() {
//     const position = new Vector3(this.x - 0.5 * size.x, this.y - 0.5 * size.y, this.z - 0.5 * size.z);
//     const collideOffset = AABBPhysics.collideWithWorld(position, size, this.velocity, this.world);

//     for (let i = 0; i < AABBPhysics.AXIS_KEYS.length; i++) {
//       const axis = AABBPhysics.AXIS_KEYS[i];

//       if (collideOffset[axis]) {
//         this[axis] += this.velocity[axis] + collideOffset[axis];
//         this.velocity[axis] = 0;
//       }
//     }

//     this.isCollideBottom = !!collideOffset.y;

//     return collideOffset;
//   }

//   isCollideWithBlock(x, y, z) {
//     const position = new Vector3(this.x - 0.5 * size.x, this.y - 0.5 * size.y, this.z - 0.5 * size.z);

//     const playerBox = new AABBPhysics.BoxCollider(
//       position.x,
//       position.y,
//       position.z,
//       position.x + size.x,
//       position.y + size.y,
//       position.z + size.z
//     );

//     const offset = 0.01;

//     const boxCollider = new AABBPhysics.BoxCollider(
//       x + offset,
//       y + offset,
//       z + offset,
//       x + 1 - offset * 2,
//       y + 1 - offset * 2,
//       z + 1 - offset * 2
//     );

//     return AABBPhysics.AA_BB(playerBox, boxCollider);
//   }

//   _updateMovement() {
//     let a = new Vector();

//     if (pressedKeys[KEY_CODES.A]) {
//       a.x = -1;
//     } else if (pressedKeys[KEY_CODES.D]) {
//       a.x = 1;
//     }
//     if (pressedKeys[KEY_CODES.W]) {
//       a.y = -1;
//     } else if (pressedKeys[KEY_CODES.S]) {
//       a.y = 1;
//     }

//     // const horizontalAcceleration = 0.0087;
//     const horizontalAcceleration = 0.02;

//     a.normalize().multiplyScalar(horizontalAcceleration);
//     a.setRotation(-this.camera.rotationY)

//     this.acceleration.x = a.x;
//     this.acceleration.z = a.y;

//     // if (this.isCollideBottom) {
//       if (pressedKeys[KEY_CODES.SPACEBAR]) {
//         // this.velocity.y = 0.17;
//         this.acceleration.y = 0.05;
//       } else if (pressedKeys[KEY_CODES.LEFT_SHIFT]) {
//         this.acceleration.y = -0.05;
//       }else{
//         this.acceleration.y = 0;
//       }
//     // }
//   }

//   isState(state) {
//     return this.state === state;
//   }
// }

// const STATES = {
//   FLYING: 'FLYING',
//   FALLING: 'FALLING',
//   WALKING: 'WALKING'
// };

import { Vector } from 'black-engine';
import Object3D from './object3D';
import AABBPhysics from './aa-bb-physics';
import HELPERS from '../utils/helpers';
import Vector3 from '../utils/vector3';

const vec3 = glMatrix.vec3;

const KEY_CODES = { W: 87, A: 65, S: 83, D: 68, SPACEBAR: 32, LEFT_SHIFT: 16 };
const pressedKeys = window.pressedKeys = window.pressedKeys || {};

window.onkeyup = (e) => { pressedKeys[e.keyCode] = false; }
window.onkeydown = (e) => { pressedKeys[e.keyCode] = true; }

const GRAVITY_Y = -0.013;
const WALK_SPEED = 0.25;
const FLY_SPEED = 0.1;
const JUMP_SPEED = 0.2;
const OFFSET_FROM_GROUND = 1.55;

const GRAVITY = -0.01;

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
    this.camera.rotationX = HELPERS.lerp(this.camera.rotationX, this.cameraRotation[0], 0.5);
    this.camera.rotationY = HELPERS.lerp(this.camera.rotationY, this.cameraRotation[1], 0.5);

    if (!HELPERS.isPointerLocked(document.body)) {
      for (const key in pressedKeys)
        if (Object.hasOwnProperty.call(pressedKeys, key))
          pressedKeys[key] = false;
    }

    this._updateMovement();

    this._updatePhysics(dt);

    this.camera.x = this.x;
    this.camera.y = this.y + 0.7;
    this.camera.z = this.z;
  }

  _updatePhysics(dt) {
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

  _checkCollision() {
    const position = new Vector3(this.x - 0.5 * size.x, this.y - 0.5 * size.y, this.z - 0.5 * size.z);
    const collideOffset = AABBPhysics.collideWithWorld(position, size, this.velocity, this.world);

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

  isCollideWithBlock(x, y, z) {
    const position = new Vector3(this.x - 0.5 * size.x, this.y - 0.5 * size.y, this.z - 0.5 * size.z);

    const playerBox = new AABBPhysics.BoxCollider(
      position.x,
      position.y,
      position.z,
      position.x + size.x,
      position.y + size.y,
      position.z + size.z
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

    this.acceleration.x = a.x;
    this.acceleration.z = a.y;

    if (this.isCollideBottom) {
      if (pressedKeys[KEY_CODES.SPACEBAR]) {
        this.velocity.y = 0.17;
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