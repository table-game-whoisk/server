import express, { RequestHandler } from "express";
import path from "path";

const router = express.Router();

class Room {
  test: RequestHandler = async (req, res, next) => {
    try {
      res.sendFile(path.resolve(__dirname, "../IM/ws.html"));
    } catch (e) {
      next(e);
    }
  };
}

export const room = new Room();

router.get("/test", room.test);

export default router;
