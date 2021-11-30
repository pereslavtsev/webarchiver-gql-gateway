module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  setupFiles: ['<rootDir>/../test/setup.ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coveragePathIgnorePatterns: ['node_modules', 'index.ts'],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
