import { Vector } from "./Vector";
import { Constants } from "./constants";

// this the the structure of messages sent through websockets, the message containings a string from Constants which signifies the type of message being sent, and also contains the object which is the contenents of the message
export class Message {
	type: string;
	content: object;

	constructor(type: string, message: object) {
		this.type = type;
		this.content = message;
	}
}
//this is the class used for content in messages sent from the client to the server
export class ClientPayload {
	id: string;
	data: object;
	constructor(id: string, data: object) {
		this.id = id;
		this.data = data;
	}
}
//this is the class used to hold the actions entered by the client
export class Action {
	id: string;
	inputType: string;
	value: object;
	constructor(inputType: string, value: object, id: string) {
		this.inputType = inputType;
		this.value = value;
		this.id = id;
	}
}
//these are interfaces which are used to unpack the values of messages/actions
export interface mouseEvent {
	x: number;
	y: number;
}
export interface keyEvent {
	key: string;
}
export interface userPlayer {
	name: string;
}
export interface playerJoinLobby extends userPlayer {
	lobbyID: string;
}
export interface lobbyID {
	id: string;
};
export interface gameUpdate {
	time: number;
	meGod: godUpdate;
	mePlayer: playerUpdate;
	otherGods: godUpdate[];
	otherPlayers: playerUpdate[];
	blocks: blockUpdate[];
	ships: shipUpdate[];
}
export interface lobbyUpdate {
	crew: string[];
	captain: string;
	ids: string[];
}
export interface addLobby {
	id: string;
}
export interface objectUpdate {
	id: string;
	x: number;
	y: number;
}
export interface blockUpdate extends objectUpdate {
	points: Vector[];
}
export interface shipUpdate extends objectUpdate {
	points: Vector[];
	zeroPoints: Vector[];
	missingZeros: number[];
	masses: blockUpdate[];
	ladder: Vector[];
}
export interface godUpdate extends objectUpdate {
	placeY: number;
}
export interface playerUpdate extends objectUpdate {
	points: Vector[];
}
export interface godCommand {
	text: string;
}
