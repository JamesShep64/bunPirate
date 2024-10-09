import { Constants } from "../shared/constants";
import { shipUpdate } from "../shared/Message";
import { Vector } from "../shared/Vector";
import { Block } from "./Block";
import { Mass } from "./Mass";
import { PhysicsObject } from "./PhysicsObject";
import { Player } from "./Player";
import { Polygon } from "./polygon";
import { checkHalfPolygonPolygonCollision, putInGrid, vectorCollision } from "./collisions";
import { Queue } from "./Queue";
import { Cannon } from "./Cannon";
import { Grapple } from "./Grapple";
import { game } from "./users";
import { Munitions } from "./Munitions";
export class PirateShip {
  pos: Vector;
  displace: Vector;
  friction: Vector;
  forward: Vector;
  bodyPoly: Polygon;
  collisionZerosPolygon: Polygon;
  damagePoly: Polygon;
  id: string;
  missingZeros: number[];
  floors: number[];
  masses: Mass[];
  players: { [key: string]: Player };
  blocks: { [key: string]: Block };
  torque: number;
  controlled: boolean;
  freeze: boolean;
  turn: number;
  upsideDown: boolean = false;
  physicsObject: PhysicsObject;
  ladder: Polygon;
  spawnPoint: Polygon;
  shipsCollided: string[];
  rollingAverage: Queue;
  rollingVelocityMult: number;
  topPortCannon: Cannon;
  grapple: Grapple | undefined;
  munitions: Munitions = new Munitions();
  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.pos = new Vector(x, y);
    this.controlled = false;
    this.freeze = false;
    this.shipsCollided = [];
    this.displace = new Vector(0, 0);
    this.friction = new Vector(0, 0);
    this.forward = new Vector(1, 0);
    this.turn = 1;
    this.players = {};
    this.blocks = {};
    this.rollingAverage = new Queue(5, 20);
    this.rollingVelocityMult = 1;
    this.masses = [];
    this.torque = 0;
    this.physicsObject = new PhysicsObject();
    this.physicsObject.gravityOn = false;
    this.bodyPoly = new Polygon(x, y, [new Vector(-220, -30), new Vector(-35, -30), new Vector(-35, 0), new Vector(-125, 0), new Vector(-125, 65), new Vector(125, 65), new Vector(125, 0), new Vector(35, 0), new Vector(35, -30), new Vector(220, -30), new Vector(220, 0), new Vector(140, 100), new Vector(-140, 100), new Vector(-220, 0)], false, 220, id);

