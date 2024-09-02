import { Constants } from "../shared/constants";
import { throttle } from 'throttle-debounce';
import generateUniqueId from "generate-unique-id";
import { Message } from "../shared/Message";
import { serverMessageHandler } from "./messaging";

const ws = new WebSocket(`ws://${window.location.host}`);
export const upgradePromise = new Promise(resolve => {
  ws.addEventListener("open", () => {
    console.log("Connected!");
    ws.addEventListener("message", (e) => serverMessageHandler.handleMessage(JSON.parse(e.data).type, JSON.parse(e.data).content));
    resolve("");
  });
});
export function sendMessage(message: Message) {
  ws.send(JSON.stringify(message));
}
/*
export const connect = onGameOver => (
  connectedPromise.then(() => {
    socket.on(Constants.MSG_TYPES.GAME_UPDATE, processGameUpdate);
    socket.on(Constants.MSG_TYPES.LOBBY_UPDATE, processLobbyUpdate);
    socket.on(Constants.MSG_TYPES.JOINED_LOBBY, joinLobby);
    socket.on(Constants.MSG_TYPES.CREATOR_JOINED_GAME, creatorJoined);
    socket.on(Constants.MSG_TYPES.CREATOR_LEFT_GAME, (e) => {
      disconnect();
      console.log('CREATOR LEFT GAME');
    });
    socket.on(Constants.MSG_TYPES.GAME_OVER, onGameOver);
    socket.on('disconnect', () => {
      console.log('disconnected');
      disconnect();
    });
    socket.on(Constants.MSG_TYPES.BECOME_LEADER, () => { becomeLeader(); console.log('LLL') });
  })
);
*/
