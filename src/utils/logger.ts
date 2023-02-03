import winston, { format } from "winston"

const { combine, printf, timestamp } = format

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}][${level}] ${message}`;
});

export const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss:SSS" }), logFormat),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ dirname: "log", filename: 'info.log', level: "info" }),
    new winston.transports.File({ dirname: "log", filename: 'error.log', level: 'error' }),
  ],
});

