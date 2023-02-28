type userId = string;
type roomId = string;

declare interface UserProp {
  id: string;
  nickname?: string;
}

declare interface MessageData {
  type: "info" | "message" | "enter" | "start" | "character" | "exit" | "error";
  from?: userId;
  timestamp?: number;
  to?: userId | userId[];
  msg?: string;
  roomId?: roomId;
  content?: any;
}

declare interface Task {
  date: Date;
  action: () => void;
}

namespace Game {
  type actionObject = "character" | "card";

  declare interface Character {
    id: string;
    name: string;
    attribute: CharacterAtr;
    skill: {
      name: string;
      describe: string;
      effect: Effect;
    };
  }

  declare interface CharacterAtr {
    health: number;
    attack: number;
    defense: number;
    evade: number;
  }

  declare interface Effect {
    type: actionObject;
    characterEffect?: {};
    cardEffect?: {};
  }
}

namespace Test {
  declare interface Listener {
    userId: string;
    socket: WebSocket.websocket;
    message: () => Promise<MessageData>;
    getMessages: (type?: MessageData["type"]) => Promise<MessageData[]>;
    send: (message: MessageData) => void;
  }
}
