import { objectUpdate } from "../shared/Message";

import { Vector } from "../shared/Vector";
import { Controllable } from "./Controllable";
import { PirateShip } from "./PirateShip";
import { Player } from "./Player";
import { Polygon } from "./polygon";
export class God extends Controllable {
	id: string;
	command: string;
	placePoint: Vector;
	controlledPlayer: Player | undefined;
	controlledShip: PirateShip | undefined;
	followingShip: boolean;
	clickPoint: Vector = new Vector(0, 0);
	constructor(id: string) {
		super(0, 0);
		this.id = id;
		this.command = "";
		this.placePoint = new Vector(0, 0);
		this.controlledPlayer = undefined;
		this.controlledShip = undefined;
		//movment vectors and bools
		this.followingShip = false;
	}
	changePlacePoint(x: number, y: number) {
		this.placePoint.set(x, y);
	}
	changeClickPoint(x: number, y: number) {
		this.clickPoint.set(x, y);
	}
	update() {
		if (!this.controlledPlayer)
			super.update();
	}
	clickedOnObject(objectPosition: Vector) {
		if (Math.sqrt(((this.placePoint.x - objectPosition.x) ** 2) + (this.placePoint.y - objectPosition.y) ** 2) < 20) {
			return true;
		}
		return false;
	}
	setControlledObject(obj: any, type: string) {
		switch (type) {
			case "Player":
				this.controlledPlayer = obj;
				break;
			case "PirateShip":
				this.controlledShip = obj;
				break;
		}

	}
	followShip() {
		if (!this.followingShip && this.controlledShip) {
			this.pos = this.controlledShip.pos;
			this.followingShip = true;
		}
		else if (this.followingShip) {
			this.pos = new Vector(this.pos.x, this.pos.y);
		}
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
