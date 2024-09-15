//actions are user inputs to be sent to the server
//messages are sent from the server

//handles the messages sent from the server to the client, has a dictionarry of functions which are paired with a message type from Constants, handle message is called whenever a message is recieved from the server.
export const serverMessageHandler = {
	// Initialize the messageFunctionPairs object
	messageFunctionPairs: {} as { [key: string]: any },

	// Define the `on` method to add a function for a specific message type
	on(type: string, func: any): void {
		this.messageFunctionPairs[type] = func;
	},

	// Define the `handleMessage` method to call the appropriate function for a given message type
	handleMessage(type: string, content: object): void {
		if (this.messageFunctionPairs[type]) {
			this.messageFunctionPairs[type](content);
		} else {
			console.warn(`No handler found for message type: ${type}`);
		}
	}
};

