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
export interface gameUpdate {
	time: number;
	me: godUpdate;
	otherGods: godUpdate[];
	blocks: blockUpdate[];
}
export interface objectUpdate {
	id: string;
	x: number;
	y: number;
}
export interface blockUpdate extends objectUpdate {
	points: Vector[];
}
export interface godUpdate extends objectUpdate {
	placeX: number;
	placeY: number;
}
export interface godCommand {
	text: string;
}
