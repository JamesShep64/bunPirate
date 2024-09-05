// ../client/messaging.ts
var serverMessageHandler = {
  messageFunctionPairs: {},
  on(type, func) {
    this.messageFunctionPairs[type] = func;
  },
  handleMessage(type, content) {
    if (this.messageFunctionPairs[type]) {
      this.messageFunctionPairs[type](content);
    } else {
      console.warn(`No handler found for message type: ${type}`);
    }
  }
};

// ../client/networking.ts
function sendMessage(message) {
  ws.send(JSON.stringify(message));
}
var ws = new WebSocket(`ws://${window.location.host}`);
var upgradePromise = new Promise((resolve) => {
  ws.addEventListener("open", () => {
    console.log("Connected!");
    ws.addEventListener("message", (e) => serverMessageHandler.handleMessage(JSON.parse(e.data).type, JSON.parse(e.data).content));
    resolve("");
  });
});

// ../shared/constants.ts
var Constants = {
  PLAYER_RADIUS: 20,
  PLAYER_MAX_HP: 100,
  PLAYER_SPEED: 400,
  PLAYER_FIRE_COOLDOWN: 0.25,
  BLOCK_SIZE: 20,
  SCORE_PER_SECOND: 1,
  PLAYER_SIZE: 25,
  PI: 3.14,
  VELOCITY_MULTIPLIER: 2.5,
  MAP_SIZE: 3000,
  MAP_HEIGHT: 3000,
  MAP_WIDTH: 6000,
  PLAYER_HEIGHT: 50,
  PLAYER_WIDTH: 25,
  BLOCK_HEIGHT: 30,
  BLOCK_WIDTH: 25,
  MSG_TYPES: {
    INPUT: "user input",
    JOIN_GAME: "join_game",
    GAME_UPDATE: "update",
    GAME_OVER: "dead",
    CREATE_LOBBY: "create_lobby",
    LOBBY_UPDATE: "lobby_update",
    JOINED_LOBBY: "joined_lobby",
    JOINED_CREW: "joined_crew",
    CREATOR_JOINED_GAME: "creator_joined_game",
    CREATOR_LEFT_GAME: "creator_left_game",
    BECOME_LEADER: "become-leader",
    WS_ID: "websocket id"
  },
  INPUT_TYPES: {
    MOUSE_MOVE: "mouse move",
    MOUSE_CLICK: "mouse click",
    GOD_COMMAND: "text entered",
    KEY_DOWN: "key pressed",
    KEY_UP: "key up"
  }
};

// ../client/assets.ts
function downloadAsset(assetName) {
  return new Promise((resolve) => {
    const asset = new Image;
    asset.onload = () => {
      console.log(`Downloaded ${assetName}`);
      assets[assetName] = asset;
      asset.src = `./assets/${assetName}`;
      resolve("");
    };
  });
}
var ASSET_NAMES = [
  "player.svg",
  "icon64.png",
  "icon1200.png",
  "page1.gif",
  "page2.png",
  "ex.gif",
  "page2.gif",
  "page3.gif",
  "page4.gif",
  "page5.gif",
  "page6.gif",
  "upArrow.png",
  "downArrow.png",
  "cannonBall.svg",
  "grapple.svg",
  "killShot.svg",
  "speedBoost.svg",
  "asteroid.svg",
  "pirate.svg",
  "barrel.svg",
  "cannonBarrel.svg",
  "cannonTurret.svg",
  "planet.svg",
  "cannonLoad.svg",
  "hairLeft.svg",
  "hairRight.svg",
  "headAndTorso.svg",
  "leftArm.svg",
  "rightArm.svg",
  "leftLeg.svg",
  "rightLeg.svg",
  "hat.svg"
];
var assets = {};
var downloadPromise = Promise.all(ASSET_NAMES.map(downloadAsset));
var downloadAssets = () => downloadPromise;

// ../shared/Message.ts
class Message {
  type;
  content;
  constructor(type, message) {
    this.type = type;
    this.content = message;
  }
}

