type RoomId = string;
type PlayerId = string;

declare const enum ReceiveType {
  create = "create",
  join = "join",
  exit = "exit",
  ready = "ready",
  start = "start",
  key = "key", //玩家提交的词语
  message = "message",
  vote = "vote",
  continue = "continue",
  disslove = "disslove"
}

declare const enum SendType {
  info = "info",
  room = "room",
  notice = "notice",
  error = "error"
}

declare const enum NoticeType {
  key = "key",
  testimony = "testimony", // 证词
  vote = "vote",
  continue = "continue"
}

declare interface ReceviceMessage<T> {
  type: ReceiveType;
  timestamp?: number;
  content: T extends ReceiveType.create | ReceiveType.join | ReceiveType.exit | ReceiveType.disslove
    ? RoomId
    : T extends ReceiveType.message | ReceiveType.key
    ? string
    : T extends ReceiveType.vote
    ? PlayerId
    : null;
}

declare interface SendMessage<T> {
  type: SendType;
  timestamp: number;
  content: T extends SendType.info
    ? PlayerInfo
    : T extends SendType.room
    ? RoomInfo
    : T extends SendType.notice
    ? NoticeType
    : null;
}

declare interface Message {
  timestamp: number;
  type?: NoticeType;
  MessageFrom: { id: PlayerId; nickname: string; avatar: string };
  messge: string;
}

declare const enum PlayerStatus {
  offline = "offline",
  online = "online",
  ready = "ready",
  playing = "playing",
  round = "round",
  mute = "mute", // 其他玩家发言时，禁言
  out = "out" // 淘汰
}

declare interface PlayerInfo {
  id: string;
  nickname: string;
  avatar: string;
  status: PlayerStatus;
}

declare interface RoomInfo {
  id: string;
  members: [];
  messages: Message[];
}
