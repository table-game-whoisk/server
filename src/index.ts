import "./utils/parseENV";
import express from "express";
import { startup } from "./startup";
import { router } from "./api";
import { globalError, response } from "./middleware";
import bodyParser from "body-parser"

const app = express();
const port = process.env.SERVER_PORT;

app.listen(port, () => {
  startup().then((failed) => {
    if (failed) return;
    app.use(response)
    app.use(bodyParser.json());
    app.use(router);
    app.use(globalError);
  });
  console.log(`server start on port ${port}`);
}).on("close", () => {
  console.log("server is stop now");
});
