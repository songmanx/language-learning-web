import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const projectRoot = process.cwd();
const DEFAULT_OUTPUT_DIR = "public/data";
const DEFAULT_LANGUAGE_CODE = "ja";
const DEFAULT_LANGUAGE_LABEL = "일본어";

function hasOption(optionName) {
  return args.includes(optionName);
}

function isHelpMode() {
  return hasOption("--help") || hasOption("-h");
}

function printHelp() {
  console.log(`Static JSON refresh helper

Usage:
  npm run refresh:json
  npm run refresh:json -- --credentials "C:\\path\\to\\service-account.json" --spreadsheet-id "YOUR_JA_MASTER_SHEET_ID"

Default behavior:
  - Detect service account JSON from project root
  - Read JA Master Sheet ID from docs/gas-connection-values-template.md
  - Run export:json and validate:json in sequence
`);
}

function findServiceAccountJson() {
  const files = readdirSync(projectRoot, { withFileTypes: true });
  const jsonCandidate = files.find((entry) => {
    if (!entry.isFile() || !entry.name.endsWith(".json")) {
      return false;
    }

    return entry.name !== "package.json" && entry.name !== "package-lock.json";
  });

  return jsonCandidate ? path.join(projectRoot, jsonCandidate.name) : null;
}

function readMasterSheetIdFromTemplate() {
  const templatePath = path.join(projectRoot, "docs", "gas-connection-values-template.md");
  if (!existsSync(templatePath)) {
    return null;
  }

  const content = readFileSync(templatePath, "utf-8");
  const match = content.match(/### JA Master Sheet[\s\S]*?Spreadsheet ID:\s*([A-Za-z0-9_-]+)/);
  return match?.[1] ?? null;
}

function buildExportArgs() {
  if (isHelpMode()) {
    return [];
  }

  const nextArgs = [...args];

  if (!hasOption("--credentials")) {
    const autoDetectedCredentials = findServiceAccountJson();
    if (autoDetectedCredentials) {
      nextArgs.push("--credentials", autoDetectedCredentials);
    }
  }

  if (!hasOption("--spreadsheet-id")) {
    const spreadsheetId = process.env.JA_MASTER_SHEET_ID || readMasterSheetIdFromTemplate();
    if (spreadsheetId) {
      nextArgs.push("--spreadsheet-id", spreadsheetId);
    }
  }

  if (!hasOption("--output-dir")) {
    nextArgs.push("--output-dir", DEFAULT_OUTPUT_DIR);
  }

  if (!hasOption("--language-code")) {
    nextArgs.push("--language-code", DEFAULT_LANGUAGE_CODE);
  }

  if (!hasOption("--language-label")) {
    nextArgs.push("--language-label", DEFAULT_LANGUAGE_LABEL);
  }

  return nextArgs;
}

function runStep(label, commandArgs) {
  return new Promise((resolve, reject) => {
    console.log(`[refresh] ${label}`);

    const child = spawn(npmCommand, commandArgs, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${label} failed with exit code ${code ?? "unknown"}`));
    });
  });
}

async function main() {
  try {
    if (isHelpMode()) {
      printHelp();
      return;
    }

    const exportArgs = buildExportArgs();

    if (!exportArgs.includes("--credentials")) {
      throw new Error("credentials is required. Put a service account JSON in the project root or pass --credentials.");
    }

    if (!exportArgs.includes("--spreadsheet-id")) {
      throw new Error("spreadsheet-id is required. Set JA_MASTER_SHEET_ID or pass --spreadsheet-id.");
    }

    await runStep("1/2 export:json", ["run", "export:json", "--", ...exportArgs]);
    await runStep("2/2 validate:json", ["run", "validate:json", "--", "--data-dir", DEFAULT_OUTPUT_DIR, "--language-code", DEFAULT_LANGUAGE_CODE]);
    console.log("[refresh] completed");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[refresh] failed ${message}`);
    process.exitCode = 1;
  }
}

void main();
