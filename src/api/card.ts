// import express, { RequestHandler } from "express";
// import { v1 } from "uuid";
// import { MaterialCache } from "../cache/materail";
// import { CardModel } from "../db/Card.model";
// import { SkillModel } from "../db/Skill.model";

// const router = express.Router();

// class Card {
//   list: RequestHandler = async (req, res, next) => {
//     try {
//       const data = await CardModel.findAll({ include: SkillModel });
//       res.json(data);
//     } catch (e) {
//       next(e);
//     }
//   };
//   get: RequestHandler = async (req, res, next) => {
//     try {
//       const { id } = req.query as { id: string };
//       const cards = await CardModel.findOne({ where: { id }, include: SkillModel });
//       res.json({ data: cards });
//     } catch (e) {
//       next(e);
//     }
//   };
//   delete: RequestHandler = async (req, res, next) => {
//     try {
//       const { id, SkillId } = req.body as CardProp;
//       await CardModel.destroy({ where: { id } });
//       await SkillModel.destroy({ where: { id: SkillId } });
//       res.json({ data: null });
//     } catch (e) {
//       next(e);
//     }
//   };
//   create: RequestHandler = async (req, res, next) => {
//     try {
//       const { cardData, skillData } = req.body as { cardData: CardProp; skillData: SkillProp };
//       const id = v1();
//       const skillId = v1();
//       const card = await CardModel.create(
//         {
//           ...cardData,
//           id,
//           Skill: { ...skillData, id: skillId } as SkillProp
//         },
//         { include: SkillModel }
//       );
//       MaterialCache.cardList.set(id, card);
//       res.json({ data: { ...card.dataValues } });
//     } catch (e) {
//       next(e);
//     }
//   };
//   update: RequestHandler = async (req, res, next) => {
//     try {
//       const { cardData, skillData } = req.body as { cardData: CardProp; skillData: SkillProp };
//       await CardModel.update(
//         { ...cardData },
//         {
//           where: { id: cardData.id }
//         }
//       );
//       await SkillModel.update({ ...skillData }, { where: { id: cardData.SkillId } });
//       const data = await CardModel.findOne({ where: { id: cardData.id }, include: SkillModel });
//       res.json({ data });
//     } catch (e) {
//       next(e);
//     }
//   };
// }

// const card = new Card();

// router.get("/list", card.list);
// router.get("/get", card.get);
// router.delete("/delete", card.delete);
// router.post("/create", card.create);
// router.post("/update", card.update);

// export default router;
