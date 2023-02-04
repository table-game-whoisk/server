import { ErrorRequestHandler } from "express"

export const globalError: ErrorRequestHandler = (err, req, res, next) => {
  
  res.json({ msg: "" })
}