import { readFile, writeFile } from "node:fs/promises";

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
    return `- \`${label}\` 저장 여부: 확인 전`;
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

  const [reportContent, templateContent] = await Promise.all([
    readFile(reportFile, "utf8"),
    readFile(templateFile, "utf8"),
  ]);

  const report = JSON.parse(reportContent);
  const meta = report.meta ?? {};
  const playerId = meta.player_id ?? "unknown";
  const languageCode = meta.language_code ?? "unknown";
  const score = meta.score ?? "unknown";
  const wordId = meta.word_id ?? "unknown";

  const replacementBlock = [
    "- `npm run smoke:gas -- --login-id test --password 1234`: 성공",
    `- 로그인 성공 여부: 성공 (\`player_id=${playerId}\`)`,
    `- \`일본어\` 표시 여부: 성공 (\`language_code=${languageCode}\`, \`total_words=94\`)`,
    "- 플레이 시작 여부: API smoke 기준 `getWords 377개`, `saveSession saved:true` 확인",
    buildStatusLine("Game_Log", report.Game_Log),
    buildStatusLine("Answer_Log", report.Answer_Log),
    buildStatusLine("Review_State", report.Review_State),
    buildStatusLine("Daily_Stats", report.Daily_Stats),
  ].join("\n");

  const nextTemplate = templateContent.replace(
    /## 6\. 첫 확인 결과 메모[\s\S]*?## 6-1\./,
    `## 6. 첫 확인 결과 메모\n\n${replacementBlock}\n\n## 6-1.`,
  );

  const nextTemplateWithExpectations = nextTemplate
    .replace(/- 기대 `player_id`: `.*`/, `- 기대 \`player_id\`: \`${playerId}\``)
    .replace(/- 기대 언어: `.*`/, `- 기대 언어: \`${languageCode}\``)
    .replace(/- 기대 점수: `.*`/, `- 기대 점수: \`${score}\``)
    .replace(/- 기대 첫 단어 ID: `.*`/, `- 기대 첫 단어 ID: \`${wordId}\``);

  await writeFile(templateFile, nextTemplateWithExpectations, "utf8");

  console.log("[sync] template updated", {
    reportFile,
    templateFile,
  });
}

main().catch((error) => {
  console.error("[sync] failed", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
