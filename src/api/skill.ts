import express, { RequestHandler } from "express";
import { v1 } from "uuid";
import { SkillModel } from "../db/Skill.model";

const router = express.Router();

class Skill {
  list: RequestHandler = async (req, res, next) => {
    try {
      const data = await SkillModel.findAll();
      res.json({ data });
    } catch (e) {}
  };
  create: RequestHandler = async (req, res, next) => {
    try {
      const data = req.body as SkillProp;
      await SkillModel.create({
        ...data,
        id: v1()
      });
    } catch (e) {}
  };
  update: RequestHandler = async (req, res, next) => {
    try {
      const data = req.body as SkillProp;
      await SkillModel.update({ ...data }, { where: { id: data.id } });
    } catch (e) {
      next(e);
    }
  };
}
const skill = new Skill();

router.get("/list", skill.list);
router.get("/craete", skill.create);
router.get("/update", skill.update);

export default router;
