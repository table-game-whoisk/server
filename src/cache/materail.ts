import { Model } from "sequelize";
import { CardModel } from "../db/Card.model";
import { CharacterModel } from "../db/Character.model";
import { SkillModel } from "../db/Skill.model";

export class MaterialCache {
  static characterList = new Map<string, Model<CharacterProp, CharacterProp>>();
  static cardList = new Map<string, Model<CardProp, CardProp>>();
  static initCache = async () => {
    SkillModel.hasMany(CharacterModel);
    CharacterModel.belongsTo(SkillModel);
    SkillModel.hasMany(CardModel);
    CardModel.belongsTo(SkillModel);

    const list = await CharacterModel.findAll({
      include: {
        model: SkillModel
      }
    });
    list.forEach((item) => {
      MaterialCache.characterList.set(item.getDataValue("id"), item);
    });
    const cards = await CardModel.findAll({ include: SkillModel });
    cards.forEach((item) => {
      MaterialCache.cardList.set(item.getDataValue("id"), item);
    });
  };
  static find(name: "characterList" | "cardList", id: string) {
    return MaterialCache[name].get(id);
  }
  static exist(name: "characterList" | "cardList", id: string) {
    return MaterialCache[name].has(id);
  }
}
