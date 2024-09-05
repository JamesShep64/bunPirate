import { Polygon } from "./polygon";
import { Vector } from "../shared/Vector"
export class Block extends Polygon {
  id: string;
  pos: Vector;
  width: number;
  height: number;

  constructor(id: string, x: number, y: number, width: number, height: number) {
    super([new Vector(-width / 2, -height / 2), new Vector(width / 2, -height / 2), new Vector(width / 2, height / 2), new Vector(-width / 2, height / 2)]);
    this.id = id;
    this.pos = new Vector(x, y);
    this.width = width;
    this.height = height;
  }
  serializeForUpdate() {
    return {
      id: this.id,
      x: this.pos.x,
      y: this.pos.y,
      points: this.points,
    }
  }
}
