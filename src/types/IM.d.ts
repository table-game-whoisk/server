declare interface Info {
  player: PlayerInfo | null;
  room: RoomInfo | null;
}

// player
declare const enum PlayerStatus {
  offline = "offline",
  online = "online",
  ready = "ready",
  playing = "playing"
}

declare interface PlayerInfo {
  id: string;
  status: string;
  avatar: string | null;
  nickname: string | null;
}
// room
declare const enum roomStatus {
  ready = "ready",
  playing = "playing"
}
declare interface RoomInfo {
  id: string | null;
  owner: string | null;
  members: PlayerInfo[] | null;
  messageList: Message[];
  status: roomStatus;
  // gameStep: Game.gameStep | null;
}

//game
declare const enum GameStatus {
  role = "role",
  palying = "round",
  end = "end"
}

// message
declare const enum messageType {
  error = "error",
  info = "info",
  createRoom = "createRoom",
  joinRoom = "joinRoom",
  ready = "ready",
  start = "start",
  message = "message",
  getMessage = "getMessage"

  // create = "create",
  // enter = "enter",
  // exit = "exit",
  // ready = "ready",
  // start = "start",
  // character = "character",
  // round = "round",
  // vote = "vote",
  // card = "card",
  // drop = "drop",
  // skill = "skill",

  // error = "error"
}

declare interface MessageData<T extends messageType> {
  type: messageType;
  timestamp?: number;
  content: T extends messageType.info
    ? Info
    : T extends messageType.createRoom | messageType.joinRoom
    ? { id: string; number?: number }
    : T extends messageType.start
    ? { id }
    : T extends messageType.message
    ? Message
    : string;
}

declare interface Message {
  timestamp: number;
  messageFrom: PlayerInfo;
  message: string;
}
