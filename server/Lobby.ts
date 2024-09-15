import generateUniqueId from "generate-unique-id";
import { User } from "./User";
import { sendMessage } from "./websockets";
import { Message } from "../shared/Message";
import { Constants } from "../shared/constants";
import { deleteLobby } from "./users";

export class Lobby {
  users: { [key: string]: User };
  creator: User;
  id: string;
  inGame: boolean;
  constructor(id: string, creator: User) {
    this.users = {};
    this.users[creator.id] = creator;
    this.id = id;
    this.creator = creator;
    this.inGame = false;
    this.sendUpdate();
  }
  addUser(user: User) {
    this.users[user.id] = user;
    this.sendUpdate();
  }
  removeUser(id: string) {
    delete this.users[id];
    if (this.creator.id == id) {
      var us = Object.values(this.users);
      if (us.length > 0) {
        this.creator = Object.values(this.users)[0];
      }
      else
        this.deleteSelf();
    }
    this.sendUpdate();
  }
  deleteSelf() {
    deleteLobby(this.id);
  }
  sendUpdate() {
    Object.keys(this.users).forEach(id => {
      sendMessage(id, new Message(Constants.MSG_TYPES.LOBBY_UPDATE,
        {
          crew: Object.values(this.users).map((user) => { return user.name; }),
          captain: this.creator.id,
          ids: Object.keys(this.users),
        }));
    });
  }

}


