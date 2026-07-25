@echo off
cd /d "%~dp0"
node scripts\prepare-tauri-web.js
if errorlevel 1 (
	echo Error preparando tauri-web.
	pause
	exit /b 1
)

npm run tauri:dev
