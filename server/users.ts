import { Constants } from "../shared/constants";
import { Action, gameUpdate, godCommand, keyEvent, Message } from "../shared/Message";
import { Game } from "./Game";
import { sendMessage } from "./websockets";
import { addGod, moveLeft, moveDown, moveUp, moveRight, godAddMass, godFollowShip, handleMouseMove, handleMouseClick, stopRight, stopUp, stopDown, stopLeft, godAddShip, godAddBlock, godAddPlayer, changeTicks, godRotateShip } from "./gameUserInteraction";


export const game = new Game();
export function userJoinedGame(id: string) {
	addGod(id);
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
		case "ship":
			godAddShip(action.id);
			break;
		case "tps":
			changeTicks(Number(command[1]));
			break;
		case "r":
			godRotateShip(action.id);
			break;
		case "mass":
			godAddMass(action.id, command[1], command[2]);
			break;
		case "follow":
			godFollowShip(action.id);
			break;

	}
}
