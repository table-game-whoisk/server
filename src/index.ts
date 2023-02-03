import "./utils/parseENV"
import express from "express"
import { startup } from "./startup"

const app = express()
const port = process.env.SERVER_PORT

app.listen(port, () => {
  startup()
  console.log(`server start on port ${port}`)
})
