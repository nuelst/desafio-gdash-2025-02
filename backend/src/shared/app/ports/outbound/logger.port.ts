export interface ILogger {
  info(message: string, data?: Record<string, any>): void;
  warn(message: string, data?: Record<string, any>): void;
  error(message: string, error: Error, data?: Record<string, any>): void;
}
