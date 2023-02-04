import { RequestHandler } from "express"

export const response: RequestHandler = (_, res, next) => {
 
  next()
}