import { upgradePromise, sendMessage } from "./networking";
import { Constants } from "../shared/constants";
import { downloadAssets, getAsset } from "./assets";
import { serverMessageHandler } from "./messaging"
import { ClientPayload, gameUpdate, Message } from "../shared/Message";
import { recordActions } from "./inputs";
import { startRendering } from "./render";
import { processGameUpdate } from "./state";

Promise.all([downloadAssets, upgradePromise]).then(() => {
  console.log("finished!")
});
serverMessageHandler.on(Constants.MSG_TYPES.WS_ID, (content: object) => {
  const contentWithId = content as { id?: string };
  ID = contentWithId.id;
  if (typeof ID == "string")
    sendMessage(new Message(Constants.MSG_TYPES.JOIN_GAME, new ClientPayload(ID, {})));
});

serverMessageHandler.on(Constants.MSG_TYPES.JOIN_GAME, (content: object) => {
  const contentWithId = content as { id?: string };
  console.log(contentWithId.id == ID);
  recordActions();
  startRendering();
});
serverMessageHandler.on(Constants.MSG_TYPES.GAME_UPDATE, (content: object) => {
  const newGameUpdate = content as gameUpdate;
  processGameUpdate(newGameUpdate);
});

export var ID: string | undefined;
