import { getCurrentState } from './state';
import { blockUpdate, cannonUpdate, godUpdate, grappleUpdate, objectUpdate, playerUpdate, shipUpdate, vectorUpdate } from '../shared/Message';
import { Constants } from '../shared/constants';
import { getAsset } from './assets';
export const cameraPosition = { x: 0, y: 0 };
// Get the canvas graphics context
var me: playerUpdate;
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d') as CanvasRenderingContext2D;
if (context)
	context.save();
setCanvasDimensions();
function setCanvasDimensions() {
	// On small screens (e.g. phones), we want to "zoom out" so players can still see at least
	// 800 in-game units of width.
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

window.addEventListener('resize', setCanvasDimensions);
function initializeDrawing(meGod: any, mePlayer: any) {
	if ((!meGod && !mePlayer))
		return;
	context.save();
	context.clearRect(0, 0, canvas.width, canvas.height)
	context.fillStyle = 'red';
	if (meGod && !mePlayer)
		drawBackground(meGod.x, meGod.y);
	else
		drawBackground(mePlayer.x, mePlayer.y);
}
//var first = true;
function drawBackground(camX: number, camY: number) {
	var canvasX = canvas.width / 2 - camX;
	var canvasY = canvas.height / 2 - camY;
	var grd = context.createLinearGradient(
		canvasX,
		canvasY - Constants.MAP_HEIGHT,
		canvasX,
		Constants.MAP_HEIGHT + canvasY + 1000
	);
	grd.addColorStop(.8, "#3483eb");
	grd.addColorStop(.65, "#0440cc");
	grd.addColorStop(.45, "black");
	context.fillStyle = grd;
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.save();
	context.translate(-camX + canvas.width / 2, -camY + canvas.height / 2);
	/*
	if (first) {
		var shift = -16400;
		var s = "";
		first = false;
		for (var x = -800; x <= Constants.MAP_WIDTH + 800; x += 80) {
			for (var y = -800; y <= Constants.MAP_HEIGHT + 800; y += 80) {
				var xCheck = x + shift;
				var yCheck = y + shift;
				if ((xCheck % 4240 == 0 && yCheck % 2320 == 0) || (xCheck % 3520 == 0 && yCheck % 3120 == 0) || (xCheck % 3200 == 0 && yCheck % 2080 == 0) || (xCheck % 8320 == 0 && yCheck % 4240 == 0) || (xCheck % 2880 == 0 && yCheck % 2820 == 0) || (xCheck % 4400 == 0 && yCheck % 3280 == 0) || (xCheck % 3280 == 0 && yCheck % 2400 == 0) || (xCheck % 2720 == 0 && yCheck % 1280 == 0) || (xCheck % 2240 == 0 && yCheck % 3000 == 0) || (xCheck % 1120 == 0 && yCheck % 4000 == 0) || (xCheck % 1120 == 0 && yCheck % 3040 == 0) || (xCheck % 2160 == 0 && yCheck % 3440 == 0)) {
					s += "x == " + x + " && y == " + y + " || ";
				}
			}
		}
		console.log(s);
	}
	*/
	for (var x = camX - canvas.width / 2 - 400; x < camX + canvas.width / 2 + 400; x += 80) {
		for (var y = camY - canvas.height / 2 - 400; y < camY + canvas.height / 2 + 400; y += 80) {
			context.save();
			x = Math.ceil(x / 80) * 80;
			y = Math.ceil(y / 80) * 80;
			context.translate(x, y);
			if (x == -560 && y == 160 || x == -560 && y == 2480 || x == -560 && y == 4800 || x == -400 && y == 400 || x == -400 && y == 1200 || x == -400 && y == 4240 || x == -400 && y == 4400 || x == -240 && y == -560 || x == -240 && y == 3680 || x == 0 && y == -400 || x == 0 && y == 2000 || x == 0 && y == 4400 || x == 80 && y == -240 || x == 80 && y == 1040 || x == 80 && y == 2320 || x == 80 && y == 3600 || x == 80 && y == 4880 || x == 400 && y == -240 || x == 400 && y == 1840 || x == 400 && y == 3920 || x == 720 && y == 400 || x == 720 && y == 1200 || x == 720 && y == 4240 || x == 720 && y == 4400 || x == 1280 && y == -800 || x == 1280 && y == 2640 || x == 1840 && y == 400 || x == 1840 && y == 1200 || x == 1840 && y == 4240 || x == 1840 && y == 4400 || x == 2000 && y == 5120 || x == 2320 && y == 800 || x == 2320 && y == 3920 || x == 2800 && y == -240 || x == 2800 && y == 1040 || x == 2800 && y == 2320 || x == 2800 && y == 3600 || x == 2800 && y == 4880 || x == 2960 && y == 400 || x == 2960 && y == 1200 || x == 2960 && y == 4240 || x == 2960 && y == 4400 || x == 3200 && y == 0 || x == 3200 && y == 3280 || x == 3280 && y == -400 || x == 3280 && y == 2000 || x == 3280 && y == 4400 || x == 3440 && y == -800 || x == 3440 && y == 2640 || x == 3600 && y == -240 || x == 3600 && y == 1840 || x == 3600 && y == 3920 || x == 3680 && y == 160 || x == 3680 && y == 2480 || x == 3680 && y == 4800 || x == 4080 && y == 400 || x == 4080 && y == 1200 || x == 4080 && y == 4240 || x == 4080 && y == 4400 || x == 4880 && y == 5120 || x == 5200 && y == 400 || x == 5200 && y == 1200 || x == 5200 && y == 4240 || x == 5200 && y == 4400) {
				if (((y < Constants.MAP_HEIGHT * .25))) {
					context.beginPath();
					context.fillStyle = "#FFDB51";
					context.beginPath();
					const a = 5;
					context.moveTo(108 / a, 0.0);
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
				if ((y > Constants.MAP_HEIGHT * .10)) {
					context.beginPath();
					context.moveTo(170, 80);
					context.bezierCurveTo(130, 100, 130, 150, 230, 150);
					context.bezierCurveTo(250, 180, 320, 180, 340, 150);
					context.bezierCurveTo(420, 150, 420, 120, 390, 100);
					context.bezierCurveTo(430, 40, 370, 30, 340, 50);
					context.bezierCurveTo(320, 5, 250, 20, 250, 50);
					context.bezierCurveTo(200, 5, 150, 20, 170, 80);
					context.closePath();
					context.fillStyle = 'white';
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
	context.fillStyle = 'red';
}

function render() {
	const { meGod, mePlayer, otherGods, otherPlayers, blocks, ships, planets, cannonBalls, explosions, grapples } = getCurrentState();
	if (mePlayer)
		me = mePlayer as playerUpdate;
	context.lineWidth = 2;
	context.fillStyle = "blue";
	initializeDrawing(meGod, mePlayer);
	drawMe(meGod as godUpdate, mePlayer as playerUpdate);
	drawOtherGods(otherGods as godUpdate[]);
	drawBlocks(blocks as blockUpdate[]);
	drawBlocks(planets as blockUpdate[]);
	drawOtherPlayers(otherPlayers as playerUpdate[]);
	drawShips(ships as shipUpdate[]);
	drawCannonBalls(cannonBalls as objectUpdate[]);
	drawExplosions(explosions as objectUpdate[]);
	drawGrapples(grapples as grappleUpdate[]);
	context.restore();
}
function drawCannonBalls(cannonBalls: objectUpdate[]) {
	if (!cannonBalls)
		return;
	cannonBalls.forEach(cannonBall => {
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
function drawGrapples(grapples: grappleUpdate[]) {
	if (!grapples)
		return;
	grapples.forEach(grapple => {
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
function drawExplosions(explosions: objectUpdate[]) {
	if (!explosions)
		return;
	explosions.forEach(explo => {
		if (explo) {
			context.save();
			context.translate(explo.x, explo.y);
			context.beginPath();
			context.arc(0, 0, 18, 0, 2 * Math.PI);
			context.closePath();
			context.fill();
			context.restore();
		}
	});
}
function drawMe(meGod: godUpdate | undefined, mePlayer: playerUpdate | undefined) {
	//draw me if me is god
	if (meGod && !mePlayer) {
		context.translate(-meGod.x + canvas.width / 2, -meGod.y + canvas.height / 2);
		cameraPosition.x = -meGod.x + canvas.width / 2;
		cameraPosition.y = -meGod.y + canvas.height / 2;
		drawGod(meGod.x, meGod.y);
	}
	//draw me if me is player
	if (mePlayer) {
		const me = mePlayer as playerUpdate;
		context.translate(-me.x + canvas.width / 2, -me.y + canvas.height / 2);
		cameraPosition.x = -me.x + canvas.width / 2;
		cameraPosition.y = -me.y + canvas.height / 2;
		drawPolygon(me.x, me.y, me.points);
		context.save();
		context.fillStyle = "rgb(" + me.colorR + "," + me.colorG + "," + me.colorB + ")";
		context.fill();
		context.restore();
	}
}
function drawLoadout(ship: shipUpdate, cannon: cannonUpdate) {
	if (!me?.onCannon)
		return;
	context.save();
	context.translate(cannon.x, cannon.y);
	context.rotate(ship.direction);
	context.translate(- Constants.PLAYER_WIDTH / 2, - Constants.PLAYER_HEIGHT - 10);
	var drawPosition = -21 * ship.munitions.length / 4;
	var i = 0;
	ship.munitions.forEach(munName => {
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
function drawOtherGods(otherGods: godUpdate[]) {

	//draw other gods
	if (!otherGods)
		return;
	otherGods.forEach(other => {
		if (!other)
			return;
		drawGod(other.x, other.y);
	});
}
function drawBlocks(blocks: blockUpdate[]) {
	if (!blocks)
		return;
	blocks.forEach(block => {
		if (!block)
			return;
		drawPolygon(block.x, block.y, block.points);
	});
}
function drawOtherPlayers(otherPlayers: playerUpdate[]) {
	if (!otherPlayers)
		return;
	otherPlayers.forEach(player => {
		if (!player)
			return;
		drawPolygon(player.x, player.y, player.points);
		context.save();
		context.fillStyle = "rgb(" + player.colorR + "," + player.colorG + "," + player.colorB + ")";
		context.fill();
		context.restore();
	});
}
function drawShips(ships: shipUpdate[]) {
	if (!ships)
		return;
	ships.forEach((ship) => {
		if (!ship)
			return;
		drawShip(ship);
	});
}
export function startRendering() {
	canvas.classList.remove("hidden");
	setInterval(render, 1000 / 90);
}
function drawGod(x: number, y: number) {
	if (!context)
		return;
	context.beginPath();
	context.arc(x, y, 100, 0, 2 * Math.PI);
	context.fill();
}
function drawPolygon(x: number, y: number, points: vectorUpdate[]) {
	if (!context)
		return;
	context.save();
	context.translate(x, y);
	context.beginPath();
	for (var i = 0; i < points.length; i++) {
		if (i == 0) {
			context.moveTo(points[i].x, points[i].y);
		}
		else {
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
function drawCannon(cannon: cannonUpdate) {
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
function drawShip(ship: shipUpdate) {
	if (!context)
		return;
	context.save();
	context.translate(ship.x, ship.y);
	context.beginPath();
	context.arc(0, 0, 10, 0, 2 * Math.PI);
	context.fill();

	context.beginPath();
	for (var i = 0; i < ship.points.length; i++) {
		if (i == 0) {
			context.moveTo(ship.points[i].x, ship.points[i].y);
		}
		else {
			context.lineTo(ship.points[i].x, ship.points[i].y);
		}
		if (i == ship.points.length - 1) {
			context.lineTo(ship.points[0].x, ship.points[0].y);
		}
	}
	context.closePath();
	context.stroke();
	context.fillStyle = 'rgb(140, 75, 25)';
	context.fill();
	/*
	context.beginPath();
	var o = 0;
	for (var i = 0; i < ship.points.length; i++) {
		for (var i = 0; i < ship.points.length; i++) {
			if (ship.missingZeros.indexOf(i) != -1) { o++; continue; }
			context.moveTo(ship.zeroPoints[i - o].x, ship.zeroPoints[i - o].y);
			context.lineTo(ship.points[i].x, ship.points[i].y);
			context.lineTo(ship.points[i].x, ship.points[i].y);
		}
	}
	context.closePath();
	context.stroke();
		*/
	//draw ladder
	drawPolygon(0, 0, ship.ladder);
	//draw masses
	context.fillStyle = 'red';
	if (ship.masses) {
		ship.masses.forEach(mass => {
			context.beginPath();
			context.arc(mass.points[0].x, mass.points[0].y, 10, 0, 2 * Math.PI);
			context.fill();
		});
	}
	//draw rect around ship
	var farLeft = -230;
	var farRight = 230;
	context.beginPath();
	context.strokeRect(farLeft, farLeft, farRight - farLeft, farRight - farLeft);
	drawCannon(ship.topPortCannon);
	drawLoadout(ship, ship.topPortCannon);
	context.restore();
}

