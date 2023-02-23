
import WebSocket from "ws"
import { TimerTask } from "../utils/timerTask"

export class ScoketClient {
  static listener = new Map<UserId, Listener>()

  private heartCheck() {
    TimerTask.register({
      date: new Date(),
      action: () => {
        ScoketClient.listener.forEach((item) => {
          item.socket.send(JSON.stringify({ type: "check" }))
        })
      }
    })
  }

  static connect(userId: string) {
    return new Promise((resove, reject) => {
      const socket = new WebSocket(process.env.WS_URL + ":" + process.env.WS_SERVER_PORT + "?userId=" + userId)
      socket.on("open", () => {
        resove(true)
      })
      socket.on("close", () => { })
      socket.on("error", (error) => {
      })
      const message = () => {
        return new Promise<MessageData>((resolve) => {
          socket.on("message", (data) => {
            resolve(JSON.parse(data.toString()))
          })
        })
      }
      ScoketClient.listener.set(userId, { userId, socket, message })
    })

  }

  static getListener(userId: string) {
    return ScoketClient.listener.get(userId)
  }

  static close() {
    ScoketClient.listener.forEach((item) => {
      item.socket.close()
    })
  }
}
