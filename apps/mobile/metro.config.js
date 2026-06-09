const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);

config.projectRoot = projectRoot;
config.watchFolders = Array.from(new Set([...(config.watchFolders || []), workspaceRoot]));
config.resolver.nodeModulesPaths = Array.from(
  new Set([
    path.join(projectRoot, "node_modules"),
    path.join(workspaceRoot, "node_modules")
  ])
);

module.exports = config;
