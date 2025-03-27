export default {
  displayName: 'bff',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  coverageReporters: [['lcov', { projectRoot: __dirname }], 'text', 'text-summary'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: './coverage',
};
