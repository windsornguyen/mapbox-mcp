// Cross-platform build helper script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create directory recursively (cross-platform equivalent of mkdir -p)
function mkdirp(dirPath) {
  const absolutePath = path.resolve(dirPath);
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }
}

// Create ESM package.json
function createEsmPackage() {
  mkdirp('dist/esm');
  fs.writeFileSync('dist/esm/package.json', JSON.stringify({ type: 'module' }, null, 2));
}

// Create CJS package.json
function createCjsPackage() {
  mkdirp('dist/cjs');
  fs.writeFileSync('dist/cjs/package.json', JSON.stringify({ type: 'commonjs' }, null, 2));
}

// Generate version info
function generateVersion() {
  mkdirp('dist');
  
  const sha = execSync('git rev-parse HEAD').toString().trim();
  const tag = execSync('git describe --tags --always').toString().trim();
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  const version = process.env.npm_package_version;
  
  const versionInfo = {
    sha,
    tag,
    branch,
    version
  };
  
  fs.writeFileSync('dist/version.json', JSON.stringify(versionInfo, null, 2));
}

// Process command line arguments
const command = process.argv[2];

switch (command) {
  case 'esm-package':
    createEsmPackage();
    break;
  case 'cjs-package':
    createCjsPackage();
    break;
  case 'generate-version':
    generateVersion();
    break;
  default:
    console.error('Unknown command:', command);
    process.exit(1);
}
