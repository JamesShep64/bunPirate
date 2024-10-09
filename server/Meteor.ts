import { Constants } from "../shared/constants";
import { Vector } from "../shared/Vector";
import { putInGrid } from "./collisions";
import { PhysicsObject } from "./PhysicsObject";
import { Polygon } from "./polygon";
import { game } from "./users";

export class Meteor extends Polygon {
  physicsObject: PhysicsObject;
  collisionIDs: string[] = [];
  constructor(id: string, x: number, y: number, launchVel: Vector) {
    super(x, y, [new Vector(0, -20), new Vector(20, 0), new Vector(0, 20), new Vector(-20, 0)], true, 20, id);
    this.physicsObject = new PhysicsObject();
    this.physicsObject.pos = this.pos;
    this.physicsObject.setFriction(launchVel);
    this.physicsObject.gravityOn = false;
  }
  update() {
    if (this.pos.x < 0 || this.pos.x > Constants.MAP_WIDTH || this.pos.y < 0 || this.pos.y > Constants.MAP_HEIGHT) {
      game.deleteMeteor(this, true);
      return;
    }
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
