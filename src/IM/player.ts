
import WebSocket from "ws";
import { Room } from "./room";

export class Player {
  userId: string;
  roomId: string | undefined;
  ws: WebSocket.WebSocket;
  room: Room | undefined
  constructor(userId: string, ws: WebSocket.WebSocket) {
    this.userId = userId
    this.ws = ws
  }
  messageParse(data: WebSocket.RawData) {
    const message = JSON.parse(data.toString()) as MessageData
    const { type, content } = message
    console.log(message)
    switch (type) {
      case "info":
        this.getPlayer()
        break;
      case "enter":
        this.enterRoom("111")
        break;
      case "exit":
        this.exitRoom("erere")
        break;
      default:
        break;
    }
  }
  getPlayer() {
    let roomId = this.roomId
    console.log(roomId)
    this.ws.send(JSON.stringify({ type: "info", roomId }))
  }
  enterRoom(roomId: string) {
    this.roomId = roomId
  }
  exitRoom(roomId: string) {
    this.roomId = undefined
  }

}