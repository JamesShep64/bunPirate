import { debounce } from 'throttle-debounce';
import { getCurrentState } from './state';
import { Vector } from '../shared/Vector';
import { blockUpdate, godUpdate, objectUpdate, playerUpdate, shipUpdate } from '../shared/Message';
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
export function startRendering() {
	setInterval(render, 1000 / 60);
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
	for (var i = 0; i < ship.bodyPoints.length; i++) {
		if (i == 0) {
			context.moveTo(ship.bodyPoints[i].x, ship.bodyPoints[i].y);
		}
		else {
			context.lineTo(ship.bodyPoints[i].x, ship.bodyPoints[i].y);
		}
		if (i == ship.bodyPoints.length - 1) {
			context.lineTo(ship.bodyPoints[0].x, ship.bodyPoints[0].y);
		}
	}
	context.closePath();
	context.stroke();
	context.beginPath();
	var o = 0;
	for (var i = 0; i < ship.bodyPoints.length; i++) {
		if (ship.missingZeros.indexOf(i) != -1) { o++; continue; }
		context.moveTo(ship.zeroPoints[i - o].x, ship.zeroPoints[i - o].y);
		context.lineTo(ship.bodyPoints[i].x, ship.bodyPoints[i].y);
	}
	context.closePath();
	context.stroke();
	context.restore();
}

