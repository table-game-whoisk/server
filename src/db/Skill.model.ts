import { DataTypes, Model } from "sequelize";
import { force, sequelize } from ".";

export class SkillModel extends Model<SkillProp> {}

export function initSkillModel() {
  return SkillModel.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      name: {
        type: DataTypes.STRING
      },
      describe: {
        type: DataTypes.STRING
      },
      action: {
        type: DataTypes.STRING
      },
      duration: {
        type: DataTypes.STRING
      },
      health: {
        type: DataTypes.INTEGER
      },
      attack: {
        type: DataTypes.INTEGER
      },
      defense: {
        type: DataTypes.INTEGER
      },
      dodge: {
        type: DataTypes.INTEGER
      },
      drop: {
        type: DataTypes.STRING
      },
      pickUp: {
        type: DataTypes.INTEGER
      },
      where: {
        type: DataTypes.STRING
      },
      to: DataTypes.STRING,
      cardType: {
        type: DataTypes.STRING
      },
      effectStep: DataTypes.STRING,
      effectType: DataTypes.CHAR
    },
    { sequelize, timestamps: false, modelName: "Skill", tableName: "skill" }
  ).sync();
}
