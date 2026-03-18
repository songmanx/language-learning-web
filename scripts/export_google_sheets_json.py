from __future__ import annotations

import argparse
import json
from pathlib import Path
from random import shuffle
from typing import Any

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build


DEFAULT_CHOICE_COUNT = 4
SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export Google Sheets master workbook into static JSON files for the frontend.",
    )
    parser.add_argument("--credentials", required=True, help="Path to the service account JSON file.")
    parser.add_argument("--spreadsheet-id", required=True, help="Google Sheets master spreadsheet id.")
    parser.add_argument("--output-dir", default="public/data", help="Directory where JSON files are written.")
    parser.add_argument("--language-code", default="ja", help="Language code written to languages.json.")
    parser.add_argument("--language-label", default="일본어", help="Language label written to languages.json.")
    return parser.parse_args()


def load_service(credentials_path: str):
    credentials = Credentials.from_service_account_file(credentials_path, scopes=SCOPES)
    return build("sheets", "v4", credentials=credentials, cache_discovery=False)


def normalize_header_key(value: Any) -> str:
    return str(value or "").strip()


def is_active(value: Any) -> bool:
    normalized = str(value or "").strip().lower()
    return normalized in {"true", "1", "yes", "y"}


def unique(items: list[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []

    for item in items:
        if item in seen:
            continue
        seen.add(item)
        ordered.append(item)

    return ordered


def get_primary_meaning(row: dict[str, Any]) -> str:
    for key in ("meaning_ko_1", "meaning_ko_2", "meaning_ko_3"):
        value = str(row.get(key, "") or "").strip()
        if value:
            return value
    return ""


def build_choices(answer: str, pool: list[str]) -> list[str]:
    distractors = [item for item in unique([item for item in pool if item]) if item != answer]
    shuffle(distractors)
    choices = distractors[: max(0, DEFAULT_CHOICE_COUNT - 1)] + [answer]
    shuffle(choices)
    return choices


def build_question_dto(
    word_id: str,
    prompt: str,
    choice_pool: list[str],
    answer: str,
    question_type: str,
    meaning: str,
    difficulty: str,
) -> dict[str, Any]:
    return {
        "word_id": word_id,
        "prompt": prompt,
        "choices": build_choices(answer, choice_pool),
        "answer": answer,
        "meaning": meaning,
        "difficulty": str(difficulty or ""),
        "question_type": question_type,
    }


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


def fetch_sheet_values(service, spreadsheet_id: str, sheet_name: str) -> list[list[Any]]:
    response = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range=f"'{sheet_name}'")
        .execute()
    )
    return response.get("values", [])


def fetch_source_rows(service, spreadsheet_id: str) -> list[dict[str, Any]]:
    spreadsheet = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
    sheets = spreadsheet.get("sheets", [])
    source_rows: list[dict[str, Any]] = []

    for sheet in sheets:
        title = sheet["properties"]["title"]
        values = fetch_sheet_values(service, spreadsheet_id, title)
        header_keys = [normalize_header_key(value) for value in values[1]] if len(values) >= 2 else []
        if "word_id" not in header_keys or "jp_kanji" not in header_keys:
            continue

        for row in sheet_to_objects(values):
            if not row.get("word_id") or not is_active(row.get("is_active")):
                continue
            row["_sheet_name"] = title
            source_rows.append(row)

    return source_rows


def build_question_dtos(source_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    active_rows = [row for row in source_rows if row.get("word_id") and get_primary_meaning(row)]
    meaning_pool = unique([get_primary_meaning(row) for row in active_rows if get_primary_meaning(row)])
    kanji_pool = unique([str(row.get("jp_kanji", "") or "").strip() for row in active_rows if str(row.get("jp_kanji", "") or "").strip()])

    furigana_pool = unique([
        candidate
        for row in active_rows
        for candidate in (
            str(row.get("jp_furigana", "") or "").strip(),
            str(row.get("jp_furigana_2", "") or "").strip(),
        )
        if candidate
    ])

    questions: list[dict[str, Any]] = []

    for row in active_rows:
        word_id = str(row.get("word_id", "") or "").strip()
        meaning = get_primary_meaning(row)
        difficulty = str(row.get("difficulty", "") or "")
        kanji = str(row.get("jp_kanji", "") or "").strip()
        furigana = str(row.get("jp_furigana", "") or "").strip()
        furigana2 = str(row.get("jp_furigana_2", "") or "").strip()

        if kanji:
            questions.append(build_question_dto(word_id, kanji, meaning_pool, meaning, "word_to_meaning", meaning, difficulty))
            questions.append(build_question_dto(word_id, meaning, kanji_pool, kanji, "meaning_to_word", meaning, difficulty))

        if furigana:
            questions.append(build_question_dto(word_id, furigana, meaning_pool, meaning, "word_to_meaning", meaning, difficulty))
            questions.append(build_question_dto(word_id, meaning, furigana_pool, furigana, "meaning_to_word", meaning, difficulty))

        if furigana2:
            questions.append(build_question_dto(word_id, furigana2, meaning_pool, meaning, "word_to_meaning", meaning, difficulty))

    return questions


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    args = parse_args()
    service = load_service(args.credentials)
    source_rows = fetch_source_rows(service, args.spreadsheet_id)
    questions = build_question_dtos(source_rows)

    output_dir = Path(args.output_dir)
    languages_payload = [
        {
            "language_code": args.language_code,
            "label": args.language_label,
            "total_words": len(source_rows),
        }
    ]

    write_json(output_dir / "languages.json", languages_payload)
    write_json(output_dir / args.language_code / "words.json", questions)

    summary = {
        "language_code": args.language_code,
        "source_rows": len(source_rows),
        "question_count": len(questions),
        "output_dir": str(output_dir),
    }
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()

