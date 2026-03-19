import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const distDir = path.join(root, 'dist');
const releaseDir = path.join(root, 'release');
const releaseName = 'rallysimfans-browser-plugin';
const zipPath = path.join(root, `${releaseName}.zip`);

const manifestSrc = path.join(root, 'manifest.json');
const stylesSrc = path.join(root, 'styles.css');
const builtContentSrc = path.join(distDir, 'content.js');

const manifestDest = path.join(releaseDir, 'manifest.json');
const stylesDest = path.join(releaseDir, 'styles.css');
const contentDest = path.join(releaseDir, 'content.js');

function ensureFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required file does not exist: ${filePath}`);
  }
}

function removeIfExists(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

function mkdirp(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
}

function rewriteManifestForRelease() {
  const raw = fs.readFileSync(manifestSrc, 'utf8');
  const manifest = JSON.parse(raw);

  if (!Array.isArray(manifest.content_scripts)) {
    throw new Error('manifest.json does not contain a content_scripts array');
  }

  for (const script of manifest.content_scripts) {
    if (!Array.isArray(script.js)) continue;
    script.js = script.js.map((entry) => {
      if (entry === 'dist/content.js') return 'content.js';
      return entry;
    });
  }

  fs.writeFileSync(manifestDest, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

function createZipFromReleaseDir() {
  removeIfExists(zipPath);

  execFileSync('zip', ['-r', zipPath, '.'], {
    cwd: releaseDir,
    stdio: 'inherit',
  });
}

function main() {
  ensureFileExists(manifestSrc);
  ensureFileExists(stylesSrc);
  ensureFileExists(builtContentSrc);

  removeIfExists(releaseDir);
  mkdirp(releaseDir);

  rewriteManifestForRelease();
  copyFile(stylesSrc, stylesDest);
  copyFile(builtContentSrc, contentDest);

  createZipFromReleaseDir();

  console.log(`Created release folder: ${releaseDir}`);
  console.log(`Created release zip: ${zipPath}`);
}

main();