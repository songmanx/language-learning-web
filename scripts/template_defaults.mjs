import { readFile } from "node:fs/promises";

const TEMPLATE_PATH = "docs/gas-connection-values-template.md";
const BLOCK_START = "<!-- machine-defaults:start -->";
const BLOCK_END = "<!-- machine-defaults:end -->";

function parseKeyValueBlock(content) {
  const blockMatch = content.match(
    new RegExp(`${BLOCK_START}[\\s\\S]*?\`\`\`text\\s*([\\s\\S]*?)\`\`\`[\\s\\S]*?${BLOCK_END}`),
  );

  if (!blockMatch) {
    return {};
  }

  const values = {};
  for (const rawLine of blockMatch[1].split(/\r?\n/)) {
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
    values[key] = value;
  }

  return values;
}

export async function readTemplateDefaults() {
  try {
    const content = await readFile(TEMPLATE_PATH, "utf8");
    const values = parseKeyValueBlock(content);

    return {
      content,
      values,
      userSheetId: values.USER_SHEET_ID ?? "",
      masterSheetId: values.JA_MASTER_SHEET_ID ?? "",
      recordSheetId: values.JA_RECORD_SHEET_ID ?? "",
      webAppUrl: values.WEB_APP_URL ?? "",
      loginId: values.LOGIN_ID ?? "",
      password: values.PASSWORD ?? "",
      playerId: values.PLAYER_ID ?? "",
      nickname: values.NICKNAME ?? "",
      languageLabel: values.LANGUAGE_LABEL ?? "",
      languageCode: values.LANGUAGE_CODE ?? "",
      totalWords: values.TOTAL_WORDS ?? "",
      questionCount: values.QUESTION_COUNT ?? "",
      modeType: values.MODE_TYPE ?? "",
      correctAnswers: values.CORRECT_ANSWERS ?? "",
      score: values.SCORE ?? "",
      firstWordId: values.FIRST_WORD_ID ?? "",
    };
  } catch {
    return {
      content: "",
      values: {},
      userSheetId: "",
      masterSheetId: "",
      recordSheetId: "",
      webAppUrl: "",
      loginId: "",
      password: "",
      playerId: "",
      nickname: "",
      languageLabel: "",
      languageCode: "",
      totalWords: "",
      questionCount: "",
      modeType: "",
      correctAnswers: "",
      score: "",
      firstWordId: "",
    };
  }
}

export function replaceMachineDefaultBlock(content, nextValues) {
  const block = `${BLOCK_START}
\`\`\`text
USER_SHEET_ID=${nextValues.USER_SHEET_ID ?? ""}
JA_MASTER_SHEET_ID=${nextValues.JA_MASTER_SHEET_ID ?? ""}
JA_RECORD_SHEET_ID=${nextValues.JA_RECORD_SHEET_ID ?? ""}
WEB_APP_URL=${nextValues.WEB_APP_URL ?? ""}
LOGIN_ID=${nextValues.LOGIN_ID ?? ""}
PASSWORD=${nextValues.PASSWORD ?? ""}
PLAYER_ID=${nextValues.PLAYER_ID ?? ""}
NICKNAME=${nextValues.NICKNAME ?? ""}
LANGUAGE_LABEL=${nextValues.LANGUAGE_LABEL ?? ""}
LANGUAGE_CODE=${nextValues.LANGUAGE_CODE ?? ""}
TOTAL_WORDS=${nextValues.TOTAL_WORDS ?? ""}
QUESTION_COUNT=${nextValues.QUESTION_COUNT ?? ""}
MODE_TYPE=${nextValues.MODE_TYPE ?? ""}
CORRECT_ANSWERS=${nextValues.CORRECT_ANSWERS ?? ""}
SCORE=${nextValues.SCORE ?? ""}
FIRST_WORD_ID=${nextValues.FIRST_WORD_ID ?? ""}
\`\`\`
${BLOCK_END}`;

  const pattern = new RegExp(`${BLOCK_START}[\\s\\S]*?${BLOCK_END}`);
  if (!pattern.test(content)) {
    return content;
  }

  return content.replace(pattern, block);
}
