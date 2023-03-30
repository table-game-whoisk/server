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
  it("user", async () => {
    const res = await request(app).post("/user/create").send();
    expect(res.status).toBe(200);
    const id = res.body.data.id;
    expect(res.body.data).not.toBeNull();
    const user = await request(app).get("/user/info").query({ id });
    expect(user.status).toBe(200);
    expect(user.body.data.id).toBe(id);
  });
});
