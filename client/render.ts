import { getCurrentState } from './state';
import { blockUpdate, cannonUpdate, expolsionUpdate, godUpdate, grappleUpdate, objectUpdate, playerUpdate, shipUpdate, vectorUpdate } from '../shared/Message';
import { animateMeteors, animatePlayers, MeteorAnimated, PlayerAnimation } from './animationHandling';
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
	console.log(canvas.width, canvas.height);
}
// Create a temporary canvas for scaling the pattern
const tempCanvas = document.createElement('canvas');
const tempContext = tempCanvas.getContext('2d');

// Set the dimensions of the temporary canvas (adjust for desired scale)
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
	const { meGod, mePlayer, otherGods, otherPlayers, blocks, ships, planets, meteors, cannonBalls, explosions, grapples } = getCurrentState();

	const { meAnimated, othersAnimated } = animatePlayers(mePlayer as playerUpdate, otherPlayers as playerUpdate[]);
	const meteorsAnimated = animateMeteors(meteors as objectUpdate[]);
	context.lineWidth = 2;
	context.fillStyle = "blue";

	initializeDrawing(meGod, mePlayer);
	if (mePlayer) {
		me = mePlayer as playerUpdate;
		context.translate(-me.x + canvas.width / 2, -me.y + canvas.height / 2);
	}
	else if (meGod) {
		context.translate(-meGod.x + canvas.width / 2, -meGod.y + canvas.height / 2);
	}
	drawOtherGods(otherGods as godUpdate[]);
	drawBlocks(blocks as blockUpdate[]);
	drawBlocks(planets as blockUpdate[]);
	drawShips(ships as shipUpdate[]);
	drawCannonBalls(cannonBalls as objectUpdate[]);
	drawMeteors(meteorsAnimated as MeteorAnimated[]);
	drawExplosions(explosions as expolsionUpdate[]);
	drawGrapples(grapples as grappleUpdate[]);
	drawOtherPlayers(othersAnimated);
	drawMe(meGod as godUpdate, meAnimated);
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
function drawMeteors(meteors: MeteorAnimated[]) {
	if (!meteors)
		return;
	meteors.forEach(meteor => {
		if (meteor) {
			context.save();
			context.translate(meteor.meteor.x, meteor.meteor.y);
			context.rotate(meteor.direction);
			context.translate(-20, -20);
			context.drawImage(getAsset("meteor.svg"), 0, 0, 40, 40);
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
function drawExplosions(explosions: expolsionUpdate[]) {
	if (!explosions)
		return;
	explosions.forEach(explo => {
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
function drawRotatedPart(x: number, y: number, angle: number, name: string) {
	context.save();
	context.translate(x, y);
	context.rotate(angle);
	context.translate(-x, -y);
	context.drawImage(getAsset(name), 0, 0, 30, 50);
	context.restore();
}
function drawPlayerModel(player: PlayerAnimation) {
	context.save();
	context.translate(player.player.x, player.player.y);
	context.rotate(player.player.direction);
	context.translate(- 15, - 32);
	context.drawImage(getAsset("face.svg"), 0, 0, 30, 50);
	context.drawImage(getAsset("torso.svg"), 0, 0, 30, 50);
	drawRotatedPart(6.41, 9.053, player.hair1Angle.current, "hair1.svg");
	drawRotatedPart(20.985, 9.356, player.hair2Angle.current, "hair2.svg");
	drawRotatedPart(14.845, 0, player.hatAngle.current, "hat.svg");
	drawRotatedPart(11.47, 39.30, player.leftLegAngle.current, "leftLeg.svg");
	drawRotatedPart(16.19, 39.30, player.rightLegAngle.current, "rightLeg.svg");
	drawRotatedPart(13.50, 28.72, player.leftShirtAngle.current, "leftShirt.svg");
	drawRotatedPart(15.52, 27.96, player.rightShirtAngle.current, "rightShirt.svg");
	drawRotatedPart(14.17, 26.45, player.bibAngle.current, "bib.svg");
	drawRotatedPart(10.12, 28.72, player.leftArmAngle.current, "leftArm.svg");
	drawRotatedPart(18.22, 27.96, player.rightArmAngle.current, "rightArm.svg");

	context.restore();

}
function drawMe(meGod: godUpdate | undefined, mePlayer: PlayerAnimation | undefined) {
	//draw me if me is god
	if (meGod && !mePlayer) {
		context.translate(-meGod.x + canvas.width / 2, -meGod.y + canvas.height / 2);
		cameraPosition.x = -meGod.x + canvas.width / 2;
		cameraPosition.y = -meGod.y + canvas.height / 2;
	}
	//draw me if me is player
	if (mePlayer) {
		cameraPosition.x = -mePlayer.player.x + canvas.width / 2;
		cameraPosition.y = -mePlayer.player.y + canvas.height / 2;
		drawPlayerModel(mePlayer);
		context.fill();
	}
}
function drawLoadout(ship: shipUpdate, cannon: cannonUpdate) {
	if (!me?.onCannon || me.id != cannon.playerID)
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
function drawOtherPlayers(otherPlayers: PlayerAnimation[] | undefined) {
	if (!otherPlayers)
		return;
	otherPlayers.forEach(player => {
		if (!player)
			return;
		drawPlayerModel(player);
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
function drawAccelerator(ship: shipUpdate) {
	context.save();
	context.translate(ship.accelerator.x, ship.accelerator.y);
	context.rotate(ship.direction);
	context.drawImage(getAsset("accelerator.svg"), 0, 0, 35, 35);
	context.translate(16.333, 31.1111);
	context.rotate((35 * Math.PI / 180) * ship.accelerator.selected);
	context.translate(-16.333, -31.1111);
	context.drawImage(getAsset("acceleratorArrow.svg"), 0, 0, 35, 35);
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
	drawCatmullRomSpline(ship.mast, 8);
	context.save();
	context.fillStyle = "#EFD0B5";
	context.fill();
	context.restore();
	context.beginPath();
	drawCatmullRomSpline(ship.points, 4);
	context.closePath();
	tempCanvas.width = 500; // Original width of the SVG pattern
	tempCanvas.height = 100; // Original height of the SVG pattern
	// Load the SVG image
	// Scale the image on the temporary canvas
	var pattern: any = undefined;
	if (tempContext) {

		// Draw the scaled image on the temporary canva
		tempContext.drawImage(getAsset("shipTexture.svg"), 0, 0);
		// Now create a pattern from the temporary scaled canva
		pattern = context.createPattern(tempCanvas, "repeat-y");

		// Save the canvas state before applying transformation
		context.save();

		// Apply transformations (translate, rotate, etc.)
		context.rotate(ship.direction);  // Rotate based on ship direction
		context.translate(-225, -200);   // Move the origin if needed
		// If the pattern was created successfully, apply it
		if (pattern) {
			context.fillStyle = pattern;
		}

		context.fill();
		context.stroke();
		// Restore the canvas state

		context.restore();
	}

	context.fillStyle = "red";
	/*
	for (var i = 0; i < ship.points.length; i++) {
		context.beginPath();
		context.arc(ship.points[i].x, ship.points[i].y, 10, 0, 2 * Math.PI);
		context.fill();
	}
	*/
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
	drawAccelerator(ship);
	context.restore();
	// Helper function to calculate Catmull-Rom interpolation

}
function catmullRom(p0: vectorUpdate, p1: vectorUpdate, p2: vectorUpdate, p3: vectorUpdate, t: number) {
	const t2 = t * t;
	const t3 = t2 * t;

	const f0 = -0.5 * t3 + t2 - 0.5 * t;
	const f1 = 1.5 * t3 - 2.5 * t2 + 1.0;
	const f2 = -1.5 * t3 + 2.0 * t2 + 0.5 * t;
	const f3 = 0.5 * t3 - 0.5 * t2;

	return {
		x: f0 * p0.x + f1 * p1.x + f2 * p2.x + f3 * p3.x,
		y: f0 * p0.y + f1 * p1.y + f2 * p2.y + f3 * p3.y
	};
}

// Function to draw the Catmull-Rom spline
function drawCatmullRomSpline(points: vectorUpdate[], segments: number) {
	context.beginPath();
	var r = 0;
	var a = 0;
	var b = 0;
	for (let i = 0; i < points.length; i++) {
		for (let t = 0; t <= 1; t += 1 / segments) {
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

