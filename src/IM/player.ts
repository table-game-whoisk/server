import WebSocket from "ws";
import { MaterialCache } from "../cache/materail";
import { TimerTask } from "../utils/timerTask";
import { Room } from "./room";
import { logger } from "../utils/logger";
export class Player {
  id: string;
  avatar: string;
  nickname: string;
  status: PlayerStatus = PlayerStatus.offline;
  ws: WebSocket.WebSocket | null = null;
  room: Room | null = null;

  // character: CharacterProp | null = null;
  // cardList: CardProp[] = [];

  constructor(info: UserProp) {
    const { id, nickname, avatar } = info;
    this.id = id;
    this.nickname = nickname;
    this.avatar = avatar;
  }
  static handleMessage<T extends messageType>(data: MessageData<T>, player: Player) {
    const { type } = data;
    switch (type) {
      case messageType.info:
        player.sendInfo();
        break;
      case messageType.createRoom:
        player.onCreateRoom(data as MessageData<messageType.createRoom>);
        break;
      case messageType.joinRoom:
        player.onJoinRoom(data as MessageData<messageType.joinRoom>);
        break;
      case messageType.ready:
        player.setPlayerStatus(PlayerStatus.ready);
        break;
      case messageType.start:
        const { content } = data as MessageData<messageType.start>;
        Room.start(content.id);
        break;
      case messageType.message:
        player.room?.onMessage(data as MessageData<messageType.message>);
      default:
        break;
    }
  }

  private send<T extends messageType>(data: MessageData<T>) {
    try {
      this.ws?.send(JSON.stringify({ ...data, timestamp: Date.now() }));
    } catch (e) {
      logger.error(`send message error`);
    }
  }

  onStartListen(ws: WebSocket.WebSocket) {
    const { room, status } = this;
    this.setPlayerStatus(room?.status === "playing" ? PlayerStatus.playing : PlayerStatus.online);
    ws.on("close", (code, reason) => this.onStopListen());
    ws.on("error", (err) => logger.error(`ws connect error [${err.message}]`));
    this.ws = ws;
    this.sendInfo();
  }
  onStopListen() {
    if (!this.room) return;
    if (this.room.id && this.room.status === "ready" && this.status === "online") {
      Room.exitRoom(this.room.id, this);
      this.room = null;
    } else {
      this.setPlayerStatus(PlayerStatus.offline);
      this.ws = null;
    }
  }
  setPlayerStatus(status: PlayerStatus) {
    this.status = status;
    if (this.room) {
      this.room.members.forEach((player) => {
        player.sendInfo();
      });
    }
  }
  rawInfo(): PlayerInfo {
    const { id, status, avatar, nickname } = this;
    return { id, status, avatar, nickname };
  }
  sendInfo() {
    try {
      const { room } = this;
      this.send<messageType.info>({
        type: messageType.info,
        content: { player: this.rawInfo(), room: room?.rawInfo() || null }
      });
    } catch (e) {}
  }
  sendError(msg: string) {
    this.send({ type: messageType.error, content: msg });
  }
  onCreateRoom(data: MessageData<messageType.createRoom>) {
    const { content } = data;
    Room.createRoom(content.id, content.number || 4, this);
  }
  onJoinRoom(data: MessageData<messageType.joinRoom>) {
    const { content } = data;
    Room.enterRoom(content.id, this);
  }

