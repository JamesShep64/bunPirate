import { blockUpdate, gameUpdate, objectUpdate } from "../shared/Message";

const RENDER_DELAY = 100;

const gameUpdates: gameUpdate[] = [];
let gameStart = 0;
let firstServerTimestamp = 0;
export function processGameUpdate(o: object) {
	const update = o as gameUpdate;
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

function currentServerTime(): number {
	return firstServerTimestamp + (Date.now() - gameStart) - RENDER_DELAY;
}
function getBaseUpdate(): number {
	const serverTime = currentServerTime();
	for (let i = gameUpdates.length - 1; i >= 0; i--) {
		if (gameUpdates[i].time <= serverTime) {
			return i;
		}
	}
	return -1;
}
export function getCurrentState() {
	if (!firstServerTimestamp) {
		return {};
	}
	const base = getBaseUpdate();
	const serverTime = currentServerTime();
	if (base < 0 || base == gameUpdates.length - 1) {
		return gameUpdates[gameUpdates.length - 1];
	}
	else {
		const baseUpdate = gameUpdates[base];
		const next = gameUpdates[base + 1];
		const ratio = (serverTime - baseUpdate.time) / (next.time - baseUpdate.time);
		return {
			me: interpolateObject(baseUpdate.me, next.me, ratio),
			otherGods: interpolateObjectArray(baseUpdate.otherGods, next.otherGods, ratio),
			blocks: interpolateObjectArray(baseUpdate.blocks, next.blocks, ratio),
		}
	}
}
function interpolateObject(base: objectUpdate | blockUpdate | undefined, next: objectUpdate | blockUpdate | undefined, ratio: number) {
	if (!base || !next)
		return base;
	if ("points" in base)
		return {
			x: (next.x - base.x) * ratio + base.x, y: (next.y - base.y) * ratio + base.y,

			points: base.points
		};
	return {
		x: (next.x - base.x) * ratio + base.x, y: (next.y - base.y) * ratio + base.y
	};
}
function interpolateObjectArray(base: objectUpdate[] | undefined, next: objectUpdate[] | undefined, ratio: number) {
	if (!base || !next)
		return base;
	return base.map(base => interpolateObject(base, next.find(next => base.id === next.id), ratio));
}
