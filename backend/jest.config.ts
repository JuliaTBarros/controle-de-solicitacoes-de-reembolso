export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    globalSetup: '<rootDir>/tests/globalSetup.ts',
    setupFiles: ['<rootDir>/tests/env.setup.ts'],
    setupFilesAfterEnv: ['<rootDir>/tests/dbSetup.ts'],
    collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.test.json',
        },
    },
};
