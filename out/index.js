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
  MAP_HEIGHT: 4500,
  MAP_WIDTH: 4500,
  PLAYER_HEIGHT: 40,
  PLAYER_WIDTH: 25,
  BLOCK_HEIGHT: 30,
  BLOCK_WIDTH: 25,
  MAX_GRAVITY: 6,
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
function createPromises() {
  downloadPromise = ASSET_NAMES.map(downloadAsset);
}
function downloadAsset(assetName) {
  return new Promise((resolve) => {
    const asset = new Image;
    assets[assetName] = asset;
    asset.src = `./assets/${assetName}`;
    console.log("downloaded", assetName);
    resolve("");
  });
}
var ASSET_NAMES = [
  "cannonBallIcon.svg",
  "icon64.png",
  "grappleIcon.svg",
  "shipTexture.svg",
  "face.svg",
  "hair1.svg",
  "hair2.svg",
  "bib.svg",
  "hat.svg",
  "leftArm.svg",
  "leftLeg.svg",
  "leftShirt.svg",
  "rightArm.svg",
  "rightLeg.svg",
  "rightShirt.svg",
  "torso.svg",
  "wholePlayer.svg"
];
var assets = {};
var downloadPromise;
var getAsset = (assetName) => assets[assetName];

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
      ships: interpolateShips(baseUpdate.ships, next.ships, ratio),
      planets: baseUpdate.planets,
      cannonBalls: interpolateObjectArray(baseUpdate.cannonBalls, next.cannonBalls, ratio),
      explosions: interpolateObjectArray(baseUpdate.explosions, next.explosions, ratio),
      grapples: interpolateGrapples(baseUpdate.grapples, next.grapples, ratio),
      meteors: interpolateObjectArray(baseUpdate.meteors, next.meteors, ratio)
    };
  }
}
function interpolateShips(base, next, ratio) {
  interpolateObjectArray(base, next, ratio);
  base.forEach((ship) => {
    interpolateObjectArray(ship.masses, next.find((next2) => next2.id === ship.id)?.masses, ratio);
    interpolatePoints(ship.ladder, next.find((next2) => next2.id === ship.id)?.ladder, ratio);
    interpolateObject(ship.topPortCannon, next.find((next2) => next2.id === ship.id)?.topPortCannon, ratio);
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
    interpolatePoints(b.points, n.points, ratio);
  }
  return base;
}
function interpolatePoints(base, next, ratio) {
  if (!base || !next || base.length != next.length)
    return;
  var b = base;
  var n = next;
  for (var i = 0;i < b.length; i++) {
    b[i].x = (n[i].x - b[i].x) * ratio + b[i].x;
    b[i].y = (n[i].y - b[i].y) * ratio + b[i].y;
  }
}
function interpolateObjectArray(base, next, ratio) {
  if (!base || !next)
    return base;
  return base.map((base2) => interpolateObject(base2, next.find((next2) => base2.id === next2.id), ratio));
}
function interpolateGrapples(base, next, ratio) {
  interpolateObjectArray(base, next, ratio);
  if (base && next) {
    base.forEach((grapple) => {
      interpolateObject(grapple.launchOrigin, next.find((next2) => next2.id === grapple.id)?.launchOrigin, ratio);
    });
  }
  return base;
}
var RENDER_DELAY = 50;
var gameUpdates = [];
var gameStart = 0;
var firstServerTimestamp = 0;

// ../client/render.ts
function setCanvasDimensions() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  console.log(canvas.width, canvas.height);
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
  var grd = context.createLinearGradient(canvasX, canvasY - Constants.MAP_HEIGHT, canvasX, Constants.MAP_HEIGHT + canvasY + 1000);
  grd.addColorStop(0.8, "#3483eb");
  grd.addColorStop(0.65, "#0440cc");
  grd.addColorStop(0.45, "black");
  context.fillStyle = grd;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(-camX + canvas.width / 2, -camY + canvas.height / 2);
  for (var x = camX - canvas.width / 2 - 400;x < camX + canvas.width / 2 + 400; x += 80) {
    for (var y = camY - canvas.height / 2 - 400;y < camY + canvas.height / 2 + 400; y += 80) {
      context.save();
      x = Math.ceil(x / 80) * 80;
      y = Math.ceil(y / 80) * 80;
      context.translate(x, y);
      if (x == -560 && y == 160 || x == -560 && y == 2480 || x == -560 && y == 4800 || x == -400 && y == 400 || x == -400 && y == 1200 || x == -400 && y == 4240 || x == -400 && y == 4400 || x == -240 && y == -560 || x == -240 && y == 3680 || x == 0 && y == -400 || x == 0 && y == 2000 || x == 0 && y == 4400 || x == 80 && y == -240 || x == 80 && y == 1040 || x == 80 && y == 2320 || x == 80 && y == 3600 || x == 80 && y == 4880 || x == 400 && y == -240 || x == 400 && y == 1840 || x == 400 && y == 3920 || x == 720 && y == 400 || x == 720 && y == 1200 || x == 720 && y == 4240 || x == 720 && y == 4400 || x == 1280 && y == -800 || x == 1280 && y == 2640 || x == 1840 && y == 400 || x == 1840 && y == 1200 || x == 1840 && y == 4240 || x == 1840 && y == 4400 || x == 2000 && y == 5120 || x == 2320 && y == 800 || x == 2320 && y == 3920 || x == 2800 && y == -240 || x == 2800 && y == 1040 || x == 2800 && y == 2320 || x == 2800 && y == 3600 || x == 2800 && y == 4880 || x == 2960 && y == 400 || x == 2960 && y == 1200 || x == 2960 && y == 4240 || x == 2960 && y == 4400 || x == 3200 && y == 0 || x == 3200 && y == 3280 || x == 3280 && y == -400 || x == 3280 && y == 2000 || x == 3280 && y == 4400 || x == 3440 && y == -800 || x == 3440 && y == 2640 || x == 3600 && y == -240 || x == 3600 && y == 1840 || x == 3600 && y == 3920 || x == 3680 && y == 160 || x == 3680 && y == 2480 || x == 3680 && y == 4800 || x == 4080 && y == 400 || x == 4080 && y == 1200 || x == 4080 && y == 4240 || x == 4080 && y == 4400 || x == 4880 && y == 5120 || x == 5200 && y == 400 || x == 5200 && y == 1200 || x == 5200 && y == 4240 || x == 5200 && y == 4400) {
        if (y < Constants.MAP_HEIGHT * 0.25) {
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
          context.stroke();
          context.fill();
        }
        if (y > Constants.MAP_HEIGHT * 0.1) {
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
          context.stroke();
          context.fill();
        }
      }
      context.restore();
    }
  }
  context.beginPath();
  context.strokeStyle = "red";
  context.lineWidth = 5;
  context.strokeRect(0, 0, Constants.MAP_WIDTH, Constants.MAP_HEIGHT);
  context.restore();
  context.fillStyle = "red";
}
function render() {
  const { meGod, mePlayer, otherGods, otherPlayers, blocks, ships, planets, meteors, cannonBalls, explosions, grapples } = getCurrentState();
  if (mePlayer)
    me = mePlayer;
  context.lineWidth = 2;
  context.fillStyle = "blue";
  initializeDrawing(meGod, mePlayer);
  drawMe(meGod, mePlayer);
  drawOtherGods(otherGods);
  drawBlocks(blocks);
  drawBlocks(planets);
  drawOtherPlayers(otherPlayers);
  drawShips(ships);
  drawCannonBalls(cannonBalls);
  drawMeteors(meteors);
  drawExplosions(explosions);
  drawGrapples(grapples);
  context.restore();
}
function drawCannonBalls(cannonBalls) {
  if (!cannonBalls)
    return;
  cannonBalls.forEach((cannonBall) => {
    if (cannonBall) {
      context.save();
      context.translate(cannonBall.x, cannonBall.y);
      context.fillStyle = "black";
      context.beginPath();
      context.arc(0, 0, 10, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
      context.restore();
    }
  });
}
function drawMeteors(meteors) {
  if (!meteors)
    return;
  meteors.forEach((meteor) => {
    if (meteor) {
      context.save();
      context.translate(meteor.x, meteor.y);
      context.fillStyle = "orange";
      context.beginPath();
      context.arc(0, 0, 20, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
      context.restore();
    }
  });
}
function drawGrapples(grapples) {
  if (!grapples)
    return;
  grapples.forEach((grapple) => {
    if (grapple) {
      context.save();
      context.beginPath();
      context.moveTo(grapple.x, grapple.y);
      context.lineTo(grapple.launchOrigin.x, grapple.launchOrigin.y);
      context.closePath();
      context.stroke();
      context.restore();
    }
  });
}
function drawExplosions(explosions) {
  if (!explosions)
    return;
  explosions.forEach((explo) => {
    if (explo) {
      context.save();
      context.translate(explo.x, explo.y);
      context.beginPath();
      context.arc(0, 0, explo.size * 1.2, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
      context.restore();
    }
  });
}
function drawRotatedPart(x, y, angle, name) {
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.translate(-x, -y);
  context.drawImage(getAsset(name), 0, 0, 30, 50);
  context.restore();
}
function drawPlayerModel(player) {
  var hair1Angle = 0;
  var hair2Angle = 0;
  var hatAngle = 0;
  var leftLegAngle = 0;
  var rightLegAngle = 0;
  var leftShirtAngle = 0;
  var rightShirtAngle = 0;
  var leftArmAngle = 0;
  var rightArmAngle = 0;
  var bibAngle = 0;
  if (player.movingRight) {
    leftLegAngle = 0.5 * Math.sin(0.01 * Date.now() + Math.PI);
    rightLegAngle = -0.5 * Math.sin(0.015 * Date.now());
  }
  if (player.movingLeft) {
    leftLegAngle = -0.5 * Math.sin(0.015 * Date.now());
    rightLegAngle = 0.5 * Math.sin(0.01 * Date.now() + Math.PI);
  }
  if (player.movingDown) {
  }
  if (player.movingUp) {
  }
  context.save();
  context.translate(player.x - 15, player.y - 32);
  context.drawImage(getAsset("face.svg"), 0, 0, 30, 50);
  context.drawImage(getAsset("torso.svg"), 0, 0, 30, 50);
  drawRotatedPart(6.41, 9.053, hair2Angle, "hair1.svg");
  drawRotatedPart(20.985, 9.356, hair2Angle, "hair2.svg");
  drawRotatedPart(14.845, 0, hatAngle, "hat.svg");
  drawRotatedPart(11.47, 39.3, leftLegAngle, "leftLeg.svg");
  drawRotatedPart(16.19, 39.3, rightLegAngle, "rightLeg.svg");
  drawRotatedPart(13.5, 28.72, leftShirtAngle, "leftShirt.svg");
  drawRotatedPart(15.52, 27.96, rightShirtAngle, "rightShirt.svg");
  drawRotatedPart(14.17, 26.45, bibAngle, "bib.svg");
  drawRotatedPart(10.12, 28.72, leftArmAngle, "leftArm.svg");
  drawRotatedPart(18.22, 27.96, rightArmAngle, "rightArm.svg");
  context.restore();
}
function drawMe(meGod, mePlayer) {
  if (meGod && !mePlayer) {
    context.translate(-meGod.x + canvas.width / 2, -meGod.y + canvas.height / 2);
    cameraPosition.x = -meGod.x + canvas.width / 2;
    cameraPosition.y = -meGod.y + canvas.height / 2;
  }
  if (mePlayer) {
    const me = mePlayer;
    context.translate(-me.x + canvas.width / 2, -me.y + canvas.height / 2);
    cameraPosition.x = -me.x + canvas.width / 2;
    cameraPosition.y = -me.y + canvas.height / 2;
    drawPlayerModel(me);
    context.save();
    context.fillStyle = "rgb(" + me.colorR + "," + me.colorG + "," + me.colorB + ")";
    context.fill();
    context.restore();
  }
}
function drawLoadout(ship, cannon) {
  if (!me?.onCannon)
    return;
  context.save();
  context.translate(cannon.x, cannon.y);
  context.rotate(ship.direction);
  context.translate(-Constants.PLAYER_WIDTH / 2, -Constants.PLAYER_HEIGHT - 10);
  var drawPosition = -21 * ship.munitions.length / 4;
  var i = 0;
  ship.munitions.forEach((munName) => {
    switch (munName) {
      case "CannonBall":
        context.drawImage(getAsset("cannonBallIcon.svg"), drawPosition, 0, 20, 20);
        break;
      case "Grapple":
        context.drawImage(getAsset("grappleIcon.svg"), drawPosition, 0, 20, 20);
        break;
    }
    if (i == cannon.munitionIndex) {
      context.save();
      context.strokeStyle = "#F8FF00";
      context.beginPath();
      context.strokeRect(drawPosition, 0, 20, 20);
      context.closePath();
      context.stroke();
      context.restore();
    }
    drawPosition += 21;
    i++;
  });
  context.restore();
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
    drawPlayerModel(player);
    context.save();
    context.fillStyle = "rgb(" + player.colorR + "," + player.colorG + "," + player.colorB + ")";
    context.fill();
    context.restore();
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
function drawCannon(cannon) {
  drawPolygon(cannon.x, cannon.y, cannon.points);
  context.fillStyle = "rgb(" + cannon.power + ",0,0)";
  context.stroke();
  context.fill();
  context.fillStyle = "red";
  context.beginPath();
  context.arc(cannon.x, cannon.y, 10, 0, 2 * Math.PI);
  context.stroke();
  context.fill();
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
  drawCatmullRomSpline(ship.points, 4);
  context.closePath();
  tempCanvas.width = 500;
  tempCanvas.height = 100;
  if (tempContext) {
    tempContext.drawImage(getAsset("shipTexture.svg"), 0, 0);
    const pattern = context.createPattern(tempCanvas, "repeat-y");
    context.save();
    context.rotate(ship.direction);
    context.translate(-225, -200);
    if (pattern) {
      context.fillStyle = pattern;
    }
    context.fill();
    context.stroke();
    context.restore();
  }
  context.fillStyle = "red";
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
  drawCannon(ship.topPortCannon);
  drawLoadout(ship, ship.topPortCannon);
  context.restore();
}
function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const f0 = -0.5 * t3 + t2 - 0.5 * t;
  const f1 = 1.5 * t3 - 2.5 * t2 + 1;
  const f2 = -1.5 * t3 + 2 * t2 + 0.5 * t;
  const f3 = 0.5 * t3 - 0.5 * t2;
  return {
    x: f0 * p0.x + f1 * p1.x + f2 * p2.x + f3 * p3.x,
    y: f0 * p0.y + f1 * p1.y + f2 * p2.y + f3 * p3.y
  };
}
function drawCatmullRomSpline(points, segments) {
  context.beginPath();
  var r = 0;
  var a = 0;
  var b = 0;
  for (let i = 0;i < points.length; i++) {
    for (let t = 0;t <= 1; t += 1 / segments) {
      r = i - 1;
      a = i + 1;
      b = i + 2;
      if (a >= points.length)
        a -= points.length;
      if (b >= points.length)
        b -= points.length;
      if (r < 0)
        r = points.length - 1;
      const p = catmullRom(points[r], points[i], points[a], points[b], t);
      context.lineTo(p.x, p.y);
    }
  }
  context.stroke();
}
var cameraPosition = { x: 0, y: 0 };
var me;
var canvas = document.getElementById("game-canvas");
var context = canvas.getContext("2d");
if (context)
  context.save();
setCanvasDimensions();
var tempCanvas = document.createElement("canvas");
var tempContext = tempCanvas.getContext("2d");
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
    if (event.key === "w" || event.key === "a" || event.key === "s" || event.key === "d" || event.key === " " || event.key == "j" || event.key == "k" || event.key == "l") {
      handleKeyDown(event.key);
    }
  });
  window.addEventListener("keyup", (event) => {
    if (event.key === "w" || event.key === "a" || event.key === "s" || event.key === "d" || event.key == "j" || event.key == "k" || event.key == "l" || event.key == " ")
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
  actionArray.push(new Action(Constants.INPUT_TYPES.MOUSE_CLICK, { x: e.clientX - cameraPosition.x, y: e.clientY - cameraPosition.y }, checkedID));
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
function actionEquals(me2, other) {
  switch (me2.inputType) {
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
createPromises();
Promise.all([upgradePromise]).then(() => {
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
export {
  ID
};
