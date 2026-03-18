from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate generated static JSON files used by the frontend.",
    )
    parser.add_argument("--data-dir", default="public/data", help="Static JSON base directory.")
    parser.add_argument("--language-code", default="ja", help="Language code to validate.")
    return parser.parse_args()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def validate_languages_payload(payload: Any, language_code: str) -> dict[str, Any]:
    require(isinstance(payload, list), "languages.json must be a JSON array.")
    require(len(payload) > 0, "languages.json must contain at least one language entry.")

    matched = next((item for item in payload if isinstance(item, dict) and item.get("language_code") == language_code), None)
    require(matched is not None, f"languages.json must include language_code '{language_code}'.")

    require(isinstance(matched.get("label"), str) and matched["label"].strip(), "language label must be a non-empty string.")
    require(isinstance(matched.get("total_words"), int) and matched["total_words"] > 0, "total_words must be a positive integer.")
    return matched


def validate_word_item(item: Any, index: int) -> None:
    require(isinstance(item, dict), f"words.json item #{index} must be an object.")

    for key in ("word_id", "prompt", "answer", "meaning", "difficulty", "question_type"):
      require(isinstance(item.get(key), str) and item[key].strip(), f"words.json item #{index} field '{key}' must be a non-empty string.")

    choices = item.get("choices")
    require(isinstance(choices, list), f"words.json item #{index} field 'choices' must be an array.")
    require(len(choices) >= 2, f"words.json item #{index} must include at least 2 choices.")
    require(all(isinstance(choice, str) and choice.strip() for choice in choices), f"words.json item #{index} choices must all be non-empty strings.")
    require(item["answer"] in choices, f"words.json item #{index} answer must be included in choices.")
    require(item["question_type"] in {"word_to_meaning", "meaning_to_word"}, f"words.json item #{index} has unsupported question_type.")


def validate_words_payload(payload: Any) -> int:
    require(isinstance(payload, list), "words.json must be a JSON array.")
    require(len(payload) > 0, "words.json must contain at least one question item.")

    for index, item in enumerate(payload):
        validate_word_item(item, index)

    return len(payload)


def main() -> None:
    args = parse_args()
    data_dir = Path(args.data_dir)
    languages_path = data_dir / "languages.json"
    words_path = data_dir / args.language_code / "words.json"

    require(languages_path.exists(), f"Missing file: {languages_path}")
    require(words_path.exists(), f"Missing file: {words_path}")

    language_entry = validate_languages_payload(load_json(languages_path), args.language_code)
    question_count = validate_words_payload(load_json(words_path))

    summary = {
        "language_code": args.language_code,
        "declared_total_words": language_entry["total_words"],
        "question_count": question_count,
        "languages_path": str(languages_path),
        "words_path": str(words_path),
    }
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
