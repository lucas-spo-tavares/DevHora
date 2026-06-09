#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILE_DIR="$ROOT_DIR/apps/mobile"
ARTIFACT="${1:-aab}"
EXPECTED_EXPO_MAJOR="51"
EAS_PROFILE=""
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
    EAS_PROFILE="production"
    ;;
  apk)
    EAS_PROFILE="preview"
    ;;
  *)
    echo "Uso: ./scripts/build-mobile-release.sh [aab|apk]"
    exit 1
    ;;
esac

echo "Gerando $ARTIFACT com EAS local..."
echo "Diretorio do app: $MOBILE_DIR"
echo "Perfil EAS: $EAS_PROFILE"

cd "$MOBILE_DIR"
npx eas-cli build --platform android --profile "$EAS_PROFILE" --local

echo
echo "Build finalizado."
echo "Confira o caminho do artefato no resumo do EAS CLI."
