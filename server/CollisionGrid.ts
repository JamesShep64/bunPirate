import { Planet } from "./Planet";
import { Player } from "./Player";
import { Block } from "./Block";
import { PirateShip } from "./PirateShip";
import { Vector } from "../shared/Vector";
import { polygonPlanetCollision, polygonPolygonCollision, shipShipCollision, polygonShipCollision } from "./collisions";
export class CollisionSection {
  players: { [key: string]: Player };
  blocks: { [key: string]: Block };
  ships: { [key: string]: PirateShip };
  planets: { [key: string]: Planet };
  constructor() {
    this.players = {};
    this.blocks = {};
    this.ships = {};
    this.planets = {};
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

  }
}