class ClientPayload {
  id;
  data;
  constructor(id, data) {
    this.id = id;
    this.data = data;
  }
}

class Action {
  id;
  inputType;
  value;
  constructor(inputType, value, id) {
    this.inputType = inputType;
    this.value = value;
    this.id = id;
  }
}

// ../client/state.ts
function processGameUpdate(o) {
  const update = o;
  if (!firstServerTimestamp) {
    firstServerTimestamp = update.time;
    gameStart = Date.now();
  }
  gameUpdates.push(update);
  const base = getBaseUpdate();
  if (base > 0) {
    gameUpdates.splice(0, base);
  }
}
function currentServerTime() {
  return firstServerTimestamp + (Date.now() - gameStart) - RENDER_DELAY;
}
function getBaseUpdate() {
  const serverTime = currentServerTime();
  for (let i = gameUpdates.length - 1;i >= 0; i--) {
    if (gameUpdates[i].time <= serverTime) {
      return i;
    }
  }
  return -1;
}
function getCurrentState() {
  if (!firstServerTimestamp) {
    return {};
  }
  const base = getBaseUpdate();
  const serverTime = currentServerTime();
  if (base < 0 || base == gameUpdates.length - 1) {
    return gameUpdates[gameUpdates.length - 1];
  } else {
    const baseUpdate = gameUpdates[base];
    const next = gameUpdates[base + 1];
    const ratio = (serverTime - baseUpdate.time) / (next.time - baseUpdate.time);
    return {
      me: interpolateObject(baseUpdate.me, next.me, ratio),
      otherGods: interpolateObjectArray(baseUpdate.otherGods, next.otherGods, ratio),
      blocks: interpolateObjectArray(baseUpdate.blocks, next.blocks, ratio)
    };
  }
}
function interpolateObject(base, next, ratio) {
  if (!base || !next)
    return base;
  if ("points" in base)
    return {
      x: (next.x - base.x) * ratio + base.x,
      y: (next.y - base.y) * ratio + base.y,
      points: base.points
    };
  return {
    x: (next.x - base.x) * ratio + base.x,
    y: (next.y - base.y) * ratio + base.y
  };
}
function interpolateObjectArray(base, next, ratio) {
  if (!base || !next)
    return base;
  return base.map((base2) => interpolateObject(base2, next.find((next2) => base2.id === next2.id), ratio));
}
var RENDER_DELAY = 100;
var gameUpdates = [];
var gameStart = 0;
var firstServerTimestamp = 0;

// ../client/render.ts
function setCanvasDimensions() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
function render() {
  const { me, otherGods, blocks } = getCurrentState();
  if (!context || !me)
    return;
  context.save();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "red";
  context.translate(-me.x + canvas.width / 2, -me.y + canvas.height / 2);
  cameraPosition.x = -me.x + canvas.width / 2;
  cameraPosition.y = -me.y + canvas.height / 2;
  drawGod(me.x, me.y);
  context.beginPath();
  context.fill();
  if (!otherGods)
    return;
  otherGods.forEach((other) => {
    if (!other)
      return;
    drawGod(other.x, other.y);
  });
  if (!blocks)
    return;
  blocks.forEach((b) => {
    const block = b;
    if (!block)
      return;
    drawPolygon(block.x, block.y, block.points);
  });
  context.restore();
}
function startRendering() {
  setInterval(render, 1000 / 60);
}
function drawGod(x, y) {
  if (!context)
    return;
  context.beginPath();
  context.arc(x, y, 100, 0, 2 * Math.PI);
  context.fill();
}
function drawPolygon(x, y, points) {
  if (!context)
    return;
  context.save();
  context.translate(x, y);
  context.beginPath();
  for (var i = 0;i < points.length; i++) {
    if (i == 0) {
      context.moveTo(points[i].x, points[i].y);
    } else {
      context.lineTo(points[i].x, points[i].y);
    }
    if (i == points.length - 1) {
      context.lineTo(points[0].x, points[0].y);
    }
  }
  context.closePath();
  context.stroke();
  context.restore();
}
var cameraPosition = { x: 0, y: 0 };
var canvas = document.getElementById("game-canvas");
var context = canvas.getContext("2d");
if (context)
  context.save();
