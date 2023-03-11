import WebSocket from "ws";

export class ScoketClient {
  static listeners = new Map<userId, Test.Listener>();

  static connect(userId: string) {
    return new Promise((resove, reject) => {
      const socket = new WebSocket(process.env.WS_URL + ":" + process.env.WS_SERVER_PORT + "?userId=" + userId);
      socket.on("open", () => {
        resove(true);
      });
      socket.on("close", () => {});
      socket.on("error", (error) => {});
      socket.on("message", (data) => {});
      const message = () => {
        return new Promise<MessageData>((resolve) => {
          socket.on("message", (data) => {
            resolve(JSON.parse(data.toString()));
          });
        });
      };
      const send = (message: MessageData) => {
        socket.send(JSON.stringify(message));
      };
      ScoketClient.listeners.set(userId, { userId, socket, send, message });
    });
  }

  static getListener(userId: string) {
    return ScoketClient.listeners.get(userId);
  }

  static close() {
    ScoketClient.listeners.forEach((item) => {
      item.socket.close();
    });
  }
}
