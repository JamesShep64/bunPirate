import { objectUpdate } from "../shared/Message";

import { Vector } from "../shared/Vector";
export class God {
	id: string;
	command: string;
	pos: Vector;
	placePoint: Vector;
	constructor(id: string) {
		this.id = id;
		this.command = "";
		this.pos = new Vector(0, 0);
		this.placePoint = new Vector(0, 0);
	}
	updatePosition(x: number, y: number) {
		this.pos.set(x, y);
	}
	changePlacePoint(x: number, y: number) {
		this.placePoint.set(x, y);
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
