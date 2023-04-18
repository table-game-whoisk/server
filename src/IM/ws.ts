import { IncomingMessage } from "node:http";
import WebSocket from "ws";
import { logger } from "../utils/logger";
import { Player } from "./player";

class IM {
  players = new Map<string, Player>();
  timer: NodeJS.Timer | null = null;

  connection(ws: WebSocket.WebSocket, req: IncomingMessage) {
    const params = new URLSearchParams(req.url!.slice(1));
    const id = params.get("id");
    const nickname = params.get("nickname");
    const avatar = params.get("avatar");
    if (!id || !nickname || !avatar) {
      console.log(id, nickname, avatar);
      return logger.error("error connected method");
    }
    let player = this.players.get(id);
    if (!player) {
      player = new Player({ id, nickname, avatar });
      this.players.set(id, player);
    }
    player.onStartListen(ws);
    ws.on("message", (data) => {
      const res = IM.parseMessage(data, ws);
      if (player) {
        res && Player.handleMessage(res, player);
      }
    });
    logger.info(`user[${nickname}] id[${id}] connected success`);
  }
  static parseMessage(data: WebSocket.RawData, ws: WebSocket.WebSocket) {
    try {
      const res = data.toString();
      if (res === "ping") {
        ws.send("pong");
        return null;
      }
      return JSON.parse(res) as MessageData<messageType>;
    } catch (e) {
      return null;
    }
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
