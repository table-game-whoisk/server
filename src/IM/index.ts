import { IncomingMessage } from "node:http";
import WebSocket from "ws";
import { logger } from "../utils/logger";

class IM {
  room: Room = new Map();

  connection(ws: WebSocket.WebSocket, req: IncomingMessage) {
    ws.onmessage = (e) => {
      const { data } = e;

      ws.send(data);
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
