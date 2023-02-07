import { RequestHandler } from "express"

export const response: RequestHandler = (_, res, next) => {
  const oldJSON = res.json;
  res.json = <T = any>(json: { code?: number; data?: T; msg?: string; name?: string }) => {
    if (json && json.msg) {
      res.status(400);
      return oldJSON.call(res, { code: 400, ...json });
    } else if (json && json.data) {
      const defaultJSON = {
        data: null,
        code: 200,
        msg: "",
        ...(json || {})
      }
      res.status(defaultJSON.code);
      return oldJSON.call(res, defaultJSON);
    } else {
      return oldJSON.call(res, json);
    }
  }

  next()
}