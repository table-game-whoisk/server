import axios from "axios"

const instanse = axios.create({ baseURL: "http://localhost:4000/" })


it("hello world test", async () => {
  const data = await axios.get("http://localhost:4000/")
  expect(data.data).toBe('Hello World!');
})