# NCS — M1 Pinned llama.cpp Android Binding Privacy Review — 2026-10-09

Status: SOURCE REVIEW COMPLETE FOR CANDIDATE ONLY. RUNTIME NOT INTEGRATED. NO MODEL OR DEVICE TEST.

## Candidate upstream revision

- Repository: https://github.com/ggml-org/llama.cpp
- Candidate commit: `10a60cf303566e10d6a7a2774c17d2085503d87b`
- Android example: `examples/llama.android`
- Official Android build notes: https://github.com/ggml-org/llama.cpp/blob/10a60cf303566e10d6a7a2774c17d2085503d87b/docs/android.md
- Upstream Android sample toolchain at that revision: Gradle 8.14.3, AGP 8.13.2, Kotlin 2.3.0, compile/target SDK 36, min SDK 33, NDK 29.0.13113456, CMake 3.31.6.
- Candidate is pinned here for review only; it has not yet been integrated into NCS or built as part of M1.

## Privacy-relevant source finding

The upstream Android wrapper has prompt-bearing native log statements:
- `ai_chat.cpp` logs a formatted chat message at INFO in `chat_add_and_format` (around upstream line 296).
- It also has DEBUG/VERBOSE logs for system/user prompt input and token pieces.
- The Kotlin wrapper logs model paths and state/errors.

Do not assume these logs are harmless because the default example config uses a Release native build. Debug/log configuration changes can re-enable lower levels, and the INFO log includes formatted message content. A local model alone does not imply prompt confidentiality.

## Required integration constraints

1. Build native inference in Release mode and explicitly compile the Android binding with `LOG_MIN_LEVEL=ANDROID_LOG_ERROR`, not merely rely on `NDEBUG` defaults.
2. Audit all remaining ERROR-level strings and upstream GGML/llama log callback paths; no prompt, response, token, system prompt, or secret may be logged at any level.
3. Add a static CI guard that searches the pinned wrapper and the resulting source patch/overlay for prompt-bearing log calls. Runtime unique-marker/logcat inspection is still required on a real device before making a no-prompt-logging claim.
4. Keep prompt/response data in process memory only. No analytics, crash upload, remote fallback, retrieval, external intents, clipboard sharing, or tools.
5. Inspect and explicitly select transitive dependencies. The upstream sample includes DataStore preferences and backup-enabled app settings; M1 must not copy those settings or dependency bundle blindly.
6. Pin the upstream SHA and every Android build input. Never clone floating `master` in a production build.
7. Treat model file parser/runtime attack surface separately from prompt privacy. A malformed or hostile GGUF model must not be accepted as trusted merely because it is local.

## Decision

- 🔵 Keep this upstream Android binding as the first native integration candidate because it provides a maintained Android/JNI bridge and chat-template support.
- 🔴 Not acceptable unchanged for M1 until prompt-bearing log levels are disabled and statically/runtime checked.
- The required log-level override is an explicit, testable build contract, not a claim that the upstream sample is private by default.
- No upstream code has been copied into the repository, no model selected/downloaded, and no device/runtime test performed.
- Next: integrate the pinned native module in a separate M1 subtree, exclude unused sample dependencies, enforce the log-level contract in build configuration and CI, and make all model failure paths return unavailable. Then choose a model only after device/resource/license/provenance review.
