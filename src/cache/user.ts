import { Model } from "sequelize";
import { UserModel } from "../db/User.model";

export class UserCache {
  static list = new Map<string, Model<UserProp, UserProp>>()
  static async initCache() {
    const list = await UserModel.findAll();
    list.forEach((item) =>
      UserCache.list.set(item.getDataValue("id"), item)
    )
  }
  static findUser(id: string) {
    return this.list.get(id)
  }

  static existUser(id: string) {
    return this.list.has(id);
  }

}