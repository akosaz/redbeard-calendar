import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateEnv } from './env';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should validate correct environment variables', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.ADMIN_PASSWORD = 'test-password-123';
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'development';

    const env = validateEnv();

    expect(env.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db');
    expect(env.ADMIN_PASSWORD).toBe('test-password-123');
    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe('development');
  });

  it('should use default values for optional variables', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.ADMIN_PASSWORD = 'test-password-123';

    const env = validateEnv();

    expect(env.PORT).toBe(8080); // default
    expect(env.NODE_ENV).toBe('development'); // default
  });

  it('should throw error when DATABASE_URL is missing', () => {
    process.env.ADMIN_PASSWORD = 'test-password-123';
    delete process.env.DATABASE_URL;

    expect(() => validateEnv()).toThrow('Invalid environment variables');
  });

  it('should throw error when ADMIN_PASSWORD is missing', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    delete process.env.ADMIN_PASSWORD;

    expect(() => validateEnv()).toThrow('Invalid environment variables');
  });

  it('should throw error when DATABASE_URL is not a valid URL', () => {
    process.env.DATABASE_URL = 'not-a-url';
    process.env.ADMIN_PASSWORD = 'test-password-123';

    expect(() => validateEnv()).toThrow('Invalid environment variables');
  });

  it('should accept valid NODE_ENV values', () => {
    const validEnvs = ['development', 'production', 'test'] as const;

    for (const nodeEnv of validEnvs) {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
      process.env.ADMIN_PASSWORD = 'test-password-123';
      process.env.NODE_ENV = nodeEnv;

      const env = validateEnv();
      expect(env.NODE_ENV).toBe(nodeEnv);
    }
  });
});
