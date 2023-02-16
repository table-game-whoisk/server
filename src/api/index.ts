import express from "express";
import user from "./user";
import room from "./room";

export const router = express.Router();

router.use("/user", user);
router.use("/room", room);
