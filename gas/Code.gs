var SHEET_KEYS = {
  USER: "USER_SHEET_ID",
  JA_MASTER: "JA_MASTER_SHEET_ID",
  JA_RECORD: "JA_RECORD_SHEET_ID",
  EN_MASTER: "EN_MASTER_SHEET_ID",
  EN_RECORD: "EN_RECORD_SHEET_ID",
};

var DEFAULT_SPREADSHEET_IDS = {
  EN_MASTER: "1bq-dAzc1agAJ2jY05NaT_FNV3mTvcfldb73oEtUWFXM",
  EN_RECORD: "1Y9zZqUZLpjJPBgULwNGHEC6xvagjOJF4f57y5d3NYks",
};

var SHEET_NAMES = {
  USERS: "Users",
  GAME_LOG: "Game_Log",
  ANSWER_LOG: "Answer_Log",
  REVIEW_STATE: "Review_State",
  DAILY_STATS: "Daily_Stats",
  PLAYER_STATS: "Player_Stats",
  PERSONAL_LEADERBOARD: "Personal_Leaderboard",
  GLOBAL_LEADERBOARD: "Global_Leaderboard",
};

var PLAYER_STATS_HEADERS_ = [
  { label: "Player ID", key: "player_id" },
  { label: "Session Count", key: "session_count" },
  { label: "Practice Session Count", key: "practice_session_count" },
  { label: "Total Score", key: "total_score" },
  { label: "Best Score", key: "best_score" },
  { label: "Total Questions", key: "total_questions" },
  { label: "Correct Answers", key: "correct_answers" },
  { label: "Average Accuracy", key: "average_accuracy" },
  { label: "Last Played At", key: "last_played_at" },
];

var LEADERBOARD_HEADERS_ = [
  { label: "Player ID", key: "player_id" },
  { label: "Nickname", key: "nickname" },
  { label: "Quiz Mode", key: "quiz_mode" },
  { label: "Played At", key: "played_at" },
  { label: "Total Time Sec", key: "total_time_sec" },
  { label: "Score", key: "score" },
];

var DEFAULT_TIMEZONE = "Asia/Seoul";
var DEFAULT_CHOICE_COUNT = 4;

function doPost(e) {
  try {
    var body = parseRequestBody_(e);
    var action = body.action;

    switch (action) {
      case "login":
        return jsonSuccess_(handleLogin_(body));
      case "getMeta":
        return jsonSuccess_(handleGetMeta_());
      case "getWords":
        return jsonSuccess_(handleGetWords_(body));
      case "saveSession":
        return jsonSuccess_(handleSaveSession_(body));
      case "getPlayerStats":
        return jsonSuccess_(handleGetPlayerStats_(body));
      case "getLeaderboard":
        return jsonSuccess_(handleGetLeaderboard_(body));
      case "getOverallLeaderboard":
        return jsonSuccess_(handleGetOverallLeaderboard_(body));
      case "clearPlayerProgress":
        return jsonSuccess_(handleClearPlayerProgress_(body));
      default:
        return jsonError_("UNKNOWN_ERROR", "지원하지 않는 action 입니다.");
    }
  } catch (error) {
    var errorCode = error && error.apiCode ? error.apiCode : "UNKNOWN_ERROR";
    return jsonError_(errorCode, error && error.message ? error.message : "알 수 없는 오류가 발생했습니다.");
  }
}

function doGet() {
  return jsonSuccess_({
    status: "ok",
    message: "Language learning GAS endpoint is running.",
  });
}

function handleLogin_(body) {
  var loginId = body.loginId;
  var password = body.password;

  if (!loginId || !password) {
    throwApiError_("AUTH_FAILED", "로그인 정보가 비어 있습니다.");
  }

  var usersSheet = openSheetByKey_(SHEET_KEYS.USER, SHEET_NAMES.USERS);
  var rows = sheetToObjects_(usersSheet);
  var user = rows.find(function(row) {
    return String(row.login_id || "") === String(loginId) &&
      String(row.password_plain_or_hash || row.password || "") === String(password) &&
      isActiveUser_(row.is_active || row.active);
  });

  if (!user) {
    throwApiError_("AUTH_FAILED", "아이디 또는 비밀번호가 올바르지 않습니다.");
  }

  return {
    session_token: buildSessionToken_(String(user.player_id || loginId)),
    player_id: String(user.player_id || ""),
    nickname: String(user.display_name || user.nickname || loginId),
  };
}

