import { DataTypes, Model } from "sequelize";
import { sequelize } from ".";

export class CharacterModel extends Model<CharacterProp> {}

export function initCharacter() {
  return CharacterModel.init(
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
      type: {
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
      }
    },
    {
      sequelize,
      modelName: "Character",
      tableName: "character",
      timestamps: false
    }
  ).sync();
}
