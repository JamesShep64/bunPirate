import { Polygon } from "./polygon";
import { Vector } from "../shared/Vector";
import generateUniqueId from "generate-unique-id";
export class Mass {
  poly: Polygon;
  weight: number;
  id: string;
  t: number;
  constructor(t: number, weight: number) {
    this.t = t;
    this.poly = new Polygon(0, 0, [new Vector(t * 220, 0)], false);
    this.weight = weight;
    this.id = generateUniqueId({ length: 8 });
  }
  serializeForUpdates() {
    return {
      id: this.id,
      x: this.poly.pos.x,
      y: this.poly.pos.y,
      points: this.poly.points,
    }
  }
}
