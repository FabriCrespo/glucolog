import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

const root = process.cwd();
const apiDir = path.join("app", "api");
const backupDir = path.join(".github-pages-build", "api");

const FIREBASE_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_DATABASE_URL",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const OPTIONAL_ENV_KEYS = ["NEXT_PUBLIC_PREDICTOR_URL", "NEXT_PUBLIC_BASE_PATH"];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function ensureFirebaseEnv() {
  if (!process.env.NEXT_PUBLIC_BASE_PATH) {
    if (process.env.GITHUB_REPOSITORY) {
      const repo = process.env.GITHUB_REPOSITORY.split("/")[1];
      if (repo) process.env.NEXT_PUBLIC_BASE_PATH = `/${repo}`;
    } else {
      process.env.NEXT_PUBLIC_BASE_PATH = "/glucolog";
    }
  }

  parseEnvFile(path.join(root, ".env.production.local"));
  parseEnvFile(path.join(root, ".env.production"));
  parseEnvFile(path.join(root, ".env"));

  const overrideLines = [...FIREBASE_ENV_KEYS, ...OPTIONAL_ENV_KEYS]
    .filter((key) => process.env[key])
    .map((key) => `${key}=${process.env[key]}`);

  if (overrideLines.length) {
    fs.writeFileSync(
      path.join(root, ".env.production.local"),
      `${overrideLines.join("\n")}\n`
    );
  }

  loadEnvConfig(root);

  const missing = FIREBASE_ENV_KEYS.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error("\n❌ Build de GitHub Pages abortado: faltan variables Firebase.\n");
    console.error(`   Faltan: ${missing.join(", ")}`);
    console.error("\n   Solución (elige una):");
    console.error("   1. Commitea `.env.production` con NEXT_PUBLIC_FIREBASE_* (recomendado para Pages)");
    console.error("   2. Añade los mismos nombres como Secrets en GitHub → Settings → Actions\n");
    process.exit(1);
  }
}

function moveApiAside() {
  if (!fs.existsSync(apiDir)) return;
  fs.mkdirSync(path.dirname(backupDir), { recursive: true });
  if (fs.existsSync(backupDir)) {
    fs.rmSync(backupDir, { recursive: true, force: true });
  }
  fs.cpSync(apiDir, backupDir, { recursive: true });
  fs.rmSync(apiDir, { recursive: true, force: true });
}

function restoreApi() {
  if (!fs.existsSync(backupDir)) return;
  if (fs.existsSync(apiDir)) {
    fs.rmSync(apiDir, { recursive: true, force: true });
  }
  fs.cpSync(backupDir, apiDir, { recursive: true });
  fs.rmSync(backupDir, { recursive: true, force: true });
}

ensureFirebaseEnv();

if (fs.existsSync(path.join(root, ".next"))) {
  fs.rmSync(path.join(root, ".next"), { recursive: true, force: true });
}

moveApiAside();

try {
  execSync("npx --no-install next build", {
    stdio: "inherit",
    env: { ...process.env, GITHUB_PAGES: "true", NODE_ENV: "production" },
  });
} finally {
  restoreApi();
  const localOverride = path.join(root, ".env.production.local");
  if (fs.existsSync(localOverride)) {
    fs.rmSync(localOverride, { force: true });
  }
}
