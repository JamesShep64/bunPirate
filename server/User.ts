import { Lobby } from "./Lobby";

export class User {
  id: string;
  name: string;
  lobby: Lobby | undefined;
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
