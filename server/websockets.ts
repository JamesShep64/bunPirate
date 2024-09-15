import { Glob } from "bun";
import generateUniqueId from "generate-unique-id";
import { Action, addLobby, ClientPayload, lobbyID, lobbyUpdate, Message, playerJoinLobby, userPlayer } from "../shared/Message";
import { Constants } from "../shared/constants";
import { SocketHandling } from "./messaging";
import { godJoinedGame, handleActions, handleDisconnect, userCreateLobby, lobbyLinks, userJoinLobby, addCrew } from "./users";
Bun.build({
  entrypoints: ['../client/index.ts', '../client/page.ts'],
  outdir: '../out/',
});
//this is to get the path all of the assets to prepare for sending
const assets: string[] = [];
const glob = new Glob("**");
for (const file of glob.scanSync(".")) {
  assets.push("/" + file);
}
//set the response functions to recieved messages
setPayLoadFunctionPairs();
//the web server
const serverInstance = Bun.serve<{ authToken: string; }>({
  fetch(req, server) {
    if (server.upgrade(req)) {
      return; // do not return a Response
    }
    //get create files to be sent over http
    const htmlPath = "../client/index.html";
    const htmlFile = Bun.file(htmlPath);
    const jsPath = "../out/index.js";
    const jsFile = Bun.file(jsPath);
    const jsPagePath = "../out/page.js";
    const jsPageFile = Bun.file(jsPagePath);
    const cssPath = "../client/style.css";
    const cssFile = Bun.file(cssPath);
    //send through http, html page and javascript
    const url = new URL(req.url);
    if (url.pathname === "/") return new Response(htmlFile);
    if (url.pathname === '/godJoin') return new Response(htmlFile);
    if (url.pathname === "/script.js") return new Response(jsFile);
    if (url.pathname === "/page.js") return new Response(jsPageFile);
    if (url.pathname === "/style.css") return new Response(cssFile);
    const index = lobbyLinks.indexOf(url.pathname.substring(1, url.pathname.length));
    if (index != -1) {
      return new Response(htmlFile);
    }
    if (assets.includes(url.pathname)) {
      const filePath = "." + url.pathname;
      const imgFile = Bun.file(filePath);
      return new Response(imgFile);
    }

    return new Response("404!");
  },
  websocket: {
    // handler called when a message is received
    async message(ws, message) {
      if (typeof message === "string") {
        const received = JSON.parse(message);
        SocketHandling.handleMessage(received.type, received.content);

      }
    },
    open(ws) {
      const id: string = generateUniqueId({ length: 8 });
      ws.send(JSON.stringify(new Message(Constants.MSG_TYPES.WS_ID, { id })));
      console.log(id, "connected");
      SocketHandling.addSocket(id, ws);
      //this is just to make sure that the correct websocket is recieving the messages calling .on sets for all websockets

    },
  },
});
export function sendMessage(id: string | undefined, message: Message) {
  if (typeof id == "string")
    SocketHandling.socketIdPairs[id].send(JSON.stringify(message));
}
function setPayLoadFunctionPairs() {
  //this is to responed to the user joining the game
  SocketHandling.on(Constants.MSG_TYPES.GOD_JOINED, (payload: ClientPayload) => {
    if (!payload.id) {
      throw ("cant join game without id");
    }
    //this is just chkecking that the websocket is connected can remove
    sendMessage(payload.id, new Message(Constants.MSG_TYPES.GOD_JOINED, { id: payload.id }));
    godJoinedGame(payload.id);
  });
  //handle inputs
  SocketHandling.on(Constants.MSG_TYPES.INPUT, (payload: ClientPayload) => { const action = payload.data as Action[]; handleActions(action); });
  //handle lobby creation
  SocketHandling.on(Constants.MSG_TYPES.CREATE_LOBBY, (payload: ClientPayload) => {
    const data = payload.data as userPlayer; const lobbyID = userCreateLobby(payload.id, data.name);
    sendMessage(payload.id, new Message(Constants.MSG_TYPES.CREATE_LOBBY, { lobbyID }));
  });
  SocketHandling.on(Constants.MSG_TYPES.JOINED_LOBBY, (payload: ClientPayload) => {
    const lobby = payload.data as playerJoinLobby;
    userJoinLobby(lobby.lobbyID, payload.id, lobby.name);
    sendMessage(payload.id, new Message(Constants.MSG_TYPES.JOINED_LOBBY, {}));
  });
  //add lobby to game
  SocketHandling.on(Constants.MSG_TYPES.ADD_CREW, (payload: ClientPayload) => {
    const lobby = payload.data as addLobby;
    addCrew(lobby.id, lobby.crew);
  });
  //handle disconnect
  SocketHandling.on(Constants.MSG_TYPES.DISCONNECT, (payload: ClientPayload) => { handleDisconnect(payload.id); SocketHandling.removeSocket(payload.id); });
}
console.log(`Listening on localhost:${serverInstance.port}`);

