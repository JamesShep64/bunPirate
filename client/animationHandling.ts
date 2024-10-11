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
export class PlayerAnimation {
  player: playerUpdate;
  hair1Angle: animationTicker;
  hair2Angle: animationTicker;
  hatAngle: animationTicker;
  leftLegAngle: animationTicker;
  rightLegAngle: animationTicker;
  leftShirtAngle: animationTicker;
  rightShirtAngle: animationTicker;
  leftArmAngle: animationTicker;
  rightArmAngle: animationTicker;
  bibAngle: animationTicker;
  constructor(playerUpdate: playerUpdate) {
    this.player = playerUpdate;
    this.hair1Angle = new animationTicker(-.3, .3);
    this.hair2Angle = new animationTicker(-.3, .3);
    this.hatAngle = new animationTicker(-.1, .1);
    this.leftLegAngle = new animationTicker(-.5, .5);
    this.rightLegAngle = new animationTicker(-.5, .5);
    this.leftShirtAngle = new animationTicker(-.2, .2);
    this.rightShirtAngle = new animationTicker(-.2, .2);
    this.leftArmAngle = new animationTicker(-.5, .5);
    this.rightArmAngle = new animationTicker(-.5, .5);
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

  stopWalking() {
    this.leftLegAngle.rest = true;
    this.rightLegAngle.rest = true;
  }
  update(player: playerUpdate) {
    this.player = player;
    if (player.movingRight) {
      this.walkRight();
    }
    else if (player.movingLeft) {
      this.walkLeft();
    }
    else {
      this.stopWalking();
    }
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
      this.current = this.min;
    }
    if (this.current >= this.max) {
      if (this.bounceOnMax) {
        this.hitMax = true;
        this.hitMin = false;
        console.log("MAX", this.tick);
      }
      this.current = this.max;
    }
  }
}
