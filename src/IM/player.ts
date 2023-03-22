import WebSocket from "ws";
import { MaterialCache } from "../cache/materail";
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
  character: CharacterProp | null = null;
  cardList: CardProp[] = [];

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
  private send<T extends messageType>(data: MessageData<T>) {
    this.ws?.send(JSON.stringify({ ...data, from: this.userId, timestamp: Date.now() }));
  }
  // ws 错误
  private handleError(err: Error) {}
  static dispatchMessage<T extends messageType>(data: MessageData<T>, player: Player | undefined) {
    if (!player) return;
    const { type } = data;
    player[`on${type}`]?.call(player, data as MessageData<typeof type>);
  }
  private rawInfo() {
    const { userId, status, avatarUrl, nickname, character, cardList } = this;
    return {
      status,
      id: userId,
      avatarUrl,
      nickname,
      character,
      cardList
    } as PlayerInfo;
  }
  oninfo() {
    const { room, roomId } = this;
    this.send({
      type: "info",
      player: this.rawInfo(),
      room: room?.rawInfo()
    });
  }
  oncreate(data: MessageData<"create">) {
    const { roomId } = data;
    Room.createRoom(roomId, this);
  }
  onenter(data: MessageData<"enter">) {
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
    room.gameStep = "start";
    room.members.forEach((item) => {
      item.status = "playing";
      item.oninfo();
    });
    TimerTask.register({
      date: new Date(Date.now() + 1000 * 3),
      action: () => {
        room.gameStep = "character";
        room.members.forEach((item) => {
          item.sendCharacterList();
        });
      }
    });
    // 给还没选角色的玩家自动分配角色
    TimerTask.register({
      date: new Date(Date.now() + 1000 * 60),
      action: () => {
        room.members.forEach((item) => {
          if (!item.character) {
            let random = Math.floor(Math.random() * MaterialCache.characterList.size);
            let characterValue = Array.from(MaterialCache.characterList)[random];
            if (characterValue[1]) {
              item.character = characterValue[1]?.dataValues;
              item.cardList = item.sendCard(item.character.health);
            }
          }
        });
      }
    });
    // 一分钟开始玩家回合
    TimerTask.register({
      date: new Date(Date.now() + 1000 * 63),
      action: () => {
        room.gameStep = "round";
        const currRound = [...room.members][0]?.userId;
        room.members.forEach((item) => {
          item.sendRound(currRound);
        });
      }
    });
  }
  onready() {
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
  onmessage(data: MessageData<"message">) {
    const { to, content } = data;
    const { roomId } = this;
    if (!roomId) return;
    const room = Room.rooms.get(roomId);
    if (!room) return;
    const { messages } = room;
    room?.messages.push({
      messageFrom: this.rawInfo(),
      to,
      timestamp: Date.now(),
      message: content || ""
    });
    room?.members.forEach((item) =>
      item.send({
        type: "message",
        room: room.rawInfo(),
        messages
      })
    );
  }
  ongetMessage() {
    const { roomId } = this;
    if (!roomId) return;
    const room = Room.rooms.get(roomId);
    if (!room) return;
    const { messages } = room;
    this.send({
      type: "message",
      room: room.rawInfo(),
      messages
    });
    return;
  }
  oncharacter(data: MessageData<"character">) {
    const { content } = data;
    // 用户选择角色逻辑
    if (content && content.character) {
      this.character = content.character;
      this.room?.members.forEach((item) => {
        item.send<"character">({ type: "character", room: this.room?.rawInfo() || null, content });
      });
      const cardNumber = content?.character?.health;
      TimerTask.register({
        date: new Date(Date.now() + 1000 * 5),
        action: () => {
          this.cardList = this.sendCard(cardNumber); // 起始手牌派发
        }
      });
      return;
    }
  }
  onround() {
    // 回合结束，将当前回合指向下一个玩家
    if (!this.roomId) return;
    const room = Room.rooms.get(this.roomId);
    if (!room) return;
    const currRound = this.userId;
    const currRoundIndex = [...room.members].findIndex((item) => item.userId === currRound);
    const nextRound = [...room.members][currRoundIndex + 1]?.userId || null;
    room.currRound === nextRound;
    room.members.forEach((item) => {
      if (nextRound) {
        item.sendRound(nextRound);
      } else if (room.gameStep === "round") {
        item.sendVote();
      }
    });
  }
  onvote(data: MessageData<"vote">) {}
  onskill(data: MessageData<"skill">) {}
  oncard(data: MessageData<"card">) {
    const { content } = data;
    if (!content?.card || !content?.to) return;
    this.room?.members.forEach((item) => {
      if (item.userId === content.to) {
      }
    });
  }
  ondrop(data: MessageData<"drop">) {
    const { content } = data;
    if (content) {
      this.cardList = content;
    }
  }
  sendCharacterList() {
    const list: CharacterProp[] = [];
    MaterialCache.characterList.forEach((item) => {
      list.push(item as unknown as CharacterProp);
    });
    this.send<"character">({
      type: "character",
      content: {
        characteList: list
      }
    });
  }
  sendRound(currRound: userId) {
    if (!this.roomId) return;
    const room = Room.rooms.get(this.roomId);
    if (!room) return;
    room.currRound = currRound;
    const currRoundPlayer = [...room.members].filter((item) => item.userId === currRound)[0] || null;
    this.send<"round">({ type: "round", content: currRoundPlayer?.rawInfo() });
    // 回合开始后，给玩家发牌
    TimerTask.register({
      date: new Date(Date.now() + 1000 * 3),
      action: () => {
        if (this.userId === currRound) {
          this.cardList.push(...this.sendCard(2));
        }
      }
    });
    // 一分钟后开始开始下一个玩家的回合
    TimerTask.register({
      date: new Date(Date.now() + 1000 * 60),
      action: () => {
        if (room.currRound === currRound) {
          const currRoundIndex = [...room.members].findIndex((item) => item.userId === currRound);
          const currentPlayer = [...room.members][currRoundIndex + 1] || null;
          const nextRound = currentPlayer?.userId || null;
          if (currentPlayer?.character && currentPlayer.cardList.length > currentPlayer.character?.health) {
            const dropNumber = currentPlayer.cardList.length - currentPlayer.character.health;
            currentPlayer.cardList.splice(0, dropNumber);
          }
          room.members.forEach((item) => {
            if (nextRound) {
              item.sendRound(nextRound);
            } else if (room.gameStep === "round") {
              item.sendVote();
            }
          });
        }
      }
    });
  }
  sendVote() {
    if (!this.roomId) return;
    const room = Room.rooms.get(this.roomId);
    if (!room) return;
    room.gameStep = "vote";
    this.send({ type: "vote" });
    TimerTask.register({
      date: new Date(Date.now() + 1000 * 60),
      action: () => {
        // 投票结束后游戏还没结束，继续进入玩家回合
        if (room.gameStep === "vote") {
          room.gameStep = "round";
          const currRound = [...room.members][0]?.userId;
          room.members.forEach((item) => {
            item.sendRound(currRound);
          });
        }
      }
    });
  }
  sendCard(cardNumber: number) {
    const cards: CardProp[] = [];
    for (let index = 0; index < cardNumber; index++) {
      let random = Math.floor(Math.random() * MaterialCache.cardList.size);
      let item = Array.from(MaterialCache.cardList)[random];
      item[1]?.dataValues && cards.push(item[1].dataValues);
    }
    this.send({ type: "card", content: { cards: [...this.cardList, ...cards] } });
    return cards;
  }
  // 判断当前玩家状态
  checkStatus(skill: SkillProp) {
    if (skill.effectType === "characterEffect") {
      if (!this.character) return;
      this.character.health += skill.health || 0;
      this.character.attack += skill.attack || 0;
      this.character.defense += skill.defense || 0;
      this.character.dodge += skill.dodge || 0;
      if (this.character.health < 0) {
        this.cardList = [];
        this.status = "out";
      }
    }
  }
  checkCard(skill: SkillProp) {}
  checkRound(skill: SkillProp) {}
  // 客户端返回错误
  onerror() {}
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
