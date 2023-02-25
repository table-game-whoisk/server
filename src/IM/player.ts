
import WebSocket from "ws";
import { Room } from "./room";

export class Player {
  userId: string;
  roomId: string | null = null;
  room: Room | null = null;
  ws: WebSocket.WebSocket | null = null;
  timer: NodeJS.Timer | null = null;
  isOffline: boolean = true

  constructor(userId: string) {
    this.userId = userId
  }

  startListen(ws: WebSocket.WebSocket) {
    this.isOffline = false
    this.timer = setInterval(() => {
      ws.ping()
    }, 1000)
    ws.on("pong", () => { })
    ws.on("close", (code, reason) => this.onClose.call(this))
    ws.on("error", (err) => this.onError.call(this, err))
    this.ws = ws
  }
  private send(data: MessageData) {
    this.ws?.send(JSON.stringify(data))
  }
  onMessage(data: MessageData) {
    const { type, content, roomId, to, from } = data
    switch (type) {
      case "info":
        this.senInfo()
        break;
      case "enter":
        Room.enterRoom(roomId, this)
        break;
      case "message":
        this.send(data);
        break;
    }
  }
  senInfo() {
    const { room, roomId, userId } = this
    const members = [...room?.members || []].map((p) => p.userId)
    this.send({ type: "info", from: userId, timestamp: Date.now(), content: { members, roomId } })
  }
  sendError(msg: string) {
    this.send({ type: "error", msg })
  }
  onClose() {
    this.ws = null
    this.timer && clearInterval(this.timer)
    this.timer = null
    this.isOffline = true
  }
  onError(err: Error) { }
}