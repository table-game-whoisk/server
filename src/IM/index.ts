import { IncomingMessage } from "node:http";
import { WebSocket } from "ws"
import { logger } from "../utils/logger"


class IM {
  room: Room = new Map()
  connection(ws: WebSocket, req: IncomingMessage) {
    console.log(ws)
  }
}
export const im = new IM()


export const createWebsocketServer = () => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket.Server({ port: process.env.WS_SERVER_PORT })

    ws.on("listening", () => {
      logger.info("websocket listening on port " + process.env.WS_SERVER_PORT)
      ws.on("connection", im.connection.bind(im))
      resolve(true)
    })

    ws.on("error", () => { })

    ws.on("close", () => { })
  })
}