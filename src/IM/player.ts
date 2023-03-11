import WebSocket from "ws";
import { Room } from "./room";

export class Player {
  userId: userId;
  roomId: string | null = null;
  room: Room | null = null;
  ws: WebSocket.WebSocket | null = null;
  status: playerStatus = "online";

  constructor(userId: userId) {
    this.userId = userId;
  }

  startListen(ws: WebSocket.WebSocket) {
    this.status = this.room?.status === "playing" ? "playing" : "online";
    ws.on("close", (code, reason) => this.handleClose.call(this));
    ws.on("error", (err) => this.handleError.call(this, err));
    this.ws = ws;

    this.oninfo();
  }
  private send(data: MessageData) {
    this.ws?.send(JSON.stringify({ ...data, from: this.userId, timestamp: Date.now() }));
  }
  private handleClose() {
    this.ws = null;
    this.status = "offline";
    this.onexit();
  }
  // ws 错误
  private handleError(err: Error) {}
  static dispatchMessage(data: MessageData, player: Player | undefined) {
    if (!player) return;
    const { type } = data;
    player[`on${type}`]?.call(player, data);
  }

  oninfo(data?: MessageData) {
    const { room, roomId, userId, status } = this;
    this.send({
      type: "info",
      content: {
        room: {
          ...room,
          roomId,
          members: [...(room?.members || [])].map(({ userId, status }) => ({ id: userId, status }))
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
    room.status = isAllready && room?.members.size > 4 ? "ready" : "playing";
    room.members.forEach((item) => {
      item.oninfo();
    });
  }
  onmessage(data: MessageData) {
    this.room?.members.forEach((item) => item.send(data));
  }
  // 客户端返回错误
  onerror(data: MessageData) {}
  onexit() {
    if (!this.roomId) return;
    if (this.room?.status !== "playing") {
      Room.exitRoom(this.roomId, this);
    }
  }
  // 发送错误信息
  sendError(msg: string) {
    this.send({ type: "error", msg });
  }
}
