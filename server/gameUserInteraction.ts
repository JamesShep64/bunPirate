import { game } from "./users";
import generateUniqueId from "generate-unique-id";
import { God } from "./God";
import { Action, objectUpdate } from "../shared/Message";
import { mouseEvent } from "../shared/Message";
import { Block } from "./Block";
import { Player } from "./Player";
import { PirateShip } from "./PirateShip";
import { Planet } from "./Planet";
import { Meteor } from "./Meteor";
import { Explosion } from "./Explosion";
import { CannonBall } from "./CannonBall";
import { Vector } from "../shared/Vector";
export function addGod(id: string) {
  game.users.push(id);
  game.gods[id] = (new God(id));
}
export function changeTicks(tps: number | undefined) {
  if (!tps)
    return;
  clearInterval(game.intervalID);
  game.intervalID = setInterval(game.update.bind(game), 1000 / tps);
}
export function handleMouseMove(action: Action) {
  const val = action.value as mouseEvent;
  game.gods[action.id].changePlacePoint(val.x, val.y);
}
export function handleMouseClick(action: Action) {
  const god = game.gods[action.id];
  const val = action.value as mouseEvent;
  god.changeClickPoint(val.x, val.y);
  const first = godTakeControl(god, god.controlledPlayer, game.players, "Player");
  if (first)
    return;
  const holder = god.controlledShip;
  const second = godTakeControl(god, god.controlledShip, game.ships, "PirateShip");
  if (!second)
    god.controlledShip = holder;
}
function godTakeControl(god: God, godControllObject: PirateShip | Player | undefined, objectDict: { [key: string]: object }, selectType: string) {
  const clickedObject = Object.values(objectDict).find((object) => { var o = object as Player; return god.clickedOnObject(o.pos); }) as Player;
  return giveGodControl(god, godControllObject, objectDict, clickedObject, selectType);
}

function giveGodControl(god: God, godControllObject: PirateShip | Player | undefined, objectDict: { [key: string]: object }, givenObject: Player | PirateShip | undefined, selectType: string) {
  if (godControllObject) {
    delete objectDict[god.id];
    objectDict[godControllObject.id] = godControllObject;
    godControllObject.controlled = false;
  }
  god.setControlledObject(undefined, selectType);
  godControllObject = undefined;
  if (givenObject && !givenObject.controlled) {
    delete objectDict[givenObject.id];
    objectDict[god.id] = givenObject;
    god.setControlledObject(givenObject, selectType);
    givenObject.controlled = true;
    return true;
  }
}

export function moveUp(id: string) {
  game.gods[id]?.moveUp();
  game.players[id]?.moveUp();
}
export function moveDown(id: string) {
  game.gods[id]?.moveDown();
  game.players[id]?.moveDown();
}
export function moveLeft(id: string) {
  game.gods[id]?.moveLeft();
  game.players[id]?.moveLeft();
}
export function moveRight(id: string) {
  game.gods[id]?.moveRight();
  game.players[id]?.moveRight();
}
export function stopUp(id: string) {
  game.gods[id]?.stopUp();
  game.players[id]?.stopUp();
}
export function stopDown(id: string) {
  game.gods[id]?.stopDown();
  game.players[id]?.stopDown();
}
export function stopLeft(id: string) {
  game.gods[id]?.stopLeft();
  game.players[id]?.stopLeft();
}
export function stopRight(id: string) {
  game.gods[id]?.stopRight();
  game.players[id]?.stopRight();
}
export function playerJump(id: string) {
  game.players[id]?.jump();
}
export function playerStopSpace(id: string) {
  game.players[id]?.stopSpace();
}
export function playerStartHolding(id: string) {
  game.players[id]?.startInteracting();
}
export function playerStopHolding(id: string) {
  game.players[id]?.stopInteracting();
}
export function playerStartSecondaryInteract(id: string) {
  game.players[id]?.startSecondaryInteracting();
}
export function playerStopSecondaryInteract(id: string) {
  game.players[id]?.stopSecondaryInteracting();
}
export function godAddBlock(id: string) {
  const blockID = generateUniqueId({ length: 8 });
  game.blocks[blockID] = new Block(blockID, game.gods[id].placePoint.x, game.gods[id].placePoint.y, 50, 50);
}
export function godAddExplosion(id: string) {
  var idE = generateUniqueId({ length: 8 });
  const god = game.gods[id];
  game.addCannonBall(new CannonBall(idE, god.placePoint.x, god.placePoint.y, new Vector(0, 0)));
}
export function godAddPlayer(id: string) {
  const playerID = generateUniqueId({ length: 8 });
  game.players[playerID] = new Player(playerID, game.gods[id].placePoint.x, game.gods[id].placePoint.y);
}
export function godAddPlanet(id: string) {
  const planetID = generateUniqueId({ length: 8 });
  game.planets[planetID] = new Planet(planetID, game.gods[id].placePoint.x, game.gods[id].placePoint.y);
}
export function godAddMeteor(id: string) {
  const god = game.gods[id];
  if (god.placePoint.x == god.clickPoint.x)
    god.clickPoint.addX(5);
  const meteorID = generateUniqueId({ length: 8 });
  var velocity = game.gods[id].clickPoint.subtractReturn(game.gods[id].placePoint);
  const v = velocity.unitReturn();
  v.unitMultiply(.5);
  const met = new Meteor(meteorID, game.gods[id].placePoint.x, game.gods[id].placePoint.y, v);
  game.addMeteor(met);
}
export function godTogglePlayerGravity(id: string) {
  if (game.gods[id].controlledPlayer)
    game.gods[id].controlledPlayer.toggleGravity();
}
export function godRotateShip(id: string, angle: number) {
  if (game.gods[id].controlledShip) {
    game.gods[id].controlledShip.rotate(angle * Math.PI, true);
    console.log("ship at", game.gods[id].controlledShip.bodyPoly.direction / Math.PI);
  }
}

export function godAddShip(id: string) {
  const shipID = generateUniqueId({ length: 8 });
  var ship = new PirateShip(shipID, game.gods[id].placePoint.x, game.gods[id].placePoint.y);
  ship.freeze = true;
  game.ships[shipID] = ship;
  giveGodControl(game.gods[id], game.gods[id].controlledShip, game.ships, game.ships[shipID], "PirateShip");

}
export function godAddMass(id: string, pos: string, weight: string) {
  if (game.gods[id].controlledShip)
    game.gods[id].controlledShip.addMass(Number(pos), Number(weight));
}
export function godClearMass(id: string) {
  if (game.gods[id].controlledShip)
    game.gods[id].controlledShip.clearMass();
}
export function godFollowShip(id: string) {
  game.gods[id].followShip();
}
export function godFreezeShip(id: string) {
  if (game.gods[id].controlledShip)
    game.gods[id].controlledShip.toggleFreeze();
}
