import WebSocket from "ws";
import { TimerTask } from "../utils/timerTask";
import { Room } from "./room";

export class Player {
  avatarUrl: string | null = null;
  nickname: string | null = null;
  status: playerStatus = "online";
  userId: userId;
  roomId: string | null = null;
  room: Room | null = null;
  ws: WebSocket.WebSocket | null = null;

  constructor({ userId, avatarUrl, nickname }: { userId: userId; avatarUrl: string | null; nickname: string | null }) {
    this.userId = userId;
    this.avatarUrl = avatarUrl || null;
    this.nickname = nickname || null;
  }

  startListen(ws: WebSocket.WebSocket) {
    if (this.room?.status === "playing") {
      this.status = "playing";
      this.room.members.forEach((p) => p.oninfo());
    } else {
      this.status = "online";
    }
    ws.on("close", (code, reason) => this.onexit.call(this));
    ws.on("error", (err) => this.handleError.call(this, err));
    this.ws = ws;
    this.oninfo();
  }
  private send(data: MessageData) {
    this.ws?.send(JSON.stringify({ ...data, from: this.userId, timestamp: Date.now() }));
  }
  // ws 错误
  private handleError(err: Error) {}
  static dispatchMessage(data: MessageData, player: Player | undefined) {
    if (!player) return;
    const { type } = data;
    player[`on${type}`]?.call(player, data);
  }
  oninfo(data?: MessageData) {
    const { room, roomId, userId, status, avatarUrl, nickname } = this;
    this.send({
      type: "info",
      player: { status, id: userId, avatarUrl, nickname },
      room: room
        ? {
            roomId,
            status: room?.status || null,
            owner: room?.owner || null,
            members: room.getMembers()
          }
        : null
    });
  }
  oncreate(data: MessageData) {
    const { roomId } = data;
    Room.createRoom(roomId, this);
  }
  onenter(data: MessageData) {
    const { roomId } = data;
    Room.enterRoom(roomId, this);
  }
  onstart() {
    const { room } = this;
    if (!room) {
      this.sendError("当前还未加入任何房间");
      return;
    }
    const isAllready = [...(room?.members || [])].every((item) => item.status === "ready");
    if (room.owner !== this.userId) {
      this.sendError("只有房主才能开始游戏");
      return;
    } else if (!isAllready) {
      this.sendError("还有玩家未准备");
      return;
    } else if (room?.members.size < 4) {
      this.sendError("玩家小于4人");
      return;
    }
    room.status = "playing";
    room.members.forEach((item) => {
      item.status = "playing";
      item.oninfo();
    });
  }
  onready(data: MessageData) {
    const { room } = this;
    if (!room) {
      this.sendError("当前还未加入任何房间");
      return;
    }
    this.status = "ready";
    room.members.forEach((item) => {
      item.oninfo();
    });
  }
  onmessage(data: MessageData) {
    const { to, content } = data;
    const { userId, roomId, status: playerStatus, avatarUrl, nickname } = this;
    if (!roomId) return;
    const room = Room.rooms.get(roomId);
    if (!room) return;
    const { status, owner, messages } = room;
    room?.messages.push({
      messageFrom: { status: playerStatus, id: userId, avatarUrl, nickname },
      to,
      timestamp: Date.now(),
      message: content
    });
    room?.members.forEach((item) =>
      item.send({
        type: "message",
        room: {
          roomId,
          status,
          owner,
          members: room.getMembers()
        },
        messages
      })
    );
  }
  ongetMessage() {
    const { userId, roomId, status: playerStatus, avatarUrl, nickname } = this;
    if (!roomId) return;
    const room = Room.rooms.get(roomId);
    if (!room) return;
    const { status, owner, messages } = room;
    this.send({
      type: "message",
      room: {
        roomId,
        status,
        owner,
        members: room.getMembers()
      },
      messages
    });
    return;
  }
  // 客户端返回错误
  onerror(data: MessageData) {}
  onexit() {
    if (!this.roomId) return;
    const room = Room.rooms.get(this.roomId);
    if (this.room?.status === "ready" && this.status === "online") {
      Room.exitRoom(this.roomId, this);
      this.room = null;
      this.roomId = null;
    }
    this.status = "offline";
    this.ws = null;
    room?.members.forEach((p) => {
      p.oninfo();
    });
  }
  // 发送错误信息
  sendError(msg: string) {
    this.send({ type: "error", msg });
  }
}
