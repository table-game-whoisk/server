import { Sequelize } from "sequelize";
import { initMaterial } from "./Material.model";
import { initUser } from "./User.model";

export const force = { force: process.env.NODE_ENV === "test" };

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
  await initMaterial();
};
