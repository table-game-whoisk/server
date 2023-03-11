import request from "supertest";
import app, { server } from "..";
import { sequelize } from "../db";
import { appStatus } from "../utils/app.status";
import { ScoketClient } from "../IM/ws.client";
import { generateRandomString } from "../utils";
import WebSocket from "ws";
import { TimerTask } from "../utils/timerTask";

beforeAll(async () => {
  await appStatus.waitRun();
});

afterAll(async () => {
  ScoketClient.close();
  TimerTask.stop();
  await sequelize.close();
  await server.close();
});

describe("main", () => {
  let nickname = generateRandomString(8);
  it("create user", async () => {
    const res = await request(app).post("/user/create").send({ nickname });
    expect(res.status).toBe(200);
    expect(res.body.data.nickname).toBe(nickname);
  });

  it("get user", async () => {
    const res = await request(app).get("/user/info");
    expect(res.status).toBe(200);
    expect(res.body.data.nickname).toBe(nickname);
  });

  it("connect websocket", async () => {
    let userId = generateRandomString(8);
    await ScoketClient.connect(userId);
    let listener = ScoketClient.getListener(userId);
    listener?.send({ type: "info" });
    const res = await listener?.message();
    expect(res?.type).toBe("info");
  });

  it("join room", async () => {
    let userId = generateRandomString(8);
    let roomId = generateRandomString(8);
    await ScoketClient.connect(userId);
    let listener = ScoketClient.getListener(userId);
    listener?.send({ type: "enter", roomId });
    const res = await listener?.message();
    expect(res?.content?.room.roomId).toBe(roomId);
  });

  let userIds = [generateRandomString(8), generateRandomString(8), generateRandomString(8), generateRandomString(8)];
  let roomId = generateRandomString(8);
  it.only("mutil player join room", async () => {
    for await (let id of userIds) {
      await ScoketClient.connect(id);
    }
    ScoketClient.listeners.forEach((l) => {
      l.send({ type: "enter", roomId });
    });
    const res = await ScoketClient.getListener(userIds[3])?.message();
    expect(res?.content?.room.roomId).toBe(roomId);
    expect(res?.content?.room.members.length).toBe(4);
  });

  it.only(" players start", async () => {
    ScoketClient.listeners.forEach((l) => {
      l.send({ type: "start" });
    });
    const res = await ScoketClient.getListener(userIds[0])?.message();
    console.log(res);
    expect(res?.content?.room.roomId).toBe(roomId);
    expect(res?.content?.room.status).toBe("playing");
  });
});
