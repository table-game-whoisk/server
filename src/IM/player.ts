
import WebSocket from "ws";
import { Room } from "./room";

export class Player {
  userId: string;
  roomId: string | null = null;
  room: Room | null = null;
  ws: WebSocket.WebSocket | null = null;
  timer: NodeJS.Timer | null = null;
  status: "offline" | "online" | "ready" | "playing" = "online"

  constructor(userId: string) {
    this.userId = userId
  }

  startListen(ws: WebSocket.WebSocket) {
    this.status = "online"
    this.timer = setInterval(() => {
      ws.ping()
    }, 1000)
    ws.on("pong", () => { })
    ws.on("close", (code, reason) => this.onClose.call(this))
    ws.on("error", (err) => this.onError.call(this, err))
    this.ws = ws
  }
  private send(data: MessageData) {
    this.ws?.send(JSON.stringify({ ...data, from: this.userId, timestamp: Date.now(), }))
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
      case "start":
        this.sendStart();
        break;
      case "message":
        this.send(data);
        break;
    }
  }
  senInfo() {
    const { room, roomId, userId, status } = this
    this.send({
      type: "info", content: {
        room: {
          ...room,
          roomId,
          members: [...room?.members || []].map((p) => p.userId)
        },
        player: {
          status,
          id: userId,
        }
      }
    })
  }
  sendStart() {
    const { room } = this
    if (!room) {
      this.sendError("当前还未加入任何房间")
      return
    }
    this.status = "ready"
    const isAllready = [...room?.members || []].every((item) => item.status === "ready")
    room.status = isAllready ? "playing" : "open"
    room.members.forEach((item) => {
      if (item.room?.owner === item.userId && !isAllready) {
        item.sendError("还有玩家未准备就绪")
      }
      item.senInfo()
    })
  }
  sendError(msg: string) {
    this.send({ type: "error", msg })
  }
  onClose() {
    this.ws = null
    this.timer && clearInterval(this.timer)
    this.timer = null
    this.status = "offline"
  }
  onError(err: Error) { }
}