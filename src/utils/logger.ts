import { config } from '../config/index.js';

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

class ConsoleLogger implements Logger {
  private level: string;
  private format: string;

  constructor() {
    this.level = config.logging.level;
    this.format = config.logging.format;
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.level);
    const logLevelIndex = levels.indexOf(level);
    return logLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    
    if (this.format === 'json') {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message,
        data: args.length > 0 ? args : undefined,
      });
    } else {
      const argsStr = args.length > 0 ? ' ' + args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ') : '';
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${argsStr}`;
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, ...args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, ...args));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, ...args));
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, ...args));
    }
  }
}

export const logger: Logger = new ConsoleLogger();
