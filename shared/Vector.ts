
export class Vector {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	subtract(vec: Vector) {
		this.x -= vec.x;
		this.y -= vec.y;
	}
	subtractReturn(vec: Vector) {
		return new Vector(this.x - vec.x, this.y - vec.y);
	}
	divide(vec: Vector) {
		this.x /= vec.x;
		this.y /= vec.y;
	}
	set(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	setVec(other: Vector) {
		this.x = other.x;
		this.y = other.y;
	}
	unit() {
		var mag = Math.sqrt(this.x * this.x + this.y * this.y);
		this.x = this.x / mag;
		this.y = this.y / mag;
	}
	unitReturn() {
		return new Vector(this.x / Math.sqrt(this.x * this.x + this.y * this.y), this.y / Math.sqrt(this.x * this.x + this.y * this.y));
	}
	multiply(vec: Vector) {
		this.x *= vec.x;
		this.y *= vec.y;
	}
	multiplyReturn(vec: Vector) {
		return new Vector(this.x * vec.x, this.y * vec.y);
	}
	unitMultiply(m: number) {
		this.x *= m;
		this.y *= m;
	}
	unitMultiplyReturn(num: number) {
		return new Vector(this.x * num, this.y * num);
	}
	unitDivide(d: number) {
		this.x /= d;
		this.y /= d;
	}
	add(vec: Vector) {
		this.x += vec.x;
		this.y += vec.y;
	}
	addReturn(vec: Vector) {
		return new Vector(this.x + vec.x, this.y + vec.y);
	}
	addX(num: number) {
		this.x += num;
	}
	addY(num: number) {
		this.y += num;
	}
	distance(vec: Vector) {
		return Math.sqrt(Math.pow(this.x - vec.x, 2) + Math.pow(vec.y - this.y, 2));
	}
	copy() {
		return new Vector(this.x, this.y);
	}
	dot(vec: Vector) {
		return this.x * vec.x + this.y * vec.y;
	}
	magnatude() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	equals(vec: Vector) {
		return vec.x == this.x && vec.y == this.y;
	}
	serializeForUpdates() {
		return { x: this.x, y: this.y };
	}
}
