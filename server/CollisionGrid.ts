import { Planet } from "./Planet";
import { Player } from "./Player";
import { Block } from "./Block";
import { PirateShip } from "./PirateShip";
import { Vector } from "../shared/Vector";
import { polygonPlanetCollision, polygonPolygonCollision, shipShipCollision, polygonShipCollision, checkHalfPolygonPolygonCollision } from "./collisions";
import { CannonBall } from "./CannonBall";
import { game } from "./users";
import { Explosion } from "./Explosion";
import { Grapple } from "./Grapple";
export class CollisionSection {
  players: { [key: string]: Player };
  blocks: { [key: string]: Block };
  ships: { [key: string]: PirateShip };
  planets: { [key: string]: Planet };
  cannonBalls: { [key: string]: CannonBall };
  grapples: { [key: string]: Grapple };
  explosions: { [key: string]: Explosion };
  constructor() {
    this.players = {};
    this.blocks = {};
    this.ships = {};
    this.planets = {};
    this.cannonBalls = {};
    this.grapples = {};
    this.explosions = {};
  }
  clear() {
    this.players = {};
    this.blocks = {};
    this.ships = {};
    this.planets = {};
    this.cannonBalls = {};
    this.grapples = {};
    this.explosions = {};
  }
  CheckCollisions(left: CollisionSection, right: CollisionSection, up: CollisionSection, down: CollisionSection, upLeft: CollisionSection, upRight: CollisionSection, downLeft: CollisionSection, downRight: CollisionSection) {
    const players = {
      ...this.players,
      ...left.players,
      ...right.players,
      ...up.players,
      ...down.players,
      ...upLeft.players,
      ...upRight.players,
      ...downLeft.players,
      ...downRight.players,
    };
    const blocks = {
      ...this.blocks,
      ...left.blocks,
      ...right.blocks,
      ...up.blocks,
      ...down.blocks,
      ...upLeft.blocks,
      ...upRight.blocks,
      ...downLeft.blocks,
      ...downRight.blocks,
    };
    const ships = {
      ...this.ships,
      ...left.ships,
      ...right.ships,
      ...up.ships,
      ...down.ships,
      ...upLeft.ships,
      ...upRight.ships,
      ...downLeft.ships,
      ...downRight.ships,

    };
    const planets = {
      ...this.planets,
      ...left.planets,
      ...right.planets,
      ...up.planets,
      ...down.planets,
      ...upLeft.planets,
      ...upRight.planets,
      ...downLeft.planets,
      ...downRight.planets,
    };
    const cannonBalls = {
      ...this.cannonBalls,
      ...left.cannonBalls,
      ...right.cannonBalls,
      ...up.cannonBalls,
      ...down.cannonBalls,
      ...upLeft.cannonBalls,
      ...upRight.cannonBalls,
      ...downLeft.cannonBalls,
      ...downRight.cannonBalls,
    }
    const grapples = {
      ...this.grapples,
      ...left.grapples,
      ...right.grapples,
      ...up.grapples,
      ...down.grapples,
      ...upLeft.grapples,
      ...upRight.grapples,
      ...downLeft.grapples,
      ...downRight.grapples,
    }
    const explosions = {
      ...this.explosions,
      ...left.explosions,
      ...right.explosions,
      ...up.explosions,
      ...down.explosions,
      ...upLeft.explosions,
      ...upRight.explosions,
      ...downLeft.explosions,
      ...downRight.explosions,
    };
    //player block collision
    Object.values(players).forEach((player) => {
      Object.values(blocks).forEach((block) => {
        const col = polygonPolygonCollision(player.hitBox, block);
        if (col) {
          player.physicsObject.addDisplacement(col);
        }
      })
    });
    //player ship collision
    Object.values(players).forEach((player) => {
      Object.values(ships).forEach((ship) => {
        const col = polygonShipCollision(player.hitBox, ship);
        if (col) {
          player.physicsObject.addDisplacement(col.push);
          if (col.onFloor) {
            ship.players[player.id] = player;
            player.applyFriction(ship.forward, ship.physicsObject, ship.bodyPoly);
          }
        }
      })
    });
    //player planet collison
    Object.values(players).forEach((player) => {
      Object.values(planets).forEach((planet) => {
        const col = polygonPlanetCollision(player.hitBox, planet);
        if (col?.push) {
          if (col.floor) {
            var v = new Vector(col.floor.y, col.floor.x).unitReturn();
            v.unitMultiply(3);
            player.physicsObject.addDisplacement(v);
          }
          player.physicsObject.addDisplacement(col.push);
        }
      });
    });

    //ship ship collision
    const shipsArray = Object.values(ships);
    const middleIndex = Math.ceil(shipsArray.length / 2);
    const ships1 = shipsArray.slice(0, middleIndex);
    const ships2 = shipsArray.slice(middleIndex);
    ships1.forEach((ship1) => {
      ships2.forEach(ship2 => {
        if (ship1.id != ship2.id && ship2.shipsCollided.indexOf(ship1.id) == -1) {
          ship1.shipsCollided.push(ship2.id);
          const col = shipShipCollision(ship1, ship2);
          if (col) {
            ship1.addDisplacement(col.unitMultiplyReturn(.5));
            ship2.addDisplacement(col.unitMultiplyReturn(-.5));
          }
        }
      });
      //planet ship collision
      Object.values(planets).forEach((planet) => {
        Object.values(ships).forEach((ship) => {
          const col = polygonShipCollision(planet, ship, false);
          if (col) {
            ship.addDisplacement(col.push.unitMultiplyReturn(-1));
          }
        })
      });
    });
    //cannonBall Ship Collision
    Object.values(cannonBalls).forEach(ball => {
      Object.values(ships).forEach(ship => {
        const col = checkHalfPolygonPolygonCollision(ball, ship.bodyPoly);
        if (col) {
          game.deleteCannonBall(ball);
        }
      });
    });
    //cannonBall Planet Collision
    Object.values(cannonBalls).forEach(ball => {
      Object.values(planets).forEach(planet => {
        const col = checkHalfPolygonPolygonCollision(ball, planet);
        if (col) {
          game.deleteCannonBall(ball);
          delete cannonBalls[ball.id];
        }
      });
    });
    //grapple Ship Collision
    Object.values(grapples).forEach(ball => {
      Object.values(ships).forEach(ship => {
        const col = checkHalfPolygonPolygonCollision(ball, ship.bodyPoly);
        if (col) {
          game.deleteGrapple(ball);
        }
      });
    });
    //grapple Planet Collision
    Object.values(grapples).forEach(ball => {
      Object.values(planets).forEach(planet => {
        const col = checkHalfPolygonPolygonCollision(ball, planet);
        if (col) {
          ball.pos = planet.pos;
        }
      });
    });
    //explosion Player Collision
    Object.values(explosions).forEach(explo => {
      Object.values(players).forEach(player => {
        if (explo.checkWithinRect(player.hitBox)) {
          const push = player.pos.copy();
          push.subtract(explo.pos);
          push.unit();
          player.addExplosionVelocity(push);
          explo.playerIDs.push(player.id);
        }
      });
    });
  }

}
