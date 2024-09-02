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
			x: this.pos.x,
			y: this.pos.y
		}
	}
}
export interface godUpdate {
	x: number,
	y: number
}
