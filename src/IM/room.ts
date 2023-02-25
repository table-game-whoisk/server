import WebSocket from "ws";
import { logger } from "../utils/logger";
import { Player } from "./player";

export class Room {
  members = new Set<Player>()
  owner: UserId | null = null
  status: "online" | "ready" | "playing" = "online"
  static rooms = new Map<roomId, Room>()
  static findRoom(roomId: string) {
    return Room.rooms.get(roomId)
  }
  static enterRoom(roomId: roomId | undefined, player: Player) {
    if (!roomId) {
      player.sendError("房间号不存在")
      return
    }
    let room = Room.findRoom(roomId)
    if (!room) {
      room = new Room()
      room.owner = player.userId
      Room.rooms.set(roomId, room)
    }
    if (room.members.size < 10) {
      room.members.add(player)
      player.roomId = roomId
      player.room = room
    } else {
      player.sendError("房间已满")
    }
    player.senInfo.call(player)
  }
  static destroyRoom(roomId: string) {
    Room.rooms.delete(roomId)
  }
}
