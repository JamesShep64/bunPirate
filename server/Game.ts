import generateUniqueId from "generate-unique-id";
import { Action, Message, mouseEvent } from "../shared/Message";
import { Block } from "./Block";
import { God } from "./God";
import { sendUpdate } from "./users";

export class Game {
  users: string[];
  gods: { [key: string]: God };
  blocks: { [key: string]: Block };
  constructor() {
    this.gods = {};
    this.blocks = {};
    this.users = [];
    setInterval(this.update.bind(this), 1000 / 30);
  }
  //these functions have to do with the god users
  //***********************************************************
  addGod(id: string) {
    this.users.push(id);
    this.gods[id] = (new God(id));
  }
  handleMouseMove(action: Action) {
    const val = action.value as mouseEvent;
    this.gods[action.id].updatePosition(val.x, val.y);
  }
  handleMouseClick(action: Action) {
    const val = action.value as mouseEvent;
    this.gods[action.id].changePlacePoint(val.x, val.y);
  }
  godAddBlock(id: string) {
    const blockID = generateUniqueId({ length: 8 });
    this.blocks[blockID] = new Block(blockID, this.gods[id].placePoint.x, this.gods[id].placePoint.y, 50, 50);
  }
  //************************************************************
  update() {
    this.users.forEach((id: string) => {
      this.createUpdate(id);
    });

  }
  createUpdate(id: string) {
    const otherGods = Object.keys(this.gods).filter((key: string) => key !== id).map((key) => this.gods[key]);
    sendUpdate(id,
      {
        time: Date.now(),
        me: this.gods[id].serializeForUpdate(),
        otherGods: otherGods.map((god) => god.serializeForUpdate()),
        blocks: Object.values(this.blocks).map((block) => block.serializeForUpdate()),
      });

  }
}



