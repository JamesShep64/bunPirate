
import { Constants } from "../shared/constants";
import { Vector } from "../shared/Vector";
export class Controllable {
  horizontalMove: Vector;
  movingLeft: boolean;
  movingRight: boolean;
  verticalMove: Vector;
  movingUp: boolean;
  movingDown: boolean;
  pos: Vector;
  constructor(x: number, y: number) {
    this.horizontalMove = new Vector(1, 0);
    this.movingLeft = false;
    this.movingRight = false;
    this.verticalMove = new Vector(0, 1);
    this.movingUp = false;
    this.movingDown = false;
    this.pos = new Vector(x, y);
  }
  moveLeft() {
    if (!this.movingRight) {
      this.movingLeft = true;
    }
  }

  stopLeft() {
    this.movingLeft = false;
  }

  moveRight() {
    if (!this.movingLeft) {
      this.movingRight = true;
    }
  }

  stopRight() {
    this.movingRight = false;
  }

  moveUp() {
    if (!this.movingDown) {
      this.movingUp = true;
    }
  }

  stopUp() {
    this.movingUp = false;
  }

  moveDown() {
    if (!this.movingUp) {
      this.movingDown = true;
    }
  }

  stopDown() {
    this.movingDown = false;
  }
  update() {
    if (this.movingLeft || this.movingRight) {
      if (this.movingRight)
        this.pos.add(this.horizontalMove.unitMultiplyReturn(Constants.VELOCITY_MULTIPLIER * 10));
      if (this.movingLeft)
        this.pos.subtract(this.horizontalMove.unitMultiplyReturn(Constants.VELOCITY_MULTIPLIER * 10));
    }
    if (this.movingUp || this.movingDown) {
      if (this.movingDown) {
        this.pos.add(this.verticalMove.unitMultiplyReturn(Constants.VELOCITY_MULTIPLIER * 10));
      }
      if (this.movingUp) {
        this.pos.subtract(this.verticalMove.unitMultiplyReturn(Constants.VELOCITY_MULTIPLIER * 10));
      }
    }
  }
}
