import { ID } from ".";
import { Constants } from "../shared/constants";
import { ClientPayload, Message, Action } from "../shared/Message";
import { sendMessage } from "./networking";
import { cameraPosition } from "./render";

//class for action, which contains the type of action the user took, and the value of the action
const actionArray: Action[] = [];
const input = document.getElementById("console-input") as HTMLInputElement;
input.addEventListener('keydown', function(event) {
	if (event.key === 'Enter') {
		// Action to perform when Enter is pressed
		handleTextInput(input.value);
		input.value = '';
		input.blur();
	}
	event.stopPropagation();
});
input.addEventListener('keyup', (e) => {
	e.stopPropagation();
});


export var toggleInterpolate = true;
export function recordMouse() {
	window.addEventListener("mousemove", handleMouseMove);
	window.addEventListener("click", handleClick);
}
export function recordActions() {
	window.addEventListener('keydown', (event) => {
		if (event.key === 'Enter') {
			input.focus();  // Focus the text box when Enter is pressed
			event.stopPropagation();
		}
		if (event.key === 'w' || event.key === 'a' || event.key === 's' || event.key === 'd' || event.key === " " || event.key == "j" || event.key == "k" || event.key == "l") {
			handleKeyDown(event.key);
		}

	});
	window.addEventListener('keyup', (event) => {
		if (event.key === 'w' || event.key === 'a' || event.key === 's' || event.key === 'd' || event.key == "j" || event.key == "k" || event.key == "l" || event.key == " ")
			handleKeyUp(event.key);
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
function handleKeyDown(key: string) {
	const checkedID = ID as string;
	actionArray.push(new Action(Constants.INPUT_TYPES.KEY_DOWN, { key: key }, checkedID));
}
function handleKeyUp(key: string) {
	const checkedID = ID as string;
	actionArray.push(new Action(Constants.INPUT_TYPES.KEY_UP, { key: key }, checkedID));
}
function handleMouseMove(e: MouseEvent) {
	const checkedID = ID as string;
	actionArray.push(new Action(Constants.INPUT_TYPES.MOUSE_MOVE, { x: e.clientX - cameraPosition.x, y: e.clientY - cameraPosition.y }, checkedID));
}
export var cursPos = { x: 0, y: 0 };
function handleClick(e: MouseEvent) {
	const checkedID = ID as string;
	actionArray.push(new Action(Constants.INPUT_TYPES.MOUSE_CLICK, { x: e.clientX, y: e.clientY }, checkedID));
}
function handleTextInput(command: string) {
	const checkedID = ID as string;
	if (command === "togInt") {
		toggleInterpolate = !toggleInterpolate;
		return;
	}
	if (command === "default") {
		toggleInterpolate = true;
		actionArray.push(new Action(Constants.INPUT_TYPES.GOD_COMMAND, { text: "tps 30" }, checkedID));
		return;
	}
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

