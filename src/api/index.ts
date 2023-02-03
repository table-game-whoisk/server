import express from "express";
import user from "./user";

export const router = express.Router();

router.use("/user", user);
