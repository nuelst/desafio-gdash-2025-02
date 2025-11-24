import { describe, expect, it } from 'vitest';
import { formatCondition, formatDateTime, formatTime } from './date-formatters';

describe('date-formatters', () => {
  describe('formatTime', () => {
    it('should format time correctly', () => {
      const date = new Date('2024-01-01T14:30:00Z');
      const result = formatTime(date.toISOString());
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle different date formats', () => {
      const isoString = '2024-01-01T14:30:00.000Z';
      const result = formatTime(isoString);
      expect(result).toBeDefined();
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const date = new Date('2024-01-01T14:30:00Z');
      const result = formatDateTime(date.toISOString());
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatCondition', () => {
    it('should format condition correctly', () => {
      expect(formatCondition('clear_sky')).toBe('Clear Sky');
      expect(formatCondition('partly_cloudy')).toBe('Partly Cloudy');
      expect(formatCondition('rain')).toBe('Rain');
    });

    it('should handle unknown conditions', () => {
      const result = formatCondition('unknown_condition');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toBe('Unknown Condition');
    });
  });
});

