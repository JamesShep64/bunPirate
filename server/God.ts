import { objectUpdate } from "../shared/Message";
import { Vector } from "./Vector";

export class God {
	id: string;
	command: string;
	pos: Vector;
	constructor(id: string) {
		this.id = id;
		this.command = "";
		this.pos = new Vector(0, 0);
	}
	updatePosition(x: number, y: number) {
		this.pos.set(x, y);
	}

	serializeForUpdate() {
		return {
			id: this.id,
			x: this.pos.x,
			y: this.pos.y
		}
	}
}
export interface godUpdate extends objectUpdate {
}
