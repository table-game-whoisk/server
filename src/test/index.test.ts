
import request from "supertest"
import app, { server } from ".."
import { sequelize } from "../db"
import { appStatus } from "../utils/app.status"


beforeAll(async () => {
  await appStatus.waitRun()
})

afterAll(async () => {
  await sequelize.close()
  await server.close()
})

describe("main", () => {
  it("create user", async () => {
    const res = await request(app).post('/user/create').send({ nickname: "111" })
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty("nickname")
  })

})