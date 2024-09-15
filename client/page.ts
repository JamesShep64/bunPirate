import generateUniqueId from "generate-unique-id";
import { Constants } from "../shared/constants";
import { ClientPayload, Message } from "../shared/Message";
import { sendMessage } from "./networking";
import { ID } from ".";
import { serverMessageHandler } from "./messaging";

const playMenu = document.getElementById("play-menu") as HTMLDivElement;
const consoleInput = document.getElementById("console-input") as HTMLDivElement;
const usernameInput = document.getElementById("username-input") as HTMLInputElement;
const joinButton = document.getElementById("join-button") as HTMLButtonElement;
const createButton = document.getElementById("create-button") as HTMLButtonElement;
const fullPath = window.location.pathname;

const fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1);
if (fileName == "godJoin") {
	playMenu.classList.add("hidden");
}
else if (fileName == "") {
	consoleInput.classList.add("hidden");
	usernameMenu();
}
else {

}
function usernameMenu() {
	usernameInput.focus();
	joinButton.onclick = () => {
		usernameInput.placeholder = "paste URL here";
		createButton.classList.add("hidden");
	};
	createButton.onclick = () => {
		var name = usernameInput.textContent as string;
		var id = ID as string;
		sendMessage(new Message(Constants.MSG_TYPES.CREATE_LOBBY, new ClientPayload(id, { name })));
		serverMessageHandler.on(Constants.MSG_TYPES.CREATE_LOBBY, (content: object) => {
			joinButton.classList.add("hidden");
			createButton.classList.add("hidden");
		});
	};
}

