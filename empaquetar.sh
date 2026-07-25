#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo
echo "===================================="
echo "  Build Tauri: Plantilla Notas Local"
echo "===================================="
echo

if ! command -v npm >/dev/null 2>&1; then
  echo "[ERROR] npm no esta instalado"
  exit 1
fi

if ! command -v cargo >/dev/null 2>&1; then
  echo "[ERROR] Rust/Cargo no esta instalado"
  echo "Instala Rust desde: https://rustup.rs/"
  exit 1
fi

node scripts/prepare-tauri-web.js
npm run tauri:build

echo
echo "[OK] Build completado"
echo "Salida: src-tauri/target/release/bundle/nsis/"
