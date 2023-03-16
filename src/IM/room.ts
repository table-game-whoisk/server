import WebSocket from "ws";
import { logger } from "../utils/logger";
import { Player } from "./player";

export class Room {
  members = new Set<Player>();
  owner: userId | null = null;
  status: roomStatus = "ready";
  messages: Message[] = [];
  gameStep: Game.gameStep | null = null;
  currRound: userId | null = null;

  static rooms = new Map<roomId, Room>();
  static findRoom(roomId: string) {
    return Room.rooms.get(roomId);
  }
  getMembers() {
    if (this.members.size > 0) {
      return [...this.members].map(({ userId, status, nickname, avatarUrl }) => ({
        id: userId,
        status,
        nickname,
        avatarUrl
      }));
    }
    return null;
  }
  static createRoom(roomId: string | undefined, player: Player) {
    if (!roomId) return;
    if (Room.rooms.has(roomId)) {
      player.sendError("房间已存在");
    } else {
      const room = new Room();
      room.owner = player.userId;
      Room.rooms.set(roomId, room);
      Room.enterRoom(roomId, player);
    }
  }
  static enterRoom(roomId: roomId | undefined, player: Player) {
    if (!roomId) return;
    let room = Room.findRoom(roomId);
    if (!room) {
      player.sendError("房间不存在");
      return;
    }
    if (room.status === "playing") {
      player.sendError("该房间已开始游戏");
      return;
    }
    if (room.members.size < 10) {
      room.members.add(player);
      player.roomId = roomId;
      player.room = room;
    } else {
      player.sendError("房间已满");
    }
    room.members.forEach((p) => {
      p.oninfo();
    });
  }
  static exitRoom(roomId: roomId, player: Player) {
    const room = Room.rooms.get(roomId);
    room?.members.delete(player); //删掉断开的用户
    if (room?.members.size === 0) {
      Room.destroyRoom(roomId, room);
    } else {
      if (room?.owner === player.userId) {
        const newPlayer = [...room.members][0];
        room.owner = newPlayer.userId;
      }
    }
    // 重新任命房主
  }
  static destroyRoom(roomId: string, room: Room) {
    Room.rooms.delete(roomId);
  }
}
