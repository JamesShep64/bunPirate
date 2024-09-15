import generateUniqueId from "generate-unique-id";
import { Action, Message, mouseEvent } from "../shared/Message";
import { Block } from "./Block";
import { God } from "./God";
import { sendUpdate } from "./users";
import { Player } from "./Player";
import { checkHalfPolygonPolygonCollision, polygonPolygonCollision, shipShipCollision } from "./collisions";
import { PirateShip } from "./PirateShip";
import { polygonShipCollision } from "./collisions";
import { Constants } from "../shared/constants";
import { Lobby } from "./Lobby";

export class Game {
  users: string[];
  gods: { [key: string]: God };
  players: { [key: string]: Player };
  blocks: { [key: string]: Block };
  ships: { [key: string]: PirateShip };
  intervalID: Timer;
  constructor() {
    this.gods = {};
    this.blocks = {};
    this.players = {};
    this.ships = {};
    this.users = [];
    this.intervalID = setInterval(this.update.bind(this), 1000 / 30);
  }
  disconnect(id: string) {
    var us = this.users;
    var i = us.indexOf(id);
    this.users.splice(i, 1);
    if (this.gods[id])
      delete this.gods[id];
    if (this.players[id])
      delete this.players[id];
  }
  addCrew(lobby: Lobby) {
    var width = Math.random() * Constants.MAP_WIDTH / 2;
    var height = Math.random() * Constants.MAP_HEIGHT / 2;
    if (Math.random() < .5)
      width *= -1;
    if (Math.random() < .5)
      width *= -1;
    const shipID = generateUniqueId({ length: 8 });
    const crew = Object.keys(lobby.users);
    this.ships[shipID] = new PirateShip(shipID, width, height);
    lobby.shipID = shipID;
    for (var i = 0; i < crew.length; i++) {
      this.players[crew[i]] = new Player(crew[i], width - i * 10, height - 50);
      this.users.push(crew[i]);
    }
  }
  addStraggler(id: string, lobby: Lobby) {
    console.log("ADD STRAGGLER");
    if (lobby.shipID) {
      const ship = this.ships[lobby.shipID];
      if (ship) {
        const spawn = ship.spawnPoint.pos.copy();
        this.users.push(id);
        this.players[id] = new Player(id, spawn.x, spawn.y);
      }
    }
  }
  removeCrew(lobby: Lobby) {
    var shipID = lobby.shipID as string;
    delete this.ships[shipID];
    Object.keys(lobby.users).forEach(userID => {
      this.disconnect(userID);
    });
  }
  update() {
    Object.values(this.gods).forEach(god => god.update());
    Object.values(this.ships).forEach(ship => ship.update());
    Object.values(this.blocks).forEach(block => block.update());
    Object.values(this.players).forEach(player => player.update());
    //player block collision
    Object.values(this.players).forEach((player) => {
      Object.values(this.blocks).forEach((block) => {
        const col = polygonPolygonCollision(player.hitBox, block);
        if (col) {
          player.physicsObject.addDisplacement(col);
        }
      })
    });
    //player ship collision
    Object.values(this.players).forEach((player) => {
      Object.values(this.ships).forEach((ship) => {
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
    Object.values(this.ships).forEach((ship1) => {
      Object.values(this.ships).forEach(ship2 => {
        if (ship1.id != ship2.id) {
          const col = shipShipCollision(ship1, ship2);
          if (col) {
            ship1.addDisplacement(col.unitMultiplyReturn(1.2));
            ship2.addDisplacement(col.unitMultiplyReturn(-1.2));
          }
        }
      });
    });
    //update the displacments of all physics objects
    Object.values(this.players).forEach(player => player.physicsObject.updateDisplace());
    Object.values(this.blocks).forEach(block => block.physicsObject.updateDisplace());
    //send updates to all users
    this.users.forEach((id: string) => {
      if (id)
        this.createUpdate(id);
    });

  }
  createUpdate(id: string) {
    const otherGods = Object.keys(this.gods).filter((key: string) => key !== id).map((key) => this.gods[key]);
    const otherPlayers = Object.keys(this.players).filter((key: string) => key !== id).map((key) => this.players[key]);
    sendUpdate(id,
      {
        time: Date.now(),
        meGod: this.gods[id]?.serializeForUpdate(),
        mePlayer: this.players[id]?.serializeForUpdate(),
        otherGods: otherGods.map((god) => god.serializeForUpdate()),
        otherPlayers: otherPlayers.map((player) => player.serializeForUpdate()),
        blocks: Object.values(this.blocks).map((block) => block.serializeForUpdate()),
        ships: Object.values(this.ships).map((ship) => ship.serializeForUpdate())
      });

  }
}
