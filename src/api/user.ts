import express, { RequestHandler } from "express";
import { UserModel } from "../db/User.model";

const router = express.Router();

class User {
  getUsers: RequestHandler = async (req, res) => {
    const data = await UserModel.findAll();
    res.json({ data });
  };
}

export const user = new User();

router.get("/all", user.getUsers);

export default router;
