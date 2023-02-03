import { sequelize, initModel } from "./db";
import { logger } from "./utils/logger";

export const startup = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Connection has been established successfully.");
    await initModel();
  } catch (error) {
    return logger.error("Unable to connect to the database:", error);
  }
};
