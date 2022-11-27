import { Black, CapsStyle, ColorHelper, DisplayObject, Graphics, RGB, Sprite, Vector } from "black-engine";
import ResizeActionComponent from "./../libs/resize-action-component";
import QueueFast from "./../utils/queue-fast";

const BOARD_SIZE = 60;
const BLOCK_SIZE = 15;
const LINE_WIDTH = 0.4;
const MAX_LIGHT = 15;

export class LightTestNew extends DisplayObject {
  constructor() {
    super();

    this.touchable = true;
    this.bg = this.addChild(this.createBg());
    this.blocksView = this.addChild(this.createBlocksView());
    this.drawQueue = new QueueFast();
    this.reverseQueue = new QueueFast();
    this.traverseQueue = new QueueFast();
    this.blocks = [];

    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
      const x = i % BOARD_SIZE
      const y = Math.floor(i / BOARD_SIZE);
      const block = new Block(x, y);

      block.light = 0;

      this.blocks[i] = block;

      // if (Math.random() < 0.3) {
      //   block.type = 1;

      //   this.drawBlock(block);
      // } else if (Math.random() < 0.01) {
      //   block.light = MAX_LIGHT;
      //   this.addToDrawQueue(block);
      //   this.traverseQueue.add(block);
      // }
    }

    // this.traverse();

    this.bg.touchable = true;

    let isPressed = false;
    let pressedBtn = 0;
    let isDraw = -1;
    let prevX = -1;
    let prevY = -1;

    const handlePointer = (x, y) => {
      if (prevX === x && prevY === y)
        return;

      this.reverseQueue.reset();
      this.traverseQueue.reset();

      prevX = x;
      prevY = y;

      const block = this.getBlock(x, y);

      if (isDraw === -1) {
        isDraw = true;

        if (pressedBtn === 2 && block.type) {
          isDraw = false;
        } else if (block.light === MAX_LIGHT) {
          isDraw = false;
        }
      }

      if (pressedBtn === 2) {
        if (isDraw) {
          block.type = 1;
        } else {
          block.type = 0;
          block.light = 0;
        }

        this.addToDrawQueue(block);

        this.reverseQueue.add(block);

        this.reverse();
        this.traverse();
      } else {
        if (isDraw) {
          block.light = MAX_LIGHT;
          block.dir = 0;
          block.type = 0;

          this.addToDrawQueue(block);
          this.traverseQueue.add(block);
          this.traverse();
        } else {
          block.light = 0;
          block.dir = 0;
          block.type = 0;

          this.addToDrawQueue(block);
          this.reverseQueue.add(block);
          this.reverse();
          this.traverse();
        }
      }

    }

    this.bg.on('pointerDown', (_, pointerInfo) => {
      const position = this.bg.globalToLocal(pointerInfo);
      const boardX = Math.floor(position.x / BLOCK_SIZE);
      const boardY = Math.floor(position.y / BLOCK_SIZE);

      pressedBtn = pointerInfo.button;
      isPressed = true;

      handlePointer(boardX, boardY);
    });

    this.bg.on('pointerUp', () => {
      isPressed = false;
      isDraw = -1;
      prevX = -1;
      prevY = -1;
    });

