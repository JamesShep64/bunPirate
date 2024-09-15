import { Vector } from "../shared/Vector";
import { PirateShip } from "./PirateShip";
import { Polygon } from "./polygon";
export function checkHalfPolygonPolygonCollision(poly1: Polygon, poly2: Polygon) {
  if (!poly2.checkWithinRect(poly1))
    return false;
  var pointsToCheck = 0;
  if (poly1.isParellelogram)
    pointsToCheck = poly1.points.length / 2;
  else
    pointsToCheck = poly1.points.length;
  for (var i = 0; i < pointsToCheck; i++) {
    var zero1 = poly1.pos;
    var vec1 = poly1.points[i];
    for (var j = 0; j < poly2.points.length; j++) {
      var o = j + 1;
      if (o == poly2.points.length) {
        o = 0;
      }
      var vec2 = new Vector(poly2.points[o].x - poly2.points[j].x, poly2.points[o].y - poly2.points[j].y);
      var { t, u } = vectorCollision(zero1, vec1, new Vector(poly2.points[j].x + poly2.pos.x, poly2.points[j].y + poly2.pos.y), vec2);

      if (t > -1 && t < 1 && u >= 0 && u < 1) {
        return true;
      }
    }
  }
  return false;
}
function vectorCollision(zero1: Vector, vec1: Vector, zero2: Vector, vec2: Vector) {
  var h = vec1.x * vec2.y - vec1.y * vec2.x;
  var t = (zero2.x - zero1.x) * vec2.y - (zero2.y - zero1.y) * vec2.x;
  t /= h;

  var u = (zero2.x - zero1.x) * vec1.y - (zero2.y - zero1.y) * vec1.x;
  u /= h;

  return { t, u };
}

//the return is a displacment vector for poly1

export function polygonPolygonCollision(poly1: Polygon, poly2: Polygon) {
  if (!poly2.checkWithinRect(poly1))
    return;
  const firstCol = halfPolygonPolygonCollision(poly1, poly2);
  if (firstCol)
    return firstCol;
  const col = halfPolygonPolygonCollision(poly2, poly1);
  if (col) {
    col.multiply(new Vector(-1, -1));
    return col;
  }
}
function halfPolygonPolygonCollision(poly1: Polygon, poly2: Polygon) {
  var pointsToCheck = 0;
  if (poly1.isParellelogram)
    pointsToCheck = poly1.points.length / 2;
  else
    pointsToCheck = poly1.points.length;
  for (var i = 0; i < pointsToCheck; i++) {
    var zero1 = poly1.pos;
    var vec1 = poly1.points[i];
    for (var j = 0; j < poly2.points.length; j++) {
      var o = j + 1;
      if (o == poly2.points.length) {
        o = 0;
      }
      var vec2 = new Vector(poly2.points[o].x - poly2.points[j].x, poly2.points[o].y - poly2.points[j].y);
      var { t, u } = vectorCollision(zero1, vec1, new Vector(poly2.points[j].x + poly2.pos.x, poly2.points[j].y + poly2.pos.y), vec2);

      if (t > -1 && t < 1 && u >= 0 && u < 1) {
        var mult = 1;
        if (t < 0) {
          mult = -1;
          t = Math.abs(t);
        }
        var push = new Vector(1 - t, 1 - t);
        push.multiply(new Vector(mult, mult));
        push.multiply(vec1);
        push.multiply(new Vector(-1, -1));
        return push;
      }
    }
  }
  return null;
}
//because the ship is big two polygon diagnols can collide at one, so return the sum.
function halfPolygonShipCollision(poly1: Polygon, ship: PirateShip) {
  var totalPush = new Vector(0, 0);
  var pointsToCheck = 0;
  var onFloor = false;
  if (poly1.isParellelogram)
    pointsToCheck = poly1.points.length / 2;
  else
    pointsToCheck = poly1.points.length;
  for (var i = 0; i < pointsToCheck; i++) {
    var zero1 = poly1.pos;
    var vec1 = poly1.points[i];
    for (var j = 0; j < ship.bodyPoly.points.length; j++) {
      var o = j + 1;
      if (o == ship.bodyPoly.points.length) {
        o = 0;
      }
      var vec2 = new Vector(ship.bodyPoly.points[o].x - ship.bodyPoly.points[j].x, ship.bodyPoly.points[o].y - ship.bodyPoly.points[j].y);
      var { t, u } = vectorCollision(zero1, vec1, new Vector(ship.bodyPoly.points[j].x + ship.bodyPoly.pos.x, ship.bodyPoly.points[j].y + ship.bodyPoly.pos.y), vec2);

      if (t > -1 && t < 1 && u >= 0 && u < 1) {
        var mult = 1;
        if (t < 0) {
          mult = -1;
          t = Math.abs(t);
        }
        if (ship.floors.indexOf(j) != -1)
          t += .08;
        var push = new Vector(1 - t, 1 - t);
        push.multiply(new Vector(mult, mult));
        push.multiply(vec1);
        push.multiply(new Vector(-1, -1));
        totalPush.add(push);
        onFloor = ship.floors.indexOf(j) != -1;
      }
    }
  }
  if (totalPush.x == 0 && totalPush.y == 0)
    return undefined;
  return { onFloor, push: totalPush };
}
export function polygonShipCollision(poly: Polygon, ship: PirateShip): { push: Vector, onFloor: boolean } | undefined {
  if (!ship.bodyPoly.checkWithinRect(poly))
    return;
  const firstCol = halfPolygonShipCollision(poly, ship);
  if (firstCol)
    return firstCol;
  const secondCol = shipDiagnolPolygonCollision(ship, poly);
  if (secondCol) {
    return { push: secondCol, onFloor: false };
  }
}
export function shipShipCollision(ship1: PirateShip, ship2: PirateShip) {
  if (!ship2.bodyPoly.checkWithinRect(ship2.bodyPoly))
    return;
  const firstCol = halfPolygonPolygonCollision(ship1.bodyPoly, ship2.collisionZerosPolygon);
  if (firstCol)
    return firstCol;
  const secondCol = halfPolygonPolygonCollision(ship2.bodyPoly, ship1.bodyPoly);
  return secondCol;
}
function shipDiagnolPolygonCollision(ship: PirateShip, poly: Polygon) {
  var diff = 0;
  for (var i = 0; i < ship.bodyPoly.points.length; i++) {
    if (ship.missingZeros.indexOf(i) != -1) {
      diff++;
      continue;
    }
    var zero1 = ship.collisionZerosPolygon.points[i - diff].copy();
    zero1.add(ship.pos);
    var vec1 = ship.bodyPoly.points[i].copy();
    vec1.subtract(ship.collisionZerosPolygon.points[i - diff]);
    for (var j = 0; j < poly.points.length; j++) {
      var o = j + 1;
      if (o == poly.points.length) {
        o = 0;
      }
      var vec2 = new Vector(poly.points[o].x - poly.points[j].x, poly.points[o].y - poly.points[j].y);
      var { t, u } = vectorCollision(zero1, vec1, new Vector(poly.points[j].x + poly.pos.x, poly.points[j].y + poly.pos.y), vec2);
      if (t > 0 && t < 1 && u >= 0 && u < 1) {
        var push = new Vector(1 - t, 1 - t);
        push.multiply(vec1);
        return push;
      }
    }
  }
  return null;
}





