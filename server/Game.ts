import generateUniqueId from "generate-unique-id";
import { Action, Message, mouseEvent } from "../shared/Message";
import { Block } from "./Block";
import { God } from "./God";
import { sendUpdate } from "./users";
import { Player } from "./Player";
import { polygonPolygonCollision } from "./collisions";
import { PirateShip } from "./PirateShip";
import { polygonShipCollision } from "./collisions";

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
  //these functions have to do with the god users
  //***********************************************************
  //************************************************************
  update() {
    Object.values(this.gods).forEach(god => god.update());
    Object.values(this.players).forEach(player => player.update());
    Object.values(this.blocks).forEach(block => block.update());
    Object.values(this.ships).forEach(ship => ship.update());
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
          player.physicsObject.addDisplacement(col);
        }
      })
    });
    //update the displacments of all physics objects
    Object.values(this.players).forEach(player => player.physicsObject.updateDisplace());
    Object.values(this.blocks).forEach(block => block.physicsObject.updateDisplace());
    //send updates to all users
    this.users.forEach((id: string) => {
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
