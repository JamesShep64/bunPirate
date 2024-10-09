import generateUniqueId from "generate-unique-id";
import { Constants } from "../shared/constants";
import { Vector } from "../shared/Vector";
import { PhysicsVelocity } from "./PhysicsVelocity";

export class PhysicsObject {
  pos: Vector;
  displace: Vector;
  friction: Vector;
  gravity: Vector;
  netVelocity: Vector;
  currentVelocity: Vector;
  collisionThisTick: boolean;
  gravityVelocity: Vector;
  gravityOn: boolean;
  onFloor: boolean;
  physicsVelocities: { [key: string]: PhysicsVelocity };
  constructor() {
    this.pos = new Vector(0, 0);
    this.displace = new Vector(0, 0);
    this.gravity = new Vector(0, 1);
    this.netVelocity = new Vector(0, 0);
    this.currentVelocity = new Vector(0, 0);
    this.collisionThisTick = false;
    this.gravityVelocity = new Vector(0, 0);
    this.friction = new Vector(0, 0);
    this.gravityOn = true;
    this.onFloor = false;
    this.physicsVelocities = {};
  }
  update() {
    if (!this.onFloor && this.gravityOn && this.netVelocity.y < Constants.MAX_GRAVITY)
      this.gravityVelocity.add(this.gravity.unitMultiplyReturn(Constants.GRAVITY_MULT));
    if (this.gravityOn && !this.onFloor)
      this.currentVelocity.add(this.gravityVelocity);
    else
      this.gravityVelocity.set(0, 0);
    this.currentVelocity.add(this.friction);
    this.updatePhysicsVelocities();
    this.pos.x += this.currentVelocity.x * Constants.VELOCITY_MULTIPLIER;
    this.pos.y += this.currentVelocity.y * Constants.VELOCITY_MULTIPLIER;
    this.netVelocity = this.currentVelocity.copy();
    this.currentVelocity.set(0, 0);
    this.onFloor = false;
  }
  updatePhysicsVelocities() {
    Object.values(this.physicsVelocities).forEach(vel => {
      vel.update();
      if (vel.ticks == 0)
        delete this.physicsVelocities[vel.id];
      else {
        //console.log(vel.velocity);
        this.addVelocity(vel.velocity);
      }
    });
  }
  updateDisplace() {
    this.pos.add(this.displace);
    this.displace.set(0, 0);
  }
  addDisplacement(vec: Vector) {
    this.displace.add(vec);
  }
  addVelocity(vec: Vector) {
    this.currentVelocity.add(vec);
  }
  setFriction(vec: Vector) {
    this.friction.set(vec.x, vec.y);
  }
  addExplosionVelocity(vec: Vector) {
    var id = generateUniqueId({ length: 4 });
    this.physicsVelocities[id] = new PhysicsVelocity(id, 30, vec.unitMultiplyReturn(2), .98);
  }
  addCollisionVelocity(vec: Vector) {
    var id = generateUniqueId({ length: 4 });
    this.physicsVelocities[id] = new PhysicsVelocity(id, 15, vec.unitMultiplyReturn(2.5), .85);
  }
  subtractVelocity(vec: Vector) {
    this.currentVelocity.subtract(vec);
  }

}
