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
DEFAULT_LANGUAGE_CODE = "ja"
DEFAULT_LANGUAGE_LABEL = "일본어"


class JsonPublishApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("YANG JSON 발행 도구")
        self.root.geometry("760x720")
        self.root.minsize(720, 640)

        self.credentials_var = tk.StringVar()
        self.spreadsheet_var = tk.StringVar()
        self.output_dir_var = tk.StringVar(value=str(DEFAULT_OUTPUT_DIR))
        self.language_code_var = tk.StringVar(value=DEFAULT_LANGUAGE_CODE)
        self.language_label_var = tk.StringVar(value=DEFAULT_LANGUAGE_LABEL)
        self.commit_message_var = tk.StringVar()

        self.last_export_succeeded = False

        self._load_settings()
        self._refresh_commit_message()
        self._build_ui()

    def _refresh_commit_message(self) -> None:
        if self.commit_message_var.get().strip():
            return
        self.commit_message_var.set(
            f"data: refresh words json ({datetime.now().strftime('%Y-%m-%d %H:%M')})"
        )

    def _load_settings(self) -> None:
        if not SETTINGS_PATH.exists():
            return

        parser = configparser.ConfigParser()
        parser.read(SETTINGS_PATH, encoding="utf-8")
        section = parser["json_publish"] if parser.has_section("json_publish") else {}

        self.credentials_var.set(section.get("credentials", ""))
        self.spreadsheet_var.set(section.get("spreadsheet_id", ""))
        self.output_dir_var.set(section.get("output_dir", str(DEFAULT_OUTPUT_DIR)))
        self.language_code_var.set(section.get("language_code", DEFAULT_LANGUAGE_CODE))
        self.language_label_var.set(section.get("language_label", DEFAULT_LANGUAGE_LABEL))
        self.commit_message_var.set(section.get("commit_message", ""))

    def _save_settings(self, notify: bool = False) -> None:
        parser = configparser.ConfigParser()
        parser["json_publish"] = {
            "credentials": self.credentials_var.get().strip(),
            "spreadsheet_id": self.spreadsheet_var.get().strip(),
            "output_dir": self.output_dir_var.get().strip(),
            "language_code": self.language_code_var.get().strip() or DEFAULT_LANGUAGE_CODE,
            "language_label": self.language_label_var.get().strip() or DEFAULT_LANGUAGE_LABEL,
            "commit_message": self.commit_message_var.get().strip(),
        }

        SETTINGS_PATH.write_text("", encoding="utf-8")
        with SETTINGS_PATH.open("w", encoding="utf-8") as file:
            parser.write(file)

        self._write_log(f"설정 저장: {SETTINGS_PATH.name}")
        if notify:
            messagebox.showinfo("저장 완료", "로컬 설정 파일에 저장했습니다.")

    def _build_ui(self) -> None:
        wrapper = tk.Frame(self.root, bg="#14110f")
        wrapper.pack(fill="both", expand=True)

        header = tk.Frame(wrapper, bg="#14110f", padx=20, pady=18)
        header.pack(fill="x")

        tk.Label(
            header,
            text="YANG JSON 발행 도구",
            font=("Malgun Gothic", 20, "bold"),
            fg="#fff5ea",
            bg="#14110f",
        ).pack(anchor="w")
        tk.Label(
            header,
            text="1단계 JSON 생성 → 2단계 GitHub 반영",
            font=("Malgun Gothic", 10),
            fg="#d3c6b9",
            bg="#14110f",
        ).pack(anchor="w", pady=(6, 0))

        form = tk.Frame(wrapper, bg="#1e1a17", padx=18, pady=18)
        form.pack(fill="x", padx=16)

        self._add_file_row(form, 0, "서비스 계정 JSON", self.credentials_var, self._browse_credentials)
        self._add_text_row(form, 1, "스프레드시트 ID", self.spreadsheet_var, width=54)
        self._add_file_row(form, 2, "출력 폴더", self.output_dir_var, self._browse_output_dir)
        self._add_text_row(form, 3, "언어 코드", self.language_code_var, width=18)
        self._add_text_row(form, 4, "언어 라벨", self.language_label_var, width=18)
        self._add_text_row(form, 5, "커밋 메시지", self.commit_message_var, width=54)

        save_settings_button = tk.Button(
            form,
            text="설정 저장",
            command=lambda: self._save_settings(notify=True),
            font=("Malgun Gothic", 9, "bold"),
            bg="#3b342f",
            fg="#fff5ea",
            activebackground="#564b43",
            relief="flat",
            padx=12,
            pady=8,
            cursor="hand2",
        )
        save_settings_button.grid(row=6, column=2, sticky="e", padx=(10, 0), pady=(10, 0))

        settings_hint = tk.Label(
            form,
            text=f"로컬 설정 파일: {SETTINGS_PATH.name} (Git 업로드 제외)",
            font=("Malgun Gothic", 9),
            fg="#cbbfb3",
            bg="#1e1a17",
        )
        settings_hint.grid(row=6, column=0, columnspan=2, sticky="w", pady=(10, 0))

        steps = tk.Frame(wrapper, bg="#14110f", padx=16, pady=16)
        steps.pack(fill="x")

        step1 = tk.Frame(steps, bg="#201b18", padx=16, pady=16)
        step1.pack(fill="x", pady=(0, 10))
        tk.Label(step1, text="1단계", font=("Malgun Gothic", 11, "bold"), fg="#f7d27c", bg="#201b18").pack(anchor="w")
        tk.Label(
            step1,
            text="Google Sheets에서 JSON 생성 + 검증",
            font=("Malgun Gothic", 12, "bold"),
            fg="#ffffff",
            bg="#201b18",
        ).pack(anchor="w", pady=(4, 10))
        tk.Button(
            step1,
            text="1. JSON 생성",
            command=self.run_export,
            font=("Malgun Gothic", 11, "bold"),
            bg="#ffb703",
            fg="#1a130a",
            activebackground="#ffd166",
            relief="flat",
            padx=18,
            pady=12,
            cursor="hand2",
        ).pack(anchor="w")

        step2 = tk.Frame(steps, bg="#201b18", padx=16, pady=16)
        step2.pack(fill="x")
        tk.Label(step2, text="2단계", font=("Malgun Gothic", 11, "bold"), fg="#9bd3ff", bg="#201b18").pack(anchor="w")
        tk.Label(
            step2,
            text="public/data 변경분을 GitHub로 반영",
            font=("Malgun Gothic", 12, "bold"),
            fg="#ffffff",
            bg="#201b18",
        ).pack(anchor="w", pady=(4, 10))
        tk.Button(
            step2,
            text="2. GitHub 반영",
            command=self.run_publish,
            font=("Malgun Gothic", 11, "bold"),
            bg="#7dd3fc",
            fg="#082032",
            activebackground="#bae6fd",
            relief="flat",
            padx=18,
            pady=12,
            cursor="hand2",
        ).pack(anchor="w")

        log_frame = tk.Frame(wrapper, bg="#14110f", padx=16, pady=0)
        log_frame.pack(fill="both", expand=True, pady=(0, 16))
        tk.Label(
            log_frame,
            text="실행 로그",
            font=("Malgun Gothic", 11, "bold"),
            fg="#fff5ea",
            bg="#14110f",
        ).pack(anchor="w", pady=(0, 8))
        self.log = scrolledtext.ScrolledText(
            log_frame,
            wrap="word",
            font=("Consolas", 10),
            bg="#0f0d0c",
            fg="#eae4dc",
            insertbackground="#ffffff",
            relief="flat",
            padx=10,
            pady=10,
        )
        self.log.pack(fill="both", expand=True)
        self._write_log("도구를 열었습니다. 필요하면 설정 저장 후 1단계부터 실행해 주세요.")

    def _add_text_row(
        self,
        parent: tk.Frame,
        row: int,
        label: str,
        variable: tk.StringVar,
        width: int = 40,
    ) -> None:
        tk.Label(
            parent,
            text=label,
            font=("Malgun Gothic", 10, "bold"),
            fg="#fff5ea",
            bg="#1e1a17",
        ).grid(row=row, column=0, sticky="w", pady=6)
        entry = tk.Entry(
            parent,
            textvariable=variable,
            width=width,
            font=("Malgun Gothic", 10),
            relief="flat",
            bg="#2b2622",
            fg="#ffffff",
            insertbackground="#ffffff",
        )
        entry.grid(row=row, column=1, sticky="ew", pady=6, padx=(10, 0))
        parent.grid_columnconfigure(1, weight=1)

    def _add_file_row(
        self,
        parent: tk.Frame,
        row: int,
        label: str,
        variable: tk.StringVar,
        browse_callback,
    ) -> None:
        self._add_text_row(parent, row, label, variable, width=48)
        button = tk.Button(
            parent,
            text="찾기",
            command=browse_callback,
            font=("Malgun Gothic", 9, "bold"),
            bg="#3b342f",
            fg="#fff5ea",
            activebackground="#564b43",
            relief="flat",
            padx=12,
            pady=8,
            cursor="hand2",
        )
        button.grid(row=row, column=2, sticky="e", padx=(10, 0))

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
        spreadsheet_id = self.spreadsheet_var.get().strip()
        output_dir = self.output_dir_var.get().strip()
        language_code = self.language_code_var.get().strip() or DEFAULT_LANGUAGE_CODE
        language_label = self.language_label_var.get().strip() or DEFAULT_LANGUAGE_LABEL

        if not credentials or not spreadsheet_id:
            messagebox.showwarning("입력 필요", "서비스 계정 JSON과 스프레드시트 ID를 입력해 주세요.")
            return

        self._save_settings(notify=False)

        export_command = [
            sys.executable,
            str(ROOT_DIR / "scripts" / "export_words_json.py"),
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
        validate_command = [
            sys.executable,
            str(ROOT_DIR / "scripts" / "validate_static_json.py"),
        ]

        export_ok = self._run_command(export_command, "1단계 완료: JSON 생성이 끝났습니다.")
        if not export_ok:
            self.last_export_succeeded = False
            return

        validate_ok = self._run_command(validate_command, "검증 완료: 생성된 JSON이 유효합니다.")
        self.last_export_succeeded = validate_ok
        if validate_ok:
            messagebox.showinfo("완료", "JSON 생성과 검증이 완료되었습니다. 이제 2단계를 실행할 수 있습니다.")

    def run_publish(self) -> None:
        self._save_settings(notify=False)

        if not self.last_export_succeeded:
            proceed = messagebox.askyesno(
                "확인",
                "이번 실행에서 1단계 성공 기록이 없습니다. 그래도 GitHub 반영을 진행할까요?",
            )
            if not proceed:
                return

        commit_message = self.commit_message_var.get().strip()
        if not commit_message:
            messagebox.showwarning("입력 필요", "커밋 메시지를 입력해 주세요.")
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
            messagebox.showinfo("변경 없음", "public/data에 반영할 변경이 없습니다.")
            self._write_log("2단계 생략: public/data 변경이 없습니다.")
            return

        commands = [
            ["git", "add", "public/data"],
            ["git", "commit", "-m", commit_message],
            ["git", "push"],
        ]

        for index, command in enumerate(commands, start=1):
            ok = self._run_command(command, f"2단계 진행: {index}/{len(commands)} 완료")
            if not ok:
                return

        messagebox.showinfo("완료", "GitHub 반영이 완료되었습니다.")


def main() -> None:
    root = tk.Tk()
    JsonPublishApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
