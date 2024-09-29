import { Vector } from "../shared/Vector";

export class PhysicsVelocity {
  ticks: number;
  velocity: Vector;
  id: string;
  slowFactor: number;
  constructor(id: string, ticks: number, velocity: Vector, slowFactor: number) {
    this.ticks = ticks;
    this.velocity = velocity;
    this.id = id;
    this.slowFactor = slowFactor;
  }
  update() {
    this.velocity.unitMultiply(this.slowFactor);
    this.ticks--;
  }
}
