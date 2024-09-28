import generateUniqueId from "generate-unique-id";
import { Vector } from "../shared/Vector";
import { Player } from "./Player";
import { Polygon } from "./polygon";

export class Cannon extends Polygon {
  id: string;
  controlled: boolean;
  barrel: Polygon;
  player: Player | undefined;
  constructor(x: number, y: number, pos: Vector) {
    super(0, 0, [new Vector(x, y)], false, 20);
    this.barrel = new Polygon(0, 0, [new Vector(45, -10), new Vector(45, 10), new Vector(0, 10), new Vector(0, -10)], false, 45);
    this.pos = pos;
    this.barrel.pos = this.points[0];
    this.id = generateUniqueId({ length: 8 });
    this.controlled = false;
    this.player = undefined;
  }
  update() {
    if (this.player) {
      if (this.player.movingRight && this.direction - this.barrel.direction > .15) {
        this.barrel.rotate(.025);
      }
      if (this.player.movingLeft && this.direction - this.barrel.direction < 3) {
        this.barrel.rotate(-.025);
      }
      this.player = undefined;
    }
    this.controlled = false;
  }
  //same but without other size
  checkPlayerWithinRect(other: Player) {
    const realPos = new Vector(this.pos.x + this.points[0].x, this.pos.y + this.points[0].y);
    if (!(realPos.x > other.pos.x + this.size || realPos.x < other.pos.x - this.size || realPos.y > other.pos.y + this.size || realPos.y < other.pos.y - this.size)) {
      if (!this.controlled && other.interacting) {
        this.player = other;
        this.controlled = true;
        other.isInteracting = true;
      }
    }
  }
  doRotate(angle: number, cosVal?: number | undefined, sinVal?: number | undefined) {
    super.rotate(angle, cosVal, sinVal);
    this.barrel.rotate(angle, cosVal, sinVal);
  }
  serializeForUpdate() {
    return {
      id: this.id,
      x: this.points[0].x,
      y: this.points[0].y,
      points: this.barrel.points.map(point => point.serializeForUpdates()),
    }
  }
}
