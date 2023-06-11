import { Model } from "sequelize";
import { UserModel } from "../db/User.model";
import axios from "axios";
import FormData from "form-data";

export class UserCache {
  static list = new Map<string, Model<UserProp, UserProp>>();
  static async initCache() {
    const list = await UserModel.findAll();
    list.forEach((item) => UserCache.list.set(item.getDataValue("id"), item));
  }
  static token = "";

  static async initUpload() {
    try {
      const data = new FormData();
      data.append("username", "coolechi@foxmail.com");
      data.append("password", "wwmm@xy123");

      const config = {
        method: "post",
        url: "https://sm.ms/api/v2/token",
        headers: {
          Accept: "*/*",
          Host: "sm.ms",
          Connection: "keep-alive",
          ...data.getHeaders()
        },
        data: data
      };

      const response = await axios(config);
      UserCache.token = response?.data?.token || "";
    } catch (e) {
      console.log(e);
    }
  }

  static findUser(id: string) {
    return this.list.get(id);
  }

  static existUser(id: string) {
    return this.list.has(id);
  }
}
