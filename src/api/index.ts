import express from "express";
import user from "./user";
import room from "./room";
import material from "./material";

export const router = express.Router();

router.use("/user", user);
router.use("/room", room);
router.use("/material", material);
