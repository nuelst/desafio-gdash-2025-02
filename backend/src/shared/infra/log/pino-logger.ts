import { Injectable } from '@nestjs/common';
import { ILogger } from '../../app/ports/outbound';

@Injectable()
export class PinoLogger implements ILogger {
  info(message: string, data?: Record<string, any>): void {
    console.log(`[INFO] ${message}`, data || '');
  }

  warn(message: string, data?: Record<string, any>): void {
    console.warn(`[WARN] ${message}`, data || '');
  }

  error(message: string, error: Error, data?: Record<string, any>): void {
    console.error(`[ERROR] ${message}`, error, data || '');
  }
}
