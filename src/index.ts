import "./utils/parseENV";
import express from "express";
import { startup } from "./startup";
import { router } from "./api";
import { globalError, response } from "./middleware";
import bodyParser from "body-parser"
import { createWebsocketServer } from "./IM/ws";
import { appStatus } from "./utils/app.status";
import { logger } from "./utils/logger";

const app = express();
const port = process.env.SERVER_PORT;

app.get('/hello', function (req, res) {
  res.status(200).json({ name: 'hello' });
});

export const server = app.listen(port, () => {
  startup().then(async (failed) => {
    if (failed) return;
    app.use(response)
    app.use(bodyParser.json());
    app.use(router);
    app.use(globalError);
    await createWebsocketServer();
    appStatus.isRunning()
  });
  console.log(`server start on port ${port}`);
}).on("close", () => {
  logger.info("server is stop now");
})

export default app