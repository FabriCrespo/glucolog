import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const apiDir = path.join("app", "api");
const backupDir = path.join(".github-pages-build", "api");

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

moveApiAside();

try {
  execSync("npx --no-install next build", {
    stdio: "inherit",
    env: { ...process.env, GITHUB_PAGES: "true" },
  });
} finally {
  restoreApi();
}