  // onstart(data?: MessageData<"start">) {
  //   const { room } = this;
  //   if (!room) {
  //     this.sendError("当前还未加入任何房间");
  //     return;
  //   }
  //   const isAllready = [...(room?.members || [])].every((item) => item.status === "ready");
  //   if (room.owner !== this.id) {
  //     this.sendError("只有房主才能开始游戏");
  //     return;
  //   } else if (!isAllready) {
  //     this.sendError("还有玩家未准备");
  //     return;
  //   } else if (room?.members.size < 4) {
  //     this.sendError("玩家小于4人");
  //     return;
  //   }
  //   room.status = "playing";
  //   room.gameStep = "start";
  //   room.members.forEach((item) => {
  //     item.status = "playing";
  //     item.oninfo();
  //   });
  //   TimerTask.register({
  //     date: new Date(Date.now() + 1000 * 3),
  //     action: () => {
  //       room.gameStep = "character";
  //       room.members.forEach((item) => {
  //         item.sendCharacterList();
  //       });
  //       room.sendSystemMessage("开始选择角色");
  //     }
  //   });
  //   // 给还没选角色的玩家自动分配角色
  //   TimerTask.register({
  //     date: new Date(Date.now() + 1000 * 60),
  //     action: () => {
  //       room.members.forEach((item) => {
  //         if (!item.character) {
  //           let random = Math.floor(Math.random() * MaterialCache.characterList.size);
  //           let characterValue = Array.from(MaterialCache.characterList)[random];
  //           if (characterValue[1]) {
  //             item.character = characterValue[1]?.dataValues;
  //             item.cardList = item.sendCard(item.character.health);
  //           }
  //         }
  //       });
  //     }
  //   });
  //   // 一分钟开始玩家回合
  //   TimerTask.register({
  //     date: new Date(Date.now() + 1000 * 63),
  //     action: () => {
  //       room.gameStep = "round";
  //       const currRound = [...room.members][0]?.id;
  //       room.members.forEach((item) => {
  //         Player.sendRound(currRound, item);
  //       });
  //     }
  //   });
  // }

