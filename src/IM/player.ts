
import WebSocket from "ws";
import { Room } from "./room";

export class Player {
  userId: string;
  roomId: string | null = null;
  ws: WebSocket.WebSocket;
  room: Room | undefined;

  constructor(userId: string, ws: WebSocket.WebSocket) {
    this.userId = userId
    ws.on("message", (data) => this.messageParse(data))
    this.ws = ws
  }
  private messageParse(data: WebSocket.RawData) {
    const message = JSON.parse(data.toString()) as MessageData
    const { type, content } = message
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
  private send(type: MessageData["type"], content: MessageData["content"]) {
    this.ws.send(JSON.stringify({ type, content }))
  }
  getPlayer() {
    let roomId = this.roomId
    this.send("info", { roomId })
  }
  enterRoom(roomId: string) {
    this.roomId = roomId
  }
  exitRoom(roomId: string) {
    this.roomId = null
    this.ws.close()
  }
}