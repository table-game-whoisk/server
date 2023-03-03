import express, { RequestHandler } from "express";
import { v1 } from "uuid";
import { MaterialCache } from "../cache/materail";
import { CharacterModel } from "../db/Character.model";
import { SkillModel } from "../db/Skill.model";

const router = express.Router();

class Character {
  list: RequestHandler = async (req, res, next) => {
    try {
      const data = await CharacterModel.findAll({ where: { type: "character" }, include: SkillModel });
      res.json(data);
    } catch (e) {
      next(e);
    }
  };
  create: RequestHandler = async (req, res, next) => {
    try {
      const { characterData, skillData } = req.body as { characterData: CharacterProp; skillData: SkillProp };
      const id = v1();
      const skillId = v1();
      const character = await CharacterModel.create(
        {
          ...characterData,
          id,
          Skill: { ...skillData, id: skillId } as SkillProp
        },
        { include: SkillModel }
      );
      MaterialCache.characterList.set(id, character);
      res.json({ data: { ...character.dataValues } });
    } catch (e) {
      next(e);
    }
  };
  update: RequestHandler = async (req, res, next) => {
    try {
      const { characterData, skillData } = req.body as { characterData: CharacterProp; skillData: SkillProp };
      await CharacterModel.update(
        { ...characterData },
        {
          where: { id: characterData.id }
        }
      );
      await SkillModel.update({ ...skillData }, { where: { id: characterData.SkillId } });
      const data = await CharacterModel.findOne({ where: { id: characterData.id }, include: SkillModel });
      res.json({ data });
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
