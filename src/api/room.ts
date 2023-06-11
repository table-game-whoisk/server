import express, { RequestHandler } from "express";
import path from "path";
import { UserCache } from "../cache/user";

const router = express.Router();

class Room {
  test: RequestHandler = async (req, res, next) => {
    try {
      res.sendFile(path.resolve(__dirname, "../IM/ws.html"));
    } catch (e) {
      next(e);
    }
  };
  upload: RequestHandler = async (req, res, next) => {
    try {
      console.log(UserCache.token);
      console.log(req.body);
      res.json({ data: "pic url" });
    } catch (e) {
      next(e);
    }
  };
}

export const room = new Room();

router.get("/test", room.test);
router.get("/post", room.upload);

export default router;
