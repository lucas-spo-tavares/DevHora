#!/usr/bin/env bash

set -euo pipefail

mkdir -p \
  "${HOME}/.gradle" \
  "${DEVHORA_ANDROID_ARTIFACTS_DIR:-/workspace/artifacts/android/docker-local}"

exec "$@"
