
import request from "supertest"
import app from ".."
import { startup } from "../startup"

describe("main", () => {
  beforeEach(async () => {
    await startup()
  })

  it("test", async () => {
    const res = await request(app).post('/user/create').send({ nickname: "111" })
    expect(res.status).toBe(200)
  })
})