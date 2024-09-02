import { Constants } from "../shared/constants";
import { Action, gameUpdate, Message } from "../shared/Message";
import { Game } from "./Game";
import { SocketHandling } from "./messaging";
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
		}
	});
}
