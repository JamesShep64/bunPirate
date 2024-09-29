import { Vector } from "../shared/Vector";
import { CannonBall } from "./CannonBall";
import { PirateShip } from "./PirateShip";
import { game } from "./users";

export class Grapple extends CannonBall {
  shipPOS: Vector;
  cannonPoint: Vector;
  deleteTicker: number = 50;
  ship: PirateShip;
  constructor(id: string, x: number, y: number, launchVel: Vector, shipPOS: Vector, cannonPoint: Vector, ship: PirateShip) {
    super(id, x, y, launchVel);
    this.shipPOS = shipPOS;
    this.cannonPoint = cannonPoint;
    this.ship = ship;
  }
  update() {
    if (this.deleteTicker == 0)
      game.deleteGrapple(this);
    this.deleteTicker--;
    super.update();
  }
  serializeForUpdate() {
    const launchOrigin = this.shipPOS.copy();
    launchOrigin.add(this.cannonPoint);
    return {
      id: this.id,
      x: this.pos.x,
      y: this.pos.y,
      launchOrigin: launchOrigin.serializeForUpdates(),
    }
  }
}
