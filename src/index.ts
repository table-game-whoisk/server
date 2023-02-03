import "./utils/parseENV";
import express from "express";
import { startup } from "./startup";
import { router } from "./api";

const app = express();
const port = process.env.SERVER_PORT;

app.listen(port, () => {
  startup().then((failed) => {
    if (failed) return;
    app.use(router);
  });
  console.log(`server start on port ${port}`);
});
