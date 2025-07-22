import { createLogger, format, transports, Logger } from 'winston';
const { combine, timestamp, json, colorize, printf } = format;

// Custom format for console logging with colors
const consoleLogFormat = combine(
  colorize(),
  printf(({ level, message, timestamp, ip }) => {
    return `${timestamp} ${level} ${ip ? `IP: ${ip} ` : ''}: ${message}`;
  })
);

const logger: Logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    json() // JSON format for file logging
  ),
  transports: [
    new transports.Console({
      format: consoleLogFormat, // Custom console format with colors
    }),
    new transports.File({
      filename: 'app.log',
    }),
  ],
});

export default logger;
