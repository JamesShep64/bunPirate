import { Controllable } from "./Controllable";
import { Polygon } from "./polygon";
import { Vector } from "../shared/Vector";
import { PhysicsObject } from "./PhysicsObject";
export class Player extends Controllable {
  hitBox: Polygon;
  width: number;
  height: number;
  id: string;
  controlled: boolean;
  physicsObject: PhysicsObject;
  constructor(id: string, x: number, y: number) {
    super(x, y);
    this.id = id;
    this.width = 20;
    this.height = 20;
    this.hitBox = new Polygon(x, y, [new Vector(0, -this.height / 2), new Vector(this.width / 2, 0), new Vector(0, this.height / 2), new Vector(-this.width / 2, 0)], true);
    this.physicsObject = new PhysicsObject();
    this.hitBox.pos = this.pos;
    this.physicsObject.pos = this.pos;
    this.controlled = false;
    this.physicsObject.gravityOn = false;

  }
  update() {
    if (this.movingLeft || this.movingRight)
      this.physicsObject.addVelocity(this.horizontalMove);
    if (this.movingUp || this.movingDown)
      this.physicsObject.addVelocity(this.verticalMove);
    this.physicsObject.update();
  }
  serializeForUpdate() {
    return {
      id: this.id,
      x: this.pos.x,
      y: this.pos.y,
      points: this.hitBox.points,
    }
  }

}

