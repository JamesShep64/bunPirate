
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
		return new Vector(this.x / Math.sqrt(this.x * this.x + this.y * this.y), this.y / Math.sqrt(this.x * this.x + this.y * this.y));
	}
	multiply(vec: Vector) {
		this.x *= vec.x;
		this.y *= vec.y;
	}
	unitMultiply(m: number) {
		this.x *= m;
		this.y *= m;
	}
	returnMultiplied(n: number) {
		return new Vector(this.x * n, this.y * n);
	}
	unitDivide(d: number) {
		this.x /= d;
		this.y /= d;
	}
	add(vec: Vector) {
		this.x += vec.x;
		this.y += vec.y;
	}
	addX(num: number) {
		this.x += num;
	}
	addY(num: number) {
		this.y += num;
	}

	dot(vec: Vector) {
		return this.x * vec.x + this.y * vec.y;
	}
	magnatude() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
}
