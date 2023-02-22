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
      id = v1();
      while (UserCache.existUser(id)) {
        id = v1();
      }
      const user = await UserModel.create({
        id,
        nickname
      });
      UserCache.list.set(id, user);
      res.json({ data: user.toJSON() });
    } catch (e) {
      next(e);
    }
  };
  userInfo: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = UserCache.findUser(id);
      user ? res.json({ data: user.toJSON() }) : res.json({ data: null });
    } catch (e) {
      next(e);
    }
  };
}

export const user = new User();

router.post("/create", user.createUser);
router.get("/info", user.userInfo);

export default router;
