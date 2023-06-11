import { Model } from "sequelize";
import { UserModel } from "../db/User.model";
import axios from "axios";
import FormData from "form-data";
import tunnel from "tunnel";

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

      const agent = tunnel.httpsOverHttp({
        proxy: {
          host: "213.52.102.32",
          port: 10800
        }
      });

      const response = await axios.request({
        url: "https://sm.ms/api/v2/token",
        method: "post",
        data: data,
        httpsAgent: agent,
        proxy: false // 设置axios不要自动检测命令行代理设置
      });

      console.log(response.data.data);
      UserCache.token = response?.data?.data?.token || "";
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
