export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.{ts,js}', '!**/node_modules/**'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/../tsconfig.json',
    },
  },
};
