module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts', 'node'],
  rootDir: 'src',
  testRegex: '.*\\\.spec\\\.ts$',
  transform: {
    '^.+\\\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.{ts,js}', '!**/node_modules/**'],
  coverageDirectory: '../coverage',
};
