import { Vector } from "../shared/Vector";
import { PirateShip } from "./PirateShip";
import { Player } from "./Player";
import { Polygon } from "./polygon";

export class Accelerator extends Polygon {
  selected: number = 0;
  wasUsed: boolean = false;
  controlled: boolean = false;
  player: Player | undefined;
  secondaryInteractWasTrue: boolean = false;
  constructor(ship: PirateShip) {
    super(0, 0, [new Vector(35, 55)], false, 20, "a");
    this.pos = ship.pos;
  }
  increment() {
    this.selected++;
    if (this.selected > 2)
      this.selected = 0;
  }
  checkPlayerWithinRect(other: Player) {
    if (this.checkPointWithinRect(other.hitBox)) {
      if (!this.controlled && other.interacting) {
        this.player = other;
        this.controlled = true;
        other.isInteracting = true;
      }
    }
  }
  checkPointWithinRect(other: Polygon) {
    const realPos = new Vector(this.pos.x + this.points[0].x, this.pos.y + this.points[0].y);
    if (!(realPos.x > other.pos.x + this.size || realPos.x < other.pos.x - this.size || realPos.y > other.pos.y + this.size || realPos.y < other.pos.y - this.size))
      return true;
    return false;
  }

  update() {
    if (this.player) {
      if (!this.checkPointWithinRect(this.player.hitBox)) {
        this.player = undefined;
        this.controlled = false;
        return;
      }
      this.player.isInteracting = true;
      if (this.player.secondaryInteracting && !this.secondaryInteractWasTrue) {
        this.secondaryInteractWasTrue = true;
        this.increment();
      }
      this.secondaryInteractWasTrue = this.player.secondaryInteracting;
      if (!this.player.interacting) {
        this.player = undefined;
        this.controlled = false;
      }
    }

    else {
      this.secondaryInteractWasTrue = false;
    }
  }
  serializeForUpdates() {
    return {
      x: this.points[0].x,
      y: this.points[0].y,
      id: this.id,
      selected: this.selected,
    }
  }
}
