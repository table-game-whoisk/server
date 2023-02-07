import express, { RequestHandler } from "express";
import { UserModel } from "../db/User.model";
import { v1 } from "uuid"
import { logger } from "../utils/logger";
import { UserCache } from "../cache/user";

const router = express.Router();

class User {
  getUsersList: RequestHandler = async (req, res) => {
    const data = await UserModel.findAll();
    res.json({ data });
  };
  createUser: RequestHandler = async (req, res, next) => {
    try {

      const nickname = (req.body as { nickname?: string }).nickname || ""
      const id = v1()
      const user = await UserModel.create({
        id,
        nickname,
      });
      UserCache.list.set(id, user);
      res.json({ data: user.toJSON() });
    } catch (e) { next(e) }

  };
  userInfo: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params
      const user = UserCache.findUser(id)
      user ? res.json({ data: user.toJSON() }) : res.json({ data: null })
    } catch (e) { next(e) }
  }
}

export const user = new User();

router.get("/list", user.getUsersList);
router.post("/create", user.createUser);
router.get("/info", user.userInfo)

export default router;

