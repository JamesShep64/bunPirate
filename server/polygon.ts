import { Constants } from "../shared/constants";
import { Vector } from "../shared/Vector";

export class Polygon {
  points: Vector[];
  radius: number;
  direction: number;
  pos: Vector;

  isParellelogram: boolean;
  constructor(x: number, y: number, points: Vector[], isParellelogram: boolean) {
    this.points = points;
    this.radius = 0;
    this.direction = 0;
    this.pos = new Vector(x, y);
    this.isParellelogram = isParellelogram;
  }

  //rotates about zero ANGLE IN RADIANS
  rotate(angle: number, cosVal: number | undefined, sinVal: number | undefined) {
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
  }
  displace(push: Vector) {
    this.pos.add(push);
  }

  rotateTo(angle: number) {
    angle %= 2 * Constants.PI;
    this.rotate(angle - this.direction, undefined, undefined);
  }

}

