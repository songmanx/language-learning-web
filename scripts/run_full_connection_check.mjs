import { spawn } from "node:child_process";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { readTemplateDefaults } from "./template_defaults.mjs";

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      args[key] = "true";
      continue;
    }

    args[key] = value;
    index += 1;
  }

  return args;
}

function ensureValue(value, label) {
  if (!value) {
    if (label === "credentials") {
      throw new Error(
        "credentials is required. In PowerShell use $env:GOOGLE_SERVICE_ACCOUNT_PATH='C:\\path\\to\\service-account.json' or pass --credentials.",
      );
    }
    throw new Error(`${label} is required.`);
  }

  return value;
}

async function detectCredentialPath() {
  try {
    const entries = await readdir(".", { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) {
        continue;
      }

      const content = await readFile(entry.name, "utf8");
      if (content.includes('"type": "service_account"') && content.includes('"client_email"')) {
        return entry.name;
      }
    }
  } catch {
    return "";
  }

  return "";
}

function printUsage() {
  console.log("Usage:");
  console.log(
    "  npm run check:live -- --login-id YOUR_ID --password YOUR_PASSWORD --credentials path\\\\to\\\\service-account.json --spreadsheet-id YOUR_JA_RECORD_SHEET_ID",
  );
  console.log("  npm run check:live");
  console.log("");
  console.log("Defaults:");
  console.log("  - loginId/password/spreadsheetId: machine-defaults block in docs/gas-connection-values-template.md");
  console.log("  - playerId/wordId/modeType/score/languageCode: machine-defaults block in docs/gas-connection-values-template.md");
  console.log("  - credentials: GOOGLE_SERVICE_ACCOUNT_PATH or project-root service account JSON");
  console.log("");
  console.log("Runs:");
  console.log("  - smoke:gas -> verify:record -> sync:live-report");
}

function runCommand(command, args) {
  const resolvedCommand = process.platform === "win32" && command === "npm" ? "npm.cmd" : command;

  return new Promise((resolve, reject) => {
    const child = spawn(resolvedCommand, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code ?? "unknown"}`));
    });
  });
}

async function writeFailureReport(reportFile, payload) {
  await writeFile(reportFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help === "true" || args.h === "true") {
    printUsage();
    return;
  }

  const templateDefaults = await readTemplateDefaults();
  const detectedCredentialPath = await detectCredentialPath();
  const loginId = ensureValue(args["login-id"] ?? process.env.SMOKE_LOGIN_ID ?? templateDefaults.loginId, "login-id");
  const password = ensureValue(args.password ?? process.env.SMOKE_PASSWORD ?? templateDefaults.password, "password");
  const credentials = ensureValue(
    args.credentials ?? process.env.GOOGLE_SERVICE_ACCOUNT_PATH ?? detectedCredentialPath,
    "credentials",
  );
  const spreadsheetId = ensureValue(
    args["spreadsheet-id"] ?? process.env.JA_RECORD_SHEET_ID ?? templateDefaults.recordSheetId,
    "spreadsheet-id",
  );
  const playerId = args["player-id"] ?? process.env.VERIFY_PLAYER_ID ?? templateDefaults.playerId ?? "u001";
  const wordId = args["word-id"] ?? process.env.VERIFY_WORD_ID ?? templateDefaults.firstWordId ?? "JA_N_0001";
  const modeType = args["mode-type"] ?? process.env.VERIFY_MODE_TYPE ?? templateDefaults.modeType ?? "practice";
  const score = args.score ?? process.env.VERIFY_SCORE ?? templateDefaults.score ?? "10";
  const languageCode =
    args["language-code"] ?? process.env.VERIFY_LANGUAGE_CODE ?? templateDefaults.languageCode ?? "ja";
  const reportFile = args["report-file"] ?? process.env.VERIFY_REPORT_FILE ?? "docs/live-check-latest.json";
  let currentStage = "smoke:gas";

  try {
    console.log("[check] 1/3 smoke:gas");
    await runCommand("npm", ["run", "smoke:gas", "--", "--login-id", loginId, "--password", password]);

    currentStage = "verify:record";
    console.log("[check] 2/3 verify:record");
    await runCommand("npm", [
      "run",
      "verify:record",
      "--",
      "--credentials",
      credentials,
      "--spreadsheet-id",
      spreadsheetId,
      "--player-id",
      playerId,
      "--word-id",
      wordId,
      "--mode-type",
      modeType,
      "--score",
      score,
      "--language-code",
      languageCode,
      "--report-file",
      reportFile,
    ]);

    currentStage = "sync:live-report";
    console.log("[check] 3/3 sync:live-report");
    await runCommand("node", [
      "scripts/sync_live_check_report.mjs",
      "--report-file",
      reportFile,
      "--template-file",
      "docs/gas-connection-values-template.md",
    ]);

    console.log("[check] completed");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await writeFailureReport(reportFile, {
      ok: false,
      failed_stage: currentStage,
      error_message: message,
      meta: {
        player_id: playerId,
        word_id: wordId,
        mode_type: modeType,
        score,
        language_code: languageCode,
        spreadsheet_id: spreadsheetId,
      },
    });

    try {
      await runCommand("node", [
        "scripts/sync_live_check_report.mjs",
        "--report-file",
        reportFile,
        "--template-file",
        "docs/gas-connection-values-template.md",
      ]);
    } catch {
      // Keep the original failure as the main error if sync also fails.
    }

    throw error;
  }
}

main().catch((error) => {
  console.error("[check] failed", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
