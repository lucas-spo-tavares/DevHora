import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const terraformDir = path.join(repoRoot, "infra", "terraform", "landing");
const landingDistDir = path.join(repoRoot, "apps", "landing", "dist");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "inherit",
    ...options
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function capture(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["inherit", "pipe", "inherit"],
    ...options
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return result.stdout.trim();
}

run("npm", ["run", "landing:build"]);

const bucketName = capture("terraform", ["-chdir=" + terraformDir, "output", "-raw", "bucket_name"]);
const distributionId = capture("terraform", ["-chdir=" + terraformDir, "output", "-raw", "cloudfront_distribution_id"]);

run("aws", ["s3", "sync", landingDistDir, `s3://${bucketName}`, "--delete"]);
run("aws", ["cloudfront", "create-invalidation", "--distribution-id", distributionId, "--paths", "/*"]);
