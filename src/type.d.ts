type UserId = string;
declare interface UserProp {
  id: string;
  nickname?: string;
}

type playerId = string;
type roomId = string;

declare interface MessageData {
  type: "info" | "message" | "enter" | "start" | "exit" | "error",
  from?: UserId,
  timestamp?: number,
  to?: UserId | UserId[],
  msg?: string,
  roomId?: roomId
  content?: any
}

declare interface Task {
  date: Date;
  action: () => void;
}

declare interface Listener {
  userId: string,
  socket: WebSocket.websocket,
  message: () => Promise<MessageData>,
  getMessages: (type?: MessageData["type"]) => Promise<MessageData[]>,
  send: (message: MessageData) => void
}