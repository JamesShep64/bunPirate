export class Ticker {
	maxTicks: number;
	ticks: number = 0;
	constructor(maxTicks: number) {
		this.maxTicks = maxTicks;
	}
	update() {
		this.ticks--;
		if (this.ticks == -1) {
			this.ticks = this.maxTicks;
		}
	}
}
