import express from "express";
import user from "./user";
import room from "./room";
import character from "./character";
import card from "./card";

export const router = express.Router();

router.use("/user", user);
router.use("/room", room);
router.use("/character", character);
router.use("/card", card);
