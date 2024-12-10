// Logger utility for consistent console logging

interface LogMessage {
  type: "info" | "debug" | "warn" | "error";
  module: string;
  message: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private debugMode: boolean = false;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  private formatMessage({
    type,
    module,
    message,
  }: Omit<LogMessage, "data">): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${type.toUpperCase()}] [${module}] ${message}`;
  }

  info(module: string, message: string, data?: any): void {
    const formattedMessage = this.formatMessage({
      type: "info",
      module,
      message,
    });
    console.info(formattedMessage);
    if (data) console.info(data);
  }

  debug(module: string, message: string, data?: any): void {
    if (!this.debugMode) return;
    const formattedMessage = this.formatMessage({
      type: "debug",
      module,
      message,
    });
    console.debug(formattedMessage);
    if (data) console.debug(data);
  }

  warn(module: string, message: string, data?: any): void {
    const formattedMessage = this.formatMessage({
      type: "warn",
      module,
      message,
    });
    console.warn(formattedMessage);
    if (data) console.warn(data);
  }

  error(module: string, message: string, data?: any): void {
    const formattedMessage = this.formatMessage({
      type: "error",
      module,
      message,
    });
    console.error(formattedMessage);
    if (data) console.error(data);
  }
}

export const logger = Logger.getInstance();