setCanvasDimensions();
window.addEventListener("resize", setCanvasDimensions);

// ../client/inputs.ts
function recordActions() {
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("click", handleClick);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      input.focus();
      event.stopPropagation();
    }
    if (event.key === "w" || event.key === "a" || event.key === "s" || event.key === "d") {
      handleKeyDown(event.key);
    }
  });
  window.addEventListener("keyup", (event) => {
    if (event.key === "w" || event.key === "a" || event.key === "s" || event.key === "d")
      handleKeyUp(event.key);
  });
  setInterval(sendActions, 1000 / 30);
}
function sendActions() {
  if (actionArray.length != 0) {
    const checkedID = ID;
    deleteDuplicates();
    sendMessage(new Message(Constants.MSG_TYPES.INPUT, new ClientPayload(checkedID, actionArray)));
    actionArray.length = 0;
  }
}
function handleKeyDown(key) {
  const checkedID = ID;
  actionArray.push(new Action(Constants.INPUT_TYPES.KEY_DOWN, { key }, checkedID));
}
function handleKeyUp(key) {
  const checkedID = ID;
  actionArray.push(new Action(Constants.INPUT_TYPES.KEY_UP, { key }, checkedID));
}
function handleMouseMove(e) {
  const checkedID = ID;
  actionArray.push(new Action(Constants.INPUT_TYPES.MOUSE_MOVE, { x: e.clientX - cameraPosition.x, y: e.clientY - cameraPosition.y }, checkedID));
}
function handleClick(e) {
  const checkedID = ID;
  actionArray.push(new Action(Constants.INPUT_TYPES.MOUSE_CLICK, { x: e.clientX, y: e.clientY }, checkedID));
}
function handleTextInput(command) {
  const checkedID = ID;
  actionArray.push(new Action(Constants.INPUT_TYPES.GOD_COMMAND, { text: command }, checkedID));
}
function deleteDuplicates() {
  const checkingArray = [];
  for (var i = actionArray.length;i--; i >= 0) {
    if (checkingArray.find((a) => actionEquals(actionArray[i], a)))
      actionArray.splice(i, 1);
    else
      checkingArray.push(actionArray[i]);
  }
}
function actionEquals(me, other) {
  switch (me.inputType) {
    case Constants.INPUT_TYPES.MOUSE_MOVE:
      if (other.inputType == Constants.INPUT_TYPES.MOUSE_MOVE)
        return true;
      break;
    case Constants.INPUT_TYPES.MOUSE_CLICK:
      if (other.inputType == Constants.INPUT_TYPES.MOUSE_CLICK)
        return true;
      break;
  }
  return false;
}
var actionArray = [];
var input = document.getElementById("console-input");
input.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    handleTextInput(input.value);
    input.value = "";
    input.blur();
  }
  event.stopPropagation();
});
input.addEventListener("keyup", (e) => {
  e.stopPropagation();
});

// ../client/index.ts
Promise.all([downloadAssets, upgradePromise]).then(() => {
  console.log("finished!");
});
serverMessageHandler.on(Constants.MSG_TYPES.WS_ID, (content) => {
  const contentWithId = content;
  ID = contentWithId.id;
  if (typeof ID == "string")
    sendMessage(new Message(Constants.MSG_TYPES.JOIN_GAME, new ClientPayload(ID, {})));
});
serverMessageHandler.on(Constants.MSG_TYPES.JOIN_GAME, (content) => {
  const contentWithId = content;
  console.log(contentWithId.id == ID);
  recordActions();
  startRendering();
});
serverMessageHandler.on(Constants.MSG_TYPES.GAME_UPDATE, (content) => {
  const newGameUpdate = content;
  processGameUpdate(newGameUpdate);
});
var ID;
export {
  ID
};
