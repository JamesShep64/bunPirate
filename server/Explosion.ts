import { Vector } from "../shared/Vector";
import { putInGrid } from "./collisions";
import { Polygon } from "./polygon";
import { game } from "./users";

export class Explosion {
  pos: Vector;
  size: number = 15;
  id: string;
  count: number = 20;
  collisionIDs: string[];
  constructor(x: number, y: number, id: string, size?: number) {
    this.id = id;
    if (size)
      this.size = size;
    this.pos = new Vector(x, y);
    this.collisionIDs = [];
  }
  update() {
    putInGrid(this.pos, this);
    if (this.count == 0) {
      game.deleteExplosion(this);
    }
    else
      this.count--;
  }
  checkWithinRect(other: Polygon) {
    if (this.pos.x > other.pos.x + this.size + other.size || this.pos.x < other.pos.x - this.size - other.size || this.pos.y > other.pos.y + this.size + other.size || this.pos.y < other.pos.y - this.size - other.size)
      return false;
    if (this.collisionIDs.indexOf(other.id) != -1)
      return false;
    return true;
  }
  serializeForUpdate() {
    return {
      id: this.id,
      x: this.pos.x,
      y: this.pos.y,
      size: this.size,
    }
  }
}
