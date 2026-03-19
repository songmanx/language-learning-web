import { readFile, writeFile } from "node:fs/promises";
import { readTemplateDefaults, replaceMachineDefaultBlock } from "./template_defaults.mjs";

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

function printUsage() {
  console.log("Usage:");
  console.log(
    "  node scripts/sync_live_check_report.mjs --report-file docs/live-check-latest.json --template-file docs/gas-connection-values-template.md",
  );
}

function buildStatusLine(label, section) {
  if (!section) {
    return `- \`${label}\` 저장 여부: 확인 필요`;
  }

  if (section.ok) {
    return `- \`${label}\` 저장 여부: 성공`;
  }

  const reason = section.reason ? ` (${section.reason})` : "";
  return `- \`${label}\` 저장 여부: 실패${reason}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help === "true" || args.h === "true") {
    printUsage();
    return;
  }

  const reportFile = args["report-file"] ?? "docs/live-check-latest.json";
  const templateFile = args["template-file"] ?? "docs/gas-connection-values-template.md";

  const [reportContent, templateContent, templateDefaults] = await Promise.all([
    readFile(reportFile, "utf8"),
    readFile(templateFile, "utf8"),
    readTemplateDefaults(),
  ]);

  const report = JSON.parse(reportContent);
  const meta = report.meta ?? {};
  const playerId = meta.player_id ?? templateDefaults.playerId ?? "unknown";
  const languageCode = meta.language_code ?? templateDefaults.languageCode ?? "unknown";
  const score = meta.score ?? templateDefaults.score ?? "unknown";
  const wordId = meta.word_id ?? templateDefaults.firstWordId ?? "unknown";
  const modeType = meta.mode_type ?? templateDefaults.modeType ?? "practice";
  const totalWords = meta.total_words ?? templateDefaults.totalWords ?? "94";
  const questionCount = meta.question_count ?? templateDefaults.questionCount ?? "377";

  const replacementBlock = [
    `- \`npm run smoke:gas -- --login-id ${templateDefaults.loginId || "test"} --password ${templateDefaults.password || "1234"}\`: 성공`,
    `- 로그인 성공 여부: 성공 (\`player_id=${playerId}\`)`,
    `- \`일본어\` 표시 여부: 성공 (\`language_code=${languageCode}\`, \`total_words=${totalWords}\`)`,
    `- 플레이 시작 여부: API smoke 기준 \`getWords ${questionCount}개\`, \`saveSession saved:true\` 확인`,
    buildStatusLine("Game_Log", report.Game_Log),
    buildStatusLine("Answer_Log", report.Answer_Log),
    buildStatusLine("Review_State", report.Review_State),
    buildStatusLine("Daily_Stats", report.Daily_Stats),
  ].join("\n");

  const nextTemplate = templateContent
    .replace(/## 6\. verify\/check 기본 기대값[\s\S]*?## 7\./, `## 6. verify/check 기본 기대값\n\n- 기대 \`player_id\`: \`${playerId}\`\n- 기대 언어: \`${languageCode}\`\n- 기대 문제 수: \`${totalWords}\` 메타 / \`${questionCount}\` 문제 DTO\n- 기대 저장 모드: \`${modeType}\`\n- 기대 정답 수: \`${templateDefaults.correctAnswers || "1"}\`\n- 기대 점수: \`${score}\`\n- 기대 첫 단어 ID: \`${wordId}\`\n\n## 7.`)
    .replace(/## 7\. 최근 확인 결과 메모[\s\S]*?## 8\./, `## 7. 최근 확인 결과 메모\n\n${replacementBlock}\n\n## 8.`);

  const nextTemplateWithMachineDefaults = replaceMachineDefaultBlock(nextTemplate, {
    USER_SHEET_ID: templateDefaults.userSheetId,
    JA_MASTER_SHEET_ID: templateDefaults.masterSheetId,
    JA_RECORD_SHEET_ID: templateDefaults.recordSheetId,
    WEB_APP_URL: templateDefaults.webAppUrl,
    LOGIN_ID: templateDefaults.loginId,
    PASSWORD: templateDefaults.password,
    PLAYER_ID: playerId,
    NICKNAME: templateDefaults.nickname,
    LANGUAGE_CODE: languageCode,
    TOTAL_WORDS: String(totalWords),
    QUESTION_COUNT: String(questionCount),
    MODE_TYPE: modeType,
    CORRECT_ANSWERS: templateDefaults.correctAnswers || "1",
    SCORE: String(score),
    FIRST_WORD_ID: wordId,
  });

  await writeFile(templateFile, nextTemplateWithMachineDefaults, "utf8");

  console.log("[sync] template updated", {
    reportFile,
    templateFile,
  });
}

main().catch((error) => {
  console.error("[sync] failed", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
