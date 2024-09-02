import { Action, Message, mouseMove } from "../shared/Message";
import { God } from "./God";
import { sendUpdate } from "./users";

export class Game {
  users: string[];
  gods: { [key: string]: God };
  constructor() {
    this.gods = {};
    this.users = [];
    setInterval(this.update.bind(this), 1000 / 30);
  }
  addGod(id: string): void {
    this.users.push(id);
    this.gods[id] = (new God(id));
  }
  handleMouseMove(action: Action) {
    const val = action.value as mouseMove;
    this.gods[action.id].updatePosition(val.x, val.y);
  }
  update() {
    this.users.forEach((id: string) => {
      this.createUpdate(id);
    });

  }
  createUpdate(id: string) {
    sendUpdate(id,
      {
        time: Date.now(),
        me: this.gods[id].serializeForUpdate()
      });

  }
}



