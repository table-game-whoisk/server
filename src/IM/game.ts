import { Room } from "./room";

export class Game {
  status: GameStatus;

  constructor(room: Room) {
    this.status = GameStatus.role;
    room.setRoomStatus(roomStatus.playing);
  }
  setGameStatus() {}
  run() {}

  // sendSystemMessage(message: string) {
  //   this.messages.push({
  //     timestamp: Date.now(),
  //     messageFrom: {
  //       id: "0",
  //       nickname: "system",
  //       avatarUrl: "",
  //       character: null,
  //       cardList: [],
  //       status: ""
  //     },
  //     message
  //   });
  //   this.members.forEach((item) =>
  //     item.send({
  //       type: "message",
  //       room: this.rawInfo(),
  //       messages: this.messages
  //     })
  //   );
  // }
}
