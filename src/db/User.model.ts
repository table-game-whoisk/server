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
      avatar: {
        type: DataTypes.STRING,
        allowNull: false
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: false
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
