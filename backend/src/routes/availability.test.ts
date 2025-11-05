import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Request validation schemas (extracted from server.ts for testing)
const monthQuerySchema = z.object({
  year: z.string().transform(Number),
  month: z.string().transform(Number),
});

const updateDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['available', 'limited', 'finished']),
  password: z.string(),
});

describe('Availability Route Schemas', () => {
  describe('monthQuerySchema', () => {
    it('should validate correct query parameters', () => {
      const result = monthQuerySchema.safeParse({
        year: '2024',
        month: '6',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.year).toBe(2024);
        expect(result.data.month).toBe(6);
      }
    });

    it('should reject missing parameters', () => {
      const result = monthQuerySchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should transform string numbers to numbers', () => {
      const result = monthQuerySchema.safeParse({
        year: '2024',
        month: '12',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.year).toBe('number');
        expect(typeof result.data.month).toBe('number');
      }
    });
  });

  describe('updateDaySchema', () => {
    it('should validate correct update request', () => {
      const result = updateDaySchema.safeParse({
        date: '2024-06-15',
        status: 'available',
        password: 'test-password',
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const invalidDates = [
        '2024/06/15',
        '15-06-2024',
        '2024-6-15',
        'invalid',
      ];

      for (const date of invalidDates) {
        const result = updateDaySchema.safeParse({
          date,
          status: 'available',
          password: 'test-password',
        });
        expect(result.success).toBe(false);
      }
    });

    it('should accept valid date formats', () => {
      const validDates = [
        '2024-01-01',
        '2024-12-31',
        '2024-06-15',
      ];

      for (const date of validDates) {
        const result = updateDaySchema.safeParse({
          date,
          status: 'available',
          password: 'test-password',
        });
        expect(result.success).toBe(true);
      }
    });

    it('should validate status enum', () => {
      const validStatuses = ['available', 'limited', 'finished'];

      for (const status of validStatuses) {
        const result = updateDaySchema.safeParse({
          date: '2024-06-15',
          status,
          password: 'test-password',
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid status values', () => {
      const result = updateDaySchema.safeParse({
        date: '2024-06-15',
        status: 'invalid-status',
        password: 'test-password',
      });

      expect(result.success).toBe(false);
    });

    it('should require password field', () => {
      const result = updateDaySchema.safeParse({
        date: '2024-06-15',
        status: 'available',
      });

      expect(result.success).toBe(false);
    });
  });
});