function handleGetMeta_() {
  try {
    var languages = [
      { languageCode: "ja", label: "일본어" },
      { languageCode: "en", label: "영어" },
    ];

    return languages.reduce(function(result, language) {
      var masterKey = getMasterSheetKeyByLanguage_(language.languageCode);

      if (!masterKey || !hasConfiguredSpreadsheet_(masterKey)) {
        return result;
      }

      var masterSpreadsheet = openSpreadsheetByKey_(masterKey);
      var sourceRows = getActiveSourceRows_(masterSpreadsheet, language.languageCode);

      result.push({
        language_code: language.languageCode,
        label: language.label,
        total_words: sourceRows.length,
      });

      return result;
    }, []);
  } catch (error) {
    throwApiError_("META_LOAD_FAILED", error && error.message ? error.message : "언어 메타 정보를 불러오지 못했습니다.");
  }
}

function handleGetWords_(body) {
  try {
    var languageCode = String(body.languageCode || "");
    var masterKey = getMasterSheetKeyByLanguage_(languageCode);

    if (!masterKey) {
      return [];
    }

    var masterSpreadsheet = openSpreadsheetByKey_(masterKey);
    var sourceRows = getActiveSourceRows_(masterSpreadsheet, languageCode);
    return buildQuestionDtosFromSourceRows_(sourceRows, languageCode);
  } catch (error) {
    throwApiError_("WORDS_LOAD_FAILED", error && error.message ? error.message : "문제 데이터를 불러오지 못했습니다.");
  }
}

function handleSaveSession_(body) {
  try {
    var payload = body.payload || {};
    validateSavePayload_(payload);

    var recordKey = getRecordSheetKeyByLanguage_(payload.languageCode);
    if (!recordKey) {
      throwApiError_("SAVE_FAILED", "???? ?? ?? ?? ?????.");
    }

    var recordSpreadsheet = openSpreadsheetByKey_(recordKey);
    var now = new Date();
    var savedAt = formatTimestamp_(now);

    upsertPlayerStats_(recordSpreadsheet, savedAt, payload);

    if (isLeaderboardEligibleSession_(payload)) {
      upsertPersonalLeaderboard_(recordSpreadsheet, savedAt, payload);
      upsertGlobalLeaderboard_(recordSpreadsheet, savedAt, payload);
    }

    return {
      saved: true,
    };
  } catch (error) {
    if (error && error.apiCode) {
      throw error;
    }
    throwApiError_("SAVE_FAILED", error && error.message ? error.message : "세션 저장에 실패했습니다.");
  }
}

function handleGetPlayerStats_(body) {
  try {
    var playerId = String(body.playerId || "");
    var languageCode = String(body.languageCode || "");
    var recordKey = getRecordSheetKeyByLanguage_(languageCode);

    if (!playerId || !recordKey) {
      return null;
    }

    var spreadsheet = openSpreadsheetByKey_(recordKey);
    var sheet = getOrCreateAggregateSheet_(spreadsheet, SHEET_NAMES.PLAYER_STATS, PLAYER_STATS_HEADERS_);
    var rows = sheetToObjects_(sheet);
    var row = rows.find(function(item) {
      return String(item.player_id || "") === playerId;
    });

    return row ? mapPlayerStatsDto_(row) : null;
  } catch (error) {
    throwApiError_("STATS_LOAD_FAILED", error && error.message ? error.message : "통계를 불러오지 못했습니다.");
  }
}

function handleGetLeaderboard_(body) {
  try {
    var playerId = String(body.playerId || "");
    var languageCode = String(body.languageCode || "");
    var recordKey = getRecordSheetKeyByLanguage_(languageCode);

    if (!playerId || !recordKey) {
      return [];
    }

    var spreadsheet = openSpreadsheetByKey_(recordKey);
    var sheet = getOrCreateAggregateSheet_(spreadsheet, SHEET_NAMES.PERSONAL_LEADERBOARD, LEADERBOARD_HEADERS_);

    return sheetToObjects_(sheet)
      .filter(function(row) {
        return String(row.player_id || "") === playerId;
      })
      .sort(compareLeaderboardRows_)
      .map(mapLeaderboardDto_);
  } catch (error) {
    throwApiError_("LEADERBOARD_LOAD_FAILED", error && error.message ? error.message : "순위표를 불러오지 못했습니다.");
  }
}

function handleGetOverallLeaderboard_(body) {
  try {
    var languageCode = String(body.languageCode || "");
    var recordKey = getRecordSheetKeyByLanguage_(languageCode);

    if (!recordKey) {
      return [];
    }

    var spreadsheet = openSpreadsheetByKey_(recordKey);
    var sheet = getOrCreateAggregateSheet_(spreadsheet, SHEET_NAMES.GLOBAL_LEADERBOARD, LEADERBOARD_HEADERS_);

    return sheetToObjects_(sheet)
      .sort(compareLeaderboardRows_)
      .map(mapLeaderboardDto_);
  } catch (error) {
    throwApiError_("LEADERBOARD_LOAD_FAILED", error && error.message ? error.message : "전체 순위표를 불러오지 못했습니다.");
  }
}

