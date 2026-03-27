from __future__ import annotations

import configparser
import subprocess
import sys
from datetime import datetime
from pathlib import Path
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext


ROOT_DIR = Path(__file__).resolve().parents[1]
SETTINGS_PATH = ROOT_DIR / "json_publish_gui.local.ini"
DEFAULT_OUTPUT_DIR = ROOT_DIR / "public" / "data"
DEFAULT_COMMIT_PREFIX = "data: refresh all language json"
WINDOW_SIZE = "940x700"

PALETTE = {
    "bg": "#f8f2ff",
    "panel": "#fffafc",
    "panel_alt": "#fff7fb",
    "line": "#eadcf5",
    "field": "#f7eefc",
    "text": "#352842",
    "muted": "#7d6f89",
    "pink": "#ff8eb5",
    "pink_active": "#ff6fa1",
    "cyan": "#8fdff0",
    "cyan_active": "#71d2e9",
    "cream": "#ffe7b8",
    "cream_active": "#ffd98a",
    "lavender": "#d9c8f7",
    "log_bg": "#fffdfd",
}

LANGUAGE_FIELDS = (
    {"code": "ja", "label": "일본어", "sheet_key": "ja_spreadsheet_id"},
    {"code": "en", "label": "영어", "sheet_key": "en_spreadsheet_id"},
)


class JsonPublishApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("YANG JSON Studio")
        self.root.geometry(WINDOW_SIZE)
        self.root.minsize(900, 780)
        self.root.configure(bg=PALETTE["bg"])

        self.credentials_var = tk.StringVar()
        self.output_dir_var = tk.StringVar(value=str(DEFAULT_OUTPUT_DIR))
        self.commit_message_var = tk.StringVar()
        self.sheet_vars = {
            "ja_spreadsheet_id": tk.StringVar(),
            "en_spreadsheet_id": tk.StringVar(),
        }
        self.label_vars = {
            "ja": tk.StringVar(value="일본어"),
            "en": tk.StringVar(value="영어"),
        }
        self.last_export_succeeded = False
        self.log: scrolledtext.ScrolledText | None = None

        self._load_settings()
        self._refresh_commit_message()
        self._build_ui()

    def _load_settings(self) -> None:
        if not SETTINGS_PATH.exists():
            return

        parser = configparser.ConfigParser()
        parser.read(SETTINGS_PATH, encoding="utf-8-sig")
        section = parser["json_publish"] if parser.has_section("json_publish") else {}

        self.credentials_var.set(section.get("credentials", ""))
        self.output_dir_var.set(section.get("output_dir", str(DEFAULT_OUTPUT_DIR)))
        self.commit_message_var.set(section.get("commit_message", ""))
        self.sheet_vars["ja_spreadsheet_id"].set(section.get("ja_spreadsheet_id", section.get("spreadsheet_id", "")))
        self.sheet_vars["en_spreadsheet_id"].set(section.get("en_spreadsheet_id", ""))
        self.label_vars["ja"].set(section.get("ja_language_label", "일본어"))
        self.label_vars["en"].set(section.get("en_language_label", "영어"))

    def _refresh_commit_message(self) -> None:
        if self.commit_message_var.get().strip():
            return
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        self.commit_message_var.set(f"{DEFAULT_COMMIT_PREFIX} ({timestamp})")

    def _save_settings(self, notify: bool = False) -> None:
        parser = configparser.ConfigParser()
        parser["json_publish"] = {
            "credentials": self.credentials_var.get().strip(),
            "output_dir": self.output_dir_var.get().strip(),
            "commit_message": self.commit_message_var.get().strip(),
            "ja_spreadsheet_id": self.sheet_vars["ja_spreadsheet_id"].get().strip(),
            "en_spreadsheet_id": self.sheet_vars["en_spreadsheet_id"].get().strip(),
            "ja_language_label": self.label_vars["ja"].get().strip() or "일본어",
            "en_language_label": self.label_vars["en"].get().strip() or "영어",
        }
        with SETTINGS_PATH.open("w", encoding="utf-8-sig") as file:
            parser.write(file)

        self._write_log(f"설정 저장 · {SETTINGS_PATH.name}")
        if notify:
            messagebox.showinfo("저장 완료", "설정을 저장했어요.")

    def _build_ui(self) -> None:
        outer = tk.Frame(self.root, bg=PALETTE["bg"], padx=18, pady=18)
        outer.pack(fill="both", expand=True)
        outer.grid_columnconfigure(0, weight=7)
        outer.grid_columnconfigure(1, weight=5)
        outer.grid_rowconfigure(2, weight=1)

        header = self._card(outer, 0, 0, columnspan=2, bg=PALETTE["panel_alt"], padx=22, pady=18)
        tk.Label(
            header,
            text="YANG JSON Studio",
            font=("Malgun Gothic", 22, "bold"),
            fg=PALETTE["text"],
            bg=PALETTE["panel_alt"],
        ).pack(anchor="w")
        tk.Label(
            header,
            text="일본어 · 영어 한 번에 발행",
            font=("Malgun Gothic", 10, "bold"),
            fg=PALETTE["muted"],
            bg=PALETTE["panel_alt"],
        ).pack(anchor="w", pady=(4, 0))

        settings_card = self._card(outer, 1, 0, sticky="nsew", padx=(0, 10), pady=(14, 0), padx_inner=18, pady_inner=18)
        actions_card = self._card(outer, 1, 1, sticky="nsew", pady=(14, 0), bg=PALETTE["panel_alt"], padx_inner=18, pady_inner=18)
        log_card = self._card(outer, 2, 0, columnspan=2, sticky="nsew", pady=(14, 0), padx_inner=18, pady_inner=16)

        self._build_settings_panel(settings_card)
        self._build_actions_panel(actions_card)
        self._build_log_panel(log_card)

        self._write_log("도구 준비 완료")

    def _card(
        self,
        parent: tk.Widget,
        row: int,
        column: int,
        *,
        columnspan: int = 1,
        sticky: str = "ew",
        padx: tuple[int, int] | int = 0,
        pady: tuple[int, int] | int = 0,
        bg: str | None = None,
        padx_inner: int = 16,
        pady_inner: int = 16,
    ) -> tk.Frame:
        frame = tk.Frame(
            parent,
            bg=bg or PALETTE["panel"],
            highlightbackground=PALETTE["line"],
            highlightthickness=1,
            padx=padx_inner,
            pady=pady_inner,
        )
        frame.grid(row=row, column=column, columnspan=columnspan, sticky=sticky, padx=padx, pady=pady)
        return frame

    def _build_settings_panel(self, parent: tk.Frame) -> None:
        parent.grid_columnconfigure(1, weight=1)
        tk.Label(
            parent,
            text="설정",
            font=("Malgun Gothic", 12, "bold"),
            fg=PALETTE["text"],
            bg=PALETTE["panel"],
        ).grid(row=0, column=0, columnspan=3, sticky="w", pady=(0, 10))

        self._add_file_row(parent, 1, "계정 JSON", self.credentials_var, self._browse_credentials)
        self._add_file_row(parent, 2, "출력 폴더", self.output_dir_var, self._browse_output_dir)
        self._add_text_row(parent, 3, "일본어 시트", self.sheet_vars["ja_spreadsheet_id"])
        self._add_text_row(parent, 4, "영어 시트", self.sheet_vars["en_spreadsheet_id"])
        self._add_text_row(parent, 5, "커밋 메시지", self.commit_message_var)

        footer = tk.Frame(parent, bg=PALETTE["panel"])
        footer.grid(row=6, column=0, columnspan=3, sticky="ew", pady=(12, 0))
        footer.grid_columnconfigure(0, weight=1)
        tk.Label(
            footer,
            text="local 설정 저장",
            font=("Malgun Gothic", 9),
            fg=PALETTE["muted"],
            bg=PALETTE["panel"],
        ).grid(row=0, column=0, sticky="w")
        tk.Button(
            footer,
            text="설정 저장",
            command=lambda: self._save_settings(notify=True),
            font=("Malgun Gothic", 9, "bold"),
            bg=PALETTE["lavender"],
            fg=PALETTE["text"],
            activebackground="#ccb6f1",
            activeforeground=PALETTE["text"],
            relief="flat",
            padx=14,
            pady=9,
            cursor="hand2",
        ).grid(row=0, column=1, sticky="e")

    def _build_actions_panel(self, parent: tk.Frame) -> None:
        tk.Label(
            parent,
            text="발행",
            font=("Malgun Gothic", 12, "bold"),
            fg=PALETTE["text"],
            bg=PALETTE["panel_alt"],
        ).pack(anchor="w")

        badge_row = tk.Frame(parent, bg=PALETTE["panel_alt"])
        badge_row.pack(anchor="w", pady=(10, 12))
        self._badge(badge_row, "일본어", PALETTE["cream"]).pack(side="left")
        self._badge(badge_row, "영어", PALETTE["cyan"]).pack(side="left", padx=(8, 0))

        self._action_block(
            parent,
            title="1. 전체 생성",
            subtitle="JSON 생성 + 검증",
            bg=PALETTE["cream"],
            active_bg=PALETTE["cream_active"],
            fg="#2f2110",
            command=self.run_export,
        ).pack(fill="x")

        self._action_block(
            parent,
            title="2. GitHub 반영",
            subtitle="public/data add · commit · push",
            bg=PALETTE["pink"],
            active_bg=PALETTE["pink_active"],
            fg="#3a1724",
            command=self.run_publish,
        ).pack(fill="x", pady=(12, 0))

        tk.Label(
            parent,
            text="설명은 최소, 발행은 빠르게.",
            font=("Malgun Gothic", 9),
            fg=PALETTE["muted"],
            bg=PALETTE["panel_alt"],
        ).pack(anchor="w", pady=(12, 0))

    def _build_log_panel(self, parent: tk.Frame) -> None:
        parent.grid_columnconfigure(0, weight=1)
        parent.grid_rowconfigure(1, weight=1)
        tk.Label(
            parent,
            text="로그",
            font=("Malgun Gothic", 11, "bold"),
            fg=PALETTE["text"],
            bg=PALETTE["panel"],
        ).grid(row=0, column=0, sticky="w", pady=(0, 8))
        self.log = scrolledtext.ScrolledText(
            parent,
            wrap="word",
            height=11,
            font=("Consolas", 10),
            bg=PALETTE["log_bg"],
            fg=PALETTE["text"],
            insertbackground=PALETTE["text"],
            relief="flat",
            padx=12,
            pady=12,
        )
        self.log.grid(row=1, column=0, sticky="nsew")

    def _badge(self, parent: tk.Widget, text: str, color: str) -> tk.Label:
        return tk.Label(
            parent,
            text=text,
            font=("Malgun Gothic", 9, "bold"),
            fg=PALETTE["text"],
            bg=color,
            padx=12,
            pady=6,
        )

    def _action_block(
        self,
        parent: tk.Widget,
        *,
        title: str,
        subtitle: str,
        bg: str,
        active_bg: str,
        fg: str,
        command,
    ) -> tk.Frame:
        wrapper = tk.Frame(
            parent,
            bg=PALETTE["panel"],
            highlightbackground=PALETTE["line"],
            highlightthickness=1,
            padx=14,
            pady=14,
        )
        tk.Label(
            wrapper,
            text=subtitle,
            font=("Malgun Gothic", 9),
            fg=PALETTE["muted"],
            bg=PALETTE["panel"],
        ).pack(anchor="w", pady=(0, 8))
        tk.Button(
            wrapper,
            text=title,
            command=command,
            font=("Malgun Gothic", 12, "bold"),
            bg=bg,
            fg=fg,
            activebackground=active_bg,
            activeforeground=fg,
            relief="flat",
            padx=18,
            pady=14,
            cursor="hand2",
        ).pack(fill="x")
        return wrapper

    def _add_text_row(self, parent: tk.Frame, row: int, label: str, variable: tk.StringVar, width: int = 48) -> None:
        tk.Label(
            parent,
            text=label,
            font=("Malgun Gothic", 10, "bold"),
            fg=PALETTE["text"],
            bg=PALETTE["panel"],
        ).grid(row=row, column=0, sticky="w", pady=5)
        entry = tk.Entry(
            parent,
            textvariable=variable,
            width=width,
            font=("Malgun Gothic", 10),
            relief="flat",
            bg=PALETTE["field"],
            fg=PALETTE["text"],
            insertbackground=PALETTE["text"],
        )
        entry.grid(row=row, column=1, sticky="ew", padx=(10, 0), pady=5)
        parent.grid_columnconfigure(1, weight=1)

    def _add_file_row(self, parent: tk.Frame, row: int, label: str, variable: tk.StringVar, browse_callback) -> None:
        self._add_text_row(parent, row, label, variable)
        tk.Button(
            parent,
            text="찾기",
            command=browse_callback,
            font=("Malgun Gothic", 9, "bold"),
            bg=PALETTE["lavender"],
            fg=PALETTE["text"],
            activebackground="#ccb6f1",
            activeforeground=PALETTE["text"],
            relief="flat",
            padx=12,
            pady=9,
            cursor="hand2",
        ).grid(row=row, column=2, sticky="e", padx=(10, 0), pady=5)

    def _browse_credentials(self) -> None:
        path = filedialog.askopenfilename(
            title="서비스 계정 JSON 선택",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")],
            initialdir=str(ROOT_DIR),
        )
        if path:
            self.credentials_var.set(path)

    def _browse_output_dir(self) -> None:
        path = filedialog.askdirectory(title="출력 폴더 선택", initialdir=str(ROOT_DIR))
        if path:
            self.output_dir_var.set(path)

    def _write_log(self, message: str) -> None:
        if self.log is None:
            return
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.log.insert("end", f"[{timestamp}] {message}\n")
        self.log.see("end")
        self.root.update_idletasks()

    def _run_command(self, command: list[str], success_message: str) -> bool:
        self._write_log(f"실행: {' '.join(command)}")
        try:
            completed = subprocess.run(
                command,
                cwd=ROOT_DIR,
                capture_output=True,
                text=True,
                check=True,
                encoding="utf-8",
                errors="replace",
            )
        except subprocess.CalledProcessError as error:
            if error.stdout:
                self._write_log(error.stdout.strip())
            if error.stderr:
                self._write_log(error.stderr.strip())
            messagebox.showerror("실행 실패", "작업 중 오류가 발생했습니다. 로그를 확인해 주세요.")
            return False

        if completed.stdout:
            self._write_log(completed.stdout.strip())
        if completed.stderr:
            self._write_log(completed.stderr.strip())
        self._write_log(success_message)
        return True

    def run_export(self) -> None:
        credentials = self.credentials_var.get().strip()
        output_dir = self.output_dir_var.get().strip()
        ja_spreadsheet_id = self.sheet_vars["ja_spreadsheet_id"].get().strip()
        en_spreadsheet_id = self.sheet_vars["en_spreadsheet_id"].get().strip()

        if not credentials or not ja_spreadsheet_id or not en_spreadsheet_id:
            messagebox.showwarning("입력 필요", "계정 JSON, 일본어 시트, 영어 시트를 모두 넣어 주세요.")
            return

        self._save_settings(notify=False)

        export_command = [
            sys.executable,
            str(ROOT_DIR / "scripts" / "export_words_json.py"),
            "--credentials",
            credentials,
            "--output-dir",
            output_dir,
            "--all-languages",
            "--ja-spreadsheet-id",
            ja_spreadsheet_id,
            "--en-spreadsheet-id",
            en_spreadsheet_id,
            "--ja-language-label",
            self.label_vars["ja"].get().strip() or "일본어",
            "--en-language-label",
            self.label_vars["en"].get().strip() or "영어",
        ]

        export_ok = self._run_command(export_command, "전체 JSON 생성 완료")
        if not export_ok:
            self.last_export_succeeded = False
            return

        for language_code, label in (("ja", "일본어"), ("en", "영어")):
            validate_command = [
                sys.executable,
                str(ROOT_DIR / "scripts" / "validate_static_json.py"),
                "--language-code",
                language_code,
                "--data-dir",
                output_dir,
            ]
            validate_ok = self._run_command(validate_command, f"{label} 검증 완료")
            if not validate_ok:
                self.last_export_succeeded = False
                return

        self.last_export_succeeded = True
        messagebox.showinfo("완료", "일본어와 영어 JSON 생성/검증이 끝났어요.")

    def run_publish(self) -> None:
        self._save_settings(notify=False)

        if not self.last_export_succeeded:
            proceed = messagebox.askyesno("확인", "이번 실행에서 1단계 성공 기록이 없어요. 그래도 반영할까요?")
            if not proceed:
                return

        commit_message = self.commit_message_var.get().strip()
        if not commit_message:
            messagebox.showwarning("입력 필요", "커밋 메시지를 넣어 주세요.")
            return

        status_command = ["git", "status", "--porcelain", "--", "public/data"]
        status = subprocess.run(
            status_command,
            cwd=ROOT_DIR,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        changed = status.stdout.strip()
        if not changed:
            messagebox.showinfo("변경 없음", "public/data 변경이 없습니다.")
            self._write_log("GitHub 반영 생략 · 변경 없음")
            return

        commands = [
            ["git", "add", "public/data"],
            ["git", "commit", "-m", commit_message],
            ["git", "push"],
        ]
        for index, command in enumerate(commands, start=1):
            ok = self._run_command(command, f"GitHub 반영 {index}/{len(commands)} 완료")
            if not ok:
                return

        messagebox.showinfo("완료", "GitHub 반영이 끝났어요.")


def main() -> None:
    root = tk.Tk()
    JsonPublishApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
