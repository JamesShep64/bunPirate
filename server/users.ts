import { Constants } from "../shared/constants";
import { Action, gameUpdate, godCommand, Message } from "../shared/Message";
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
		}
	});
}
function handleCommands(action: Action) {
	const val = action.value as godCommand;
	switch (val.text) {
		case "poly":
			game.godAddBlock(action.id);
			break;
	}
}
