import { createDefaultPreset } from 'ts-jest';

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  globals: {
    'esbuild-jest': {
      target: 'es2022',
      format: 'esm'
    }
  },
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/index.ts'],
  testPathIgnorePatterns: ['/node_modules/', 'src/index.ts', '/dist/'],
  transform: {
    ...tsJestTransformCfg
  }
};
