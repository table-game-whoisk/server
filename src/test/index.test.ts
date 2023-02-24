
import request from "supertest"
import app, { server } from ".."
import { sequelize } from "../db"
import { appStatus } from "../utils/app.status"
import { ScoketClient } from "../IM/ws.client"
import { generateRandomString } from "../utils"
import WebSocket from "ws"
import { TimerTask } from "../utils/timerTask"

beforeAll(async () => {
  await appStatus.waitRun()
})

afterAll(async () => {
  ScoketClient.close();
  TimerTask.stop();
  await sequelize.close()
  await server.close()
})

describe("main", () => {
  it("create user", async () => {
    let nickname = generateRandomString(8)
    const res = await request(app).post('/user/create').send({ nickname })
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty("nickname")
  })

  it("connect ws", async () => {
    let nickname = generateRandomString(8)
    const res = await request(app).post('/user/create').send({ nickname })
    const userId = res.body.data.id
    const isOpen = await ScoketClient.connect(userId)
    expect(isOpen).toBe(true)
  })

  it("ping pong test", async () => {
    jest.useFakeTimers();
    let index = 1
    let userId = generateRandomString(8)
    await ScoketClient.connect(userId)
    let listener = ScoketClient.getListener(userId)
    TimerTask.register({
      date: new Date(Date.now() + 1000 * 6),
      action: () => {
        listener?.socket.pong()
        index++
      },
    })
    setTimeout(() => {
      expect(index).toBeGreaterThan(2)
    }, 7000);
  })

  it("get player info", async () => {
    let userId = generateRandomString(8)
    await ScoketClient.connect(userId)
    let listener = ScoketClient.getListener(userId)
    listener?.socket.send(JSON.stringify({ type: "info" }))
    const data = await listener?.message()
    expect(data?.type).toBe("info")
    expect(data?.content).toHaveProperty("roomId")
  })

  it("create room", async () => { })

  it("reconnect room", async () => { })

  it("join room", async () => { })

  it("ready test", async () => { })

  it("game start", async () => { })
})
