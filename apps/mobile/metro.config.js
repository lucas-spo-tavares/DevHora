const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);
const workspaceNodeModules = path.join(workspaceRoot, "node_modules");

config.projectRoot = projectRoot;
// Only watch the hoisted dependency tree the mobile app actually needs.
config.watchFolders = Array.from(new Set([workspaceNodeModules]));
config.resolver.nodeModulesPaths = Array.from(
  new Set([
    path.join(projectRoot, "node_modules"),
    workspaceNodeModules
  ])
);

module.exports = config;
