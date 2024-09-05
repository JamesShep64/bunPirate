import { objectUpdate } from "../shared/Message";

import { Vector } from "../shared/Vector";
import { Controllable } from "./Controllable";
export class God extends Controllable {
	id: string;
	command: string;
	placePoint: Vector;
	constructor(id: string) {
		super(0, 0);
		this.id = id;
		this.command = "";
		this.placePoint = new Vector(0, 0);
		//movment vectors and bools
	}
	changePlacePoint(x: number, y: number) {
		this.placePoint.set(x, y);
	}
	update() {
		super.update();
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
