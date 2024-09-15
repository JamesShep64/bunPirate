import { game } from "./users";
import generateUniqueId from "generate-unique-id";
import { God } from "./God";
import { Action, objectUpdate } from "../shared/Message";
import { mouseEvent } from "../shared/Message";
import { Block } from "./Block";
import { Player } from "./Player";
import { PirateShip } from "./PirateShip";
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
export function godAddBlock(id: string) {
  const blockID = generateUniqueId({ length: 8 });
  game.blocks[blockID] = new Block(blockID, game.gods[id].placePoint.x, game.gods[id].placePoint.y, 50, 50);
}
export function godAddPlayer(id: string) {
  const playerID = generateUniqueId({ length: 8 });
  game.players[playerID] = new Player(playerID, game.gods[id].placePoint.x, game.gods[id].placePoint.y);
}
export function godTogglePlayerGravity(id: string) {
  if (game.gods[id].controlledPlayer)
    game.gods[id].controlledPlayer.toggleGravity();
}
export function godRotateShip(id: string, angle: number) {
  if (game.gods[id].controlledShip) {
    game.gods[id].controlledShip.rotate(angle);
  }
}
export function godAddShip(id: string) {
  const shipID = generateUniqueId({ length: 8 });
  game.ships[shipID] = new PirateShip(shipID, game.gods[id].placePoint.x, game.gods[id].placePoint.y);
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
