import { beforeAll } from 'vitest';

// Set up test environment variables
beforeAll(() => {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/testdb';
  process.env.ADMIN_PASSWORD = 'test-admin-password-123';
  process.env.PORT = '8081';
  process.env.NODE_ENV = 'test';
});
