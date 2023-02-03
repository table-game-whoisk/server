import { Sequelize } from "sequelize";
import { initUser } from "./User.model";

export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.HOST,
  dialect: "mysql",
  port: 3306,
  logging: false,
  timezone: "Asia/Shanghai",
  dialectOptions: {
    timezone: "local"
  }
});

export const initModel = async () => {
  await initUser();
};
