type RoomId = string;
type PlayerId = string;

declare const enum PlayerStatus {
  online = "online",
  ready = "ready",
  playing = "playing",
  round = "round",
  mute = "mute", // 其他玩家发言时，禁言
  out = "out" // 淘汰
}

declare const enum RoomStatus {
  end = "end",
  addKey = "addKey",
  round = "round",
  vote = "vote"
}

declare const enum ReceiveType {
  info = "info",
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
  content: T extends ReceiveType.create
    ? { id: RoomId; memberCount: number; subject?: string }
    : T extends ReceiveType.join | ReceiveType.exit | ReceiveType.disslove
    ? RoomId
    : T extends ReceiveType.message | ReceiveType.key
    ? string
    : T extends ReceiveType.vote
    ? PlayerId
    : null;
}

declare interface SendMessage<T> {
  type: SendType;
  content: T extends SendType.info
    ? Info
    : T extends SendType.notice
    ? NoticeType
    : T extends SendType.error
    ? string
    : null;
}

declare interface Message {
  timestamp: number;
  type?: NoticeType;
  messageFrom: { id: PlayerId; nickname: string; avatar: string };
  message: string;
}

declare interface Info {
  id: string;
  nickname: string;
  avatar: string;
  status: PlayerStatus;
  room: RoomInfo | null;
  key: string | null;
  role: "undercover" | "civilian";
}

declare interface PlayerInfo {
  id: string;
  nickname: string;
  avatar: string;
  status: PlayerStatus;
  voteCount: number;
}

declare interface RoomInfo {
  id: string;
  status: RoomStatus;
  members: PlayerInfo[];
  messages: Message[];
  owner: PlayerId;
  memberCount: memberCount;
  currentPlayer: PlayerInfo | null;
  subject?: string;
  undercoverKey: string[];
}
