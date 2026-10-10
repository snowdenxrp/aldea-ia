#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LLAMA_CPP_SHA="10a60cf303566e10d6a7a2774c17d2085503d87b"
LLAMA_DIR="$ROOT/llama.cpp"

if [[ -d "$LLAMA_DIR/.git" ]]; then
  git -C "$LLAMA_DIR" fetch --depth 1 origin "$LLAMA_CPP_SHA"
else
  git clone --filter=blob:none --no-checkout https://github.com/ggml-org/llama.cpp.git "$LLAMA_DIR"
  git -C "$LLAMA_DIR" fetch --depth 1 origin "$LLAMA_CPP_SHA"
fi

git -C "$LLAMA_DIR" checkout --detach "$LLAMA_CPP_SHA"
ACTUAL_SHA="$(git -C "$LLAMA_DIR" rev-parse HEAD)"
if [[ "$ACTUAL_SHA" != "$LLAMA_CPP_SHA" ]]; then
  echo "FAIL: llama.cpp revision mismatch: $ACTUAL_SHA" >&2
  exit 1
fi

# Apply our reviewed build configuration to the pinned upstream Android binding.
# This is deterministic project configuration, not a floating-source patch.
cp "$ROOT/llama-lib.build.gradle.kts" "$LLAMA_DIR/examples/llama.android/lib/build.gradle.kts"

printf 'Pinned llama.cpp revision: %s\n' "$ACTUAL_SHA"
printf 'Native log floor: ANDROID_LOG_ERROR\n'
