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
  addGod(id: string) {
    this.users.push(id);
    this.gods[id] = (new God(id));
  }
  changeTicks(tps: number | undefined) {
    if (!tps)
      return;
    clearInterval(this.intervalID);
    this.intervalID = setInterval(this.update.bind(this), 1000 / tps);
  }
  handleMouseMove(action: Action) {
    const val = action.value as mouseEvent;
    this.gods[action.id].changePlacePoint(val.x, val.y);
  }
  handleMouseClick(action: Action) {
    const god = this.gods[action.id];
    if (god.controlledPlayer) {
      delete this.players[god.id];
      this.players[god.controlledPlayer.id] = god.controlledPlayer;
      god.controlledPlayer.controlled = false;
    }
    god.controlledPlayer = undefined;
    const clickedPlayer = Object.values(this.players).findLast((player) => god.clickedOnPolygon(player.hitBox));
    if (clickedPlayer && !clickedPlayer.controlled) {
      delete this.players[clickedPlayer.id];
      this.players[god.id] = clickedPlayer;
      god.controlledPlayer = clickedPlayer;
      clickedPlayer.controlled = true;
    }
  }

  moveUp(id: string) {
    this.gods[id]?.moveUp();
    this.players[id]?.moveUp();
  }
  moveDown(id: string) {
    this.gods[id]?.moveDown();
    this.players[id]?.moveDown();
  }
  moveLeft(id: string) {
    this.gods[id]?.moveLeft();
    this.players[id]?.moveLeft();
  }
  moveRight(id: string) {
    this.gods[id]?.moveRight();
    this.players[id]?.moveRight();
  }
  stopUp(id: string) {
    this.gods[id]?.stopUp();
    this.players[id]?.stopUp();
  }
  stopDown(id: string) {
    this.gods[id]?.stopDown();
    this.players[id]?.stopDown();
  }
  stopLeft(id: string) {
    this.gods[id]?.stopLeft();
    this.players[id]?.stopLeft();
  }
  stopRight(id: string) {
    this.gods[id]?.stopRight();
    this.players[id]?.stopRight();
  }

  godAddBlock(id: string) {
    const blockID = generateUniqueId({ length: 8 });
    this.blocks[blockID] = new Block(blockID, this.gods[id].placePoint.x, this.gods[id].placePoint.y, 50, 50);
  }
  godAddPlayer(id: string) {
    const playerID = generateUniqueId({ length: 8 });
    this.players[playerID] = new Player(playerID, this.gods[id].placePoint.x, this.gods[id].placePoint.y);
  }
  godAddShip(id: string) {
    const shipID = generateUniqueId({ length: 8 });
    this.ships[shipID] = new PirateShip(shipID, this.gods[id].placePoint.x, this.gods[id].placePoint.y);
  }
  //************************************************************
  update() {
    Object.values(this.gods).forEach(god => god.update());
    Object.values(this.players).forEach(player => player.update());
    //player block collision
    Object.values(this.players).forEach((player) => {
      Object.values(this.blocks).forEach((block) => {
        const col = polygonPolygonCollision(player.hitBox, block);
        if (col) {
          player.hitBox.displace(col);
        }
      })
    });
    //player ship collision
    Object.values(this.players).forEach((player) => {
      Object.values(this.ships).forEach((ship) => {
        const col = polygonShipCollision(player.hitBox, ship);
        if (col) {
          player.hitBox.displace(col);
        }
      })
    });
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
