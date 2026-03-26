from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Google Sheets 단어 시트를 프론트엔드용 JSON으로 변환합니다.",
    )
    parser.add_argument("--credentials", required=True, help="서비스 계정 JSON 경로")
    parser.add_argument("--spreadsheet-id", required=True, help="Google Sheets 스프레드시트 ID")
    parser.add_argument("--output-dir", default="public/data", help="출력 디렉토리")
    parser.add_argument("--language-code", default="ja", help="언어 코드")
    parser.add_argument("--language-label", default="일본어", help="언어 라벨")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    delegate_script = Path(__file__).with_name("export_google_sheets_json.py")
    command = [
      sys.executable,
      str(delegate_script),
      "--credentials",
      args.credentials,
      "--spreadsheet-id",
      args.spreadsheet_id,
      "--output-dir",
      args.output_dir,
      "--language-code",
      args.language_code,
      "--language-label",
      args.language_label,
    ]
    subprocess.run(command, check=True)


if __name__ == "__main__":
    main()
