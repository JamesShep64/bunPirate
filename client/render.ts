
import { debounce } from 'throttle-debounce';
import { getCurrentState } from './state';
import { Vector } from '../shared/Vector';
import { blockUpdate, objectUpdate } from '../shared/Message';
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
	context.clearRect(0, 0, canvas.width, canvas.height)
	context.fillStyle = 'red';
	drawGod(me.x, me.y);
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
	context.restore();
	var o;
	context.beginPath();
	for (var i = 0; i < points.length; i++) {
		o = i + 1;
		if (o == points.length) {
			o = 0;
		}
		if (i == 0) {
			context.moveTo(x + points[i].x, y + points[i].y);
		}
		else {
			context.lineTo(x + points[i].x, y + points[i].y);
		}
		if (i == points.length - 1) {
			context.lineTo(x + points[0].x, y + points[0].y);
		}
	}
	context.closePath();
	context.stroke();
	context.restore();
}

