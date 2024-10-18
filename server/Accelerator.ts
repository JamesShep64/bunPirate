import { Vector } from "../shared/Vector";
import { PirateShip } from "./PirateShip";
import { Player } from "./Player";
import { Polygon } from "./polygon";

export class Accelerator extends Polygon {
  selected: number = 0;
  secondaryInteractingWasTrue: boolean = false;
  constructor(ship: PirateShip) {
    super(0, 0, [new Vector(15, 30)], false, 10, "a");
    this.pos = ship.pos;
  }
  increment() {
    this.selected++;
    if (this.selected > 2)
      this.selected = 0;
  }
  playerInteract(player: Player) {
    if (!player.isInteracting && !this.secondaryInteractingWasTrue && player.secondaryInteracting && this.checkWithinRect(player.hitBox)) {
      this.secondaryInteractingWasTrue = true;
      this.increment();
    }
    this.secondaryInteractingWasTrue = player.secondaryInteracting;
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
