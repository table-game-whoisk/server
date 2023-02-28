import { DataTypes, Model } from "sequelize";
import { sequelize } from ".";

export class MaterialModel extends Model<MaterialProp> {}

export function initMaterial() {
  return MaterialModel.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      modelName: "Material",
      tableName: "material",
      timestamps: false
    }
  ).sync();
}
