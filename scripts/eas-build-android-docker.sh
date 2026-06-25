#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCKER_DIR="$ROOT_DIR/docker/eas-android-build"
IMAGE_TAG="${DEVHORA_ANDROID_DOCKER_IMAGE:-devhora/android-build:node22-android34-ndk26.1}"
MOBILE_DIR="$ROOT_DIR/apps/mobile"
ANDROID_DIR="$MOBILE_DIR/android"

ARTIFACT="${1:-aab}"
if [[ $# -gt 0 ]]; then
  shift
fi

case "$ARTIFACT" in
  apk)
    GRADLE_TASK="assembleRelease"
    OUTPUT_RELATIVE="app/build/outputs/apk/release/app-release.apk"
    OUTPUT_NAME="devhora-release.apk"
    ;;
  aab)
    GRADLE_TASK="bundleRelease"
    OUTPUT_RELATIVE="app/build/outputs/bundle/release/app-release.aab"
    OUTPUT_NAME="devhora-release.aab"
    ;;
  *)
    echo "Uso: ./scripts/eas-build-android-docker.sh [apk|aab] [argumentos extras do gradle]"
    exit 1
    ;;
esac

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker nao encontrado no PATH."
  exit 1
fi

ARTIFACTS_RELATIVE="artifacts/android/docker-local/${ARTIFACT}"
ARTIFACTS_DIR="$ROOT_DIR/$ARTIFACTS_RELATIVE"
OUTPUT_PATH="$ANDROID_DIR/$OUTPUT_RELATIVE"

mkdir -p "$ARTIFACTS_DIR"

if [[ "${DEVHORA_ANDROID_DOCKER_REBUILD:-0}" == "1" || "${DEVHORA_EAS_DOCKER_REBUILD:-0}" == "1" ]] || ! docker image inspect "$IMAGE_TAG" >/dev/null 2>&1; then
  echo "Construindo imagem Docker do Android..."
  docker build \
    --build-arg "HOST_UID=$(id -u)" \
    --build-arg "HOST_GID=$(id -g)" \
    -t "$IMAGE_TAG" \
    "$DOCKER_DIR"
fi

DOCKER_TTY=()
if [[ -t 0 && -t 1 ]]; then
  DOCKER_TTY=(-it)
fi

DOCKER_ARGS=(
  run
  --rm
  "${DOCKER_TTY[@]}"
  -v "$ROOT_DIR:/workspace"
  -v devhora-android-gradle:/home/node/.gradle
  -w /workspace/apps/mobile/android
  -e "HOME=/home/node"
  -e "GRADLE_USER_HOME=/home/node/.gradle"
  -e "DEVHORA_ANDROID_ARTIFACTS_DIR=/workspace/${ARTIFACTS_RELATIVE}"
)

if [[ -n "${JAVA_TOOL_OPTIONS:-}" ]]; then
  DOCKER_ARGS+=(-e "JAVA_TOOL_OPTIONS=${JAVA_TOOL_OPTIONS}")
fi

echo "Rodando build Android com Gradle local dentro do Docker..."
echo "Tarefa Gradle: $GRADLE_TASK"
echo "Artefatos: $ARTIFACTS_DIR"

docker "${DOCKER_ARGS[@]}" \
  "$IMAGE_TAG" \
  ./gradlew "$GRADLE_TASK" "$@"

if [[ ! -f "$OUTPUT_PATH" ]]; then
  echo "Build terminou, mas o artefato esperado nao foi encontrado em:"
  echo "$OUTPUT_PATH"
  exit 1
fi

cp "$OUTPUT_PATH" "$ARTIFACTS_DIR/$OUTPUT_NAME"

echo
echo "Build finalizado."
echo "Artefato Gradle: $OUTPUT_PATH"
echo "Artefato copiado: $ARTIFACTS_DIR/$OUTPUT_NAME"
