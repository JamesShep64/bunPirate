import { upgradePromise, sendMessage } from "./networking";
import { Constants } from "../shared/constants";
import { downloadAssets, getAsset } from "./assets";
import { serverMessageHandler } from "./messaging"
import { ClientPayload, gameUpdate, lobbyUpdate, Message, playerJoinLobby } from "../shared/Message";
import { recordActions, recordMouse } from "./inputs";
import { startRendering } from "./render";
import { processGameUpdate } from "./state";


// Get the full path of the current HTML file
const fullPath = window.location.pathname;

const fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1);

Promise.all([downloadAssets, upgradePromise]).then(() => {
  console.log("finished!")
});
//get ID from server on page open
serverMessageHandler.on(Constants.MSG_TYPES.WS_ID, (content: object) => {
  const contentWithId = content as { id?: string };
  ID = contentWithId.id;
  if (typeof ID == "string") {
    if (fileName == "godJoin") {
      sendMessage(new Message(Constants.MSG_TYPES.GOD_JOINED, new ClientPayload(ID, {})));
    }
  }
});
//handle game updates
serverMessageHandler.on(Constants.MSG_TYPES.GAME_UPDATE, (content: object) => {
  const newGameUpdate = content as gameUpdate;
  processGameUpdate(newGameUpdate);
});
//put right into game if entering as god
if (fileName == "godJoin") {
  serverMessageHandler.on(Constants.MSG_TYPES.GOD_JOINED, (content: object) => {
    const contentWithId = content as { id?: string };
    console.log(contentWithId.id == ID);
    recordActions();
    recordMouse();
    startRendering();
  });
}
//handle player joining
serverMessageHandler.on(Constants.MSG_TYPES.PLAYER_JOINED, (content: object) => {
  const contentWithId = content as { id?: string };
  console.log(contentWithId.id == ID);
  recordActions();
  startRendering();
});

//this handles the HTML page, and lobbies and things
const userMenu = document.getElementById("play-menu") as HTMLDivElement;
const consoleInput = document.getElementById("console-input") as HTMLDivElement;
const usernameInput = document.getElementById("username-input") as HTMLInputElement;
const joinButton = document.getElementById("join-button") as HTMLButtonElement;
const createButton = document.getElementById("create-button") as HTMLButtonElement;
const lobbyLink = document.getElementById("lobby-link") as HTMLParagraphElement;
const playMenu = document.getElementById("play-menu") as HTMLDivElement;
const tableBody = document.querySelector("#lobby-board tbody") as HTMLTableElement;
const playButton = document.getElementById("play-button") as HTMLButtonElement;
if (fileName == "godJoin") {
  userMenu.classList.add("hidden");
}
else if (fileName == "") {
  consoleInput.classList.add("hidden");
  usernameInput.focus();
  joinButton.onclick = () => {
    usernameInput.placeholder = "paste URL here";
    createButton.classList.add("hidden");
  };
  createButton.onclick = () => {
    const name = usernameInput.value as string;
    const id = ID as string;
    sendMessage(new Message(Constants.MSG_TYPES.CREATE_LOBBY, new ClientPayload(id, { name })));
    serverMessageHandler.on(Constants.MSG_TYPES.CREATE_LOBBY, (content: playerJoinLobby) => {
      lobbyLink.innerHTML = content.lobbyID;
      userMenu.classList.add("hidden");
      playMenu.classList.remove("hidden");
      lobby.id = content.lobbyID;
    });
  };
}
//this is for users joining a lobby
else {
  const lobbyID = fileName;
  consoleInput.classList.add("hidden");
  createButton.classList.add("hidden");
  joinButton.onclick = () => {
    const id = ID as string;
    const name = usernameInput.value as string;
    sendMessage(new Message(Constants.MSG_TYPES.JOINED_LOBBY, new ClientPayload(id, { name, lobbyID } as playerJoinLobby)));
    serverMessageHandler.on(Constants.MSG_TYPES.JOINED_LOBBY, () => console.log("joined"));
    userMenu.classList.add("hidden");
    playMenu.classList.remove("hidden");
    lobby.id = lobbyID;
  }
}
serverMessageHandler.on(Constants.MSG_TYPES.LOBBY_UPDATE, (content: lobbyUpdate) => {
  updateBoard(content);
});
function updateBoard(update: lobbyUpdate) {
  lobby.crew = update.ids;
  var id = ID as string;
  if (id == update.captain) {
    playButton.classList.remove("hidden");
  }
  else
    playButton.classList.add("hidden");
  tableBody.innerHTML = '';
  update.crew.forEach(p => console.log(p));
  update.crew.forEach(p => {
    let row = document.createElement("tr"); // Create a new row
    let cell = document.createElement("td"); // Create a new cell

    cell.textContent = p; // Set the text content of the cell to the item
    row.appendChild(cell); // Add the cell to the row
    tableBody.appendChild(row); // Add the row to the tbody);

  });
}
playButton.onclick = () => {
  const id = ID as string;
  sendMessage(new Message(Constants.MSG_TYPES.ADD_CREW, new ClientPayload(id, lobby)));
  playMenu.classList.add("hidden");
  console.log(lobby);
}
const lobby: lob = { id: "", crew: [] };
interface lob {
  id: string;
  crew: string[];
}

export var ID: string | undefined;
