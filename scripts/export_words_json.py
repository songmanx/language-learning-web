from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


LANGUAGE_PRESETS = {
    "ja": {"label": "일본어"},
    "en": {"label": "영어"},
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export Google Sheets master workbooks into frontend JSON files.",
    )
    parser.add_argument("--credentials", required=True, help="Path to the service account JSON file.")
    parser.add_argument("--output-dir", default="public/data", help="Directory where JSON files are written.")
    parser.add_argument("--language-code", choices=sorted(LANGUAGE_PRESETS), help="Single language code to export.")
    parser.add_argument("--language-label", help="Single language label to export.")
    parser.add_argument("--spreadsheet-id", help="Single language spreadsheet id to export.")
    parser.add_argument("--all-languages", action="store_true", help="Export all supported languages in one run.")
    parser.add_argument("--ja-spreadsheet-id", help="Japanese master spreadsheet id.")
    parser.add_argument("--en-spreadsheet-id", help="English master spreadsheet id.")
    parser.add_argument("--ja-language-label", default=LANGUAGE_PRESETS["ja"]["label"], help="Japanese language label.")
    parser.add_argument("--en-language-label", default=LANGUAGE_PRESETS["en"]["label"], help="English language label.")
    return parser.parse_args()


def run_export(command: list[str]) -> None:
    subprocess.run(command, check=True)


def build_single_command(
    credentials: str,
    output_dir: str,
    language_code: str,
    language_label: str,
    spreadsheet_id: str,
) -> list[str]:
    delegate_script = Path(__file__).with_name("export_google_sheets_json.py")
    return [
        sys.executable,
        str(delegate_script),
        "--credentials",
        credentials,
        "--spreadsheet-id",
        spreadsheet_id,
        "--output-dir",
        output_dir,
        "--language-code",
        language_code,
        "--language-label",
        language_label,
    ]


def export_single(args: argparse.Namespace) -> None:
    if not args.language_code or not args.spreadsheet_id:
        raise ValueError("--language-code and --spreadsheet-id are required for single-language export.")

    language_label = args.language_label or LANGUAGE_PRESETS[args.language_code]["label"]
    command = build_single_command(
        credentials=args.credentials,
        output_dir=args.output_dir,
        language_code=args.language_code,
        language_label=language_label,
        spreadsheet_id=args.spreadsheet_id,
    )
    run_export(command)


def export_all(args: argparse.Namespace) -> None:
    spreadsheet_ids = {
        "ja": args.ja_spreadsheet_id,
        "en": args.en_spreadsheet_id,
    }
    labels = {
        "ja": args.ja_language_label,
        "en": args.en_language_label,
    }

    missing = [language_code for language_code, spreadsheet_id in spreadsheet_ids.items() if not spreadsheet_id]
    if missing:
        raise ValueError(f"Missing spreadsheet ids for: {', '.join(missing)}")

    results: list[dict[str, str]] = []
    for language_code in ("ja", "en"):
        command = build_single_command(
            credentials=args.credentials,
            output_dir=args.output_dir,
            language_code=language_code,
            language_label=labels[language_code],
            spreadsheet_id=spreadsheet_ids[language_code] or "",
        )
        run_export(command)
        results.append(
            {
                "language_code": language_code,
                "spreadsheet_id": spreadsheet_ids[language_code] or "",
                "language_label": labels[language_code],
            }
        )

    print(json.dumps({"mode": "all", "languages": results}, ensure_ascii=False))


def main() -> None:
    args = parse_args()

    if args.all_languages:
      export_all(args)
      return

    export_single(args)


if __name__ == "__main__":
    main()
