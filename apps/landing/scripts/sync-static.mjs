import { cp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const landingRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(landingRoot, "..", "..");
const publicRoot = path.join(landingRoot, "public");
const generatedRoot = path.join(publicRoot, "generated");
const screenshotsSource = path.join(repoRoot, "screenshots");
const screenshotsTarget = path.join(generatedRoot, "screenshots");
const downloadTarget = path.join(generatedRoot, "downloads");

const apkCandidates = [
  process.env.DEVHORA_APK_PATH,
  path.join(repoRoot, "artifacts", "android", "devhora-latest.apk"),
  path.join(repoRoot, "apps", "mobile", "dist", "devhora-latest.apk")
].filter(Boolean);

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

await mkdir(publicRoot, { recursive: true });
await rm(generatedRoot, { recursive: true, force: true });
await mkdir(screenshotsTarget, { recursive: true });
await mkdir(downloadTarget, { recursive: true });

let hasScreenshots = false;
if (await exists(screenshotsSource)) {
  await cp(screenshotsSource, screenshotsTarget, { recursive: true });
  hasScreenshots = true;
}

let apkPath;
for (const candidate of apkCandidates) {
  if (await exists(candidate)) {
    apkPath = candidate;
    break;
  }
}

if (apkPath) {
  await cp(apkPath, path.join(downloadTarget, "devhora-latest.apk"));
}

const manifest = {
  hasApk: Boolean(apkPath),
  hasScreenshots,
  apkPath: apkPath ? "/generated/downloads/devhora-latest.apk" : null,
  generatedAt: new Date().toISOString()
};

await writeFile(path.join(generatedRoot, "site-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Synced landing assets. screenshots=${hasScreenshots} apk=${Boolean(apkPath)}`);