function handleClearPlayerProgress_(body) {
  try {
    var playerId = String(body.playerId || "");
    var languageCode = String(body.languageCode || "");
    var recordKey = getRecordSheetKeyByLanguage_(languageCode);

    if (!playerId || !recordKey) {
      return { cleared: false };
    }

    var spreadsheet = openSpreadsheetByKey_(recordKey);
    removeRowsByMatcher_(
      getOrCreateAggregateSheet_(spreadsheet, SHEET_NAMES.PLAYER_STATS, PLAYER_STATS_HEADERS_),
      function(row) {
        return String(row.player_id || "") !== playerId;
      }
    );
    removeRowsByMatcher_(
      getOrCreateAggregateSheet_(spreadsheet, SHEET_NAMES.PERSONAL_LEADERBOARD, LEADERBOARD_HEADERS_),
      function(row) {
        return String(row.player_id || "") !== playerId;
      }
    );
    removeRowsByMatcher_(
      getOrCreateAggregateSheet_(spreadsheet, SHEET_NAMES.GLOBAL_LEADERBOARD, LEADERBOARD_HEADERS_),
      function(row) {
        return String(row.player_id || "") !== playerId;
      }
    );

    return { cleared: true };
  } catch (error) {
    throwApiError_("SAVE_FAILED", error && error.message ? error.message : "기록 삭제에 실패했습니다.");
  }
}

function appendGameLog_(spreadsheet, sessionId, savedAt, payload) {
  var sheet = spreadsheet.getSheetByName(SHEET_NAMES.GAME_LOG);
  ensureSheetExists_(sheet, SHEET_NAMES.GAME_LOG);

  var maxCombo = (payload.answerLog || []).reduce(function(maxValue, item) {
    return Math.max(maxValue, Number(item.comboAfterAnswer || 0));
  }, 0);

  appendObjectRow_(sheet, {
    log_id: sessionId,
    played_at: savedAt,
    player_id: payload.playerId,
    mode_type: payload.modeType || "standard",
    quiz_type: payload.quizType || "mixed",
    total_questions: payload.totalQuestions,
    correct_count: payload.correctAnswers,
    partial_count: 0,
    wrong_count: Math.max(0, Number(payload.totalQuestions || 0) - Number(payload.correctAnswers || 0)),
    max_combo: maxCombo,
    final_score: payload.score,
    hearts_left: payload.heartsLeft,
    total_time_sec: Number(payload.totalTimeSec || 0),
    settings_json: JSON.stringify({
      language_code: payload.languageCode,
    }),
  });
}

function appendAnswerLog_(spreadsheet, sessionId, savedAt, payload) {
  var sheet = spreadsheet.getSheetByName(SHEET_NAMES.ANSWER_LOG);
  ensureSheetExists_(sheet, SHEET_NAMES.ANSWER_LOG);

  (payload.answerLog || []).forEach(function(item, index) {
    appendObjectRow_(sheet, {
      answer_log_id: buildAnswerLogId_(sessionId, index + 1),
      played_at: savedAt,
      player_id: payload.playerId,
      session_log_id: sessionId,
      word_id: item.wordId,
      question_type: item.questionType || "unknown",
      shown_prompt: item.shownPrompt || "",
      selected_answer: item.selectedAnswer,
      result_grade: item.correct ? "correct" : "wrong",
      numeric_score: item.earnedScore,
      response_time_ms: Number(item.responseTimeMs || 0),
      combo_at_time: item.comboAfterAnswer,
      difficulty_snapshot: item.difficultySnapshot || "",
      note: "",
    });
  });
}

