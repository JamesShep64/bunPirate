
import { Vector } from "../shared/Vector";
export class Controllable {
  horizontalMove: Vector;
  leftMove: Vector;
  movingLeft: boolean;
  rightMove: Vector;
  movingRight: boolean;
  verticalMove: Vector;
  upMove: Vector;
  movingUp: boolean;
  downMove: Vector;
  movingDown: boolean;
  pos: Vector;
  constructor(x: number, y: number) {
    this.horizontalMove = new Vector(0, 0);
    this.leftMove = new Vector(-1, 0);
    this.movingLeft = false;
    this.rightMove = new Vector(1, 0);
    this.movingRight = false;
    this.verticalMove = new Vector(0, 0);
    this.upMove = new Vector(0, -1);
    this.movingUp = false;
    this.downMove = new Vector(0, 1);
    this.movingDown = false;
    this.pos = new Vector(x, y);
  }
  moveLeft() {
    if (!this.movingRight) {
      this.horizontalMove.setVec(this.leftMove);
      this.movingLeft = true;
    }
  }

  stopLeft() {
    this.movingLeft = false;
  }

  moveRight() {
    if (!this.movingLeft) {
      this.horizontalMove.setVec(this.rightMove);
      this.movingRight = true;
    }
  }

  stopRight() {
    this.movingRight = false;
  }

  moveUp() {
    if (!this.movingDown) {
      this.verticalMove.setVec(this.upMove);
      this.movingUp = true;
    }
  }

  stopUp() {
    this.movingUp = false;
  }

  moveDown() {
    if (!this.movingUp) {
      this.verticalMove.setVec(this.downMove);
      this.movingDown = true;
    }
  }

  stopDown() {
    this.movingDown = false;
  }
  update() {
    if (this.movingLeft || this.movingRight)
      this.pos.add(this.horizontalMove.returnMultiplied(2));
    if (this.movingUp || this.movingDown)
      this.pos.add(this.verticalMove.returnMultiplied(2));
  }
}
