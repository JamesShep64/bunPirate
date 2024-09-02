
import { debounce } from 'throttle-debounce';
import { getCurrentState } from './state';
// Get the canvas graphics context
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d');
if (context)
	context.save();
setCanvasDimensions();
function setCanvasDimensions() {
	// On small screens (e.g. phones), we want to "zoom out" so players can still see at least
	// 800 in-game units of width.
	const scaleRatio = Math.max(1, 800 / window.innerWidth);
	canvas.width = 1.5 * scaleRatio * window.innerWidth;
	canvas.height = 1.5 * scaleRatio * window.innerHeight;
}

window.addEventListener('resize', debounce(40, setCanvasDimensions));
function render() {

	const { me } = getCurrentState();
	if (!context || !me)
		return;
	context.clearRect(0, 0, canvas.width, canvas.height)
	context.fillStyle = 'red';
	context.beginPath();
	console.log(me.x, me.y);
	context.arc(me.x, me.y, 100, 0, 2 * Math.PI);
	context.fill();
}
export function startRendering() {

	setInterval(render, 1000 / 500);
}

