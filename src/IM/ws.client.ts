
import WebSocket from "ws"

export class ScoketClient {
  static listener = new Map<userId, Test.Listener>()


  static connect(userId: string) {
    return new Promise((resove, reject) => {
      const socket = new WebSocket(process.env.WS_URL + ":" + process.env.WS_SERVER_PORT + "?userId=" + userId)
      socket.on("open", () => {
        resove(true)
      })
      let messages: MessageData[] = []
      socket.on("close", () => { })
      socket.on("error", (error) => {
      })
      socket.on("message", (data) => {
        messages.push(JSON.parse(data.toString()))
      })
      const message = () => {
        return new Promise<MessageData>((resolve) => {
          socket.on("message", (data) => {
            resolve(JSON.parse(data.toString()))
          })
        })
      }
      const getMessages = (type?: MessageData["type"]) => {
        return new Promise<MessageData[]>((resolve) => {
          resolve(messages.filter((item) => type ? item.type === type : true))
        })
      }
      const send = (message: MessageData) => {
        socket.send(JSON.stringify(message))
      }
      ScoketClient.listener.set(userId, { userId, socket, send, message, getMessages })
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
