import generateUniqueId from "generate-unique-id";
import { Vector } from "../shared/Vector";
import { Player } from "./Player";
import { Polygon } from "./polygon";
import { game } from "./users";
import { CannonBall } from "./CannonBall";
import { Grapple } from "./Grapple";
import { PirateShip } from "./PirateShip";

export class Cannon extends Polygon {
  id: string;
  controlled: boolean;
  barrel: Polygon;
  launchVector: Polygon;
  player: Player | undefined;
  power: number;
  spaceWasDown: boolean = false;
  ship: PirateShip;
  constructor(x: number, y: number, pos: Vector, ship: PirateShip) {
    super(0, 0, [new Vector(x, y)], false, 20);
    this.barrel = new Polygon(0, 0, [new Vector(45, -10), new Vector(45, 10), new Vector(0, 10), new Vector(0, -10)], false, 45);
    this.launchVector = new Polygon(0, 0, [new Vector(1, 0)], false, 0);
    this.pos = pos;
    this.barrel.pos = this.points[0];
    this.id = generateUniqueId({ length: 8 });
    this.controlled = false;
    this.player = undefined;
    this.power = 0;
    this.ship = ship;
  }
  update() {
    if (this.player) {
      if (this.player.movingRight && this.direction - this.barrel.direction > .15) {
        this.barrel.rotate(.035);
        this.launchVector.rotate(.035);
      }
      if (this.player.movingLeft && this.direction - this.barrel.direction < 3) {
        this.barrel.rotate(-.035);
        this.launchVector.rotate(-.035);
      }
      if (this.player.spaceDown && this.power < 50) {
        this.power++;
        this.spaceWasDown = true;
      }
      if (!this.player.spaceDown && this.spaceWasDown) {

        if (this.power > 15)
          this.fireGrapple();
        this.power = 0;
      }
      this.player = undefined;
    }
    else {
      this.power = 0;
    }
    this.controlled = false;
  }
  fire() {
    const id = generateUniqueId({ length: 8 });
    const spawnPoint = this.launchVector.points[0].unitMultiplyReturn(45);
    spawnPoint.add(this.pos);
    spawnPoint.add(this.points[0]);
    const ball = new CannonBall(id, spawnPoint.x, spawnPoint.y, this.launchVector.points[0].unitMultiplyReturn(this.power / 10));
    game.addCannonBall(ball);
  }
  fireGrapple() {
    if (!this.ship.grapple) {
      const id = generateUniqueId({ length: 8 });
      const spawnPoint = this.launchVector.points[0].unitMultiplyReturn(45);
      spawnPoint.add(this.pos);
      spawnPoint.add(this.points[0]);
      const ball = new Grapple(id, spawnPoint.x, spawnPoint.y, this.launchVector.points[0].unitMultiplyReturn(this.power / 10), this.pos, this.points[0], this.ship);
      this.ship.grapple = ball;
      game.addGrapple(ball);
    }

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
    this.launchVector.rotate(angle, cosVal, sinVal);
  }
  serializeForUpdate() {
    return {
      id: this.id,
      x: this.points[0].x,
      y: this.points[0].y,
      points: this.barrel.points.map(point => point.serializeForUpdates()),
      power: this.power,
    }
  }
}
