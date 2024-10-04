
export class Munitions {
  loadOut: { [key: string]: number } = {};
  constructor() {
    this.loadOut["CannonBall"] = 5;
    this.loadOut["Grapple"] = 1;
  }
  useCannonBall() {
    this.loadOut["cannonBall"]--;
  }
  getLoadOut() {
    return Object.keys(this.loadOut);
  }
  getLoadOutLength() {
    return Object.keys(this.loadOut).length;
  }
  getLoadOutItem(index: number) {
    return Object.keys(this.loadOut)[index];
  } getLoadOutItemAmmo(index: number) {
    return this.loadOut[Object.keys(this.loadOut)[index]];
  }
}
