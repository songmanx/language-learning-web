import { spawn } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { readTemplateDefaults } from "./template_defaults.mjs";

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
  - Read JA Master Sheet ID and language label from machine-defaults in docs/gas-connection-values-template.md
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

async function buildExportArgs() {
  if (isHelpMode()) {
    return [];
  }

  const templateDefaults = await readTemplateDefaults();
  const nextArgs = [...args];

  if (!hasOption("--credentials")) {
    const autoDetectedCredentials = findServiceAccountJson();
    if (autoDetectedCredentials) {
      nextArgs.push("--credentials", autoDetectedCredentials);
    }
  }

  if (!hasOption("--spreadsheet-id")) {
    const spreadsheetId = process.env.JA_MASTER_SHEET_ID || templateDefaults.masterSheetId;
    if (spreadsheetId) {
      nextArgs.push("--spreadsheet-id", spreadsheetId);
    }
  }

  if (!hasOption("--output-dir")) {
    nextArgs.push("--output-dir", DEFAULT_OUTPUT_DIR);
  }

  if (!hasOption("--language-code")) {
    nextArgs.push("--language-code", process.env.EXPORT_LANGUAGE_CODE || templateDefaults.languageCode || DEFAULT_LANGUAGE_CODE);
  }

  if (!hasOption("--language-label")) {
    nextArgs.push(
      "--language-label",
      process.env.EXPORT_LANGUAGE_LABEL || templateDefaults.languageLabel || DEFAULT_LANGUAGE_LABEL,
    );
  }

  return nextArgs;
}

async function main() {
  try {
    if (isHelpMode()) {
      printHelp();
      return;
    }

    const exportArgs = await buildExportArgs();

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
