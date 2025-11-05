import { describe, it, expect } from 'vitest';
import { pad, isoYMD, isoDate } from '../../../shared/utils';

describe('Utility Functions', () => {
  describe('pad', () => {
    it('should pad single digit numbers with zero', () => {
      expect(pad(1)).toBe('01');
      expect(pad(5)).toBe('05');
      expect(pad(9)).toBe('09');
    });

    it('should not pad double digit numbers', () => {
      expect(pad(10)).toBe('10');
      expect(pad(25)).toBe('25');
      expect(pad(99)).toBe('99');
    });

    it('should handle edge cases', () => {
      expect(pad(0)).toBe('00');
    });
  });

  describe('isoYMD', () => {
    it('should format dates correctly', () => {
      expect(isoYMD(2024, 1, 1)).toBe('2024-01-01');
      expect(isoYMD(2024, 12, 31)).toBe('2024-12-31');
      expect(isoYMD(2024, 6, 15)).toBe('2024-06-15');
    });

    it('should pad single digit months and days', () => {
      expect(isoYMD(2024, 3, 5)).toBe('2024-03-05');
    });

    it('should not pad double digit months and days', () => {
      expect(isoYMD(2024, 10, 25)).toBe('2024-10-25');
    });
  });

  describe('isoDate', () => {
    it('should convert Date to ISO date string', () => {
      const date = new Date('2024-06-15T12:30:45.000Z');
      expect(isoDate(date)).toBe('2024-06-15');
    });

    it('should handle different dates', () => {
      expect(isoDate(new Date('2024-01-01T00:00:00.000Z'))).toBe('2024-01-01');
      expect(isoDate(new Date('2024-12-31T23:59:59.999Z'))).toBe('2024-12-31');
    });

    it('should ignore time component', () => {
      const date1 = new Date('2024-06-15T00:00:00.000Z');
      const date2 = new Date('2024-06-15T23:59:59.999Z');

      expect(isoDate(date1)).toBe('2024-06-15');
      expect(isoDate(date2)).toBe('2024-06-15');
    });
  });
});
