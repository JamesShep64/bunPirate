import { objectUpdate } from "../shared/Message";

import { Vector } from "../shared/Vector";
import { Controllable } from "./Controllable";
import { Player } from "./Player";
import { Polygon } from "./polygon";
export class God extends Controllable {
	id: string;
	command: string;
	placePoint: Vector;
	controlledPlayer: Player | undefined;
	constructor(id: string) {
		super(0, 0);
		this.id = id;
		this.command = "";
		this.placePoint = new Vector(0, 0);
		this.controlledPlayer = undefined;
		//movment vectors and bools
	}
	changePlacePoint(x: number, y: number) {
		this.placePoint.set(x, y);
	}
	update() {
		super.update();
	}
	clickedOnPolygon(poly: Polygon) {
		if (Math.sqrt(((this.placePoint.x - poly.pos.x) ** 2) + (this.placePoint.y - poly.pos.y) ** 2) < 20) {
			return true;
		}
		return false;
	}
	serializeForUpdate() {
		return {
			id: this.id,
			x: this.pos.x,
			y: this.pos.y,
			placeX: this.placePoint.x,
			placeY: this.placePoint.y
		}
	}
}
