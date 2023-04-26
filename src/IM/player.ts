import WebSocket from "ws";
import { Room } from "./room";
import { logger } from "../utils/logger";
import { generateRandomKey } from "../utils";

export class Player implements PlayerInfo {
  id: string;
  avatar: string;
  nickname: string;
  status: PlayerStatus = PlayerStatus.online;
  ws: WebSocket.WebSocket | null = null;

  room: Room | null = null;
  role: "undercover" | "civilian" = "civilian";
  key: string | null = null;
  voteCount: number = 0;
  isVoted: boolean = true;

  constructor(info: UserProp) {
    const { id, nickname, avatar } = info;
    this.id = id;
    this.nickname = nickname;
    this.avatar = avatar;
  }

  static link(ws: WebSocket.WebSocket, player: Player) {
    player.ws = ws;
    player.reLink();
    ws.on("close", (code, reason) => player.onOffline());
    ws.on("error", (err) => logger.error(`ws connect error [${err.message}]`));
    player.sendInfo();
  }

  static messageHandler(data: ReceviceMessage<ReceiveType>, player: Player) {
    const { type } = data;
    switch (type) {
      case ReceiveType.info:
        player.sendInfo;
        break;
      case ReceiveType.create:
      case ReceiveType.join:
        player.handleEnterRoom(data);
        break;
      case ReceiveType.exit:
        player.handleExitRoom();
        break;
      case ReceiveType.ready:
        player.setStatus(PlayerStatus.ready);
        break;
      case ReceiveType.start:
        player.handleStart();
        break;
      case ReceiveType.message:
        player.handleMessage(data);
        break;
      case ReceiveType.key:
        player.handleKey(data);
        break;
      case ReceiveType.vote:
        player.handleVote(data);
        break;
      case ReceiveType.disslove:
        player.handleDeisslove();
        break;
      default:
        break;
    }
  }

  private sendMessage<T extends SendType>(data: SendMessage<T>) {
    try {
      this.ws?.send(JSON.stringify({ ...data, timestamp: Date.now() }));
    } catch (e) {
      logger.error(`send message error`);
    }
  }

  reLink() {}
  onOffline() {
    if (this.room) {
      // 意外断开处理
      // 通知房间内其他玩家，房间等待玩家重连，超时解散房间
      if (this.status === PlayerStatus.online) {
        this.room.removeMember(this);
        this.room = null;
      }
    } else {
      this.room = null;
      this.setStatus(PlayerStatus.online);
    }
    this.ws = null;
  }

  setStatus(status: PlayerStatus) {
    const { room } = this;
    if (status === PlayerStatus.ready && !room) {
      this.sendEroor("请先加入一个房间");
      return;
    }
    this.status = status;
    room?.members.forEach((player) => player.sendInfo());
  }

  handleEnterRoom(data: ReceviceMessage<ReceiveType.create | ReceiveType.join>) {
    const { type } = data;
    if (type === ReceiveType.create) {
      const { content } = data as ReceviceMessage<ReceiveType.create>;
      if (this.room) {
        this.sendEroor("你已经在房间内，不能创建房间");
        return;
      }
      Room.createRoom({ ...content, owner: this.id }, this);
    } else if (type === ReceiveType.join) {
      const { content } = data as ReceviceMessage<ReceiveType.join>;
      const room = Room.findRoom(content);
      if (!room) {
        this.sendEroor("房间不存在");
        return;
      }
      room.addMember(this);
    }
  }
  handleExitRoom() {
    const { room } = this;
    room?.removeMember(this);
    this.room = null;
    this.setStatus(PlayerStatus.online);
  }
  handleStart() {
    const { room } = this;
    if (!room) return;
    if (room.owner !== this.id) {
      this.sendEroor("只有房主才能开始游戏");
      return;
    }
    if (room.status !== RoomStatus.end) {
      this.sendEroor("房间已经开始游戏了");
      return;
    }
    if (room.members.size < room.memberCount) {
      this.sendEroor(`房间不足${room.memberCount}人`);
      return;
    }
    let readyCount = 0;
    room.members.forEach((player) => {
      if (player.status === PlayerStatus.ready) {
        readyCount += 1;
      }
    });
    if (readyCount !== room.memberCount) {
      this.sendEroor("还有玩家未准备好");
      return;
    }
    room.members.forEach((player) => {
      player.status = PlayerStatus.playing;
    });
    room.addMessage("开始游戏");
    room.setStatus(RoomStatus.addKey);
  }
  handleMessage(data: ReceviceMessage<ReceiveType.message>) {
    const { content } = data;
    if (!content) return;
    const { room } = this;
    if (!room) return;
    room.addMessage(content, this);
  }
  handleKey(data: ReceviceMessage<ReceiveType.key>) {
    const { content } = data;
    if (this.room) {
      this.room.status === RoomStatus.addKey && this.room.setMembersRole(content, this);
    }
  }
  handleVote(data: ReceviceMessage<ReceiveType.vote>) {
    const { content } = data;
    if (this.status !== PlayerStatus.playing || this.isVoted) {
      this.sendEroor("现在不能投票");
      return;
    }
    this.isVoted = true;
    this.room?.handleVote(content, this);
  }
  handleDeisslove() {
    if (this.room) {
      if (this.id !== this.room.owner) {
        this.sendEroor("只有房主才能解散房间");
        return;
      }
      Room.destroyRoom(this.room.id);
      this.room.members.forEach((player) => {
        player.resetPlayer();
        this.room?.removeMember(player);
        player.room = null;
        player.sendInfo();
      });
      this.room = null;
    }
  }
  sendInfo() {
    const { id, nickname, avatar, status, room, key, role } = this;
    this.sendMessage<SendType.info>({
      type: SendType.info,
      content: { id, nickname, avatar, status, room: room?.getInfo() || null, key, role }
    });
  }
  sendEroor(message: string) {
    this.sendMessage<SendType.error>({ type: SendType.error, content: message });
  }
  sendNotice(notice: NoticeType) {
    this.sendMessage<SendType.notice>({ type: SendType.notice, content: notice });
  }
  resetPlayer() {
    this.key = null;
    this.isVoted = true;
    this.status = PlayerStatus.online;
    this.voteCount = 0;
    this.role = "civilian";
  }
}
