import { readFile } from "node:fs/promises";
import { readTemplateDefaults } from "./template_defaults.mjs";

function parseDotEnv(content) {
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    env[key] = value.replace(/^"(.*)"$/, "$1");
  }

  return env;
}

async function loadEnvFile() {
  try {
    const content = await readFile(".env", "utf8");
    return parseDotEnv(content);
  } catch {
    return {};
  }
}

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
    throw new Error(`${label} is required.`);
  }

  return value;
}

async function postToGas(baseUrl, payload) {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  if (!body.ok) {
    throw new Error(body?.error?.message ?? "Unknown API error");
  }

  return body.data;
}

function createSavePayload(playerId, firstWord) {
  const now = Date.now();

  return {
    playerId,
    languageCode: "ja",
    modeType: "practice",
    quizType: firstWord.question_type ?? "word_to_meaning",
    totalTimeSec: 5,
    score: 10,
    heartsLeft: 3,
    totalQuestions: 1,
    correctAnswers: 1,
    answerLog: [
      {
        wordId: firstWord.word_id,
        questionType: firstWord.question_type ?? "word_to_meaning",
        shownPrompt: firstWord.prompt,
        difficultySnapshot: firstWord.difficulty ?? "1",
        responseTimeMs: 1200,
        selectedAnswer: firstWord.answer,
        correct: true,
        comboAfterAnswer: 1,
        earnedScore: 10,
      },
    ],
    reviewState: [
      {
        wordId: firstWord.word_id,
        priorityScore: 10,
        reviewStage: "review",
        lastResult: "correct",
      },
    ],
    _meta: {
      generatedAt: now,
    },
  };
}

function printUsage() {
  console.log("Usage:");
  console.log("  npm run smoke:gas -- --login-id YOUR_ID --password YOUR_PASSWORD");
  console.log("  npm run smoke:gas");
  console.log("");
  console.log("Defaults:");
  console.log("  - baseUrl: .env VITE_GAS_BASE_URL");
  console.log("  - loginId/password: machine-defaults block in docs/gas-connection-values-template.md");
  console.log("");
  console.log("Checks:");
  console.log("  - login -> getMeta -> getWords -> saveSession");
}

async function main() {
  const envFile = await loadEnvFile();
  const templateDefaults = await readTemplateDefaults();
  const cliArgs = parseArgs(process.argv.slice(2));
  const baseUrl = process.env.VITE_GAS_BASE_URL ?? envFile.VITE_GAS_BASE_URL;
  const loginId =
    process.env.SMOKE_LOGIN_ID ?? cliArgs["login-id"] ?? templateDefaults.loginId;
  const password =
    process.env.SMOKE_PASSWORD ?? cliArgs.password ?? templateDefaults.password;

  if (cliArgs.help === "true" || cliArgs.h === "true") {
    printUsage();
    return;
  }

  ensureValue(baseUrl, "VITE_GAS_BASE_URL");
  ensureValue(loginId, "login-id");
  ensureValue(password, "password");

  console.log(`[smoke] baseUrl: ${baseUrl}`);

  const loginData = await postToGas(baseUrl, {
    action: "login",
    loginId,
    password,
  });
  console.log("[smoke] login ok", {
    playerId: loginData.player_id,
    nickname: loginData.nickname,
  });

  const metaData = await postToGas(baseUrl, {
    action: "getMeta",
  });
  console.log("[smoke] getMeta ok", {
    languages: metaData.length,
    first: metaData[0],
  });

  const wordsData = await postToGas(baseUrl, {
    action: "getWords",
    languageCode: "ja",
  });
  if (!Array.isArray(wordsData) || wordsData.length === 0) {
    throw new Error("getWords returned no data.");
  }
  console.log("[smoke] getWords ok", {
    count: wordsData.length,
    firstWordId: wordsData[0].word_id,
  });

  const savePayload = createSavePayload(loginData.player_id, wordsData[0]);
  const saveData = await postToGas(baseUrl, {
    action: "saveSession",
    payload: savePayload,
  });
  console.log("[smoke] saveSession ok", saveData);

  console.log("[smoke] completed");
}

main().catch((error) => {
  console.error("[smoke] failed", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
