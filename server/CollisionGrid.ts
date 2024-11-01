import { Planet } from "./Planet";
import { Player } from "./Player";
import { Block } from "./Block";
import { PirateShip } from "./PirateShip";
import { Vector } from "../shared/Vector";
import { polygonPlanetCollision, polygonPolygonCollision, shipShipCollision, polygonShipCollision, checkHalfPolygonPolygonCollision, CannonballShipCollision, explosiveCollision, DamageShipCollision } from "./collisions";
import { CannonBall } from "./CannonBall";
import { game } from "./users";
import { Explosion } from "./Explosion";
import { Grapple } from "./Grapple";
import { Meteor } from "./Meteor";
export class CollisionSection {
  players: { [key: string]: Player };
  blocks: { [key: string]: Block };
  ships: { [key: string]: PirateShip };
  planets: { [key: string]: Planet };
  meteors: { [key: string]: Meteor };
  cannonBalls: { [key: string]: CannonBall };
  grapples: { [key: string]: Grapple };
  explosions: { [key: string]: Explosion };
  mergedGrids: { [key: string]: CollisionSection };
  constructor() {
    this.players = {};
    this.blocks = {};
    this.ships = {};
    this.meteors = {};
    this.planets = {};
    this.cannonBalls = {};
    this.grapples = {};
    this.explosions = {};
    this.mergedGrids = {};
  }
  clear() {
    this.players = {};
    this.blocks = {};
    this.ships = {};
    this.planets = {};
    this.meteors = {};
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
    const meteors = {
      ...this.meteors,
      ...left.meteors,
      ...right.meteors,
      ...up.meteors,
      ...down.meteors,
      ...upLeft.meteors,
      ...upRight.meteors,
      ...downLeft.meteors,
      ...downRight.meteors,
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
    //meteor meteor collision
    const meteorsArray = Object.values(meteors);
    const middleIndexMet = Math.ceil(meteorsArray.length / 2);
    const meteors1 = meteorsArray.slice(0, middleIndexMet);
    const meteors2 = meteorsArray.slice(middleIndexMet);
    Object.values(meteors).forEach((met1) => {
      Object.values(meteors).forEach(met2 => {
        const push = explosiveCollision(met1, met2);
        if (push && met1.id != met2.id) {
          const met1Vel = push.unitMultiplyReturn(-.5);
          const met2Vel = push.unitMultiplyReturn(.5);
          met1.physicsObject.addCollisionVelocity(met1Vel);
          met1.physicsObject.setFriction(met1Vel);
          met2.physicsObject.addCollisionVelocity(met2Vel);
          met2.physicsObject.setFriction(met2Vel);
          met1.collisionIDs.push(met2.id);
          met2.collisionIDs.push(met1.id);
        }

      });
    });
    //cannonBall Ship Collision
    Object.values(cannonBalls).forEach(ball => {
      Object.values(ships).forEach(ship => {
        const col = DamageShipCollision(ball, ship.bodyPoly);
        if (col) {
          game.deleteCannonBall(ball);
          ship.addDamage(ball.pos, col);
        }
      });
    });
    //cannonBall Planet Collision
    Object.values(cannonBalls).forEach(ball => {
      Object.values(planets).forEach(planet => {
        const col = checkHalfPolygonPolygonCollision(ball, planet);
        if (col) {
          game.deleteCannonBall(ball);
        }
      });
    });
    //cannonBall Meteor Collision
    Object.values(meteors).forEach(met => {
      Object.values(cannonBalls).forEach(ball => {
        const col = checkHalfPolygonPolygonCollision(ball, met);
        if (col) {
          game.deleteCannonBall(ball);
          game.deleteMeteor(met);
        }
        else {
          const col2 = checkHalfPolygonPolygonCollision(met, ball);
          if (col2) {
            game.deleteCannonBall(ball);
            game.deleteMeteor(met);
          }
        }
      });
    });
    //meteor Ship Collision
    Object.values(meteors).forEach(ball => {
      Object.values(ships).forEach(ship => {
        const col = DamageShipCollision(ball, ship.bodyPoly);
        if (col) {
          game.deleteMeteor(ball);
          ship.addDamage(ball.pos, col);
        }
      });
    });
    //meteor Planet Collision
    Object.values(meteors).forEach(ball => {
      Object.values(planets).forEach(planet => {
        const col = checkHalfPolygonPolygonCollision(ball, planet);
        if (col) {
          game.deleteMeteor(ball);
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
          ball.grappled = true;
        }
      });
    });
    //explosion Player Collision
    Object.values(explosions).forEach(explo => {
      Object.values(players).forEach(player => {
        const push = explosiveCollision(explo, player.hitBox);
        if (push)
          player.addExplosionVelocity(push);
      });
    });
  }

}
