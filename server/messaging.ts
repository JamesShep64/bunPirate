import { ServerWebSocket } from "bun";
import { ClientPayload, Message } from "../shared/Message";
export const SocketHandling = {
	// Key-value pair of all currently connected sockets
	socketIdPairs: {} as { [key: string]: ServerWebSocket<{ authToken: string; }> },
	payLoadFunctionPairs: {} as { [key: string]: any },
	// Method to add a socket to the socketIdPairs object
	addSocket(id: string, ws: ServerWebSocket<{ authToken: string; }>): void {
		this.socketIdPairs[id] = ws;
	},

	// Optionally, you can include additional methods
	getSocket(id: string): object | undefined {
		return this.socketIdPairs[id];
	},

	removeSocket(id: string): void {
		delete this.socketIdPairs[id];
	},

	on(type: string, func: any): void {
		this.payLoadFunctionPairs[type] = func;
	},

	// Define the `handleMessage` method to call the appropriate function for a given message type
	handleMessage(type: string, payload: ClientPayload): void {
		if (this.payLoadFunctionPairs[type]) {
			this.payLoadFunctionPairs[type](payload);
		} else {
			console.warn(`No handler found for message type: ${type}`);
		}
	}
};

