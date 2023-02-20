import { IncomingMessage } from "node:http";
import WebSocket from "ws";
import { logger } from "../utils/logger";
import { Room } from "./room";

class IM {
  rooms = new Map<roomId, Room>();

  connection(ws: WebSocket.WebSocket, req: IncomingMessage) {
    const { roomId, userId } = this.parseParam(req);
    if (!roomId || !userId) {
      return logger.error("error connected method");
    }
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new Room(roomId);
      this.rooms.set(roomId, room);
    }
    room.join(userId, ws);
    ws.on("message", (data) => room!.messageParse(data));
  }

  parseParam(req: IncomingMessage) {
    const params = new URLSearchParams(req.url!.slice(1));
    const roomId = params.get("roomId");
    const userId = params.get("userId");
    return { roomId, userId };
  }
}
export const im = new IM();
let port = process.env.WS_SERVER_PORT;

export const createWebsocketServer = () => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket.Server({ port });

    ws.on("listening", () => {
      logger.info("websocket listening on port " + port);
      ws.on("connection", im.connection.bind(im));
      resolve(true);
    });

    ws.on("error", (e) => {
      logger.error("error", e);
    });

    ws.on("close", () => {
      logger.info("websocket closed ");
    });
  });
};
