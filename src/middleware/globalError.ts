import { ErrorRequestHandler } from "express"
import { logger } from "../utils/logger";

export const globalError: ErrorRequestHandler = (err, req, res, next) => {
  const prefix = req.method.toUpperCase() + " " + req.url + " ";
  console.log(err)
  // 打印错误日志
  logger.error(prefix + JSON.stringify((req.method.toLowerCase() === "get" ? req.query : req.body)))


  res.json({ msg: err })
}