function upsertReviewState_(spreadsheet, savedAt, payload) {
  var sheet = spreadsheet.getSheetByName(SHEET_NAMES.REVIEW_STATE);
  ensureSheetExists_(sheet, SHEET_NAMES.REVIEW_STATE);

  var rows = sheetToObjects_(sheet);
  var rowMap = {};
  rows.forEach(function(row, index) {
    rowMap[buildReviewKey_(row.player_id, row.word_id)] = {
      rowNumber: index + getDataStartRow_(sheet),
      row: row,
    };
  });

  var answerGroups = groupAnswerLogByWord_(payload.answerLog || []);

  (payload.reviewState || []).forEach(function(item) {
    var key = buildReviewKey_(payload.playerId, item.wordId);
    var existing = rowMap[key] ? rowMap[key].row : null;
    var grouped = answerGroups[item.wordId] || { correct: 0, wrong: 0, latestCorrect: null };
    var isCorrect = item.lastResult === "correct";

    var nextRow = {
      player_id: payload.playerId,
      word_id: item.wordId,
      status: mapReviewStageToStatus_(item.reviewStage),
      wrong_count_total: Number(existing && existing.wrong_count_total || 0) + grouped.wrong,
      partial_count_total: Number(existing && existing.partial_count_total || 0),
      correct_count_total: Number(existing && existing.correct_count_total || 0) + grouped.correct,
      wrong_streak: isCorrect ? 0 : Number(existing && existing.wrong_streak || 0) + 1,
      correct_streak: isCorrect ? Number(existing && existing.correct_streak || 0) + 1 : 0,
      ease_score: Number(existing && existing.ease_score || 0),
      priority_score: item.priorityScore,
      last_seen_at: savedAt,
      next_due_at: existing && existing.next_due_at || "",
      manual_flag: existing && existing.manual_flag || "",
      mastered_at: existing && existing.mastered_at || "",
      memo: existing && existing.memo || "",
    };

    if (rowMap[key]) {
      updateObjectRow_(sheet, rowMap[key].rowNumber, nextRow);
      return;
    }

    appendObjectRow_(sheet, nextRow);
  });
}

function upsertDailyStats_(spreadsheet, now, savedAt, payload) {
  var sheet = spreadsheet.getSheetByName(SHEET_NAMES.DAILY_STATS);
  ensureSheetExists_(sheet, SHEET_NAMES.DAILY_STATS);

  var statDate = formatStatDate_(now);
  var rows = sheetToObjects_(sheet);
  var existingIndex = -1;
  var existingRow = null;

  rows.some(function(row, index) {
    var matched = String(row.stat_date || "") === statDate &&
      String(row.player_id || "") === String(payload.playerId);
    if (matched) {
      existingIndex = index + getDataStartRow_(sheet);
      existingRow = row;
    }
    return matched;
  });

  var nextRow = {
    stat_date: statDate,
    player_id: payload.playerId,
    solved_count: Number(existingRow && existingRow.solved_count || 0) + Number(payload.totalQuestions || 0),
    correct_count: Number(existingRow && existingRow.correct_count || 0) + Number(payload.correctAnswers || 0),
    study_minutes: Number(existingRow && existingRow.study_minutes || 0) + Math.ceil(Number(payload.totalTimeSec || 0) / 60),
    sessions_count: Number(existingRow && existingRow.sessions_count || 0) + 1,
    best_score: Math.max(Number(existingRow && existingRow.best_score || 0), Number(payload.score || 0)),
    earned_badges: existingRow && existingRow.earned_badges || "",
    streak_days: existingRow && existingRow.streak_days || "",
    notes: existingRow && existingRow.notes || "",
  };

  if (existingIndex > 0) {
    updateObjectRow_(sheet, existingIndex, nextRow);
    return;
  }

  appendObjectRow_(sheet, nextRow);
}

function upsertPlayerStats_(spreadsheet, savedAt, payload) {
  var sheet = getOrCreateAggregateSheet_(spreadsheet, SHEET_NAMES.PLAYER_STATS, PLAYER_STATS_HEADERS_);
  var rows = sheetToObjects_(sheet);
  var existingIndex = -1;
  var existingRow = null;

  rows.some(function(row, index) {
    var matched = String(row.player_id || "") === String(payload.playerId);
    if (matched) {
      existingIndex = index + getDataStartRow_(sheet);
      existingRow = row;
    }
    return matched;
  });

  var nextSessionCount = Number(existingRow && existingRow.session_count || 0) + (payload.modeType === "standard" ? 1 : 0);
  var nextPracticeCount = Number(existingRow && existingRow.practice_session_count || 0) + (payload.modeType === "practice" ? 1 : 0);
  var nextTotalScore = Number(existingRow && existingRow.total_score || 0) + Number(payload.score || 0);
  var nextTotalQuestions = Number(existingRow && existingRow.total_questions || 0) + Number(payload.totalQuestions || 0);
  var nextCorrectAnswers = Number(existingRow && existingRow.correct_answers || 0) + Number(payload.correctAnswers || 0);

  var nextRow = {
    player_id: payload.playerId,
    session_count: nextSessionCount,
    practice_session_count: nextPracticeCount,
    total_score: nextTotalScore,
    best_score: Math.max(Number(existingRow && existingRow.best_score || 0), Number(payload.score || 0)),
    total_questions: nextTotalQuestions,
    correct_answers: nextCorrectAnswers,
    average_accuracy: nextTotalQuestions > 0 ? Math.round((nextCorrectAnswers / nextTotalQuestions) * 100) : 0,
    last_played_at: savedAt,
  };

  if (existingIndex > 0) {
    updateObjectRow_(sheet, existingIndex, nextRow);
    return;
  }

  appendObjectRow_(sheet, nextRow);
}

