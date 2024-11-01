import generateUniqueId from "generate-unique-id";
import { Action, Message, mouseEvent } from "../shared/Message";
import { Block } from "./Block";
import { God } from "./God";
import { sendUpdate } from "./users";
import { Player } from "./Player";
import { PirateShip } from "./PirateShip";
import { Constants } from "../shared/constants";
import { Lobby } from "./Lobby";
import { Planet } from "./Planet";
import { CollisionSection } from "./CollisionGrid";
import { CannonBall } from "./CannonBall";
import { Explosion } from "./Explosion";
import { Grapple } from "./Grapple";
import { Meteor } from "./Meteor";

export class Game {
  users: string[];
  gods: { [key: string]: God };
  players: { [key: string]: Player };
  blocks: { [key: string]: Block };
  ships: { [key: string]: PirateShip };
  planets: { [key: string]: Planet };
  meteors: { [key: string]: Meteor };
  cannonBalls: { [key: string]: CannonBall };
  grapples: { [key: string]: Grapple };
  explosions: { [key: string]: Explosion };
  collisionGrid: CollisionSection[][];
  intervalID: Timer;

  constructor() {
    this.gods = {};
    this.blocks = {};
    this.players = {};
    this.ships = {};
    this.planets = {};
    this.meteors = {};
    this.cannonBalls = {};
    this.explosions = {};
    this.grapples = {};
    this.users = [];
    this.collisionGrid = Array.from({ length: ~~(Constants.MAP_WIDTH / 500) }, () => Array.from({ length: ~~(Constants.MAP_HEIGHT / 500) }, () => new CollisionSection()));
    this.intervalID = setInterval(this.update.bind(this), 1000 / 20);
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
    var width = Math.random() * Constants.MAP_WIDTH;
    var height = Math.random() * Constants.MAP_HEIGHT;
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
  addCannonBall(cannonBall: CannonBall) {
    this.cannonBalls[cannonBall.id] = cannonBall;
  }
  deleteCannonBall(cannonBall: CannonBall, dontExplode = false) {
    if (!dontExplode && this.cannonBalls[cannonBall.id]) {
      var id = generateUniqueId({ length: 8 });
      this.addExplosion(new Explosion(cannonBall.pos.x, cannonBall.pos.y, id));
    }
    delete this.cannonBalls[cannonBall.id];
  }
  addMeteor(met: Meteor) {
    this.meteors[met.id] = met;
  }
  deleteMeteor(met: Meteor, dontExplode = false) {
    if (!dontExplode && this.meteors[met.id]) {
      var id = generateUniqueId({ length: 8 });
      this.addExplosion(new Explosion(met.pos.x, met.pos.y, id, 20));
    }
    delete this.meteors[met.id];
  }

  addGrapple(grapple: Grapple) {
    this.grapples[grapple.id] = grapple;
  }
  deleteGrapple(grapple: Grapple) {
    grapple.ship.grapple = undefined;
    delete this.grapples[grapple.id];
  }
  addExplosion(explosion: Explosion) {
    this.explosions[explosion.id] = explosion;
  }
  deleteExplosion(explosion: Explosion) {
    var id = explosion.id;
    delete this.explosions[id];
  }
  update() {
    const begin = Date.now();
    Object.values(this.gods).forEach(god => god.update());
    Object.values(this.ships).forEach(ship => ship.update());
    Object.values(this.blocks).forEach(block => block.update());
    Object.values(this.planets).forEach(planet => planet.update());
    Object.values(this.meteors).forEach(meteor => meteor.update());
    Object.values(this.players).forEach(player => player.update());
    Object.values(this.cannonBalls).forEach(ball => ball.update());
    Object.values(this.grapples).forEach(ball => ball.update());
    Object.values(this.explosions).forEach(explo => explo.update());
    for (var i = 1; i < this.collisionGrid.length; i += 2) {
      for (var j = 1; j < this.collisionGrid[0].length; j += 2) {
        this.collisionGrid[i][j].CheckCollisions(this.collisionGrid[i - 1][j], this.collisionGrid[i + 1][j], this.collisionGrid[i][j + 1], this.collisionGrid[i][j - 1], this.collisionGrid[i - 1][j - 1], this.collisionGrid[i + 1][j + 1], this.collisionGrid[i - 1][j + 1], this.collisionGrid[i + 1][j - 1]);
      }
    }
    //update the displacments of all physics objects
    Object.values(this.ships).forEach(ship => ship.physicsObject.updateDisplace());
    Object.values(this.players).forEach(player => player.physicsObject.updateDisplace());
    //send updates to all users
    this.users.forEach((id: string) => {
      if (id)
        this.createUpdate(id);
    });
    for (var i = 0; i < this.collisionGrid.length; i += 1) {
      for (var j = 0; j < this.collisionGrid[0].length; j += 1) {
        this.collisionGrid[i][j].clear();
      }
    }
    const b = Date.now() - begin;
    if (b > 3)
      console.log(b);
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
        ships: Object.values(this.ships).map((ship) => ship.serializeForUpdate()),
        planets: Object.values(this.planets).map((planet) => planet.serializeForUpdate()),
        meteors: Object.values(this.meteors).map((meteor) => meteor.serializeForUpdate()),
        cannonBalls: Object.values(this.cannonBalls).map((ball => ball.serializeForUpdate())),
        grapples: Object.values(this.grapples).map((ball => ball.serializeForUpdate())),
        explosions: Object.values(this.explosions).map((explo => explo.serializeForUpdate())),
      });

  }
}
