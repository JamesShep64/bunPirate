import { shipUpdate } from "../shared/Message";
import { Vector } from "../shared/Vector";
import { Block } from "./Block";
import { Mass } from "./Mass";
import { PhysicsObject } from "./PhysicsObject";
import { Player } from "./Player";
import { Polygon } from "./polygon";
export class PirateShip {
  pos: Vector;
  netVelocity: Vector;
  displace: Vector;
  friction: Vector;
  forward: Vector;
  bodyPoly: Polygon;
  collisionZerosPolygon: Polygon;
  id: string;
  missingZeros: number[];
  masses: Mass[];
  players: { [key: string]: Player };
  blocks: { [key: string]: Block };
  torque: number;
  controlled: boolean;
  direction: number;
  physicsObject: PhysicsObject;
  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.pos = new Vector(x, y);
    this.controlled = false;
    this.netVelocity = new Vector(0, 0);
    this.displace = new Vector(0, 0);
    this.friction = new Vector(0, 0);
    this.forward = new Vector(1, 0);
    this.direction = 1;
    this.players = {};
    this.blocks = {};
    this.masses = [];
    this.torque = 0;
    this.physicsObject = new PhysicsObject();
    this.physicsObject.gravityOn = false;
    this.bodyPoly = new Polygon(x, y, [new Vector(-220, -30), new Vector(-35, -30), new Vector(-35, 0), new Vector(-125, 0), new Vector(-125, 65), new Vector(125, 65), new Vector(125, 0), new Vector(35, 0), new Vector(35, -30), new Vector(220, -30), new Vector(220, 0), new Vector(140, 100), new Vector(-140, 100), new Vector(-220, 0)], false);
    this.collisionZerosPolygon = new Polygon(0, 0, [new Vector(-210, -20), new Vector(-45, -20), new Vector(-45, -10), new Vector(45, -10), new Vector(45, -20), new Vector(210, -20), new Vector(210, -10), new Vector(130, 90), new Vector(-130, 90), new Vector(-210, -10)], false);
    this.collisionZerosPolygon.pos = this.pos;
    this.bodyPoly.pos = this.pos;
    this.physicsObject.pos = this.pos;
    this.missingZeros = [3, 4, 5, 6];
  }
  update() {
    this.applyTorque();
    this.forward.set(this.bodyPoly.points[1].x - this.bodyPoly.points[0].x, this.bodyPoly.points[1].y - this.bodyPoly.points[0].y);
    this.physicsObject.addVelocity(this.forward.unitMultiplyReturn(.01));
    this.physicsObject.update();
  }
  getTorque() {
    //player torque
    Object.values(this.players).forEach(player => {
      this.torque += (player.pos.x - this.pos.x) / 600;
    });
    this.masses.forEach(mass => {
      this.torque += mass.weight * (mass.poly.pos.x - this.pos.x) / 600;
    });
  }
  rotate(r: number) {
    this.bodyPoly.rotate(r);
    this.collisionZerosPolygon.rotate(r);
  }
  applyTorque() {
    //the torque is assumed to have a maximum absolute value of 1000, will rotate at the ration of the torque to maximum torque of this angle
    var appliedRotation = this.torque * (.0001);
    this.rotate(appliedRotation);
  }
  addMass(t: number, weight: number) {
    const mass = new Mass(t, weight);
    this.masses.push(mass);
    mass.poly.pos = this.pos;
    mass.poly.rotateTo(this.bodyPoly.direction);
  }
  serializeForUpdate() {
    return {
      id: this.id,
      x: this.pos.x,
      y: this.pos.y,
      points: this.bodyPoly.points,
      zeroPoints: this.collisionZerosPolygon.points,
      missingZeros: this.missingZeros,
      masses: this.masses.map(mass => mass.serializeForUpdates()),
    } as shipUpdate;
  }

}
