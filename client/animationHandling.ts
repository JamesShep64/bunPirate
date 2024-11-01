import { gameUpdate, objectUpdate, playerUpdate } from "../shared/Message";

const players: { [key: string]: PlayerAnimation } = {};
export function animatePlayers(mePlayer: playerUpdate | undefined, otherPlayers: playerUpdate[] | undefined) {
  const othersAnimated: PlayerAnimation[] = [];
  var meAnimated: PlayerAnimation | undefined = undefined;
  if (mePlayer) {
    const found = Object.keys(players).indexOf(mePlayer.id);
    if (found == -1) {
      players[mePlayer.id] = new PlayerAnimation(mePlayer);
    }
    players[mePlayer.id].update(mePlayer);
    meAnimated = players[mePlayer.id];
  }
  if (otherPlayers) {
    otherPlayers.forEach(player => {
      if (player) {
        if (Object.keys(players).indexOf(player.id) == -1)
          players[player.id] = new PlayerAnimation(player);
        players[player.id].update(player);
        if (player.id != mePlayer?.id) {
          othersAnimated.push(players[player.id]);
        }
      }
    });
  }
  return { meAnimated: meAnimated, othersAnimated: othersAnimated, }
}

const meteors: { [key: string]: MeteorAnimated } = {};
export function animateMeteors(updateMeteors: objectUpdate[]) {
  const meteorsAnimated: MeteorAnimated[] = [];
  if (!updateMeteors)
    return;
  updateMeteors.forEach(met => {
    if (met) {
      if (Object.keys(meteors).indexOf(met.id) == -1)
        meteors[met.id] = new MeteorAnimated(met);
      meteors[met.id].update(met);
      meteorsAnimated.push(meteors[met.id]);
    }
  });
  return meteorsAnimated;
}

export class MeteorAnimated {
  direction: number;
  meteor: objectUpdate;
  spinRate: number;
  constructor(meteor: objectUpdate) {
    this.meteor = meteor;
    var spinDirection = 1;
    if (Math.random() <= .5) {
      spinDirection = -1;
    }
    this.spinRate = Math.random() * spinDirection * .1;
    this.direction = 0;
  }
  update(meteor: objectUpdate) {
    this.direction += this.spinRate;
    if (Math.abs(this.direction) > 2 * Math.PI) {
      this.direction = 0;
    }
    this.meteor = meteor;
  }

}
export class PlayerAnimation {
  player: playerUpdate;
  hair1Angle: animationTicker;
  hair2Angle: animationTicker;
  hairMax: number = .15;
  hairMin: number = -.15;
  hatAngle: animationTicker;
  leftLegAngle: animationTicker;
  rightLegAngle: animationTicker;
  leftShirtAngle: shirtTicker;
  rightShirtAngle: shirtTicker;
  leftArmAngle: animationTicker;
  rightArmAngle: animationTicker;
  bibAngle: animationTicker;
  pastNetY: number = 0;
  constructor(playerUpdate: playerUpdate) {
    this.player = playerUpdate;
    this.hair1Angle = new animationTicker(this.hairMin, this.hairMax);
    this.hair2Angle = new animationTicker(this.hairMin, this.hairMax);
    this.hatAngle = new animationTicker(-.03, .03);
    this.leftLegAngle = new animationTicker(-.5, .5);
    this.rightLegAngle = new animationTicker(-.5, .5);
    this.leftShirtAngle = new shirtTicker(.1);
    this.rightShirtAngle = new shirtTicker(-.1);
    this.leftArmAngle = new animationTicker(-.3, 1);
    this.rightArmAngle = new animationTicker(-1, .3);
    this.bibAngle = new animationTicker(-.1, .1);
  }
  walkRight() {
    this.leftLegAngle.tick = .03;
    this.leftLegAngle.bounceOnMax = true;
    this.leftLegAngle.bounceOnMin = true;
    this.rightLegAngle.tick = -.05;
    this.rightLegAngle.bounceOnMax = true;
    this.rightLegAngle.bounceOnMin = true;
    this.leftLegAngle.rest = false;
    this.rightLegAngle.rest = false;
  }
  walkLeft() {
    this.leftLegAngle.tick = -.05;
    this.leftLegAngle.bounceOnMax = true;
    this.leftLegAngle.bounceOnMin = true;
    this.rightLegAngle.tick = .03;
    this.rightLegAngle.bounceOnMax = true;
    this.rightLegAngle.bounceOnMin = true;
    this.leftLegAngle.rest = false;
    this.rightLegAngle.rest = false;
  }
  movingOnLadder() {
    this.leftArmAngle.tick = .06;
    this.leftArmAngle.bounceOnMax = true;
    this.leftArmAngle.bounceOnMin = true;
    this.rightArmAngle.tick = -.06;
    this.rightArmAngle.bounceOnMax = true;
    this.rightArmAngle.bounceOnMin = true;
    this.leftArmAngle.rest = false;
    this.rightArmAngle.rest = false;
  }
  jumping() {
    this.leftArmAngle.tick = .05;
    this.rightArmAngle.tick = -.05;
    this.leftArmAngle.bounceOnMax = false;
    this.rightArmAngle.bounceOnMin = false;
    this.leftArmAngle.rest = false;
    this.rightArmAngle.rest = false;
    this.leftLegAngle.tick = .05;
    this.rightLegAngle.tick = -.05;
    this.leftLegAngle.bounceOnMax = false;
    this.rightLegAngle.bounceOnMin = false;
    this.leftLegAngle.rest = false;
    this.rightLegAngle.rest = false;

  }
  stopClimbing() {
    this.leftArmAngle.rest = true;
    this.rightArmAngle.rest = true;
    this.leftArmAngle.bounceOnMin = true;
    this.rightArmAngle.bounceOnMax = true;
    this.leftArmAngle.bounceOnMax = true;
    this.rightArmAngle.bounceOnMin = true;

  }

