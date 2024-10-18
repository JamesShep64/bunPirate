import { blockUpdate, gameUpdate, grappleUpdate, objectUpdate, shipUpdate, vectorUpdate } from "../shared/Message";
import { toggleInterpolate } from "./inputs";

const RENDER_DELAY = 50;
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
			ships: interpolateShips(baseUpdate.ships, next.ships, ratio),
			planets: baseUpdate.planets,
			cannonBalls: interpolateObjectArray(baseUpdate.cannonBalls, next.cannonBalls, ratio),
			explosions: interpolateObjectArray(baseUpdate.explosions, next.explosions, ratio),
			grapples: interpolateGrapples(baseUpdate.grapples, next.grapples, ratio),
			meteors: interpolateObjectArray(baseUpdate.meteors, next.meteors, ratio),

		}
	}
}
function interpolateShips(base: shipUpdate[], next: shipUpdate[], ratio: number) {

	interpolateObjectArray(base, next, ratio);
	base.forEach((ship) => {
		interpolateObjectArray(ship.masses, next.find(next => next.id === ship.id)?.masses, ratio);
		interpolatePoints(ship.ladder, next.find(next => next.id === ship.id)?.ladder, ratio);
		interpolateObject(ship.accelerator, next.find(next => next.id === ship.id)?.accelerator, ratio);
		interpolatePoints(ship.mast, next.find(next => next.id === ship.id)?.mast, ratio);
		interpolateObject(ship.topPortCannon, next.find(next => next.id === ship.id)?.topPortCannon, ratio);
	});
	return base;
}
function interpolateObject(base: blockUpdate | objectUpdate | undefined, next: blockUpdate | objectUpdate | undefined, ratio: number) {
	if (!base || !next)
		return;
	if (base.x && base.y) {
		base.x = (next.x - base.x) * ratio + base.x;
		base.y = (next.y - base.y) * ratio + base.y;
	}
	var b = base as blockUpdate;
	var n = next as blockUpdate;
	if (b.points) {
		interpolatePoints(b.points, n.points, ratio);
	}
	return base;
}
function interpolatePoints(base: vectorUpdate[] | undefined, next: vectorUpdate[] | undefined, ratio: number) {
	if (!base || !next || base.length != next.length)
		return;
	var b = base as vectorUpdate[];
	var n = next as vectorUpdate[];
	for (var i = 0; i < b.length; i++) {
		b[i].x = (n[i].x - b[i].x) * ratio + b[i].x;
		b[i].y = (n[i].y - b[i].y) * ratio + b[i].y;
	}
}
function interpolateObjectArray(base: objectUpdate[] | undefined, next: objectUpdate[] | undefined, ratio: number) {
	if (!base || !next)
		return base;
	return base.map(base => interpolateObject(base, next.find(next => base.id === next.id), ratio));
}
function interpolateGrapples(base: grappleUpdate[] | undefined, next: grappleUpdate[] | undefined, ratio: number) {
	interpolateObjectArray(base, next, ratio);
	if (base && next) {
		base.forEach((grapple) => {
			interpolateObject(grapple.launchOrigin, next.find(next => next.id === grapple.id)?.launchOrigin, ratio);
		});
	}
	return base;
}
