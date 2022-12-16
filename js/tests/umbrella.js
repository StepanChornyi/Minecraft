import { Black, DisplayObject, Ease, Graphics, Tween, Vector } from "black-engine";
import ResizeActionComponent from "./../libs/resize-action-component";

export class Umbrella extends DisplayObject {
  constructor() {
    super();

    this.touchable = true;
    this.view = this.addChild(new Graphics());

    this.init();

    this.view.rotation = -0.03;

    this.view.addComponent(new Tween({
      rotation: 0.03
    }, 10, {
      ease: Ease.sinusoidalInOut,
      yoyo: true,
      loop: true
    }));
  }

  init() {
    const view = this.view;

    const innerRadius = 15;
    const outerRadius = 270;
    const segmentsCount = 8;
    const segmentCPOffset = 70;

    for (let i = 0, angleStep = Math.PI * 2 / segmentsCount; i < segmentsCount; i++) {
      const angle0 = angleStep * i;
      const angle1 = angleStep * (i - 0.5);
      const angle2 = angleStep * (i + 0.5);

      const dir = new Vector(innerRadius, 0).setRotation(angle0);

      const p0 = new Vector(0, 0).add(dir);
      const p1 = new Vector(outerRadius - innerRadius, 0).setRotation(angle1).add(dir);
      const p2 = new Vector(outerRadius - innerRadius, 0).setRotation(angle2).add(dir);
      const cp = new Vector(outerRadius - innerRadius - segmentCPOffset, 0).setRotation(angle0).add(dir);

      view.beginPath();
      view.fillStyle(i % 2 ? 0xfffbff : 0x820e01, 1);
      view.moveTo(p0.x, p0.y);
      view.lineTo(p1.x, p1.y);
      view.quadraticCurveTo(cp.x, cp.y, p2.x, p2.y);
      view.closePath();
      view.fill();
    }
  }

  onAdded() {
    this.addComponent(new ResizeActionComponent(this.onResize, this));
  }

  onResize() {
    const stageBounds = Black.stage.bounds;

    this.x = stageBounds.center().x;
    this.y = stageBounds.center().y;
  }
}