    this.bg.on('pointerMove', (_, pointerInfo) => {
      if (!isPressed)
        return;

      const position = this.bg.globalToLocal(pointerInfo);
      const boardX = Math.floor(position.x / BLOCK_SIZE);
      const boardY = Math.floor(position.y / BLOCK_SIZE);

      handlePointer(boardX, boardY);
    });
  }

  reverse() {
    let count = 0;
    const reverseQueue = this.reverseQueue;
    const traverseQueue = this.traverseQueue;
    let light, prevDir, prevDirIvs, prevNormIvs;

    while (reverseQueue.length) {
      if (++count > 5000) {
        console.warn("Reverse calculation error o__O");
        return;
      }

      const prevBlock = reverseQueue.peek();

      prevDir = prevBlock.dir;
      prevDirIvs = invertDir(prevDir);

      for (let i = 0; i < directionsArr.length; i++) {
        const dir = directionsArr[i];

        const pos = new Vector()
          .copyFrom(normals[dir])
          .add(prevBlock);

        const block = this.getBlock(pos.x, pos.y);

        if (!block || block.type) {
          continue;
        }

        if (block.dir !== dir) {
          if (block.light > 0)
            traverseQueue.add(block);
          continue;
        }

        if (block.light > 0) {
          block.light = 0;
          block.dir = 0;
          block.type = 0;

          reverseQueue.add(block);
          this.addToDrawQueue(block);
        }
      }

      count++;
    }
  }

  traverse() {
    let count = 0;
    const traverseQueue = this.traverseQueue;
    let light, prevDir, prevDirIvs, prevNorm, prevNormIvs;

    while (traverseQueue.length) {
      if (++count > 5000) {
        console.warn("Light calculation error o__O");
        return;
      }

      const prevBlock = traverseQueue.peek();

      prevDir = prevBlock.dir;
      prevDirIvs = invertDir(prevDir);

      for (let i = 0; i < directionsArr.length; i++) {
        const dir = directionsArr[i];

        if (dir === prevDirIvs) {
          continue;
        }

        const pos = new Vector()
          .copyFrom(normals[directionsArr[i]])
          .add(prevBlock);

        const block = this.getBlock(pos.x, pos.y);

        light = prevBlock.light - 1;

        if (dir !== prevDir && prevDir) {
          prevNormIvs = normals[prevDirIvs];
          prevNorm = normals[prevDir];

          const isSolid1 = prevNormIvs && (this.getBlock(pos.x + prevNormIvs.x, pos.y + prevNormIvs.y) || {}).type;
          const isSolid2 = prevNorm && (this.getBlock(pos.x + prevNorm.x, pos.y + prevNorm.y) || {}).type;

          if (isSolid1 && isSolid2) {
            light = ~~(light * 0.7);
          }
        }

        // if (offX !== -conf.vx || offY !== -conf.vy || offZ !== -conf.vz)
        //   l = l < 1 ? 0 : l - 1;

        if (!block || block.type || block.light >= light)
          continue;

        block.light = light;
        block.dir = dir;

        this.addToDrawQueue(block);

        if (light > 1) {
          traverseQueue.add(block);
        }
      }

      count++;
    }
  }

  onUpdate() {
    if (this.drawQueue.length) {
      let drawPerUpdate = Math.max(1, Math.round(this.drawQueue.length * 0.01));

      for (let i = 0; this.drawQueue.length && i < drawPerUpdate; i++) {
        this.drawBlock(this.drawQueue.peek());
      }
    } else {
      this.drawQueue.reset();
    }
  }

  drawBlock(block) {
    this.blocksView.drawBlock(block);
  }

  addToDrawQueue(block) {
    this.drawQueue.add(Block.from(block));
  }

  getBlock(x, y) {
    if (x < 0 || x >= BOARD_SIZE)
      return null;

    if (y < 0 || y >= BOARD_SIZE)
      return null;

    return this.blocks[x + y * BOARD_SIZE];
  }

  getBlockIndex(x, y) {
    return x + y * BOARD_SIZE;
  }

  createBg() {
    const container = new DisplayObject();
    const bg = new Graphics();

    bg.beginPath();
    bg.fillStyle(0x111111);
    bg.rect(0, 0, BOARD_SIZE * BLOCK_SIZE, BOARD_SIZE * BLOCK_SIZE);
    bg.closePath();
    bg.fill();

    bg.lineStyle(LINE_WIDTH, 0x000000);

    for (let x = 0; x <= BOARD_SIZE; x++) {
      bg.beginPath();
      bg.moveTo(x * BLOCK_SIZE, 0);
      bg.lineTo(x * BLOCK_SIZE, BOARD_SIZE * BLOCK_SIZE);
      bg.stroke();
      bg.closePath();
    }

    for (let y = 0; y <= BOARD_SIZE; y++) {
      bg.beginPath();
      bg.moveTo(0, y * BLOCK_SIZE);
      bg.lineTo(BOARD_SIZE * BLOCK_SIZE, y * BLOCK_SIZE);
      bg.stroke();
      bg.closePath();
    }

    container.add(bg);

    container.cacheAsBitmap = true;
    container.cacheAsBitmapDynamic = false;

    return bg;
  }

  createBlocksView() {
    const container = new DisplayObject();
    const graphics = [];

    container.drawBlock = (block) => {
      const i = this.getBlockIndex(block.x, block.y);
      const g = graphics[i] = graphics[i] || container.addChild(new Graphics());

      g.clear();

      g.x = block.x * BLOCK_SIZE;
      g.y = block.y * BLOCK_SIZE;

      g.beginPath();

      if (block.type) {
        g.fillStyle(0x3245d1);
      } else {
        g.fillStyle(0xed32e4, block.light / MAX_LIGHT);
      }

      g.rect(
        LINE_WIDTH * 0.5,
        LINE_WIDTH * 0.5,
        BLOCK_SIZE - LINE_WIDTH,
        BLOCK_SIZE - LINE_WIDTH
      );
      g.closePath();
      g.fill();


      g.lineStyle(LINE_WIDTH, 0x111111, 0.5);

      if (block.type) {
        g.beginPath();
        g.moveTo(0 * BLOCK_SIZE, 0 * BLOCK_SIZE);
        g.lineTo(1 * BLOCK_SIZE, 1 * BLOCK_SIZE);
        g.stroke();
        g.closePath();

        g.beginPath();
        g.moveTo(1 * BLOCK_SIZE, 0 * BLOCK_SIZE);
        g.lineTo(0 * BLOCK_SIZE, 1 * BLOCK_SIZE);
        g.stroke();
        g.closePath();
      } else if (block.dir) {
        const p1 = new Vector(0, -0.3).setRotation(angles[block.dir]).add(new Vector(0.5, 0.5));
        const p2 = new Vector(0.2, 0.2).setRotation(angles[block.dir]).add(new Vector(0.5, 0.5));
        const p3 = new Vector(-0.2, 0.2).setRotation(angles[block.dir]).add(new Vector(0.5, 0.5));

        g.beginPath();
        g.moveTo(p1.x * BLOCK_SIZE, p1.y * BLOCK_SIZE);
        g.lineTo(p2.x * BLOCK_SIZE, p2.y * BLOCK_SIZE);
        g.lineTo(p3.x * BLOCK_SIZE, p3.y * BLOCK_SIZE);
        g.closePath();
        g.stroke();
      }
    };

    return container;
  }

  onAdded() {
    this.addComponent(new ResizeActionComponent(this.onResize, this));
  }

  onResize() {
    const stageBounds = Black.stage.bounds;

    this.x = stageBounds.left;
    this.y = stageBounds.top;
  }
}

class Block {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.light = 0;
    this.type = 0;
    this.dir = 0;
  }

  static from(block) {
    const b = new Block();

    b.x = block.x;
    b.y = block.y;
    b.light = block.light;
    b.type = block.type;
    b.dir = block.dir;

    return b;
  }
}

const directions = {
  top: 0b010,//2
  bottom: 0b101,//5
  right: 0b100,//4
  left: 0b011,//3
};

const directionsArr = [
  directions.top,
  directions.right,
  directions.bottom,
  directions.left,
];

const normals = {};

normals[directions.top] = new Vector(0, -1);
normals[directions.bottom] = new Vector(0, 1);
normals[directions.right] = new Vector(1, 0);
normals[directions.left] = new Vector(-1, 0);

const angles = {};

angles[directions.top] = 0;
angles[directions.bottom] = Math.PI;
angles[directions.right] = Math.PI * 0.5;
angles[directions.left] = Math.PI * 1.5;

function invertDir(dir) {
  return dir ^ 0x7;
}
