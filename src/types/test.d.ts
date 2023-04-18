// test
namespace Test {
  declare interface Listener {
    userId: string;
    socket: WebSocket.websocket;
    message: () => Promise<MessageData>;
    send: (message: MessageData) => void;
  }
}
