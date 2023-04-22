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
  TimerTask.stop();
  await sequelize.close();
  await server.close();
});

describe("main", () => {
  // 获取用户
  it("create user", () => {});
});
