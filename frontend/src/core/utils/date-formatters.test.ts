import { describe, expect, it } from 'vitest';
import { formatCondition, formatDate, formatDateTime, formatTime } from './date-formatters';

describe('date-formatters', () => {
  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const date = new Date('2024-01-15T14:30:00Z');
      const result = formatDateTime(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
    });

    it('should handle string dates', () => {
      const result = formatDateTime('2024-01-15T14:30:00Z');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T14:30:00Z');
      const result = formatDate(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      const date = new Date('2024-01-15T14:30:00Z');
      const result = formatTime(date);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('formatCondition', () => {
    it('should translate weather conditions to Portuguese', () => {
      expect(formatCondition('clear_sky')).toBe('Céu Limpo');
      expect(formatCondition('partly_cloudy')).toBe('Parcialmente Nublado');
      expect(formatCondition('overcast')).toBe('Nublado');
      expect(formatCondition('slight_rain_showers')).toBe('Chuvisco Leve');
      expect(formatCondition('heavy_rain')).toBe('Chuva Forte');
      expect(formatCondition('thunderstorm')).toBe('Tempestade');
    });

    it('should handle unknown conditions with fallback formatting', () => {
      expect(formatCondition('unknown_condition')).toBe('Unknown Condition');
    });

    it('should handle case-insensitive conditions', () => {
      expect(formatCondition('CLEAR_SKY')).toBe('Céu Limpo');
      expect(formatCondition('Overcast')).toBe('Nublado');
    });
  });
});

