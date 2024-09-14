import { shipUpdate } from "../shared/Message";
import { Vector } from "../shared/Vector";
import { Block } from "./Block";
import { Mass } from "./Mass";
import { PhysicsObject } from "./PhysicsObject";
import { Player } from "./Player";
import { Polygon } from "./polygon";
export class PirateShip {
  pos: Vector;
  displace: Vector;
  friction: Vector;
  forward: Vector;
  bodyPoly: Polygon;
  collisionZerosPolygon: Polygon;
  id: string;
  missingZeros: number[];
  floors: number[];
  masses: Mass[];
  players: { [key: string]: Player };
  blocks: { [key: string]: Block };
  torque: number;
  controlled: boolean;
  freeze: boolean;
  direction: number;
  physicsObject: PhysicsObject;
  farLeft: number;
  farRight: number;
  netVelocity: Vector;
  ladder: Polygon;
  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.pos = new Vector(x, y);
    this.controlled = false;
    this.freeze = true;
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
    this.ladder = new Polygon(0, 0, [new Vector(-10, -30), new Vector(10, -30), new Vector(10, 50), new Vector(-10, 50)], true);
    this.farLeft = -230;
    this.farRight = 230;
    this.collisionZerosPolygon.pos = this.pos;
    this.ladder.pos = this.pos;
    this.bodyPoly.pos = this.pos;
    this.physicsObject.pos = this.pos;
    this.missingZeros = [3, 4, 5, 6];
    this.floors = [0, 4, 8];
    this.netVelocity = this.physicsObject.netVelocity;
  }
  update() {
    this.getTorque();
    this.applyTorque();
    this.forward.set(this.bodyPoly.points[1].x - this.bodyPoly.points[0].x, this.bodyPoly.points[1].y - this.bodyPoly.points[0].y);
    if (!this.freeze)
      this.physicsObject.addVelocity(this.forward.unitMultiplyReturn(.01));
    this.physicsObject.update();
    this.checkPlayersWithin();
  }
  getTorque() {
    //player torque
    this.torque = 0;
    Object.values(this.players).forEach(player => {
      this.torque += (player.pos.x - this.pos.x) / 600;
    });
    this.masses.forEach(mass => {
      if (mass) {
        this.torque += mass.weight * (mass.poly.points[0].x) / 600;
      }
    });
  }
  toggleFreeze() {
    this.freeze = !this.freeze;
  }
  rotate(angle: number, withPolys?: boolean) {
    const { cos, sin } = this.bodyPoly.rotate(angle);
    this.collisionZerosPolygon.rotate(angle);
    this.ladder.rotate(angle);
    this.masses.forEach(mass => { if (mass) mass.poly.rotate(angle) });
    if (withPolys) {
      Object.values(this.players).forEach((player) => {
        if (player.physicsObject.onFloor || player.onLadder) {
          const shipToPlayer = new Vector(player.pos.x - this.pos.x, player.pos.y - this.pos.y);
          const newShipToPlayer = new Vector(shipToPlayer.x * cos - shipToPlayer.y * sin, shipToPlayer.y * cos + shipToPlayer.x * sin);
          newShipToPlayer.subtract(shipToPlayer);
          player.pos.add(newShipToPlayer);
        }
      });
    }
  }
  applyTorque() {
    //the torque is assumed to have a maximum absolute value of 1000, will rotate at the ration of the torque to maximum torque of this angle
    var appliedRotation = this.torque * (.001);
    this.rotate(appliedRotation, true);
  }
  addMass(t: number, weight: number) {
    const mass = new Mass(t, weight);
    this.masses.push(mass);
    mass.poly.pos = this.pos;
    mass.poly.rotateTo(this.bodyPoly.direction);
  }
  clearMass() {
    this.masses = [];
  }
  withinRect(pos: Vector) {
    if (pos.x < this.pos.x + this.farLeft || pos.x > this.pos.x + this.farRight || pos.y < this.pos.y + this.farLeft || pos.y > this.pos.y + this.farRight)
      return false;
    return true;
  }
  checkPlayersWithin() {
    Object.values(this.players).forEach((player) => {
      if (!this.withinRect(player.pos)) {
        player.applyFriction(new Vector(1, 0));
        delete this.players[player.id];
      }
    });
  }
  serializeForUpdate() {
    return {
      id: this.id,
      x: this.pos.x,
      y: this.pos.y,
      points: this.bodyPoly.points.map(point => point.serializeForUpdates()),
      zeroPoints: this.collisionZerosPolygon.points.map(point => point.serializeForUpdates()),
      missingZeros: this.missingZeros,
      masses: this.masses.map(mass => mass.serializeForUpdates()),
      ladder: this.ladder.points.map(point => point.serializeForUpdates()),
    } as shipUpdate;
  }

}
