import express, { RequestHandler } from "express";
import { MaterialModel } from "../db/Material.model";

const router = express.Router();

class Material {
  createCharacter: RequestHandler = async (req, res, next) => {
    try {
    } catch (e) {
      next(e);
    }
  };
}

export const material = new Material();

router.get("/character", material.createCharacter);

export default router;
