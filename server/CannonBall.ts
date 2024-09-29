import { Vector } from "../shared/Vector";
import { putInGrid } from "./collisions";
import { PhysicsObject } from "./PhysicsObject";
import { Polygon } from "./polygon";

export class CannonBall extends Polygon {
  physicsObject: PhysicsObject;
  constructor(id: string, x: number, y: number, launchVel: Vector) {
    super(x, y, [new Vector(0, -10), new Vector(10, 0), new Vector(0, 10), new Vector(-10, 0)], true, 10, id);
    this.physicsObject = new PhysicsObject();
    this.physicsObject.pos = this.pos;
    this.physicsObject.setFriction(launchVel);
  }
  update(): void {
    super.update();
    this.physicsObject.update();
    putInGrid(this.pos, this);
  }
  serializeForUpdate() {
    return {
      id: this.id,
      x: this.pos.x,
      y: this.pos.y,
    }
  }
}
