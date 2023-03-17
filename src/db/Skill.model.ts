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
      effectType: {
        type: DataTypes.STRING
      },
      duration: {
        type: DataTypes.INTEGER
      },
      timing: {
        type: DataTypes.STRING
      },
      target: {
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
      action: { type: DataTypes.STRING },
      roundNumber: { type: DataTypes.CHAR },
      cardOrigin: { type: DataTypes.STRING },
      cardType: {
        type: DataTypes.STRING
      },
      drop: {
        type: DataTypes.STRING
      },
      gain: {
        type: DataTypes.INTEGER
      }
    },
    { sequelize, timestamps: false, modelName: "Skill", tableName: "skill" }
  ).sync();
}
