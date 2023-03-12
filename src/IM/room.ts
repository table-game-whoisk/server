import WebSocket from "ws";
import { logger } from "../utils/logger";
import { Player } from "./player";

export class Room {
  members = new Set<Player>();
  owner: userId | null = null;
  status: roomStatus = "ready";
  static rooms = new Map<roomId, Room>();
  static findRoom(roomId: string) {
    return Room.rooms.get(roomId);
  }
  static enterRoom(roomId: roomId | undefined, player: Player) {
    if (!roomId) {
      player.sendError("房间号不存在");
      return;
    }
    let room = Room.findRoom(roomId);

    if (!room) {
      room = new Room();
      room.owner = player.userId;
      Room.rooms.set(roomId, room);
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
    if(room?.status!=="playing"){
      room?.members.delete(player);
    }
    room?.members.forEach((p) => {
      p.oninfo();
    });
    player.oninfo();
    if (room?.members.size === 0) {
      Room.destroyRoom(roomId);
    }
  }
  static destroyRoom(roomId: string) {
    Room.rooms.delete(roomId);
  }
}
