import express, { RequestHandler } from "express";
import { v1 } from "uuid";
import { CharacterModel } from "../db/Character.model";
import { SkillModel } from "../db/Skill.model";

const router = express.Router();

class Character {
  list: RequestHandler = async (req, res, next) => {
    try {
      const data = await CharacterModel.findAll({ where: { type: "character" }, include: SkillModel });
    } catch (e) {
      next(e);
    }
  };
  create: RequestHandler = async (req, res, next) => {
    try {
      const data = req.body as CharacterProp;
      const id = v1();
      const character = await CharacterModel.create({
        ...data,
        id
      });
      res.json({ data: { ...character.dataValues } });
    } catch (e) {
      next(e);
    }
  };
  update: RequestHandler = async (req, res, next) => {
    try {
      const data = req.body as CharacterProp;
      const { id } = data;
      await CharacterModel.update({ ...data }, { where: { id } });
    } catch (e) {
      next(e);
    }
  };
}

export const character = new Character();

router.get("/list", character.list);
router.post("/create", character.create);
router.post("/update", character.update);

export default router;
