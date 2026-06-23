/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./jest.setup.js'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|expo-modules-core|firebase|jest-expo)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/node_modules/react-native',
    '^expo-modules-core/src/polyfill/dangerous-internal$':
      '<rootDir>/src/__mocks__/dangerous-internal.js',
  },
};
