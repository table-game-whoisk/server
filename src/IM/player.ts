
import WebSocket from "ws";
import { Room } from "./room";

export class Player {
  userId: string;
  roomId: string | null = null;
  room: Room | null = null;
  ws: WebSocket.WebSocket | null = null;

  constructor(userId: string) {
    this.userId = userId
  }

  static parseMessage(data: WebSocket.RawData) {
    const message = JSON.parse(data.toString()) as MessageData
    return message
  }

  startListen(ws: WebSocket.WebSocket) {
    ws.on("message", (data) => { this.onMessage.call(this, data) })
    ws.on("close", (code, reason) => this.onClose.call(this))
    ws.on("error", (err) => this.onError.call(this, err))
    this.ws = ws
  }
  onMessage(data: WebSocket.RawData) {
    const { type, content } = Player.parseMessage(data)
    switch (type) {
      case "info":
        break;
      case "enter":
        this.enterRoom(content.roomId);
        break;
    }
  }
  
  onClose() {
    this.ws = null
  }
  onError(err: Error) { }
  send(data: MessageData) {
    this.ws?.send(JSON.stringify(data))
  }
  enterRoom(roomId: string) {

  }
  playerInfo() {
    const roomId = this.roomId
    return {
      roomId,
      room: null,
    }
  }
}