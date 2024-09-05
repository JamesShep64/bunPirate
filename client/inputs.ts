import { ID } from ".";
import { Constants } from "../shared/constants";
import { ClientPayload, Message, Action } from "../shared/Message";
import { sendMessage } from "./networking";

//class for action, which contains the type of action the user took, and the value of the action
const actionArray: Action[] = [];
const input = document.getElementById("console-input") as HTMLInputElement;
input.addEventListener('keydown', function(event) {
	if (event.key === 'Enter') {
		// Action to perform when Enter is pressed
		handleTextInput(input.value);
		input.value = '';
	}
});
input.addEventListener('click', function(event) {
	event.stopPropagation(); // Prevent click event propagation
});


export function recordActions() {
	window.addEventListener("mousemove", handleMouseMove);
	window.addEventListener("click", handleClick);
	window.addEventListener('keydown', function(event) {
		if (event.key === 'Enter') {
			input.focus();  // Focus the text box when Enter is pressed
			event.stopPropagation();
		}
	});
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

function handleClick(e: MouseEvent) {
	const checkedID = ID as string;
	actionArray.push(new Action(Constants.INPUT_TYPES.MOUSE_CLICK, { x: e.clientX, y: e.clientY }, checkedID));
}
function handleTextInput(command: string) {
	const checkedID = ID as string;
	actionArray.push(new Action(Constants.INPUT_TYPES.GOD_COMMAND, { text: command }, checkedID));
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
		case Constants.INPUT_TYPES.MOUSE_CLICK:
			if (other.inputType == Constants.INPUT_TYPES.MOUSE_CLICK)
				return true;
			break;
	}
	return false;
}

