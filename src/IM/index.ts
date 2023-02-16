import { IncomingMessage } from "node:http";
import WebSocket from "ws";
import { logger } from "../utils/logger";

class IM {
  room: Room = new Map();
  users: WebSocket.WebSocket[] = [];

  connection(ws: WebSocket.WebSocket, req: IncomingMessage) {
    this.users.push(ws);

    ws.onmessage = (e) => {
      const { data } = e;
      this.users.forEach((w) => w.send(data));
    };
  }

  onMessage(message: WebSocketData) {
    const { type, content } = message;
    this.send(content);
  }
  send(content: string) {
    console.log(content);
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

    ws.on("close", () => {});
  });
};
