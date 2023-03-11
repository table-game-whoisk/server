import { DataTypes, Model } from "sequelize";
import { force, sequelize } from ".";

export class UserModel extends Model<UserProp> {}

export function initUser() {
  return UserModel.init(
    {
      id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        primaryKey: true
      },
      nickname: {
        type: DataTypes.STRING
      },
      ip: {
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      modelName: "User",
      tableName: "user",
      timestamps: false
    }
  ).sync(force);
}
