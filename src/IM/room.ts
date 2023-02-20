import WebSocket from "ws";
import { logger } from "../utils/logger";

export class Room {
  players = new Map<playerId, Player>();
  roomId: string;
  gameStatus: "ready" | "runnig" | "end";

  constructor(roomId: string) {
    this.roomId = roomId;
    this.gameStatus = "ready";
  }
  join(userId: string, ws: WebSocket.WebSocket) {
    if (!this.players.has(userId)) {
      this.players.set(userId, { ws });
    }
    logger.info(`player ${userId} jion room ${this.roomId}`);
  }
  exit(userId: string) {
    if (this.players.has(userId)) {
      this.players.delete(userId);
    }
  }
  messageParse(data: WebSocket.RawData) {
    let message = JSON.parse(data.toString());
    this.players.forEach(({ ws }) => ws.send(message));
  }
}
