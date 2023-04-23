import { TimerTask } from "../utils/timerTask";
import { Player } from "./player";

export interface RoomOption {
  id: string;
  owner: string;
  memberCount?: number;
  subject?: string;
}

export class Room {
  static roomList = new Map<string, Room>();

  id: string;
  members = new Set<Player>();
  owner: string;
  status: RoomStatus = RoomStatus.end;
  memberCount: number;
  subject?: string;
  messages: Message[] = [];

  constructor({ id, owner, memberCount, subject }: RoomOption) {
    this.id = id;
    this.owner = owner;
    this.memberCount = memberCount || 4;
    this.subject = subject;
  }

  static createRoom(roomOptions: RoomOption, player: Player) {
    const room = new Room(roomOptions);
    Room.roomList.set(room.id, room);
    room.addMember(player);
  }
  static destroyRoom(roomId: RoomId) {
    Room.roomList.delete(roomId);
  }
  static findRoom(roomId: RoomId) {
    return Room.roomList.get(roomId) || null;
  }

  setStatus(status: RoomStatus) {
    this.status = status;
    if (status === RoomStatus.addKey) {
      TimerTask.register({
        date: new Date(Date.now() + 1000 * 3),
        action: () => {
          this.members.forEach((player) => player.sendNotice(NoticeType.key));
        }
      });
    } else if (status === RoomStatus.vote) {
      TimerTask.register({
        date: new Date(Date.now() + 1000 * 3),
        action: () => {
          this.members.forEach((player) => player.sendNotice(NoticeType.vote));
        }
      });
    }
    this.members.forEach((player) => player.sendInfo());
  }

  addMember(player: Player) {
    if (this.findMember(player.id)) {
      player.sendEroor("你已经在房间内了");
      return;
    }
    if (this.members.size >= this.memberCount) {
      player.sendEroor("房间已满");
      return;
    }
    if (this.status !== RoomStatus.end) {
      player.sendEroor("该房间在游戏中");
      return;
    }
    player.room = this;
    this.members.add(player);
  }
  findMember(id: PlayerId): Player | null {
    let player: Player | null = null;
    this.members.forEach((p) => {
      if (p.id === id) {
        player = p;
      }
    });
    return player;
  }
  removeMember(player: Player) {
    this.members.forEach((p) => {
      if (player.id === p.id) {
        this.members.delete(p);
      }
    });
  }
  disslove() {
    this.members.forEach((player) => {
      player.setStatus(PlayerStatus.online);
      player.room = null;
      // 通知玩家
      this.members.delete(player);
    });
  }
  getInfo(): RoomInfo {
    const { id, members, messages, owner, memberCount, subject, status } = this;
    let membersInfo: PlayerInfo[] = [];
    members.forEach(({ id, avatar, status, nickname }) => membersInfo.push({ id, avatar, status, nickname }));
    return { id, members: membersInfo, messages, owner, memberCount, subject, status };
  }
  notice() {}

  addMessage(text: string, player?: Player, type?: NoticeType.key | NoticeType.vote) {
    const messageFrom = {
      id: player ? player.id : "0",
      nickname: player ? player.nickname : "system",
      avatar: player ? player.avatar : ""
    };

    this.messages.push({
      timestamp: Date.now(),
      type,
      messageFrom,
      message: text
    });
    this.members.forEach((player) => player.sendInfo());
  }

  // static findRoom(roomId: string) {
  //   return Room.roomList.get(roomId);
  // }
  // static createRoom(roomId: string, number: number, player: Player) {
  //   if (Room.roomList.has(roomId)) {
  //     player.sendError("房间已存在");
  //     return;
  //   }
  //   const room = new Room();
  //   room.memberCount = number;
  //   room.id = roomId;
  //   room.owner = player.id;
  //   Room.roomList.set(roomId, room);
  //   Room.enterRoom(roomId, player);
  // }
  // static enterRoom(roomId: string, player: Player) {
  //   let room = Room.findRoom(roomId);
  //   if (!room) {
  //     player.sendError("房间不存在");
  //     return;
  //   }
  //   if (room.status === roomStatus.playing) {
  //     player.sendError("该房间已开始游戏");
  //     return;
  //   }
  //   if (room.members.size < room.memberCount) {
  //     room.members.add(player);
  //     player.room = room;
  //   } else {
  //     player.sendError("房间已满");
  //   }
  //   room.members.forEach((player) => {
  //     player.sendInfo();
  //   });
  // }
  // static exitRoom(roomId: string, player: Player) {
  //   const room = Room.roomList.get(roomId);
  //   if (!room) return;
  //   room.members.delete(player); //删掉断开的用户
  //   if (room?.members.size === 0) {
  //     Room.destroyRoom(roomId, room);
  //   } else {
  //     // 重新任命房主
  //     if (room.owner === player.id) {
  //       const newPlayer = [...room.members][0];
  //       room.owner = newPlayer.id;
  //     }
  //     room.members.forEach((player) => player.sendInfo());
  //   }
  // }
  // static destroyRoom(roomId: string, room: Room) {
  //   Room.roomList.delete(roomId);
  // }
  // static start(roomId: string) {
  //   const room = Room.findRoom(roomId);
  //   if (!room) return;
  //   if (!room.game) {
  //     room.game = new Game(room);
  //   }
  //   room.setRoomStatus(roomStatus.playing);
  // }

  // getMembers(): PlayerInfo[] | null {
  //   if (this.members.size > 0) {
  //     return [...this.members].map((player) => player.rawInfo());
  //   }
  //   return null;
  // }
  // rawInfo(): RoomInfo | null {
  //   const { id, owner, messages, status } = this;
  //   if (!id) return null;
  //   return {
  //     id,
  //     owner,
  //     members: this.getMembers(),
  //     messageList: messages,
  //     status
  //   };
  // }
  // setRoomStatus(status: roomStatus) {
  //   this.status = status;
  //   this.members.forEach((player) => {
  //     player.sendInfo();
  //   });
  // }
  // onMessage(data: ReceiveData<messageType.message>, player?: Player) {
  //   const { content } = data;
  //   if (!content) return;
  //   if (player && this.game?.checkMessage(content, player)) return;
  //   this?.messages.push({
  //     timestamp: Date.now(),
  //     messageFrom: player?.rawInfo() || {
  //       id: "0",
  //       nickname: "system",
  //       avatar: null,
  //       status: ""
  //     },
  //     message: content
  //   });
  //   this.members.forEach((player) => player.sendInfo());
  // }
  // roomNotice(text: string) {
  //   this.onMessage({ type: messageType.message, content: text });
  // }
}
