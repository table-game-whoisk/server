import express, { RequestHandler } from "express";
import { UserModel } from "../db/User.model";
import { v1 } from "uuid";
import { logger } from "../utils/logger";
import { UserCache } from "../cache/user";

const router = express.Router();

class User {
  createUser: RequestHandler = async (req, res, next) => {
    try {
      let id = "";
      const { nickname } = req.body;
      const ip = req.ip;
      id = v1();
      const user = await UserModel.create({
        id,
        nickname,
        ip
      });
      UserCache.list.set(id, user);
      res.json({ data: user });
    } catch (e) {
      next(e);
    }
  };
  userInfo: RequestHandler = async (req, res, next) => {
    try {
      const ip = req.ip;
      const user = await UserModel.findOne({ where: { ip } });
      user ? res.json({ data: user }) : res.json({ data: null });
    } catch (e) {
      next(e);
    }
  };
}

export const user = new User();

router.post("/create", user.createUser);
router.get("/info", user.userInfo);

export default router;
