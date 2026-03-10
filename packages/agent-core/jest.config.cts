module.exports = {
  displayName: '@conscius/agent-core',
  preset: '../../jest.preset.js',
  coverageDirectory: 'test-output/jest/coverage',
  coverageReporters: ['lcov', 'text-summary'],
  passWithNoTests: true,
};
