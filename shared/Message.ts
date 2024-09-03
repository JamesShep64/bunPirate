import { godUpdate } from "../server/God";
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
export class ClientPayload {
	id: string;
	data: object;
	constructor(id: string, data: object) {
		this.id = id;
		this.data = data;
	}
}
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
export interface mouseMove {
	x: number;
	y: number;

}
export interface gameUpdate {
	time: number;
	me: godUpdate;
	otherGods: godUpdate[];
}
export interface objectUpdate {
	id: string;
	x: number;
	y: number;
}
