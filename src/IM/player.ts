import WebSocket from "ws";
import { TimerTask } from "../utils/timerTask";
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
      case ReceiveType.continue:
        player.handleContinue();
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
    this.key = content;
    let hasKeyCount = 0;
    this.sendInfo();
    this.room?.members.forEach((player) => {
      if (player.key) {
        hasKeyCount += 1;
      }
    });
    if (hasKeyCount === this.room?.memberCount) {
      this.room.setMembersRole();
      this.room.setStatus(RoomStatus.round);
    }
  }
  handleVote(data: ReceviceMessage<ReceiveType.vote>) {}
  handleContinue() {}
  handleDeisslove() {}

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

  resetInfo() {}

  // static handleMessage<T extends messageType>(data: ReceiveData<T>, player: Player) {
  //   switch (data.type) {
  //     case messageType.info:
  //       player.sendInfo();
  //       break;
  //     case messageType.createRoom:
  //       player.onCreateRoom(data as ReceiveData<messageType.createRoom>);
  //       break;
  //     case messageType.joinRoom:
  //       player.onJoinRoom(data as ReceiveData<messageType.joinRoom>);
  //       break;
  //     case messageType.ready:
  //       player.setPlayerStatus(PlayerStatus.ready);
  //       break;
  //     case messageType.start:
  //       player.onStart(data as ReceiveData<messageType.start>);
  //       break;
  //     case messageType.message:
  //       player.room?.onMessage(data as ReceiveData<messageType.message>, player);
  //       break;
  //     case messageType.round:
  //       player.onRound();
  //     default:
  //       break;
  //   }
  // }

  // private send<T extends messageType>(data: MessageData<T>) {
  //   try {
  //     this.ws?.send(JSON.stringify({ ...data, timestamp: Date.now() }));
  //   } catch (e) {
  //     logger.error(`send message error`);
  //   }
  // }
  // onStartListen(ws: WebSocket.WebSocket) {
  //   const { room, status } = this;
  //   this.setPlayerStatus(room?.status === "playing" ? PlayerStatus.playing : PlayerStatus.online);
  //   ws.on("close", (code, reason) => this.onStopListen());
  //   ws.on("error", (err) => logger.error(`ws connect error [${err.message}]`));
  //   this.ws = ws;
  //   this.sendInfo();
  // }
  // onStopListen() {
  //   if (!this.room) return;
  //   if (this.room.id && this.room.status === "ready" && this.status === "online") {
  //     Room.exitRoom(this.room.id, this);
  //     this.room = null;
  //   } else {
  //     this.setPlayerStatus(PlayerStatus.offline);
  //     this.ws = null;
  //   }
  // }
  // setPlayerStatus(status: PlayerStatus) {
  //   this.status = status;
  //   if (this.room) {
  //     this.room.members.forEach((player) => {
  //       player.sendInfo();
  //     });
  //   }
  // }
  // rawInfo(): PlayerInfo {
  //   const { id, status, avatar, nickname, character } = this;
  //   return { id, status, avatar, nickname, character: character?.getCharacterProp() };
  // }
  // sendInfo() {
  //   try {
  //     const { room } = this;
  //     this.send<messageType.info>({
  //       type: messageType.info,
  //       content: { player: this.rawInfo(), room: room?.rawInfo() || null }
  //     });
  //   } catch (e) {}
  // }
  // sendError(msg: string) {
  //   this.send({ type: messageType.error, content: msg });
  // }
  // onCreateRoom(data: ReceiveData<messageType.createRoom>) {
  //   const { content } = data;
  //   content && Room.createRoom(content.id, content.number || 4, this);
  // }
  // onJoinRoom(data: ReceiveData<messageType.joinRoom>) {
  //   const { content } = data;
  //   content && Room.enterRoom(content.id, this);
  // }
  // onStart(data: ReceiveData<messageType.start>) {
  //   const { content } = data;
  //   content && Room.start(content.id);
  // }
  // setCharacter() {
  //   this.character = new Character();
  //   this.key = generateRandomKey();
  //   this.sendInfo();
  // }
  // onRound() {
  //   const { room, id } = this;
  //   if (!room) return;
  //   const members = [...room.members];
  //   if (members.length === 0) return;
  //   if (room.game?.currentRound === id) {
  //     // 是否是当前玩家的回合
  //     const thisIndex = members.findIndex((player) => player.id === id);
  //     const nextPlayer = members[(thisIndex + 1) % members.length];
  //     room.game?.setRound(nextPlayer.id);
  //   }
  // }
}
