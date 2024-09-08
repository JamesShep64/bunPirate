import { blockUpdate, gameUpdate, objectUpdate } from "../shared/Message";
import { toggleInterpolate } from "./inputs";

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
	}
	else {
		const baseUpdate = gameUpdates[base];
		const next = gameUpdates[base + 1];
		const ratio = (serverTime - baseUpdate.time) / (next.time - baseUpdate.time);
		return {
			meGod: interpolateObject(baseUpdate.meGod, next.meGod, ratio),
			mePlayer: interpolateObject(baseUpdate.mePlayer, next.mePlayer, ratio),
			otherGods: interpolateObjectArray(baseUpdate.otherGods, next.otherGods, ratio),
			otherPlayers: interpolateObjectArray(baseUpdate.otherPlayers, next.otherPlayers, ratio),
			blocks: interpolateObjectArray(baseUpdate.blocks, next.blocks, ratio),
			ships: interpolateObjectArray(baseUpdate.ships, next.ships, ratio)
		}
	}
}
function interpolateObject(base: objectUpdate | blockUpdate | undefined, next: objectUpdate | blockUpdate | undefined, ratio: number) {
	if (!base || !next)
		return;
	base.x = (next.x - base.x) * ratio + base.x;
	base.y = (next.y - base.y) * ratio + base.y;
	return base;
}

function interpolateObjectArray(base: objectUpdate[] | undefined, next: objectUpdate[] | undefined, ratio: number) {
	if (!base || !next)
		return base;
	return base.map(base => interpolateObject(base, next.find(next => base.id === next.id), ratio));
}
