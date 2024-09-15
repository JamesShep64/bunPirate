import { Controllable } from "./Controllable";
import { Polygon } from "./polygon";
import { Vector } from "../shared/Vector";
import { PhysicsObject } from "./PhysicsObject";
import { PirateShip } from "./PirateShip";
import { Constants } from "../shared/constants";
export class Player extends Controllable {
  hitBox: Polygon;
  width: number;
  height: number;
  id: string;
  controlled: boolean;
  physicsObject: PhysicsObject;
  jumpTicks: number;
  jumpCooldown: number;
  onLadder: boolean;
  shipAboard: PirateShip | undefined;
  constructor(id: string, x: number, y: number) {
    super(x, y);
    this.id = id;
    this.jumpTicks = 0;
    this.jumpCooldown = 30;
    this.width = Constants.PLAYER_WIDTH;
    this.height = Constants.PLAYER_HEIGHT;
    this.hitBox = new Polygon(x, y, [new Vector(0, -this.height / 2), new Vector(this.width / 2, 0), new Vector(0, this.height / 2), new Vector(-this.width / 2, 0)], true, 40);
    this.physicsObject = new PhysicsObject();
    this.hitBox.pos = this.pos;
    this.physicsObject.pos = this.pos;
    this.controlled = false;
    this.onLadder = false;
    //this.physicsObject.gravityOn = false;

  }
  update() {
    if (this.horizontalMove.x < 0)
      this.horizontalMove.unitMultiply(-1);
    if (this.movingRight)
      this.physicsObject.addVelocity(this.horizontalMove);
    if (this.movingLeft)
      this.physicsObject.subtractVelocity(this.horizontalMove);

    if (this.movingDown && this.onLadder) {
      this.physicsObject.addVelocity(this.verticalMove);
    }
    if (this.movingUp && this.onLadder && this.jumpTicks == 0) {
      this.physicsObject.subtractVelocity(this.verticalMove);
    }
    if (!this.shipAboard)
      this.applyFriction(new Vector(1, 0));
    this.updateJumping();
    if (this.onLadder)
      this.physicsObject.onFloor = true;
    this.shipAboard = undefined;
    this.physicsObject.update();
  }
  updateJumping() {
    if (this.jumpTicks) {
      var mult = 2;
      mult -= .1 * (25 - this.jumpTicks);
      this.physicsObject.addVelocity(this.verticalMove.unitMultiplyReturn(-mult));
      this.jumpTicks--;
      this.jumpCooldown--;
    }
    if (this.jumpTicks == 0 && this.jumpCooldown < 30) {
      this.jumpCooldown--;
    }
    if (this.jumpCooldown == 0) {
      this.jumpCooldown = 30;
    }
  }
  applyFriction(vec: Vector, po?: PhysicsObject | undefined, polygon?: Polygon) {
    const forward = vec.unitReturn();
    this.horizontalMove.set(forward.x, forward.y);
    this.verticalMove.set(-forward.y, forward.x);
    this.physicsObject.gravity.set(-forward.y, forward.x);
    if (po) {
      this.physicsObject.setFriction(po.netVelocity);
      this.physicsObject.onFloor = true;
    }
    if (polygon)
      this.hitBox.rotateTo(polygon.direction);
  }
  toggleGravity() {
    this.physicsObject.gravityOn = !this.physicsObject.gravityOn;
  }
  jump() {
    if (this.jumpCooldown == 30 && (this.physicsObject.onFloor || this.onLadder)) {
      this.onLadder = false;
      this.jumpTicks = 25;
    }
  }
  moveUp() {
    if (!this.movingDown) {
      this.movingUp = true;
    }
  }

  moveDown() {
    if (!this.movingUp) {
      this.movingDown = true;
    }
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

