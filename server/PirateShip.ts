import { shipUpdate } from "../shared/Message";
import { Vector } from "../shared/Vector";
import { Polygon } from "./polygon";

export class PirateShip {
  pos: Vector;
  netVelocity: Vector;
  displace: Vector;
  friction: Vector;
  forward: Vector;
  forwardMove: Vector;
  bodyPoly: Polygon;
  collisionZerosPolygon: Polygon;
  id: string;
  missingZeros: number[];
  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.pos = new Vector(x, y);
    this.netVelocity = new Vector(0, 0);
    this.displace = new Vector(0, 0);
    this.friction = new Vector(0, 0);
    this.forward = new Vector(1, 0);
    this.forwardMove = new Vector(15, 0);
    this.bodyPoly = new Polygon(x, y, [new Vector(-220, -30), new Vector(-35, -30), new Vector(-35, 0), new Vector(-125, 0), new Vector(-125, 65), new Vector(125, 65), new Vector(125, 0), new Vector(35, 0), new Vector(35, -30), new Vector(220, -30), new Vector(220, 0), new Vector(140, 100), new Vector(-140, 100), new Vector(-220, 0)], false);
    this.collisionZerosPolygon = new Polygon(0, 0, [new Vector(-210, -20), new Vector(-45, -20), new Vector(-45, -10), new Vector(45, -10), new Vector(45, -20), new Vector(210, -20), new Vector(210, -10), new Vector(130, 90), new Vector(-130, 90), new Vector(-210, -10)], false);
    this.collisionZerosPolygon.pos = this.pos;
    this.bodyPoly.pos = this.pos;
    this.missingZeros = [3, 4, 5, 6];
  }
  serializeForUpdate() {
    return {
      id: this.id,
      x: this.pos.x,
      y: this.pos.y,
      bodyPoints: this.bodyPoly.points,
      zeroPoints: this.collisionZerosPolygon.points,
      missingZeros: this.missingZeros,
    } as shipUpdate;
  }

}
