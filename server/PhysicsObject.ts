import { Constants } from "../shared/constants";
import { Vector } from "../shared/Vector";

export class PhysicsObject {
  pos: Vector;
  displace: Vector;
  friction: Vector;
  gravity: Vector;
  netVelocity: Vector;
  collisionThisTick: boolean;
  gravityVelocity: Vector;
  gravityOn: boolean;
  constructor() {
    this.pos = new Vector(0, 0);
    this.displace = new Vector(0, 0);
    this.friction = new Vector(0, 0);
    this.gravity = new Vector(0, 1);
    this.netVelocity = new Vector(0, 0);
    this.collisionThisTick = false;
    this.gravityVelocity = new Vector(0, 0);
    this.gravityOn = true;
  }
  update() {
    this.updateDisplace();
    if (this.gravityOn && this.gravityVelocity.magnatude() < Constants.MAX_GRAVITY)
      this.gravityVelocity.add(this.gravity.unitMultiplyReturn(Constants.GRAVITY_MULT));
    if (this.gravityOn)
      this.netVelocity.add(this.gravityVelocity);
    this.netVelocity.add(this.friction);
    this.pos.x += this.netVelocity.x * Constants.VELOCITY_MULTIPLIER;
    this.pos.y += this.netVelocity.y * Constants.VELOCITY_MULTIPLIER;
    this.netVelocity.set(0, 0);
  }
  updateDisplace() {
    this.pos.add(this.displace);
    this.displace.set(0, 0);
  }
  addDisplacement(vec: Vector) {
    this.displace.add(vec);
  }
  addVelocity(vec: Vector) {
    this.netVelocity.add(vec);
  }

}
