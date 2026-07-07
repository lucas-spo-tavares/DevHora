#!/usr/bin/env node

import { createSign } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_PACKAGE_NAME = "com.devhora.app";
const DEFAULT_TRACK = "internal";
const DEFAULT_RELEASE_STATUS = "completed";
const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_AAB_PATH = "artifacts/android/docker-local/aab/devhora-release.aab";
const OAUTH_SCOPE = "https://www.googleapis.com/auth/androidpublisher";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API_BASE_URL = "https://androidpublisher.googleapis.com";

function printUsage() {
  console.log(`Uso:
  npm run mobile:play:internal -- /caminho/para/app-release.aab

Variaveis:
  Obrigatoria: GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_FILE ou GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
  Opcional: GOOGLE_PLAY_AAB_PATH (padrao: ${DEFAULT_AAB_PATH})
  Opcional: GOOGLE_PLAY_PACKAGE_NAME (padrao: ${DEFAULT_PACKAGE_NAME})
  Opcional: GOOGLE_PLAY_TRACK (padrao: ${DEFAULT_TRACK})
  Opcional: GOOGLE_PLAY_RELEASE_STATUS (padrao: ${DEFAULT_RELEASE_STATUS})
  Opcional: GOOGLE_PLAY_RELEASE_NAME
  Opcional: GOOGLE_PLAY_RELEASE_NOTES
  Opcional: GOOGLE_PLAY_RELEASE_NOTES_LOCALE (padrao: pt-BR)
  Opcional: GOOGLE_PLAY_CHANGES_NOT_SENT_FOR_REVIEW (padrao: false)
  Opcional: GOOGLE_PLAY_TIMEOUT_MS (padrao: ${DEFAULT_TIMEOUT_MS})`);
}

async function loadDotEnvFile(filePath) {
  let contents = "";

  try {
    contents = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key] != null) {
      continue;
    }

    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

async function loadDotEnv() {
  await loadDotEnvFile(path.resolve(".env"));
}

function getEnv(name, fallback = undefined) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

function parseBoolean(value, fallback = false) {
  if (value == null || value === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function encodeBase64Url(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function loadServiceAccount() {
  const rawJson = getEnv("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON");
  const jsonFile = getEnv("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_FILE");

  if (!rawJson && !jsonFile) {
    throw new Error("Defina GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_FILE ou GOOGLE_PLAY_SERVICE_ACCOUNT_JSON.");
  }

  const source = rawJson ?? (await fs.readFile(path.resolve(jsonFile), "utf8"));
  const parsed = JSON.parse(source);

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("Service account invalida: faltam client_email/private_key.");
  }

  return parsed;
}

function createJwt(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT"
  };
  const payload = {
    iss: serviceAccount.client_email,
    scope: OAUTH_SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now
  };

  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();

  const signature = signer.sign(serviceAccount.private_key);
  return `${unsignedToken}.${encodeBase64Url(signature)}`;
}

async function exchangeJwtForAccessToken(serviceAccount) {
  const jwt = createJwt(serviceAccount);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao obter access token (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("Resposta OAuth sem access_token.");
  }

  return data.access_token;
}

async function apiRequest(url, { accessToken, method = "GET", headers = {}, body, timeoutMs }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        authorization: `Bearer ${accessToken}`,
        ...headers
      },
      body,
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Play API ${method} ${url} falhou (${response.status}): ${errorText}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function readVersionName() {
  const appJsonPath = path.resolve("apps/mobile/app.json");
  const appJson = JSON.parse(await fs.readFile(appJsonPath, "utf8"));
  return appJson?.expo?.version ?? undefined;
}

function buildReleaseNotes() {
  const text = getEnv("GOOGLE_PLAY_RELEASE_NOTES");
  if (!text) {
    return undefined;
  }

  return [
    {
      language: getEnv("GOOGLE_PLAY_RELEASE_NOTES_LOCALE", "pt-BR"),
      text
    }
  ];
}

async function main() {
  await loadDotEnv();

  const argPath = process.argv[2];

  if (argPath === "--help" || argPath === "-h") {
    printUsage();
    return;
  }

  const aabPath = path.resolve(argPath ?? getEnv("GOOGLE_PLAY_AAB_PATH", DEFAULT_AAB_PATH));

  const packageName = getEnv("GOOGLE_PLAY_PACKAGE_NAME", DEFAULT_PACKAGE_NAME);
  const track = getEnv("GOOGLE_PLAY_TRACK", DEFAULT_TRACK);
  const releaseStatus = getEnv("GOOGLE_PLAY_RELEASE_STATUS", DEFAULT_RELEASE_STATUS);
  const timeoutMs = parseInteger(getEnv("GOOGLE_PLAY_TIMEOUT_MS"), DEFAULT_TIMEOUT_MS);
  const changesNotSentForReview = parseBoolean(getEnv("GOOGLE_PLAY_CHANGES_NOT_SENT_FOR_REVIEW"), false);

  const serviceAccount = await loadServiceAccount();
  const accessToken = await exchangeJwtForAccessToken(serviceAccount);
  const aabFile = await fs.readFile(aabPath);
  const releaseName = getEnv("GOOGLE_PLAY_RELEASE_NAME", await readVersionName());
  const releaseNotes = buildReleaseNotes();

  console.log(`Criando edit para ${packageName}...`);
  const edit = await apiRequest(
    `${API_BASE_URL}/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/edits`,
    {
      accessToken,
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: "{}",
      timeoutMs
    }
  );

  const editId = edit.id;
  if (!editId) {
    throw new Error("A Google Play nao retornou um editId.");
  }

  console.log(`Enviando bundle ${aabPath}...`);
  const uploadedBundle = await apiRequest(
    `${API_BASE_URL}/upload/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/edits/${encodeURIComponent(editId)}/bundles?uploadType=media`,
    {
      accessToken,
      method: "POST",
      headers: {
        "content-type": "application/octet-stream"
      },
      body: aabFile,
      timeoutMs
    }
  );

  const versionCode = uploadedBundle.versionCode;
  if (!versionCode) {
    throw new Error("Upload concluido, mas sem versionCode na resposta.");
  }

  const release = {
    status: releaseStatus,
    versionCodes: [String(versionCode)]
  };

  if (releaseName) {
    release.name = releaseName;
  }

  if (releaseNotes) {
    release.releaseNotes = releaseNotes;
  }

  console.log(`Atualizando track ${track} com versionCode ${versionCode}...`);
  await apiRequest(
    `${API_BASE_URL}/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/edits/${encodeURIComponent(editId)}/tracks/${encodeURIComponent(track)}`,
    {
      accessToken,
      method: "PUT",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        track,
        releases: [release]
      }),
      timeoutMs
    }
  );

  console.log("Efetivando edit...");
  await apiRequest(
    `${API_BASE_URL}/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/edits/${encodeURIComponent(editId)}:commit?changesNotSentForReview=${changesNotSentForReview}`,
    {
      accessToken,
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: "{}",
      timeoutMs
    }
  );

  console.log();
  console.log("Release enviada com sucesso para a Google Play.");
  console.log(`Pacote: ${packageName}`);
  console.log(`Track: ${track}`);
  console.log(`Version code: ${versionCode}`);
  if (releaseName) {
    console.log(`Release name: ${releaseName}`);
  }
}

main().catch((error) => {
  console.error();
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
