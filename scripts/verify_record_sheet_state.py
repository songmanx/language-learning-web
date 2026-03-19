from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from typing import Any

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
TARGET_SHEETS = ("Game_Log", "Answer_Log", "Review_State", "Daily_Stats")

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
except Exception:
    pass


def detect_credentials_path() -> str:
    for path in Path(".").glob("*.json"):
        try:
            content = path.read_text(encoding="utf-8")
        except OSError:
            continue

        if '"type": "service_account"' in content and '"client_email"' in content:
            return str(path)

    return ""


def read_template_defaults() -> dict[str, str]:
    template_path = Path("docs/gas-connection-values-template.md")
    if not template_path.exists():
        return {
            "spreadsheet_id": "",
            "player_id": "",
            "word_id": "",
            "mode_type": "",
            "score": "",
            "language_code": "",
        }

    try:
        content = template_path.read_text(encoding="utf-8")
    except OSError:
        return {
            "spreadsheet_id": "",
            "player_id": "",
            "word_id": "",
            "mode_type": "",
            "score": "",
            "language_code": "",
        }

    block_match = re.search(r"<!-- machine-defaults:start -->[\s\S]*?```text\s*([\s\S]*?)```[\s\S]*?<!-- machine-defaults:end -->", content)
    values: dict[str, str] = {}

    if block_match:
        for raw_line in block_match.group(1).splitlines():
            line = raw_line.strip()
            if not line or "=" not in line:
                continue
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip()

    return {
        "spreadsheet_id": values.get("JA_RECORD_SHEET_ID", ""),
        "player_id": values.get("PLAYER_ID", ""),
        "word_id": values.get("FIRST_WORD_ID", ""),
        "mode_type": values.get("MODE_TYPE", ""),
        "score": values.get("SCORE", ""),
        "language_code": values.get("LANGUAGE_CODE", ""),
    }


def parse_args() -> argparse.Namespace:
    defaults = read_template_defaults()
    parser = argparse.ArgumentParser(
        description="Verify the latest Japanese record-sheet rows after a smoke test run.",
        epilog=(
            "Defaults: credentials from GOOGLE_SERVICE_ACCOUNT_PATH or project-root service account JSON, "
            "spreadsheet-id/player-id/word-id/mode-type/score/language-code from docs/gas-connection-values-template.md."
        ),
    )
    parser.add_argument("--credentials", help="Path to the service account JSON file.")
    parser.add_argument("--spreadsheet-id", help="Japanese record spreadsheet id.")
    parser.add_argument(
        "--player-id",
        default=os.getenv("VERIFY_PLAYER_ID") or defaults["player_id"] or "u001",
        help="Expected player id.",
    )
    parser.add_argument(
        "--word-id",
        default=os.getenv("VERIFY_WORD_ID") or defaults["word_id"] or "JA_N_0001",
        help="Expected word id in Answer_Log/Review_State.",
    )
    parser.add_argument(
        "--mode-type",
        default=os.getenv("VERIFY_MODE_TYPE") or defaults["mode_type"] or "practice",
        help="Expected mode_type in Game_Log.",
    )
    parser.add_argument(
        "--score",
        default=os.getenv("VERIFY_SCORE") or defaults["score"] or "10",
        help="Expected final score / numeric score.",
    )
    parser.add_argument(
        "--language-code",
        default=os.getenv("VERIFY_LANGUAGE_CODE") or defaults["language_code"] or "ja",
        help="Expected language code in settings_json.",
    )
    parser.add_argument(
        "--report-file",
        default=os.getenv("VERIFY_REPORT_FILE", "docs/live-check-latest.json"),
        help="Optional JSON report output path.",
    )
    args = parser.parse_args()

    args.credentials = args.credentials or os.getenv("GOOGLE_SERVICE_ACCOUNT_PATH") or detect_credentials_path()
    args.spreadsheet_id = args.spreadsheet_id or os.getenv("JA_RECORD_SHEET_ID") or defaults["spreadsheet_id"]

    if not args.credentials:
        parser.error("--credentials or GOOGLE_SERVICE_ACCOUNT_PATH is required.")
    if not args.spreadsheet_id:
        parser.error("--spreadsheet-id or JA_RECORD_SHEET_ID is required.")

    return args


def load_service(credentials_path: str):
    try:
        from google.oauth2.service_account import Credentials
        from googleapiclient.discovery import build
    except ModuleNotFoundError:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", "requirements-json-export.txt"],
            check=True,
        )
        from google.oauth2.service_account import Credentials
        from googleapiclient.discovery import build

    credentials = Credentials.from_service_account_file(credentials_path, scopes=SCOPES)
    return build("sheets", "v4", credentials=credentials, cache_discovery=False)


def normalize_header_key(value: Any) -> str:
    return str(value or "").strip()


def fetch_sheet_values(service, spreadsheet_id: str, sheet_name: str) -> list[list[Any]]:
    try:
        response = (
            service.spreadsheets()
            .values()
            .get(spreadsheetId=spreadsheet_id, range=f"'{sheet_name}'")
            .execute()
        )
    except Exception as error:
        message = str(error)
        if "The caller does not have permission" in message or "HttpError 403" in message:
            raise RuntimeError(
                f"Record sheet access denied for '{sheet_name}'. Share the japanese_record spreadsheet with the service account email in your JSON file."
            ) from error
        raise

    return response.get("values", [])


