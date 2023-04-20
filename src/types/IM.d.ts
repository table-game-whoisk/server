declare interface Info {
  player: PlayerInfo | null;
  room: RoomInfo | null;
}

// player
declare const enum PlayerStatus {
  offline = "offline",
  online = "online",
  ready = "ready",
  playing = "playing",
  end = "end"
}
declare interface PlayerInfo {
  id: string;
  status: string;
  avatar: string | null;
  nickname: string | null;
  character?: CharacterProp | null;
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

// message
declare const enum messageType {
  error = "error",
  info = "info",
  createRoom = "createRoom",
  joinRoom = "joinRoom",
  ready = "ready",
  start = "start",
  message = "message",
  character = "character",
  round = "round"

  // exit = "exit",

  // character = "character",
  // vote = "vote",
  // card = "card",
  // drop = "drop",
  // skill = "skill",

  // error = "error"
}
declare interface MessageData<T extends messageType> {
  type: messageType;
  timestamp?: number;
  content: T extends messageType.info ? Info : string;
}

declare interface ReceiveData<T extends messageType> {
  type: messageType;
  timestamp?: number;
  content?: T extends messageType.createRoom
    ? { id: string; number: number }
    : T extends messageType.joinRoom
    ? { id: string }
    : T extends messageType.start
    ? { id: string }
    : string;
}

declare interface Message {
  timestamp: number;
  messageFrom: PlayerInfo;
  message: string;
}
