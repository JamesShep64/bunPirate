import { Ticker } from "./Ticker";

export class Queue extends Ticker {
	items: number[] = [];
	maxLength: number;
	index: number = 0;
	averageItem: number = 1;
	constructor(maxLength: number, maxTicks: number = 0) {
		super(maxTicks);
		this.maxLength = maxLength;
	}
	add(element: number) {
		this.items[this.index] = element;
		this.index++;
		if (this.index == this.maxLength)
			this.index = 0;
	}
	average() {
		var sum = 0;
		this.items.forEach(val => {
			sum += val;
		});
		this.averageItem = sum / this.maxLength;
		return this.averageItem;
	}
}
