@echo off
setlocal
cd /d "%~dp0"

echo.
echo ====================================
echo   Build Tauri: Plantilla Notas Local
echo ====================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] NPM no esta instalado.
  pause
  exit /b 1
)

where cargo >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Rust/Cargo no esta instalado.
  echo Instala Rust desde: https://rustup.rs/
  pause
  exit /b 1
)

call node scripts\prepare-tauri-web.js
if errorlevel 1 (
  echo [ERROR] Fallo al preparar tauri-web.
  pause
  exit /b 1
)

call npm run tauri:build
if errorlevel 1 (
  echo [ERROR] Fallo la compilacion Tauri.
  pause
  exit /b 1
)

echo.
echo [OK] Build completado.
echo Salida: src-tauri\target\release\bundle\nsis\
echo.
pause