function upsertPersonalLeaderboard_(spreadsheet, savedAt, payload) {
  var sheet = getOrCreateAggregateSheet_(spreadsheet, SHEET_NAMES.PERSONAL_LEADERBOARD, LEADERBOARD_HEADERS_);
  var nextEntry = buildLeaderboardRow_(savedAt, payload);

  rewriteRankedSheetRows_(
    sheet,
    function(row) {
      return String(row.player_id || "") === String(payload.playerId) &&
        String(row.quiz_mode || "") === String(payload.quizType || "");
    },
    function(row) {
      return String(row.player_id || "") === String(payload.playerId);
    },
    nextEntry,
    10
  );
}

function upsertGlobalLeaderboard_(spreadsheet, savedAt, payload) {
  var sheet = getOrCreateAggregateSheet_(spreadsheet, SHEET_NAMES.GLOBAL_LEADERBOARD, LEADERBOARD_HEADERS_);
  var nextEntry = buildLeaderboardRow_(savedAt, payload);

  rewriteRankedSheetRows_(
    sheet,
    function(row) {
      return String(row.quiz_mode || "") === String(payload.quizType || "");
    },
    function() {
      return true;
    },
    nextEntry,
    50
  );
}

function rewriteRankedSheetRows_(sheet, scopeMatcher, preserveMatcher, nextEntry, limit) {
  var rows = sheetToObjects_(sheet);
  var scopedRows = rows.filter(scopeMatcher);
  var preservedRows = rows.filter(function(row) {
    return preserveMatcher(row) && !scopeMatcher(row);
  });
  var nextScopedRows = scopedRows.concat([nextEntry]).sort(compareLeaderboardRows_).slice(0, limit);
  var headerKeys = getHeaderKeys_(sheet);
  var dataStartRow = getDataStartRow_(sheet);
  var finalRows = preservedRows.concat(nextScopedRows);

  clearSheetDataRows_(sheet, dataStartRow, headerKeys.length);

  if (finalRows.length === 0) {
    return;
  }

  sheet
    .getRange(dataStartRow, 1, finalRows.length, headerKeys.length)
    .setValues(finalRows.map(function(row) {
      return buildRowValuesByKeys_(headerKeys, row);
    }));
}

function buildLeaderboardRow_(savedAt, payload) {
  return {
    player_id: payload.playerId,
    nickname: String(payload.nickname || payload.playerId || ""),
    quiz_mode: String(payload.quizType || ""),
    played_at: savedAt,
    total_time_sec: Number(payload.totalTimeSec || 0),
    score: Number(payload.score || 0),
  };
}

function isLeaderboardEligibleSession_(payload) {
  return payload.modeType === "standard" &&
    !(Number(payload.heartsLeft || 0) <= 0 && Number(payload.totalQuestions || 0) < 20);
}

function parseRequestBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("요청 본문이 비어 있습니다.");
  }

  return JSON.parse(e.postData.contents);
}

