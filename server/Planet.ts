import { Vector } from "../shared/Vector";
import { putInGrid } from "./collisions";
import { Polygon } from "./polygon";

export class Planet extends Polygon {
  floors: number[];
  constructor(id: string, x: number, y: number) {
    super(x, y, [new Vector(0, -100), new Vector(100, 0), new Vector(0, 100), new Vector(-100, 0)], false, 100, id);
    this.floors = [0, 3];
    putInGrid(this.pos, this);
  }
  update(): void {
    super.update();
  }
  serializeForUpdate() {
    return {
      id: this.id,
      x: this.pos.x,
      y: this.pos.y,
      points: this.points.map(point => point.serializeForUpdates()),
    }
  }
}
