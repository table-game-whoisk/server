import { IncomingMessage } from "node:http";
import WebSocket from "ws";
import { logger } from "../utils/logger";
import { Player } from "./player";

class IM {
  players = new Map<userId, Player>();
  timer: NodeJS.Timer | null = null;

  connection(ws: WebSocket.WebSocket, req: IncomingMessage) {
    const { userId, nickname, avatarUrl } = this.parseParam(req);
    if (!userId) {
      return logger.error("error connected method");
    }
    let player = this.players.get(userId);
    if (!player) {
      player = new Player({ userId, nickname, avatarUrl });
      this.players.set(userId, player);
    }
    ws.on("message", (data) => {
      const res = IM.parseMessage(data, ws);
      res && Player.dispatchMessage(res, player);
    });
    player.startListen.call(player, ws);
    logger.info(`user ${userId} connected success`);
  }
  static parseMessage(data: WebSocket.RawData, ws: WebSocket.WebSocket) {
    const res = data.toString();
    if (res === "ping") {
      ws.send("pong");
      return null;
    }
    return JSON.parse(res) as MessageData<messageType>;
  }
  parseParam(req: IncomingMessage) {
    const params = new URLSearchParams(req.url!.slice(1));
    const userId = params.get("userId");
    const nickname = params.get("nickname");
    const avatarUrl = params.get("avatarUrl");
    return { userId, nickname, avatarUrl };
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
