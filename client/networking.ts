import { Constants } from "../shared/constants";
import { ClientPayload, Message } from "../shared/Message";
import { serverMessageHandler } from "./messaging";
import { ID } from ".";

const ws = new WebSocket(`ws://${window.location.host}`);
export const upgradePromise = new Promise(resolve => {
  ws.addEventListener("open", () => {
    console.log("Connected!");
    ws.addEventListener("message", (e) => serverMessageHandler.handleMessage(JSON.parse(e.data).type, JSON.parse(e.data).content));
    resolve("");
    ws.addEventListener("close", () => { var id = ID as string; sendMessage(new Message(id, {})); });
  });
});
window.onbeforeunload = () => {
  var id = ID as string;
  sendMessage(new Message(Constants.MSG_TYPES.DISCONNECT, new ClientPayload(id, {})));
}
export function sendMessage(message: Message) {
  ws.send(JSON.stringify(message));
}
