type UserId = string;
declare interface UserProp {
  id: string;
  nickname?: string;
}

type playerId = string;
type roomId = string;

declare interface Player {
  ws: WebSocket.websocket;
}

declare interface MessageData {
  type: "info" | "message" | "enter" | "exit",
  content: any
}

declare interface Task {
  date: Date;
  action: () => void;
}