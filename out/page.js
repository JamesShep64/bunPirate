// ../shared/constants.ts
var Constants = {
  PLAYER_RADIUS: 20,
  PLAYER_MAX_HP: 100,
  PLAYER_SPEED: 400,
  PLAYER_FIRE_COOLDOWN: 0.25,
  BLOCK_SIZE: 20,
  SCORE_PER_SECOND: 1,
  PI: 3.14,
  VELOCITY_MULTIPLIER: 2.5,
  MAP_SIZE: 3000,
  MAP_HEIGHT: 5000,
  MAP_WIDTH: 1e4,
  PLAYER_HEIGHT: 40,
  PLAYER_WIDTH: 25,
  BLOCK_HEIGHT: 30,
  BLOCK_WIDTH: 25,
  MAX_GRAVITY: 4,
  GRAVITY_MULT: 0.1,
  MSG_TYPES: {
    INPUT: "user input",
    GOD_JOINED: "god joined game",
    PLAYER_JOINED: "player joined game",
    USER_CONNECTED: "user connected",
    GAME_UPDATE: "update",
    GAME_OVER: "dead",
    CREATE_LOBBY: "create_lobby",
    LOBBY_UPDATE: "lobby_update",
    JOINED_LOBBY: "joined_lobby",
    JOINED_CREW: "joined_crew",
    CREATOR_JOINED_GAME: "creator_joined_game",
    CREATOR_LEFT_GAME: "creator_left_game",
    ADD_STRAGGLER: "add to lobby",
    BECOME_LEADER: "become-leader",
    WS_ID: "websocket id",
    DISCONNECT: "dc",
    ADD_CREW: "lobby join game"
  },
  INPUT_TYPES: {
    MOUSE_MOVE: "mouse move",
    MOUSE_CLICK: "mouse click",
    GOD_COMMAND: "text entered",
    KEY_DOWN: "key pressed",
    KEY_UP: "key up"
  }
};

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
    ws.addEventListener("close", () => {
      var id = ID;
      sendMessage(new Message(id, {}));
    });
  });
});
window.onbeforeunload = () => {
  var id = ID;
  sendMessage(new Message(Constants.MSG_TYPES.DISCONNECT, new ClientPayload(id, {})));
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
  if (!toggleInterpolate) {
    return gameUpdates[0];
  }
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
      meGod: interpolateObject(baseUpdate.meGod, next.meGod, ratio),
      mePlayer: interpolateObject(baseUpdate.mePlayer, next.mePlayer, ratio),
      otherGods: interpolateObjectArray(baseUpdate.otherGods, next.otherGods, ratio),
      otherPlayers: interpolateObjectArray(baseUpdate.otherPlayers, next.otherPlayers, ratio),
      blocks: interpolateObjectArray(baseUpdate.blocks, next.blocks, ratio),
      ships: interpolateShips(baseUpdate.ships, next.ships, ratio)
    };
  }
}
function interpolateShips(base, next, ratio) {
  interpolateObjectArray(base, next, ratio);
  base.forEach((ship) => {
    interpolateObjectArray(ship.masses, next.find((next2) => next2.id === ship.id)?.masses, ratio);
  });
  return base;
}
function interpolateObject(base, next, ratio) {
  if (!base || !next)
    return;
  if (base.x && base.y) {
    base.x = (next.x - base.x) * ratio + base.x;
    base.y = (next.y - base.y) * ratio + base.y;
  }
  var b = base;
  var n = next;
  if (b.points) {
    for (var i = 0;i < b.points.length; i++) {
      b.points[i].x = (n.points[i].x - b.points[i].x) * ratio + b.points[i].x;
      b.points[i].y = (n.points[i].y - b.points[i].y) * ratio + b.points[i].y;
    }
  }
  return base;
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
function initializeDrawing(meGod, mePlayer) {
  if (!meGod && !mePlayer)
    return;
  context.save();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "red";
  if (meGod && !mePlayer)
    drawBackground(meGod.x, meGod.y);
  else
    drawBackground(mePlayer.x, mePlayer.y);
}
function drawBackground(camX, camY) {
  var canvasX = canvas.width / 2 - camX;
  var canvasY = canvas.height / 2 - camY;
  var grd = context.createLinearGradient(canvasX, canvasY - Constants.MAP_HEIGHT / 2, canvasX, Constants.MAP_HEIGHT / 2 + canvasY + 1000);
  grd.addColorStop(0.8, "#34cceb");
  grd.addColorStop(0.35, "#0440cc");
  grd.addColorStop(0.2, "black");
  context.fillStyle = grd;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(-camX + canvas.width / 2, -camY + canvas.height / 2);
  for (var x = camX - canvas.width / 2 - 400;x < camX + canvas.width / 2 + 400; x += 80) {
    for (var y = camY - canvas.height / 2 - 400;y < camY + canvas.height / 2 + 400; y += 80) {
      context.save();
      x = Math.ceil(x / 80) * 80;
      y = Math.ceil(y / 80) * 80;
      var shift = -17520;
      var xCheck = x + shift;
      var yCheck = y + shift;
      context.translate(x, y);
      if (xCheck % 4240 == 0 && yCheck % 2320 == 0 || xCheck % 3520 == 0 && yCheck % 3120 == 0 || xCheck % 3200 == 0 && yCheck % 2080 == 0 || xCheck % 8320 == 0 && yCheck % 4240 == 0 || xCheck % 2880 == 0 && yCheck % 2820 == 0 || xCheck % 4400 == 0 && yCheck % 3280 == 0 || xCheck % 3280 == 0 && yCheck % 2400 == 0 || xCheck % 2720 == 0 && yCheck % 1280 == 0 || xCheck % 2240 == 0 && yCheck % 3000 == 0 || xCheck % 1120 == 0 && yCheck % 4000 == 0 || xCheck % 1120 == 0 && yCheck % 3040 == 0 || xCheck % 2160 == 0 && yCheck % 3440 == 0) {
        if (yCheck < shift + Constants.MAP_HEIGHT * 0.15) {
          context.beginPath();
          context.fillStyle = "#FFDB51";
          context.beginPath();
          const a = 5;
          context.moveTo(108 / a, 0);
          context.lineTo(141 / a, 70 / a);
          context.lineTo(218 / a, 78.3 / a);
          context.lineTo(162 / a, 131 / a);
          context.lineTo(175 / a, 205 / a);
          context.lineTo(108 / a, 170 / a);
          context.lineTo(41.2 / a, 205 / a);
          context.lineTo(55 / a, 131 / a);
          context.lineTo(1 / a, 78 / a);
          context.lineTo(75 / a, 68 / a);
          context.lineTo(108 / a, 0);
          context.closePath();
          context.fill();
        }
        if (yCheck > shift + Constants.MAP_HEIGHT * 0.1) {
          context.beginPath();
          context.moveTo(170, 80);
          context.bezierCurveTo(130, 100, 130, 150, 230, 150);
          context.bezierCurveTo(250, 180, 320, 180, 340, 150);
          context.bezierCurveTo(420, 150, 420, 120, 390, 100);
          context.bezierCurveTo(430, 40, 370, 30, 340, 50);
          context.bezierCurveTo(320, 5, 250, 20, 250, 50);
          context.bezierCurveTo(200, 5, 150, 20, 170, 80);
          context.closePath();
          context.fillStyle = "white";
          context.fill();
        }
      }
      context.restore();
    }
  }
  context.beginPath();
  context.strokeStyle = "red";
  context.lineWidth = 5;
  context.strokeRect(-Constants.MAP_WIDTH / 2, -Constants.MAP_HEIGHT / 2, Constants.MAP_WIDTH, Constants.MAP_HEIGHT);
  context.restore();
  context.fillStyle = "red";
}
function render() {
  const { meGod, mePlayer, otherGods, otherPlayers, blocks, ships } = getCurrentState();
  initializeDrawing(meGod, mePlayer);
  drawMe(meGod, mePlayer);
  drawOtherGods(otherGods);
  drawBlocks(blocks);
  drawOtherPlayers(otherPlayers);
  drawShips(ships);
  context.restore();
}
function drawMe(meGod, mePlayer) {
  if (meGod && !mePlayer) {
    context.translate(-meGod.x + canvas.width / 2, -meGod.y + canvas.height / 2);
    cameraPosition.x = -meGod.x + canvas.width / 2;
    cameraPosition.y = -meGod.y + canvas.height / 2;
    drawGod(meGod.x, meGod.y);
  }
  if (mePlayer) {
    const me = mePlayer;
    context.translate(-me.x + canvas.width / 2, -me.y + canvas.height / 2);
    cameraPosition.x = -me.x + canvas.width / 2;
    cameraPosition.y = -me.y + canvas.height / 2;
    drawPolygon(me.x, me.y, me.points);
  }
}
function drawOtherGods(otherGods) {
  if (!otherGods)
    return;
  otherGods.forEach((other) => {
    if (!other)
      return;
    drawGod(other.x, other.y);
  });
}
function drawBlocks(blocks) {
  if (!blocks)
    return;
  blocks.forEach((block) => {
    if (!block)
      return;
    drawPolygon(block.x, block.y, block.points);
  });
}
function drawOtherPlayers(otherPlayers) {
  if (!otherPlayers)
    return;
  otherPlayers.forEach((player) => {
    if (!player)
      return;
    drawPolygon(player.x, player.y, player.points);
  });
}
function drawShips(ships) {
  if (!ships)
    return;
  ships.forEach((ship) => {
    if (!ship)
      return;
    drawShip(ship);
  });
}
function startRendering() {
  canvas.classList.remove("hidden");
  setInterval(render, 1000 / 90);
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
function drawShip(ship) {
  if (!context)
    return;
  context.save();
  context.translate(ship.x, ship.y);
  context.beginPath();
  context.arc(0, 0, 10, 0, 2 * Math.PI);
  context.fill();
  context.beginPath();
  for (var i = 0;i < ship.points.length; i++) {
    if (i == 0) {
      context.moveTo(ship.points[i].x, ship.points[i].y);
    } else {
      context.lineTo(ship.points[i].x, ship.points[i].y);
    }
    if (i == ship.points.length - 1) {
      context.lineTo(ship.points[0].x, ship.points[0].y);
    }
  }
  context.closePath();
  context.stroke();
  context.fillStyle = "rgb(140, 75, 25)";
  context.fill();
  drawPolygon(0, 0, ship.ladder);
  context.fillStyle = "red";
  if (ship.masses) {
    ship.masses.forEach((mass) => {
      context.beginPath();
      context.arc(mass.points[0].x, mass.points[0].y, 10, 0, 2 * Math.PI);
      context.fill();
    });
  }
  var farLeft = -230;
  var farRight = 230;
  context.beginPath();
  context.strokeRect(farLeft, farLeft, farRight - farLeft, farRight - farLeft);
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
function recordMouse() {
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("click", handleClick);
}
function recordActions() {
  window.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      input.focus();
      event.stopPropagation();
    }
    if (event.key === "w" || event.key === "a" || event.key === "s" || event.key === "d" || event.key === " ") {
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
  if (command === "togInt") {
    toggleInterpolate = !toggleInterpolate;
    return;
  }
  if (command === "default") {
    toggleInterpolate = true;
    actionArray.push(new Action(Constants.INPUT_TYPES.GOD_COMMAND, { text: "tps 30" }, checkedID));
    return;
  }
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
var toggleInterpolate = true;

// ../client/index.ts
function updateBoard(update) {
  lobby.crew = update.ids;
  var id = ID;
  if (id == update.captain) {
    playButton.classList.remove("hidden");
  } else
    playButton.classList.add("hidden");
  tableBody.innerHTML = "";
  update.crew.forEach((p) => console.log(p));
  update.crew.forEach((p) => {
    let row = document.createElement("tr");
    let cell = document.createElement("td");
    cell.textContent = p;
    row.appendChild(cell);
    tableBody.appendChild(row);
  });
}
var fullPath = window.location.pathname;
var fileName = fullPath.substring(fullPath.lastIndexOf("/") + 1);
Promise.all([downloadAssets, upgradePromise]).then(() => {
  console.log("finished!");
});
serverMessageHandler.on(Constants.MSG_TYPES.WS_ID, (content) => {
  const contentWithId = content;
  ID = contentWithId.id;
  if (typeof ID == "string") {
    if (fileName == "godJoin") {
      sendMessage(new Message(Constants.MSG_TYPES.GOD_JOINED, new ClientPayload(ID, {})));
    }
  }
});
serverMessageHandler.on(Constants.MSG_TYPES.GAME_UPDATE, (content) => {
  const newGameUpdate = content;
  processGameUpdate(newGameUpdate);
});
if (fileName == "godJoin") {
  serverMessageHandler.on(Constants.MSG_TYPES.GOD_JOINED, (content) => {
    const contentWithId = content;
    console.log(contentWithId.id == ID);
    recordActions();
    recordMouse();
    startRendering();
  });
}
serverMessageHandler.on(Constants.MSG_TYPES.PLAYER_JOINED, (content) => {
  const contentWithId = content;
  console.log(contentWithId.id == ID);
  recordActions();
  startRendering();
});
var userMenu = document.getElementById("play-menu");
var consoleInput = document.getElementById("console-input");
var usernameInput = document.getElementById("username-input");
var joinButton = document.getElementById("join-button");
var createButton = document.getElementById("create-button");
var lobbyLink = document.getElementById("lobby-link");
var playMenu = document.getElementById("play-menu");
var tableBody = document.querySelector("#lobby-board tbody");
var playButton = document.getElementById("play-button");
if (fileName == "godJoin") {
  userMenu.classList.add("hidden");
} else if (fileName == "") {
  consoleInput.classList.add("hidden");
  usernameInput.focus();
  joinButton.onclick = () => {
    joinButton.blur();
    usernameInput.placeholder = "paste URL here";
    createButton.classList.add("hidden");
  };
  createButton.onclick = () => {
    const name = usernameInput.value;
    const id = ID;
    sendMessage(new Message(Constants.MSG_TYPES.CREATE_LOBBY, new ClientPayload(id, { name })));
    serverMessageHandler.on(Constants.MSG_TYPES.CREATE_LOBBY, (content) => {
      lobbyLink.innerHTML = content.lobbyID;
      userMenu.classList.add("hidden");
      playMenu.classList.remove("hidden");
      lobby.id = content.lobbyID;
    });
  };
} else {
  const lobbyID = fileName;
  consoleInput.classList.add("hidden");
  createButton.classList.add("hidden");
  joinButton.onclick = () => {
    const id = ID;
    const name = usernameInput.value;
    sendMessage(new Message(Constants.MSG_TYPES.JOINED_LOBBY, new ClientPayload(id, { name, lobbyID })));
    serverMessageHandler.on(Constants.MSG_TYPES.JOINED_LOBBY, () => console.log("joined"));
    userMenu.classList.add("hidden");
    playMenu.classList.remove("hidden");
    lobby.id = lobbyID;
    serverMessageHandler.on(Constants.MSG_TYPES.ADD_STRAGGLER, (content) => {
      const id2 = ID;
      playButton.classList.remove("hidden");
      playButton.onclick = () => {
        sendMessage(new Message(Constants.MSG_TYPES.ADD_STRAGGLER, new ClientPayload(id2, lobby)));
        playMenu.classList.add("hidden");
      };
    });
  };
}
serverMessageHandler.on(Constants.MSG_TYPES.LOBBY_UPDATE, (content) => {
  updateBoard(content);
});
playButton.onclick = () => {
  const id = ID;
  sendMessage(new Message(Constants.MSG_TYPES.ADD_CREW, new ClientPayload(id, lobby)));
  playMenu.classList.add("hidden");
  console.log(lobby);
};
var lobby = { id: "", crew: [] };
var ID;

// ../client/page.ts
function usernameMenu() {
  usernameInput2.focus();
  joinButton2.onclick = () => {
    usernameInput2.placeholder = "paste URL here";
    createButton2.classList.add("hidden");
  };
  createButton2.onclick = () => {
    var name = usernameInput2.textContent;
    var id = ID;
    sendMessage(new Message(Constants.MSG_TYPES.CREATE_LOBBY, new ClientPayload(id, { name })));
    serverMessageHandler.on(Constants.MSG_TYPES.CREATE_LOBBY, (content) => {
      joinButton2.classList.add("hidden");
      createButton2.classList.add("hidden");
    });
  };
}
var playMenu2 = document.getElementById("play-menu");
var consoleInput2 = document.getElementById("console-input");
var usernameInput2 = document.getElementById("username-input");
var joinButton2 = document.getElementById("join-button");
var createButton2 = document.getElementById("create-button");
var fullPath2 = window.location.pathname;
var fileName2 = fullPath2.substring(fullPath2.lastIndexOf("/") + 1);
if (fileName2 == "godJoin") {
  playMenu2.classList.add("hidden");
} else if (fileName2 == "") {
  consoleInput2.classList.add("hidden");
  usernameMenu();
} else {
}