def sheet_to_objects(values: list[list[Any]]) -> list[dict[str, Any]]:
    if len(values) < 2:
        return []

    header_keys = [normalize_header_key(value) for value in values[1]]
    data_rows = values[2:]
    objects: list[dict[str, Any]] = []

    for row in data_rows:
        if not any(cell not in ("", None) for cell in row):
            continue

        record: dict[str, Any] = {}
        for index, key in enumerate(header_keys):
            if not key:
                continue
            record[key] = row[index] if index < len(row) else ""
        objects.append(record)

    return objects


def find_latest_row(rows: list[dict[str, Any]], predicate) -> dict[str, Any] | None:
    for row in reversed(rows):
        if predicate(row):
            return row
    return None


def verify_game_log(rows: list[dict[str, Any]], args: argparse.Namespace) -> dict[str, Any]:
    row = find_latest_row(rows, lambda item: str(item.get("player_id", "")).strip() == args.player_id)
    if not row:
        return {"ok": False, "reason": "No Game_Log row found for player_id.", "row": None}

    settings_json = str(row.get("settings_json", "")).strip()
    language_ok = args.language_code in settings_json if settings_json else False
    return {
        "ok": str(row.get("mode_type", "")).strip() == args.mode_type
        and str(row.get("final_score", "")).strip() == args.score
        and language_ok,
        "row": row,
        "checks": {
            "player_id": str(row.get("player_id", "")).strip() == args.player_id,
            "mode_type": str(row.get("mode_type", "")).strip() == args.mode_type,
            "final_score": str(row.get("final_score", "")).strip() == args.score,
            "language_code_in_settings_json": language_ok,
        },
    }


def verify_answer_log(rows: list[dict[str, Any]], args: argparse.Namespace) -> dict[str, Any]:
    row = find_latest_row(
        rows,
        lambda item: str(item.get("player_id", "")).strip() == args.player_id
        and str(item.get("word_id", "")).strip() == args.word_id,
    )
    if not row:
        return {"ok": False, "reason": "No Answer_Log row found for player_id + word_id.", "row": None}

    score_ok = str(row.get("numeric_score", "")).strip() == args.score
    result_grade = str(row.get("result_grade", "")).strip().lower()
    return {
        "ok": score_ok and result_grade == "correct",
        "row": row,
        "checks": {
            "player_id": str(row.get("player_id", "")).strip() == args.player_id,
            "word_id": str(row.get("word_id", "")).strip() == args.word_id,
            "numeric_score": score_ok,
            "result_grade": result_grade == "correct",
        },
    }


def verify_review_state(rows: list[dict[str, Any]], args: argparse.Namespace) -> dict[str, Any]:
    row = find_latest_row(
        rows,
        lambda item: str(item.get("player_id", "")).strip() == args.player_id
        and str(item.get("word_id", "")).strip() == args.word_id,
    )
    if not row:
        return {"ok": False, "reason": "No Review_State row found for player_id + word_id.", "row": None}

    review_stage = str(row.get("review_stage", row.get("status", ""))).strip().lower()
    priority_score = str(row.get("priority_score", "")).strip()
    return {
        "ok": review_stage in {"review", "learning", "new"} and bool(priority_score),
        "row": row,
        "checks": {
            "player_id": str(row.get("player_id", "")).strip() == args.player_id,
            "word_id": str(row.get("word_id", "")).strip() == args.word_id,
            "review_stage_or_status_present": bool(review_stage),
            "priority_score_present": bool(priority_score),
        },
    }


def verify_daily_stats(rows: list[dict[str, Any]], args: argparse.Namespace) -> dict[str, Any]:
    row = find_latest_row(rows, lambda item: str(item.get("player_id", "")).strip() == args.player_id)
    if not row:
        return {"ok": False, "reason": "No Daily_Stats row found for player_id.", "row": None}

    solved = int(str(row.get("solved_count", "0") or "0"))
    correct = int(str(row.get("correct_count", "0") or "0"))
    sessions = int(str(row.get("sessions_count", "0") or "0"))
    return {
        "ok": solved >= 1 and correct >= 1 and sessions >= 1,
        "row": row,
        "checks": {
            "player_id": str(row.get("player_id", "")).strip() == args.player_id,
            "solved_count>=1": solved >= 1,
            "correct_count>=1": correct >= 1,
            "sessions_count>=1": sessions >= 1,
        },
    }


def main() -> None:
    args = parse_args()
    service = load_service(args.credentials)

    rows_by_sheet = {
        sheet_name: sheet_to_objects(fetch_sheet_values(service, args.spreadsheet_id, sheet_name))
        for sheet_name in TARGET_SHEETS
    }

    result = {
        "Game_Log": verify_game_log(rows_by_sheet["Game_Log"], args),
        "Answer_Log": verify_answer_log(rows_by_sheet["Answer_Log"], args),
        "Review_State": verify_review_state(rows_by_sheet["Review_State"], args),
        "Daily_Stats": verify_daily_stats(rows_by_sheet["Daily_Stats"], args),
        "meta": {
            "player_id": args.player_id,
            "word_id": args.word_id,
            "mode_type": args.mode_type,
            "score": args.score,
            "language_code": args.language_code,
            "spreadsheet_id": args.spreadsheet_id,
        },
    }
    result["ok"] = all(result[sheet_name]["ok"] for sheet_name in TARGET_SHEETS)

    if args.report_file:
        report_path = Path(args.report_file)
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
