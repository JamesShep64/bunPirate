import { Glob } from "bun";
import generateUniqueId from "generate-unique-id";
import { Action, ClientPayload, Message } from "../shared/Message";
import { Constants } from "../shared/constants";
import { SocketHandling } from "./messaging";
import { userJoinedGame, handleActions } from "./users";
Bun.build({
  entrypoints: ['../client/index.ts'],
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
    const cssPath = "../client/style.css";
    const cssFile = Bun.file(cssPath);
    //send through http, html page and javascript
    const url = new URL(req.url);
    if (url.pathname === "/") return new Response(htmlFile);
    if (url.pathname === "/script.js") return new Response(jsFile);
    if (url.pathname == "/style.css") return new Response(cssFile);
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
      console.log('Connected');
      const id: string = generateUniqueId({ length: 8 });
      ws.send(JSON.stringify(new Message(Constants.MSG_TYPES.WS_ID, { id })));

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
  SocketHandling.on(Constants.MSG_TYPES.JOIN_GAME, (payload: ClientPayload) => {
    if (!payload.id) {
      throw ("cant join game without id");
    }
    //this is just chkecking that the websocket is connected can remove
    sendMessage(payload.id, new Message(Constants.MSG_TYPES.JOIN_GAME, { id: payload.id }));
    userJoinedGame(payload.id);
  });
  SocketHandling.on(Constants.MSG_TYPES.INPUT, (payload: ClientPayload) => { const action = payload.data as Action[]; handleActions(action); });
}
console.log(`Listening on localhost:${serverInstance.port}`);

