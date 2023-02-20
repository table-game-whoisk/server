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
