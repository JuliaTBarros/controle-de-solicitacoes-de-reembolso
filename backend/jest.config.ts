export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['dotenv/config'],
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
};
