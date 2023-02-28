import WebSocket from "ws";
import { Room } from "./room";

export class Player {
  userId: userId;
  roomId: string | null = null;
  room: Room | null = null;
  ws: WebSocket.WebSocket | null = null;
  timer: NodeJS.Timer | null = null;
  status: "offline" | "online" | "ready" | "playing" = "online";

  constructor(userId: userId) {
    this.userId = userId;
  }

  startListen(ws: WebSocket.WebSocket) {
    this.status = "online";
    this.timer = setInterval(() => {
      ws.ping();
    }, 1000);
    ws.on("pong", () => {});
    ws.on("close", (code, reason) => this.handleClose.call(this));
    ws.on("error", (err) => this.handleError.call(this, err));
    this.ws = ws;
  }
  private send(data: MessageData) {
    this.ws?.send(JSON.stringify({ ...data, from: this.userId, timestamp: Date.now() }));
  }
  private handleClose() {
    this.ws = null;
    this.timer && clearInterval(this.timer);
    this.timer = null;
    this.status = "offline";
  }
  private handleError(err: Error) {}
  static dispatchMessage(data: MessageData, player: Player | undefined) {
    if (!player) return;
    const { type } = data;
    player[`on${type}`].call(player, data);
  }
  oninfo(data?: MessageData) {
    const { room, roomId, userId, status } = this;
    this.send({
      type: "info",
      content: {
        room: {
          ...room,
          roomId,
          members: [...(room?.members || [])].map((p) => p.userId)
        },
        player: {
          status,
          id: userId
        }
      }
    });
  }
  onenter(data: MessageData) {
    const { type, content, roomId, to, from } = data;
    Room.enterRoom(roomId, this);
  }
  onstart(data: MessageData) {
    const { room } = this;
    if (!room) {
      this.sendError("当前还未加入任何房间");
      return;
    }
    this.status = "ready";
    const isAllready = [...(room?.members || [])].every((item) => item.status === "ready");
    room.status = isAllready ? "playing" : "open";
    room.members.forEach((item) => {
      if (item.room?.owner === item.userId && !isAllready) {
        item.sendError("还有玩家未准备就绪");
      }
      item.oninfo();
    });
  }
  oncharacter(data: MessageData) {
    const { content } = data;
  }
  onmessage(data: MessageData) {
    this.room?.members.forEach((item) => item.send(data));
  }
  onerror(data: MessageData) {}
  onexit(data: MessageData) {}
  sendError(msg: string) {
    this.send({ type: "error", msg });
  }
}
