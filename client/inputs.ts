import { ID } from ".";
import { Constants } from "../shared/constants";
import { ClientPayload, Message, Action } from "../shared/Message";
import { sendMessage } from "./networking";

//class for action, which contains the type of action the user took, and the value of the action
const actionArray: Action[] = [];
export function recordActions() {
	window.addEventListener("mousemove", handleMouseMove);
	setInterval(sendActions, 1000 / 30);
}
function sendActions() {
	if (actionArray.length != 0) {

		const checkedID = ID as string;
		deleteDuplicates();
		sendMessage(new Message(Constants.MSG_TYPES.INPUT, new ClientPayload(checkedID, actionArray)));
		actionArray.length = 0;
	}
}

function handleMouseMove(e: MouseEvent) {
	const checkedID = ID as string;
	actionArray.push(new Action(Constants.INPUT_TYPES.MOUSE_MOVE, { x: e.clientX, y: e.clientY }, checkedID));
}
function deleteDuplicates() {
	const checkingArray: Action[] = [];
	for (var i = actionArray.length; i--; i >= 0) {
		if (checkingArray.find((a: Action) => actionEquals(actionArray[i], a)))
			actionArray.splice(i, 1);
		else
			checkingArray.push(actionArray[i]);
	}
}
function actionEquals(me: Action, other: Action): boolean {
	switch (me.inputType) {
		case Constants.INPUT_TYPES.MOUSE_MOVE:
			if (other.inputType == Constants.INPUT_TYPES.MOUSE_MOVE)
				return true;
			break;
	}
	return false;
}

