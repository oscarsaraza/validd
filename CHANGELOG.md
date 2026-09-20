# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-09-20

### Added
- Dual-package distribution supporting both native ES Modules (`import`) and CommonJS (`require`).
- Built-in TypeScript declarations (`lib/index.d.ts` and `lib/index.d.cts`) generated automatically without third-party tools.
- Modern GitHub Actions CI matrix workflow testing against Node.js 18.x, 20.x, 22.x, and 24.x.
- Automated release and publish workflow with NPM Provenance support.
- Native build script (`scripts/build.js`) using Node.js built-in `node:fs` and `node:path`.
- CommonJS compatibility test case in the test suite.

### Changed
- Migrated test runner and assertion library to Node.js native `node:test` and `node:assert`, modernizing tests with `async/await`.
- Updated package configuration with `"type": "module"`, `"exports"` field, `"types"`, and `"engines": { "node": ">=18.0.0" }`.
- Modernized documentation in `readme.md` with usage instructions for ESM, CJS, and TypeScript.
- Updated CircleCI configuration to modern `cimg/node:22.0.0`.

### Removed
- Removed 100% of external dependencies (`@babel/core`, `@babel/cli`, `@babel/preset-env`, `@babel/register`, `mocha`, `chai`) and their 266 transitive packages.
- Removed redundant `.npmignore` in favor of the `"files": ["lib", "src"]` field in `package.json`.

### Security
- Resolved 34 security vulnerabilities found in previous development dependencies (including high-severity CVEs in `glob`, `serialize-javascript`, `minimatch`, `brace-expansion`, and `js-yaml`).

## [0.0.15] - 2023-12-26

### Changed
- Updated development dependencies.

## [0.0.14] - 2023-01-11

### Changed
- Maintenance updates and dependency bumps.

## [0.0.13] - 2022-05-15

### Added
- Initial experimental schema validation features and core validations.

[Unreleased]: https://github.com/oscarsaraza/validd/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/oscarsaraza/validd/compare/v0.0.15...v0.1.0
[0.0.15]: https://github.com/oscarsaraza/validd/compare/v0.0.14...v0.0.15
[0.0.14]: https://github.com/oscarsaraza/validd/compare/v0.0.13...v0.0.14
[0.0.13]: https://github.com/oscarsaraza/validd/releases/tag/v0.0.13
