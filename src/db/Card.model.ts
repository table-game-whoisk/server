import { DataTypes, Model } from "sequelize";
import { sequelize } from ".";

export class CardModel extends Model<CardProp> {}

export function initCardModel() {
  return CardModel.init(
    {
      id: {
        type: DataTypes.STRING,
        unique: true,
        primaryKey: true,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING
      },
      name: {
        type: DataTypes.STRING
      },
      describe: {
        type: DataTypes.STRING
      },
      SkillId: {
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      timestamps: false,
      modelName: "Card",
      tableName: "card"
    }
  ).sync();
}
