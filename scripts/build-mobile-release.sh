#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILE_DIR="$ROOT_DIR/apps/mobile"
ANDROID_DIR="$ROOT_DIR/apps/mobile/android"
ARTIFACT="${1:-aab}"
EXPECTED_EXPO_MAJOR="51"

INSTALLED_EXPO_VERSION="$(
  node -p "try { require('$MOBILE_DIR/node_modules/expo/package.json').version } catch { '' }" 2>/dev/null
)"

if [[ -z "$INSTALLED_EXPO_VERSION" ]]; then
  echo "Expo nao encontrado em apps/mobile/node_modules."
  echo "Rode: npm install"
  exit 1
fi

INSTALLED_EXPO_MAJOR="${INSTALLED_EXPO_VERSION%%.*}"

if [[ "$INSTALLED_EXPO_MAJOR" != "$EXPECTED_EXPO_MAJOR" ]]; then
  echo "Versao do Expo instalada: $INSTALLED_EXPO_VERSION"
  echo "Este projeto Android esta configurado para Expo SDK $EXPECTED_EXPO_MAJOR."
  echo "Sincronize as dependencias antes do build:"
  echo "npm install"
  exit 1
fi

case "$ARTIFACT" in
  aab)
    TASK="bundleRelease"
    OUTPUT_RELATIVE="app/build/outputs/bundle/release/app-release.aab"
    ;;
  apk)
    TASK="assembleRelease"
    OUTPUT_RELATIVE="app/build/outputs/apk/release/app-release.apk"
    ;;
  *)
    echo "Uso: ./scripts/build-mobile-release.sh [aab|apk]"
    exit 1
    ;;
esac

echo "Gerando $ARTIFACT com Gradle local..."
echo "Diretorio Android: $ANDROID_DIR"

cd "$ANDROID_DIR"
./gradlew "$TASK"

echo
echo "Build finalizado."
echo "Artefato: $ANDROID_DIR/$OUTPUT_RELATIVE"
