import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const landingRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(landingRoot, "..", "..");
const publicDir = path.join(landingRoot, "public");
const distDir = path.join(landingRoot, "dist");

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

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(publicDir, distDir, { recursive: true });

let apkPath;
for (const candidate of apkCandidates) {
  if (await exists(candidate)) {
    apkPath = candidate;
    break;
  }
}

if (apkPath) {
  const downloadsDir = path.join(distDir, "downloads");
  await mkdir(downloadsDir, { recursive: true });
  await cp(apkPath, path.join(downloadsDir, "devhora-latest.apk"));
  console.log(`Landing built with APK: ${apkPath}`);
} else {
  console.log("Landing built without APK. Set DEVHORA_APK_PATH or add artifacts/android/devhora-latest.apk.");
}
