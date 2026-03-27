@echo off
chcp 65001 > nul
cd /d "%~dp0"
python ".\scripts\json_publish_gui.py"

REM cmd창 종료되지 않게 유지하려면 바로 위에 pause 단어를 한줄 추가