    this.damagePoly = new Polygon(x, y, [new Vector(-220, -25), new Vector(-180, -30), new Vector(-140, -30), new Vector(-100, -30), new Vector(-60, -30), new Vector(-35, -25), new Vector(-35, 0), new Vector(-125, 0), new Vector(-125, 60), new Vector(-100, 65), new Vector(-60, 65), new Vector(-20, 65), new Vector(20, 65), new Vector(60, 65), new Vector(90, 65), new Vector(125, 60), new Vector(125, 0), new Vector(35, 0), new Vector(35, -25), new Vector(60, -30), new Vector(100, -30), new Vector(140, -30), new Vector(180, -30), new Vector(220, -25), new Vector(220, 0), new Vector(204, 20), new Vector(188, 40), new Vector(172, 60), new Vector(156, 80), new Vector(140, 100), new Vector(100, 100), new Vector(60, 100), new Vector(20, 100), new Vector(-20, 100), new Vector(-60, 100), new Vector(-100, 100), new Vector(-140, 100), new Vector(-164, 70), new Vector(-188, 40), new Vector(-220, 0)], false, 220, id);
    this.collisionZerosPolygon = new Polygon(0, 0, [new Vector(-210, -20), new Vector(-45, -20), new Vector(-45, -10), new Vector(45, -10), new Vector(45, -20), new Vector(210, -20), new Vector(210, -10), new Vector(130, 90), new Vector(-130, 90), new Vector(-210, -10)], false, 220);
    this.ladder = new Polygon(0, 0, [new Vector(-10, -30), new Vector(10, -30), new Vector(10, 50), new Vector(-10, 50)], true, 90);
    this.spawnPoint = new Polygon(0, 0, [new Vector(100, -50)], false, 0);
    this.topPortCannon = new Cannon(-180, -40, this.pos, this);
    this.collisionZerosPolygon.pos = this.pos;
    this.ladder.pos = this.pos;
    this.bodyPoly.pos = this.pos;
    this.damagePoly.pos = this.pos;
    this.physicsObject.pos = this.pos;
    this.spawnPoint.pos = this.pos;
    this.missingZeros = [3, 4, 5, 6];
    this.floors = [0, 4, 8];
  }
  update() {
    /*
    if (this.rollingAverage.ticks == 0) {
      this.rollingAverage.add(this.bodyPoly.direction);
      if (this.rollingAverage.items.length == this.rollingAverage.maxLength) {
        this.rollingAverage.average();
        this.rollingVelocityMult = 1 - 25 * Math.abs(this.bodyPoly.direction - this.rollingAverage.averageItem);
        if (this.rollingVelocityMult < 0 || this.rollingVelocityMult > 1) {
          this.rollingVelocityMult = .5;
        }
      }
    }
        */
    this.getTorque();
    this.applyTorque();
    this.forward.set(this.bodyPoly.points[1].x - this.bodyPoly.points[0].x, this.bodyPoly.points[1].y - this.bodyPoly.points[0].y);
    this.orbit();
    if (!this.freeze)
      this.physicsObject.addVelocity(this.forward.unitMultiplyReturn(this.turn * .007 * this.rollingVelocityMult));
    this.bodyPoly.update();
    this.physicsObject.update();
    this.checkPlayersWithin();
    //check border collsision
    if (this.pos.x > Constants.MAP_WIDTH || this.pos.x < 0)
      this.turn *= -1;
    if (this.pos.y > Constants.MAP_HEIGHT) {
      this.rotate(Math.PI / 2, true);
    }
    if (this.pos.y < 0) {
      this.rotate(-Math.PI / 2, true);
    }
    this.playerLadderCollisions();
    this.playerCannonCollisions();
    this.topPortCannon.update();
    this.rollingAverage.update();
    putInGrid(this.pos, this);
  }
  orbit() {
    if (this.grapple?.grappled) {
      const grapVec = this.grapple.pos.subtractReturn(this.pos);
      const angle = Math.acos(grapVec.dot(this.forward) / (grapVec.magnatude() * this.forward.magnatude()));
      if (angle < .4 * Math.PI || angle > .9 * Math.PI) {
        game.deleteGrapple(this.grapple);
        return;
      }
      this.rotate(-.03 * (angle - Math.PI * .4), true);

    }

  }
  getTorque() {
    //player torque
    this.torque = 0;
    var upsideDownMult = 1;
    if (this.upsideDown)
      upsideDownMult = -1;

    Object.values(this.players).forEach(player => {
      if (player.physicsObject.onFloor)
        this.torque += upsideDownMult * (player.pos.x - this.pos.x) / 600;
    });
    this.masses.forEach(mass => {
      if (mass) {
        this.torque += upsideDownMult * mass.weight * (mass.poly.points[0].x) / 600;
      }
    });
  }
  toggleFreeze() {
    this.freeze = !this.freeze;
  }
  rotate(angle: number, withPolys?: boolean) {
    const { cos, sin } = this.bodyPoly.rotate(angle);
    this.collisionZerosPolygon.rotate(angle, cos, sin);
    this.ladder.rotate(angle, cos, sin);
    this.topPortCannon.doRotate(angle, cos, sin);
    this.spawnPoint.rotate(angle, cos, sin);
    this.damagePoly.rotate(angle, cos, sin);
    this.masses.forEach(mass => { if (mass) mass.poly.rotate(angle) });
    if (withPolys) {
      Object.values(this.players).forEach((player) => {
        if (player.physicsObject.onFloor || player.onLadder) {
          const shipToPlayer = new Vector(player.pos.x - this.pos.x, player.pos.y - this.pos.y);
          const newShipToPlayer = new Vector(shipToPlayer.x * cos - shipToPlayer.y * sin, shipToPlayer.y * cos + shipToPlayer.x * sin);
          newShipToPlayer.subtract(shipToPlayer);
          player.pos.add(newShipToPlayer);
        }
      });
    }
    if ((this.bodyPoly.direction > .5 * Math.PI && this.bodyPoly.direction < 1.5 * Math.PI) || (this.bodyPoly.direction < -.5 * Math.PI && this.bodyPoly.direction > -1.5 * Math.PI)) {
      this.upsideDown = true;
    }
    else
      this.upsideDown = false;
  }
  playerLadderCollisions() {
    Object.values(this.players).forEach(player => {
      const onLadder = checkHalfPolygonPolygonCollision(player.hitBox, this.ladder);
      if (onLadder && player.onLadder) {
        player.applyFriction(this.forward, this.physicsObject, this.bodyPoly);
      }
      if (onLadder && (player.movingUp || player.movingDown)) {
        player.onLadder = true;
      }
      if (!onLadder)
        player.onLadder = false;
    });
  }
  playerCannonCollisions() {
    Object.values(this.players).forEach(player => {
      this.topPortCannon.checkPlayerWithinRect(player);
    });
  }
  addDisplacement(vec: Vector) {
    Object.values(this.players).forEach(player => {
      if (player)
        player.physicsObject.addDisplacement(vec);
    });
    this.physicsObject.addDisplacement(vec);

  }
  applyTorque() {
    //the torque is assumed to have a maximum absolute value of 1000, will rotate at the ration of the torque to maximum torque of this angle
    var appliedRotation = this.torque * (.001);
    this.rotate(appliedRotation, true);
  }
  addMass(t: number, weight: number) {
    const mass = new Mass(t, weight);
    this.masses.push(mass);
    mass.poly.pos = this.pos;
    mass.poly.rotateTo(this.bodyPoly.direction);
  }
  clearMass() {
    this.masses = [];
  }
  addDamage(collisionPoint: Vector, collidedVec: Vector) {
    collisionPoint.subtract(this.pos);
    const perp = new Vector(0, 0);
    perp.set(-collidedVec.y, collidedVec.x);
    perp.unit();
    var minT = 10000;
    var intersection: { u: number, t: number };
    var intersectedVector: Vector | undefined;
    var index = 0;
    var intersectU = 0;
    var o = 0;
    for (var i = 0; i < this.damagePoly.points.length; i++) {
      o++;
      if (o == this.damagePoly.points.length) {
        o = 0;
      }
      var vec2 = new Vector(this.damagePoly.points[o].x - this.damagePoly.points[i].x, this.damagePoly.points[o].y - this.damagePoly.points[i].y);
      intersection = vectorCollision(collisionPoint, perp, this.damagePoly.points[i], vec2);
      if (intersection.u >= 0 && intersection.u <= 1 && Math.abs(intersection.t) < minT) {
        index = i;
        intersectU = intersection.u;
        minT = Math.abs(intersection.t);
        intersectedVector = vec2;
      }
    }
    if (intersectedVector) {
      const newPoint = new Vector(this.damagePoly.points[index].x + intersectedVector.x * intersectU, this.damagePoly.points[index].y + intersectedVector.y * intersectU);
      perp.unitMultiply(6);
      var o = index + 1;
      if (o == this.damagePoly.points.length)
        o = 0;
      if (index < this.damagePoly.points.length && this.damagePoly.points[o].distance(newPoint) < 8) {
        this.damagePoly.points[o].add(perp);
      }
      else if (this.damagePoly.points[index].distance(newPoint) < 8) {
        this.damagePoly.points[index].add(perp);
      }
      else {
        newPoint.add(perp);
        this.damagePoly.points.splice(index + 1, 0, newPoint);
      }
    }

  }
  checkPlayersWithin() {
    Object.values(this.players).forEach((player) => {
      if (!this.bodyPoly.checkWithinRect(player.hitBox)) {
        delete this.players[player.id];
      }
      else
        player.shipAboard = this;
    });
  }
  serializeForUpdate() {
    return {
      id: this.id,
      x: this.pos.x,
      y: this.pos.y,
      points: this.damagePoly.points.map(point => point.serializeForUpdates()),
      zeroPoints: this.collisionZerosPolygon.points.map(point => point.serializeForUpdates()),
      missingZeros: this.missingZeros,
      masses: this.masses.map(mass => mass.serializeForUpdates()),
      ladder: this.ladder.points.map(point => point.serializeForUpdates()),
      topPortCannon: this.topPortCannon.serializeForUpdate(),
      munitions: this.munitions.getLoadOut(),
      direction: this.bodyPoly.direction,
    } as shipUpdate;
  }

}
