module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  rootDir: 'src',
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)x?$',
  transform: {
    '\\.[jt]sx?$': [
      'ts-jest',
      {
        isolatedModules: true,
        tsconfig: 'tsconfig.test.json',
        useESM: true,
      },
    ],
  },

  // transform all modules because it would be impossible to keep up with
  // the entire dependency tree. for example when doing this
  // '/node_modules/(?!(node-fetch)/)' an error threw for `data-uri-to-buffer`
  // which is a dependency of `node-fetch`. we would be endlessly chasing these
  // down if we tried to manually curate this.
  transformIgnorePatterns: [],
};
