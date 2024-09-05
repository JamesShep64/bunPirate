import { Constants } from "../shared/constants";
import { Action, gameUpdate, godCommand, keyEvent, Message } from "../shared/Message";
import { Game } from "./Game";
import { sendMessage } from "./websockets";

const game = new Game();
export function userJoinedGame(id: string) {
	game.addGod(id);
}
export function sendUpdate(id: string, update: gameUpdate) {
	sendMessage(id, new Message(Constants.MSG_TYPES.GAME_UPDATE, update));
}
export function handleActions(actions: Action[]) {
	actions.forEach((action) => {
		switch (action.inputType) {
			case Constants.INPUT_TYPES.MOUSE_MOVE:
				game.handleMouseMove(action);
				break;
			case Constants.INPUT_TYPES.MOUSE_CLICK:
				game.handleMouseClick(action);
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
			game.moveUp(action.id);
			break;
		case "a":
			game.moveLeft(action.id);
			break;
		case "s":
			game.moveDown(action.id);
			break;
		case "d":
			game.moveRight(action.id);
			break;
	}
}
function handleKeyUp(action: Action) {
	const val = action.value as keyEvent;
	switch (val.key) {
		case "w":
			game.stopUp(action.id);
			break;
		case "a":
			game.stopLeft(action.id);
			break;
		case "s":
			game.stopDown(action.id);
			break;
		case "d":
			game.stopRight(action.id);
			break;
	}
}
function handleCommands(action: Action) {
	const val = action.value as godCommand;
	switch (val.text) {
		case "poly":
			game.godAddBlock(action.id);
			break;
	}
}
