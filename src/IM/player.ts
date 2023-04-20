import WebSocket from "ws";
import { TimerTask } from "../utils/timerTask";
import { Room } from "./room";
import { logger } from "../utils/logger";
import { Character } from "./game";
import { generateRandomKey } from "../utils";
export class Player {
  id: string;
  avatar: string;
  nickname: string;
  status: PlayerStatus = PlayerStatus.offline;
  ws: WebSocket.WebSocket | null = null;
  room: Room | null = null;
  character: Character | null = null;
  key: string | null = null;
  fakeKey: FakeKey | null = null;

  constructor(info: UserProp) {
    const { id, nickname, avatar } = info;
    this.id = id;
    this.nickname = nickname;
    this.avatar = avatar;
  }

  static handleMessage<T extends messageType>(data: ReceiveData<T>, player: Player) {
    switch (data.type) {
      case messageType.info:
        player.sendInfo();
        break;
      case messageType.createRoom:
        player.onCreateRoom(data as ReceiveData<messageType.createRoom>);
        break;
      case messageType.joinRoom:
        player.onJoinRoom(data as ReceiveData<messageType.joinRoom>);
        break;
      case messageType.ready:
        player.setPlayerStatus(PlayerStatus.ready);
        break;
      case messageType.start:
        player.onStart(data as ReceiveData<messageType.start>);
        break;
      case messageType.message:
        player.room?.onMessage(data as ReceiveData<messageType.message>, player);
        break;
      case messageType.round:
        player.onRound();
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
    const { id, status, avatar, nickname, character } = this;
    return { id, status, avatar, nickname, character: character?.getCharacterProp() };
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
  onCreateRoom(data: ReceiveData<messageType.createRoom>) {
    const { content } = data;
    content && Room.createRoom(content.id, content.number || 4, this);
  }
  onJoinRoom(data: ReceiveData<messageType.joinRoom>) {
    const { content } = data;
    content && Room.enterRoom(content.id, this);
  }
  onStart(data: ReceiveData<messageType.start>) {
    const { content } = data;
    content && Room.start(content.id);
  }
  setCharacter() {
    this.character = new Character();
    this.key = generateRandomKey();
    this.sendInfo();
  }
  onRound() {
    const { room, id } = this;
    if (!room) return;
    const members = [...room.members];
    if (members.length === 0) return;
    if (room.game?.currentRound === id) {
      // 是否是当前玩家的回合
      const thisIndex = members.findIndex((player) => player.id === id);
      const nextPlayer = members[(thisIndex + 1) % members.length];
      room.game?.setRound(nextPlayer.id);
    }
  }
}