function openSpreadsheetByKey_(propertyKey) {
  var spreadsheetId = getSpreadsheetIdByKey_(propertyKey);

  if (!spreadsheetId) {
    throw new Error("Script Properties? '" + propertyKey + "' ?? ????.");
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

function getSpreadsheetIdByKey_(propertyKey) {
  var scriptPropertyValue = PropertiesService.getScriptProperties().getProperty(propertyKey);
  if (scriptPropertyValue) {
    return scriptPropertyValue;
  }

  return DEFAULT_SPREADSHEET_IDS[propertyKey] || "";
}

function openSheetByKey_(propertyKey, sheetName) {
  var spreadsheet = openSpreadsheetByKey_(propertyKey);
  var sheet = spreadsheet.getSheetByName(sheetName);
  ensureSheetExists_(sheet, sheetName);
  return sheet;
}

function hasScriptProperty_(propertyKey) {
  return hasConfiguredSpreadsheet_(propertyKey);
}

function hasConfiguredSpreadsheet_(propertyKey) {
  return !!getSpreadsheetIdByKey_(propertyKey);
}

function getMasterSheetKeyByLanguage_(languageCode) {
  if (languageCode === "ja") {
    return SHEET_KEYS.JA_MASTER;
  }

  if (languageCode === "en") {
    return SHEET_KEYS.EN_MASTER;
  }

  return null;
}

function getRecordSheetKeyByLanguage_(languageCode) {
  if (languageCode === "ja") {
    return SHEET_KEYS.JA_RECORD;
  }

  if (languageCode === "en") {
    return SHEET_KEYS.EN_RECORD;
  }

  return null;
}

function ensureSheetExists_(sheet, sheetName) {
  if (!sheet) {
    throw new Error("'" + sheetName + "' 시트를 찾을 수 없습니다.");
  }
}

function getSourceSheets_(spreadsheet, languageCode) {
  return spreadsheet.getSheets().filter(function(sheet) {
    var headerKeys = getHeaderKeys_(sheet);

    if (headerKeys.indexOf("word_id") < 0) {
      return false;
    }

    if (languageCode === "ja") {
      return headerKeys.indexOf("jp_kanji") >= 0;
    }

    if (languageCode === "en") {
      return headerKeys.indexOf("eng_word") >= 0;
    }

    return false;
  });
}

function getActiveSourceRows_(spreadsheet, languageCode) {
  var sheets = getSourceSheets_(spreadsheet, languageCode);
  var rows = [];

  sheets.forEach(function(sheet) {
    sheetToObjects_(sheet).forEach(function(row) {
      if (isActiveSourceRow_(row)) {
        row._sheet_name = sheet.getName();
        rows.push(row);
      }
    });
  });

  return rows;
}

function isActiveSourceRow_(row) {
  return !!row.word_id && isActiveUser_(row.is_active);
}

function sheetToObjects_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    return [];
  }

  var headerKeys = getHeaderKeysFromValues_(values);
  var dataStartRow = getDataStartRowFromValues_(values);
  if (!headerKeys.length || values.length < dataStartRow) {
    return [];
  }

  return values.slice(dataStartRow - 1).filter(function(row) {
    return row.some(function(cell) {
      return cell !== "" && cell !== null && cell !== undefined;
    });
  }).map(function(row) {
    var result = {};
    headerKeys.forEach(function(header, index) {
      if (header) {
        result[header] = row[index];
      }
    });
    return result;
  });
}

function getHeaderKeys_(sheet) {
  return getHeaderKeysFromValues_(sheet.getDataRange().getValues());
}

function getHeaderKeysFromValues_(values) {
  if (!values || values.length === 0) {
    return [];
  }

  var keyRow = values.length >= 2 ? values[1] : values[0];
  return keyRow.map(function(value) {
    return normalizeHeaderKey_(value);
  }).filter(function(value) {
    return value.length > 0;
  });
}

function getDataStartRow_(sheet) {
  return getDataStartRowFromValues_(sheet.getDataRange().getValues());
}

function getDataStartRowFromValues_(values) {
  return values.length >= 2 ? 3 : 2;
}

function normalizeHeaderKey_(value) {
  return String(value || "").trim();
}

function appendObjectRow_(sheet, rowObject) {
  var headerKeys = getHeaderKeys_(sheet);
  var rowValues = buildRowValuesByKeys_(headerKeys, rowObject);
  sheet.appendRow(rowValues);
}

function updateObjectRow_(sheet, rowNumber, rowObject) {
  var headerKeys = getHeaderKeys_(sheet);
  var rowValues = buildRowValuesByKeys_(headerKeys, rowObject);
  sheet.getRange(rowNumber, 1, 1, rowValues.length).setValues([rowValues]);
}

function getOrCreateAggregateSheet_(spreadsheet, sheetName, headers) {
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (sheet) {
    return sheet;
  }

  sheet = spreadsheet.insertSheet(sheetName);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers.map(function(header) {
    return header.label;
  })]);
  sheet.getRange(2, 1, 1, headers.length).setValues([headers.map(function(header) {
    return header.key;
  })]);
  return sheet;
}

function clearSheetDataRows_(sheet, dataStartRow, columnCount) {
  var maxRows = sheet.getMaxRows();
  if (maxRows < dataStartRow) {
    return;
  }

  sheet.getRange(dataStartRow, 1, maxRows - dataStartRow + 1, columnCount).clearContent();
}

function removeRowsByMatcher_(sheet, keepMatcher) {
  var headerKeys = getHeaderKeys_(sheet);
  var dataStartRow = getDataStartRow_(sheet);
  var nextRows = sheetToObjects_(sheet).filter(keepMatcher);

  clearSheetDataRows_(sheet, dataStartRow, headerKeys.length);

  if (nextRows.length === 0) {
    return;
  }

  sheet
    .getRange(dataStartRow, 1, nextRows.length, headerKeys.length)
    .setValues(nextRows.map(function(row) {
      return buildRowValuesByKeys_(headerKeys, row);
    }));
}

function buildRowValuesByKeys_(headerKeys, rowObject) {
  return headerKeys.map(function(key) {
    if (!Object.prototype.hasOwnProperty.call(rowObject, key)) {
      return "";
    }
    return rowObject[key];
  });
}

