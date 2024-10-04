import { Vector } from "../shared/Vector";
import { CannonBall } from "./CannonBall";
import { PirateShip } from "./PirateShip";
import { game } from "./users";

export class Grapple extends CannonBall {
  shipPOS: Vector;
  cannonPoint: Vector;
  deleteTicker: number = 50;
  ship: PirateShip;
  grappled: boolean = false;
  launchOrigin: Vector;
  constructor(id: string, x: number, y: number, launchVel: Vector, shipPOS: Vector, cannonPoint: Vector, ship: PirateShip) {
    super(id, x, y, launchVel);
    this.shipPOS = shipPOS;
    this.cannonPoint = cannonPoint;
    this.ship = ship;
    this.launchOrigin = this.shipPOS.copy();
  }
  update() {
    super.update();
    if (this.deleteTicker == 0 && !this.grappled)
      game.deleteGrapple(this);
    this.deleteTicker--;
    this.launchOrigin = this.shipPOS.copy();
    this.launchOrigin.add(this.cannonPoint);
  }
  serializeForUpdate() {
    return {
      id: this.id,
      x: this.pos.x,
      y: this.pos.y,
      launchOrigin: this.launchOrigin.serializeForUpdates(),
    }
  }
}
