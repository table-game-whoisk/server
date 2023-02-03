import { sequelize } from "./db"
import { logger } from "./utils/logger";

export const startup = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
}