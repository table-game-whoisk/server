import { IncomingMessage } from "node:http";
import WebSocket from "ws";
import { logger } from "../utils/logger";
import { Player } from "./player";

class IM {
  players = new Map<UserId, Player>();

  connection(ws: WebSocket.WebSocket, req: IncomingMessage) {
    const { userId } = this.parseParam(req);
    if (!userId) {
      return logger.error("error connected method");
    }
    let player = this.players.get(userId);
    if (!player) {
      player = new Player(userId, ws)
      this.players.set(userId, player)
    }
    ws.on("message", (data) =>player?.messageParse(data));
    logger.info(`user ${userId} connected success`)
  }

  parseParam(req: IncomingMessage) {
    const params = new URLSearchParams(req.url!.slice(1));
    const userId = params.get("userId");
    return { userId };
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