function buildQuestionDtosFromSourceRows_(sourceRows, languageCode) {
  if (languageCode === "en") {
    return buildEnglishQuestionDtosFromSourceRows_(sourceRows);
  }

  return buildJapaneseQuestionDtosFromSourceRows_(sourceRows);
}

function buildJapaneseQuestionDtosFromSourceRows_(sourceRows) {
  var activeRows = sourceRows.filter(function(row) {
    return getPrimaryMeaning_(row) && row.word_id;
  });

  var meaningPool = unique_(activeRows.map(function(row) {
    return getPrimaryMeaning_(row);
  }).filter(Boolean));
  var kanjiPool = unique_(activeRows.map(function(row) {
    return String(row.jp_kanji || "").trim();
  }).filter(Boolean));
  var furiganaPool = unique_(activeRows.reduce(function(result, row) {
    var values = [row.jp_furigana, row.jp_furigana_2].map(function(item) {
      return String(item || "").trim();
    }).filter(Boolean);
    return result.concat(values);
  }, []));

  var questions = [];

  activeRows.forEach(function(row) {
    var meaning = getPrimaryMeaning_(row);
    var kanji = String(row.jp_kanji || "").trim();
    var furigana = String(row.jp_furigana || "").trim();
    var furigana2 = String(row.jp_furigana_2 || "").trim();

    if (kanji) {
      questions.push(buildQuestionDto_(row.word_id, kanji, meaningPool, meaning, "word_to_meaning", meaning, row.difficulty));
      questions.push(buildQuestionDto_(row.word_id, meaning, kanjiPool, kanji, "meaning_to_word", meaning, row.difficulty));
    }

    if (furigana) {
      questions.push(buildQuestionDto_(row.word_id, furigana, meaningPool, meaning, "word_to_meaning", meaning, row.difficulty));
      questions.push(buildQuestionDto_(row.word_id, meaning, furiganaPool, furigana, "meaning_to_word", meaning, row.difficulty));
    }

    if (furigana2) {
      questions.push(buildQuestionDto_(row.word_id, furigana2, meaningPool, meaning, "word_to_meaning", meaning, row.difficulty));
    }
  });

  return questions;
}

function buildEnglishQuestionDtosFromSourceRows_(sourceRows) {
  var activeRows = sourceRows.filter(function(row) {
    return getPrimaryMeaning_(row) && row.word_id && String(row.eng_word || "").trim();
  });

  var meaningPool = unique_(activeRows.map(function(row) {
    return getPrimaryMeaning_(row);
  }).filter(Boolean));
  var wordPool = unique_(activeRows.map(function(row) {
    return String(row.eng_word || "").trim();
  }).filter(Boolean));

  var questions = [];

  activeRows.forEach(function(row) {
    var meaning = getPrimaryMeaning_(row);
    var engWord = String(row.eng_word || "").trim();

    questions.push(buildQuestionDto_(row.word_id, engWord, meaningPool, meaning, "word_to_meaning", meaning, row.difficulty));
    questions.push(buildQuestionDto_(row.word_id, meaning, wordPool, engWord, "meaning_to_word", meaning, row.difficulty));
  });

  return questions;
}

function buildQuestionDto_(wordId, prompt, choicePool, answer, questionType, meaning, difficulty) {
  return {
    word_id: wordId,
    prompt: prompt,
    choices: buildChoices_(answer, choicePool),
    answer: answer,
    meaning: meaning,
    difficulty: String(difficulty || ""),
    question_type: questionType,
  };
}

function buildChoices_(answer, pool) {
  var uniquePool = unique_(pool.filter(Boolean));
  var distractors = shuffle_(uniquePool.filter(function(item) {
    return item !== answer;
  })).slice(0, Math.max(0, DEFAULT_CHOICE_COUNT - 1));
  var choices = distractors.concat([answer]);
  return shuffle_(choices);
}

function getPrimaryMeaning_(row) {
  return [row.meaning_ko_1, row.meaning_ko_2, row.meaning_ko_3].map(function(value) {
    return String(value || "").trim();
  }).find(function(value) {
    return value.length > 0;
  }) || "";
}

function unique_(items) {
  var seen = {};
  return items.filter(function(item) {
    if (seen[item]) {
      return false;
    }
    seen[item] = true;
    return true;
  });
}

function shuffle_(items) {
  var copied = items.slice();
  for (var i = copied.length - 1; i > 0; i -= 1) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = copied[i];
    copied[i] = copied[j];
    copied[j] = temp;
  }
  return copied;
}

