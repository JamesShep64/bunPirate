import { Polygon } from "./polygon";
import { Vector } from "../shared/Vector"
import { PhysicsObject } from "./PhysicsObject";
export class Block extends Polygon {
  id: string;
  width: number;
  height: number;
  physicsObject: PhysicsObject;
  constructor(id: string, x: number, y: number, width: number, height: number) {
    super(x, y, [new Vector(-width / 2, -height / 2), new Vector(width / 2, -height / 2), new Vector(width / 2, height / 2), new Vector(-width / 2, height / 2)], true, 50);
    this.id = id;
    this.width = width;
    this.height = height;
    this.physicsObject = new PhysicsObject();
    this.physicsObject.pos = this.pos;
  }
  update() {
    this.physicsObject.update();
  }
  serializeForUpdate() {
    return {
      id: this.id,
      x: this.pos.x,
      y: this.pos.y,
      points: this.points,
    }
  }
}
