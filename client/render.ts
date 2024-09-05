import { debounce } from 'throttle-debounce';
import { getCurrentState } from './state';
import { Vector } from '../shared/Vector';
import { blockUpdate, objectUpdate } from '../shared/Message';
import { cursPos } from './inputs';

export const cameraPosition = { x: 0, y: 0 };
// Get the canvas graphics context
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d');
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
function render() {
	const { me, otherGods, blocks } = getCurrentState();
	if (!context || !me)
		return;
	context.save();
	context.clearRect(0, 0, canvas.width, canvas.height)
	context.fillStyle = 'red';
	context.translate(-me.x + canvas.width / 2, -me.y + canvas.height / 2);
	cameraPosition.x = -me.x + canvas.width / 2;
	cameraPosition.y = -me.y + canvas.height / 2;
	drawGod(me.x, me.y);
	context.beginPath();
	context.fill();
	if (!otherGods)
		return;
	otherGods.forEach(other => {
		if (!other)
			return;
		drawGod(other.x, other.y);
	});
	if (!blocks)
		return;
	blocks.forEach(b => {
		const block = b as blockUpdate;
		if (!block)
			return;
		drawPolygon(block.x, block.y, block.points);
	});
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