function normalizeChoices_(rawChoices) {
  if (Array.isArray(rawChoices)) {
    return rawChoices.map(function(item) {
      return String(item).trim();
    }).filter(function(item) {
      return item.length > 0;
    });
  }

  if (rawChoices === null || rawChoices === undefined || rawChoices === "") {
    return [];
  }

  var stringValue = String(rawChoices).trim();

  if (stringValue.charAt(0) === "[") {
    try {
      var parsed = JSON.parse(stringValue);
      if (Array.isArray(parsed)) {
        return parsed.map(function(item) {
          return String(item).trim();
        }).filter(function(item) {
          return item.length > 0;
        });
      }
    } catch (error) {}
  }

  return stringValue.split("|").map(function(item) {
    return item.trim();
  }).filter(function(item) {
    return item.length > 0;
  });
}

function validateSavePayload_(payload) {
  if (!payload.playerId || !payload.languageCode) {
    throwApiError_("SAVE_FAILED", "세션 저장 payload에 사용자 정보가 없습니다.");
  }

  if (!payload.modeType || !payload.quizType) {
    throwApiError_("SAVE_FAILED", "세션 저장 payload에 모드 정보가 없습니다.");
  }

  if (typeof payload.totalTimeSec !== "number") {
    throwApiError_("SAVE_FAILED", "세션 저장 payload에 총 플레이 시간이 없습니다.");
  }

  if (!Array.isArray(payload.answerLog) || !Array.isArray(payload.reviewState)) {
    throwApiError_("SAVE_FAILED", "세션 저장 payload 구조가 올바르지 않습니다.");
  }

  if (Number(payload.totalQuestions || 0) !== payload.answerLog.length) {
    throwApiError_("SAVE_FAILED", "totalQuestions는 실제 답변 수와 같아야 합니다.");
  }
}

function groupAnswerLogByWord_(answerLog) {
  return (answerLog || []).reduce(function(result, item) {
    var key = String(item.wordId || "");
    if (!result[key]) {
      result[key] = { correct: 0, wrong: 0 };
    }
    if (item.correct) {
      result[key].correct += 1;
    } else {
      result[key].wrong += 1;
    }
    return result;
  }, {});
}

function compareLeaderboardRows_(left, right) {
  var leftScore = Number(left.score || 0);
  var rightScore = Number(right.score || 0);

  if (rightScore !== leftScore) {
    return rightScore - leftScore;
  }

  var leftTime = Number(left.total_time_sec || 0);
  var rightTime = Number(right.total_time_sec || 0);

  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }

  return String(right.played_at || "").localeCompare(String(left.played_at || ""));
}

function mapPlayerStatsDto_(row) {
  return {
    player_id: String(row.player_id || ""),
    session_count: Number(row.session_count || 0),
    practice_session_count: Number(row.practice_session_count || 0),
    total_score: Number(row.total_score || 0),
    best_score: Number(row.best_score || 0),
    total_questions: Number(row.total_questions || 0),
    correct_answers: Number(row.correct_answers || 0),
    average_accuracy: Number(row.average_accuracy || 0),
    last_played_at: String(row.last_played_at || ""),
  };
}

function mapLeaderboardDto_(row) {
  return {
    played_at: String(row.played_at || ""),
    total_time_sec: Number(row.total_time_sec || 0),
    score: Number(row.score || 0),
    quiz_mode: String(row.quiz_mode || ""),
    player_id: String(row.player_id || ""),
    nickname: String(row.nickname || ""),
  };
}

function mapReviewStageToStatus_(reviewStage) {
  return String(reviewStage || "learning");
}

function isActiveUser_(value) {
  var normalized = String(value || "").toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "y";
}

function buildSessionToken_(playerId) {
  return "gas-token-" + playerId + "-" + new Date().getTime();
}

function buildSessionId_(playerId, now) {
  var normalizedPlayerId = String(playerId || "player").replace(/[^a-zA-Z0-9_-]/g, "-");
  return normalizedPlayerId + "-" + Utilities.formatDate(now, getProjectTimeZone_(), "yyyyMMdd'T'HHmmss");
}

function buildAnswerLogId_(sessionId, index) {
  return sessionId + "-a" + index;
}

function formatTimestamp_(date) {
  return Utilities.formatDate(date, getProjectTimeZone_(), "yyyy-MM-dd'T'HH:mm:ss");
}

function formatStatDate_(date) {
  return Utilities.formatDate(date, getProjectTimeZone_(), "yyyy-MM-dd");
}

function getProjectTimeZone_() {
  return DEFAULT_TIMEZONE;
}

function buildReviewKey_(playerId, wordId) {
  return [playerId, wordId].join("::");
}

function throwApiError_(code, message) {
  var error = new Error(message);
  error.apiCode = code;
  throw error;
}

function jsonSuccess_(data) {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      data: data,
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonError_(code, message) {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: false,
      error: {
        code: code,
        message: message,
      },
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


