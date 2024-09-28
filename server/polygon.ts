import { Constants } from "../shared/constants";
import { Vector } from "../shared/Vector";
import { game } from "./users";
export class Polygon {
  points: Vector[];
  radius: number;
  direction: number;
  pos: Vector;
  size: number;
  collisionList: string[];
  id: string;
  collisionIDs: string[];

  isParellelogram: boolean;
  constructor(x: number, y: number, points: Vector[], isParellelogram: boolean, size: number, id: string = "") {
    this.points = points;
    this.radius = 0;
    this.direction = 0;
    this.pos = new Vector(x, y);
    this.isParellelogram = isParellelogram;
    this.size = size;
    this.collisionList = [];
    this.id = id;
    this.collisionIDs = [];
  }

  //rotates about zero ANGLE IN RADIANS
  rotate(angle: number, cosVal?: number | undefined, sinVal?: number | undefined) {
    var sin = 0;
    var cos = 0;
    if (cosVal && sinVal) { cos = cosVal; sin = sinVal; }
    else { sin = Math.sin(angle); cos = Math.cos(angle) }
    for (var i = 0; i < this.points.length; i++) {
      var x = this.points[i].x;
      var y = this.points[i].y;
      this.points[i].x = x * cos - y * sin;
      this.points[i].y = y * cos + x * sin;
    }
    this.direction += angle;
    this.direction %= 2 * Constants.PI;
    return { cos, sin };
  }
  displace(push: Vector) {
    this.pos.add(push);
  }

  rotateTo(angle: number) {
    angle %= 2 * Constants.PI;
    this.rotate(angle - this.direction, undefined, undefined);
  }
  checkWithinRect(other: Polygon) {
    if (this.pos.x > other.pos.x + this.size + other.size || this.pos.x < other.pos.x - this.size - other.size || this.pos.y > other.pos.y + this.size + other.size || this.pos.y < other.pos.y - this.size - other.size)
      return false;

    return true;
  }
  update() {
    this.collisionIDs.length = 0;
  }
  collisionOccured(other: Polygon) {
    this.collisionIDs.push(other.id);
    other.collisionIDs.push(this.id);
  }
  checkIfCollision(other : Polygon) {
    if(this.collisionIDs.indexOf(other.id) != -1)
      return true;
    return false;
  }

}