  // oncharacter(data: MessageData<"character">) {
  //   const { content } = data;
  //   // 用户选择角色逻辑
  //   if (content && content.character) {
  //     this.character = content.character;
  //     this.room?.members.forEach((item) => {
  //       item.oninfo();
  //     });
  //     const cardNumber = content?.character?.health;
  //     TimerTask.register({
  //       date: new Date(Date.now() + 1000 * 5),
  //       action: () => {
  //         this.cardList = this.sendCard(cardNumber); // 起始手牌派发
  //       }
  //     });
  //     return;
  //   }
  // }
  // onround(data?: MessageData<"round">) {
  //   // 回合结束，将当前回合指向下一个玩家
  //   if (!this.roomId) return;
  //   const room = Room.rooms.get(this.roomId);
  //   if (!room) return;
  //   const currRound = this.id;
  //   const currRoundIndex = [...room.members].findIndex((item) => item.id === currRound);
  //   const nextRound = [...room.members][currRoundIndex + 1]?.id || null;
  //   room.currRound === nextRound;
  //   room.members.forEach((item) => {
  //     if (nextRound) {
  //       Player.sendRound(nextRound, item);
  //     } else {
  //       item.sendVote();
  //     }
  //   });
  // }
  // onvote(data: MessageData<"vote">) {}
  // onskill(data: MessageData<"skill">) {}
  // // 使用卡牌
  // oncard(data: MessageData<"card">) {
  //   const { content } = data;
  //   if (!content?.card || !content?.to) return;
  //   this.room?.members.forEach((item) => {
  //     if (item.id === content.to) {
  //       item.handleCardEffect(content.card!, this);
  //       item.oninfo();
  //     }
  //   });
  // }
  // handleCardEffect(card: CardProp, from: Player) {
  //   const { type } = card;
  //   switch (type) {
  //     case "action":
  //       if (this.character) {
  //         this.character.health = this.character.health - 1;
  //       }
  //       this.room?.sendSystemMessage(`${this.nickname}受到了${from.nickname}的攻击`);
  //       break;
  //     case "trop":
  //       break;
  //     case "prop":
  //       const { Skill } = card;
  //       Skill && this.handleSkillEffect(Skill, from);
  //       break;
  //     case "clue":
  //       break;
  //     default:
  //       break;
  //   }
  //   this.checkStatus();
  // }
  // // 弃牌
  // ondrop(data: MessageData<"drop">) {
  //   const { content } = data;
  //   if (content) {
  //     this.cardList = content;
  //   }
  // }
  // // 发送角色列表
  // sendCharacterList() {
  //   const list: CharacterProp[] = [];
  //   MaterialCache.characterList.forEach(({ dataValues }) => {
  //     list.push(dataValues);
  //   });
  //   this.send<"character">({
  //     type: "character",
  //     content: {
  //       characterList: list
  //     }
  //   });
  // }
  // static sendRound(currRound: userId, player: Player) {
  //   if (!player.roomId) return;
  //   const room = Room.rooms.get(player.roomId);
  //   if (!room) return;
  //   room.currRound = currRound;
  //   const currRoundPlayer = [...room.members].filter((item) => item.id === currRound)[0] || null;
  //   player.send<"round">({ type: "round", content: currRoundPlayer?.rawInfo() });
  //   // 回合开始后，给玩家发牌
  //   TimerTask.register({
  //     date: new Date(Date.now() + 1000 * 3),
  //     action: () => {
  //       if (player.id === currRound) {
  //         player.cardList.push(...player.sendCard(2));
  //       }
  //     }
  //   });
  //   // 一分钟后开始开始下一个玩家的回合
  //   TimerTask.register({
  //     date: new Date(Date.now() + 1000 * 60),
  //     action: () => {
  //       if (room.currRound === currRound) {
  //         const currRoundIndex = [...room.members].findIndex((item) => item.id === currRound);
  //         const nextRound = [...room.members][currRoundIndex + 1]?.id || null;
  //         if (currRoundPlayer?.character && currRoundPlayer.cardList.length > currRoundPlayer.character?.health) {
  //           const dropNumber = currRoundPlayer.cardList.length - currRoundPlayer.character.health;
  //           currRoundPlayer.cardList.splice(0, dropNumber);
  //           currRoundPlayer.oninfo();
  //         }
  //         if (nextRound) {
  //           Player.sendRound(nextRound, player);
  //         } else {
  //           player.sendVote();
  //         }
  //       }
  //     }
  //   });
  // }
  // sendVote() {
  //   const { roomId } = this;
  //   if (!roomId) return;
  //   const room = Room.rooms.get(roomId);
  //   if (room) {
  //     if (room.gameStep === "round") {
  //       room.gameStep = "vote";
  //       this.send({ type: "vote" });
  //       TimerTask.register({
  //         date: new Date(Date.now() + 1000 * 60),
  //         action: () => {
  //           if (room.gameStep === "vote") {
  //             room.gameStep = "round";
  //             const currRound = [...room.members][0]?.id;
  //             room.members.forEach((item) => {
  //               Player.sendRound(currRound, item);
  //             });
  //           }
  //         }
  //       });
  //     }
  //   }
  // }
  // sendCard(cardNumber: number) {
  //   const cards: CardProp[] = [];
  //   for (let index = 0; index < cardNumber; index++) {
  //     let random = Math.floor(Math.random() * MaterialCache.cardList.size);
  //     let item = Array.from(MaterialCache.cardList)[random];
  //     item[1]?.dataValues && cards.push(item[1].dataValues);
  //   }
  //   this.send({ type: "card", content: { cards: [...this.cardList, ...cards] } });
  //   return cards;
  // }
  // // 判断当前玩家状态
  // checkStatus() {
  //   if (this.character) {
  //     if (this.character?.health < 0) {
  //       this.cardList = [];
  //       this.status = "out";
  //       this.room?.sendSystemMessage(`${this.nickname}被淘汰了`);
  //     }
  //   }
  // }
  // handleSkillEffect(Skill: SkillProp, from: Player) {
  //   switch (Skill.effectType) {
  //     case "characterEffect":
  //       if (this.character) {
  //         this.character.health += Skill.health || 0;
  //         this.character.attack += Skill.attack || 0;
  //         this.character.defense += Skill.defense || 0;
  //         this.character.dodge += Skill.dodge || 0;
  //       }
  //       break;
  //     case "cardSetpEffect":
  //       break;
  //     case "roundEffect":
  //       break;
  //   }
  // }
  // // 客户端返回错误
  // onerror() {}
}
