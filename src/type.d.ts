type UserId = string;
type RoomId = string;

declare interface UserProp {
  id: string;
  nickname?: string;
}

declare interface RoomMember extends Map<UserId, WebSocket> {}
declare interface Room extends Map<RoomId, RoomMember> {}

declare interface WebSocketData {
  type: "message";
  content: string;
  roomId: string;
  userId: string;
}
