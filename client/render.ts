import { debounce } from 'throttle-debounce';
import { getCurrentState } from './state';
import { Vector } from '../shared/Vector';
import { blockUpdate, godUpdate, objectUpdate, playerUpdate, shipUpdate } from '../shared/Message';
import { Constants } from '../shared/constants';
import { cursPos } from './inputs';

export const cameraPosition = { x: 0, y: 0 };
// Get the canvas graphics context
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
function drawBackground(camX: number, camY: number) {
	var canvasX = canvas.width / 2 - camX;
	var canvasY = canvas.height / 2 - camY;
	var grd = context.createLinearGradient(
		canvasX,
		canvasY - Constants.MAP_HEIGHT / 2,
		canvasX,
		Constants.MAP_HEIGHT / 2 + canvasY + 1000
	);
	grd.addColorStop(.8, "#34cceb");
	grd.addColorStop(.35, "#0440cc");
	grd.addColorStop(.2, "black");
	context.fillStyle = grd;
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.save();
	context.translate(-camX + canvas.width / 2, -camY + canvas.height / 2);
	for (var x = camX - canvas.width / 2 - 400; x < camX + canvas.width / 2 + 400; x += 80) {
		for (var y = camY - canvas.height / 2 - 400; y < camY + canvas.height / 2 + 400; y += 80) {
			context.save();
			x = Math.ceil(x / 80) * 80;
			y = Math.ceil(y / 80) * 80;
			var shift = -17520;
			var xCheck = x + shift;
			var yCheck = y + shift;
			context.translate(x, y);
			if ((xCheck % 5280 == 0 && yCheck % 2320 == 0) || (xCheck % 3520 == 0 && yCheck % 3120 == 0) || (xCheck % 3200 == 0 && yCheck % 2080 == 0) || (xCheck % 8320 == 0 && yCheck % 4240 == 0) || (xCheck % 2880 == 0 && yCheck % 5280 == 0) || (xCheck % 4400 == 0 && yCheck % 3280 == 0) || (xCheck % 4320 == 0 && yCheck % 2400 == 0) || (xCheck % 4800 == 0 && yCheck % 1280 == 0) || (xCheck % 2240 == 0 && yCheck % 3000 == 0) || (xCheck % 1120 == 0 && yCheck % 4000 == 0)) {
				if (((yCheck < shift + Constants.MAP_HEIGHT * .15))) {
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
					context.fill();
				}
				if ((yCheck > shift + Constants.MAP_HEIGHT * .15)) {
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
	context.fillStyle = 'red';
}

function render() {
	const { meGod, mePlayer, otherGods, otherPlayers, blocks, ships } = getCurrentState();
	initializeDrawing(meGod, mePlayer);
	drawMe(meGod as godUpdate, mePlayer as playerUpdate);
	drawOtherGods(otherGods as godUpdate[]);
	drawBlocks(blocks as blockUpdate[]);
	drawOtherPlayers(otherPlayers as playerUpdate[]);
	drawShips(ships as shipUpdate[]);
	context.restore();
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
	}
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
	setInterval(render, 1000 / 90);
}
function drawGod(x: number, y: number) {
	if (!context)
		return;
	context.beginPath();
	context.arc(x, y, 100, 0, 2 * Math.PI);
	context.fill();
}
function drawPolygon(x: number, y: number, points: Vector[]) {
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
	context.restore();
}

