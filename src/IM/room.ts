import WebSocket from "ws";
import { logger } from "../utils/logger";
import { Player } from "./player";
import { Game } from "./game";

export class Room {
  static roomList = new Map<string, Room>();
  id: string | null = null;
  members = new Set<Player>();
  owner: string | null = null;
  game: Game | null = null;
  status: roomStatus = roomStatus.ready;
  memberCount: number = 4;
  messages: Message[] = [];

  static findRoom(roomId: string) {
    return Room.roomList.get(roomId);
  }
  static createRoom(roomId: string, number: number, player: Player) {
    if (Room.roomList.has(roomId)) {
      player.sendError("房间已存在");
      return;
    }
    const room = new Room();
    room.memberCount = number;
    room.id = roomId;
    room.owner = player.id;
    Room.roomList.set(roomId, room);
    Room.enterRoom(roomId, player);
  }
  static enterRoom(roomId: string, player: Player) {
    let room = Room.findRoom(roomId);
    if (!room) {
      player.sendError("房间不存在");
      return;
    }
    if (room.status === roomStatus.playing) {
      player.sendError("该房间已开始游戏");
      return;
    }
    if (room.members.size < room.memberCount) {
      room.members.add(player);
      player.room = room;
    } else {
      player.sendError("房间已满");
    }
    room.members.forEach((player) => {
      player.sendInfo();
    });
  }
  static exitRoom(roomId: string, player: Player) {
    const room = Room.roomList.get(roomId);
    if (!room) return;
    room.members.delete(player); //删掉断开的用户
    if (room?.members.size === 0) {
      Room.destroyRoom(roomId, room);
    } else {
      // 重新任命房主
      if (room.owner === player.id) {
        const newPlayer = [...room.members][0];
        room.owner = newPlayer.id;
      }
      room.members.forEach((player) => player.sendInfo());
    }
  }
  static destroyRoom(roomId: string, room: Room) {
    Room.roomList.delete(roomId);
  }
  static start(roomId: string) {
    const room = Room.findRoom(roomId);
    if (!room) return;
    if (!room.game) {
      room.game = new Game(room);
    }
    room.setRoomStatus(roomStatus.playing);
  }

  getMembers(): PlayerInfo[] | null {
    if (this.members.size > 0) {
      return [...this.members].map((player) => player.rawInfo());
    }
    return null;
  }
  rawInfo(): RoomInfo | null {
    const { id, owner, messages, status } = this;
    if (!id) return null;
    return {
      id,
      owner,
      members: this.getMembers(),
      messageList: messages,
      status
    };
  }
  setRoomStatus(status: roomStatus) {
    this.status = status;
    this.members.forEach((player) => {
      player.sendInfo();
    });
  }
  onMessage(data: MessageData<messageType.message>) {
    const { content } = data;
    this?.messages.push(content);
    this.members.forEach((player) => player.sendInfo());
  }
}
