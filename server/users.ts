import { Constants } from "../shared/constants";
import { Action, gameUpdate, godCommand, keyEvent, Message } from "../shared/Message";
import { Game } from "./Game";
import { sendMessage } from "./websockets";
import { addGod, moveLeft, moveDown, moveUp, playerJump, godTogglePlayerGravity, moveRight, godClearMass, godAddMass, godFollowShip, handleMouseMove, handleMouseClick, stopRight, stopUp, stopDown, stopLeft, godAddShip, godAddBlock, godAddPlayer, changeTicks, godRotateShip, godFreezeShip, godAddPlanet, playerStartHolding, playerStopHolding, playerStopSpace, playerStartSecondaryInteract, playerStopSecondaryInteract, godAddMeteor, godAddExplosion, godTurnShip } from "./gameUserInteraction";
import generateUniqueId from "generate-unique-id";
import { Lobby } from "./Lobby";
import { User } from "./User";

export const game = new Game();
const lobbies = {} as { [key: string]: Lobby };
const users = {} as { [key: string]: User };
export const lobbyLinks = [] as string[];
export function godJoinedGame(id: string) {
	users[id] = new User(id, "");
	addGod(id);
}
export function userCreateLobby(id: string, name: string) {
	users[id] = new User(id, name);
	var lobbyID = generateUniqueId({ length: 8 });
	lobbies[lobbyID] = new Lobby(lobbyID, users[id]);
	users[id].lobby = lobbies[lobbyID];
	lobbyLinks.push(lobbyID);
	return lobbyID;
}
export function userJoinLobby(lobbyID: string, id: string, name: string) {
	users[id] = new User(id, name);
	lobbies[lobbyID].addUser(users[id]);
	users[id].lobby = lobbies[lobbyID];
	if (lobbies[lobbyID].shipID) {
		sendMessage(id, new Message(Constants.MSG_TYPES.ADD_STRAGGLER, {}));
	}
}
export function addStraggler(lobbyID: string, id: string) {

	game.addStraggler(id, lobbies[lobbyID]);
}
export function handleDisconnect(id: string) {
	game.disconnect(id);
	if (users[id]?.lobby) {
		users[id].lobby.removeUser(id);
	}
}
export function deleteLobby(lobbyID: string) {
	game.removeCrew(lobbies[lobbyID]);
	delete lobbies[lobbyID];
	const index = lobbyLinks.indexOf(lobbyID);
	lobbyLinks.splice(index, 1);
}
export function addCrew(lobbyID: string) {
	game.addCrew(lobbies[lobbyID]);
	Object.keys(lobbies[lobbyID].users).forEach(id => {
		if (id)
			sendMessage(id, new Message(Constants.MSG_TYPES.PLAYER_JOINED, {}));
	});
}
export function sendUpdate(id: string, update: gameUpdate) {
	sendMessage(id, new Message(Constants.MSG_TYPES.GAME_UPDATE, update));
}
export function handleActions(actions: Action[]) {
	actions.forEach((action) => {
		switch (action.inputType) {
			case Constants.INPUT_TYPES.MOUSE_MOVE:
				handleMouseMove(action);
				break;
			case Constants.INPUT_TYPES.MOUSE_CLICK:
				handleMouseClick(action);
				break;
			case Constants.INPUT_TYPES.GOD_COMMAND:
				handleCommands(action);
				break;
			case Constants.INPUT_TYPES.KEY_DOWN:
				handleKeyDown(action);
				break;
			case Constants.INPUT_TYPES.KEY_UP:
				handleKeyUp(action);
				break;
		}
	});
}
function handleKeyDown(action: Action) {
	const val = action.value as keyEvent;
	switch (val.key) {
		case "w":
			moveUp(action.id);
			break;
		case "a":
			moveLeft(action.id);
			break;
		case "s":
			moveDown(action.id);
			break;
		case "d":
			moveRight(action.id);
			break;
		case " ":
			playerJump(action.id);
			break;
		case "k":
			playerStartHolding(action.id);
			break;
		case "l":
			playerStartSecondaryInteract(action.id);
			break;
	}
}
function handleKeyUp(action: Action) {
	const val = action.value as keyEvent;
	switch (val.key) {
		case "w":
			stopUp(action.id);
			break;
		case "a":
			stopLeft(action.id);
			break;
		case "s":
			stopDown(action.id);
			break;
		case "d":
			stopRight(action.id);
			break;
		case "k":
			playerStopHolding(action.id);
			break;
		case " ":
			playerStopSpace(action.id);
			break;
		case "l":
			playerStopSecondaryInteract(action.id);
			break;
	}
}
function handleCommands(action: Action) {
	const val = action.value as godCommand;
	const command = val.text.split(" ");
	switch (command[0]) {
		case "poly":
			godAddBlock(action.id);
			break;
		case "player":
			godAddPlayer(action.id);
			break;
		case "plan":
			godAddPlanet(action.id);
			break;
		case "met":
			godAddMeteor(action.id);
			break;
		case "grav":
			godTogglePlayerGravity(action.id);
			break;
		case "ship":
			godAddShip(action.id);
			break;
		case "tps":
			changeTicks(Number(command[1]));
			break;
		case "r":
			godRotateShip(action.id, Number(command[1]));
			break;

		case "turn":
			godTurnShip(action.id);
			break;
		case "mass":
			if (command[1] == "clear")
				godClearMass(action.id);
			else
				godAddMass(action.id, command[1], command[2]);
			break;
		case "follow":
			godFollowShip(action.id);
			break;
		case "freeze":
			godFreezeShip(action.id);
			break;
		case "e":
			godAddExplosion(action.id);
			break;

	}
}