  stopWalking() {
    this.leftLegAngle.rest = true;
    this.rightLegAngle.rest = true;
    this.rightLegAngle.bounceOnMax = true;
    this.rightLegAngle.bounceOnMin = true;

    this.leftLegAngle.bounceOnMax = true;
    this.leftLegAngle.bounceOnMin = true;
  }
  hairAnimate() {
    this.hair1Angle.tick = .005;
    this.hair1Angle.bounceOnMax = true;
    this.hair1Angle.bounceOnMin = true;
    this.hair1Angle.max = this.hairMax + this.player.netVelocity.x * .1;
    this.hair1Angle.min = this.hairMin + this.player.netVelocity.x * .1;
    this.hair2Angle.tick = -.004;
    this.hair2Angle.bounceOnMax = true;
    this.hair2Angle.bounceOnMin = true;
    this.hair2Angle.max = this.hairMax + this.player.netVelocity.x * .1;
    this.hair2Angle.min = this.hairMin + this.player.netVelocity.x * .1;
    this.hair1Angle.rest = false;
    this.hair2Angle.rest = false;
  }
  shirtAnimate() {
    this.leftShirtAngle.tick = -.01;
    this.rightShirtAngle.tick = .01;
    this.leftShirtAngle.limit = Math.abs(this.player.netVelocity.y * .1);
    this.rightShirtAngle.limit = -Math.abs(this.player.netVelocity.y * .1);
  }
  hatAnimate() {
    this.hatAngle.tick = .01;
    this.hatAngle.bounceOnMax = false;
    this.hatAngle.bounceOnMin = false;
    if (this.player.movingLeft)
      this.hatAngle.bounceOnMin = true;
    if (this.player.movingRight)
      this.hatAngle.bounceOnMax = true;
  }

  update(player: playerUpdate) {
    this.player = player;
    if (player.movingRight && !player.onLadder && player.onFloor) {
      this.walkRight();
    }
    else if (player.movingLeft && !player.onLadder && player.onFloor) {
      this.walkLeft();
    }
    else {
      this.stopWalking();
    }
    if (player.onLadder && (player.movingUp || player.movingDown || player.movingLeft || player.movingRight)) {
      this.movingOnLadder();
    }
    else if (!player.onFloor) {
      this.jumping();
    }

    else {
      this.stopClimbing();
    }
    this.hatAnimate();
    this.hairAnimate();
    this.shirtAnimate();
    this.hair1Angle.update();
    this.hair2Angle.update();
    this.hatAngle.update();
    this.leftLegAngle.update();
    this.rightLegAngle.update();
    this.leftShirtAngle.update();
    this.rightShirtAngle.update();
    this.leftArmAngle.update();
    this.rightArmAngle.update();
    this.bibAngle.update();

  }
}

class animationTicker {
  max: number;
  min: number;
  current: number = 0;
  tick: number = 0;
  rest: boolean = false;
  bounceOnMin: boolean = false;
  bounceOnMax: boolean = false;
  goToNuetral: boolean = false;
  hitMin: boolean = false;
  hitMax: boolean = false;
  setMin: boolean = true;
  setMax: boolean = true;

  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }
  update() {
    if (this.hitMin && this.tick < 0)
      this.tick *= -1;
    if (this.hitMax && this.tick > 0) {
      this.tick *= -1;
    }
    const lessThanBefore = this.current < 0;
    this.current += this.tick;
    const greaterOrEqualAfter = this.current >= 0;
    if (lessThanBefore == greaterOrEqualAfter && this.rest) {
      this.current = 0;
    }
    if (this.current <= this.min) {
      if (this.bounceOnMin) {
        this.hitMin = true;
        this.hitMax = false;
      }
      if (this.setMin)
        this.current = this.min;
    }
    if (this.current >= this.max) {
      if (this.bounceOnMax) {
        this.hitMax = true;
        this.hitMin = false;
      }
      if (this.setMax)
        this.current = this.max;
    }
  }
}
class shirtTicker {
  limit: number;
  current: number = 0;
  tick: number = 0;
  onGround: boolean = false;
  constructor(limit: number) {
    this.limit = limit;
  }
  update() {
    const lessThanBefore = this.current < this.limit;

    if (Math.abs(this.current) > Math.abs(this.limit)) {
      this.current += this.tick;
    }
    if (Math.abs(this.current) < Math.abs(this.limit)) {
      this.current -= this.tick;
    }
    const greaterOrEqualAfter = this.current >= this.limit;
    if (lessThanBefore == greaterOrEqualAfter) {
      this.current = this.limit;
    }
  }
}
