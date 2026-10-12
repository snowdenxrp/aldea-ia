# Nexo M1 Android — local inference prototype

This is the isolated Android client under `NEXO_NCS/M1_ANDROID`. It does not import the existing Node.js/Lúmina simulation runtime and it is not Nexo's constitutional authority or protected-action engine.

## Current source behavior

- Single-screen, text-only conversation using the pinned native `llama.cpp` Android binding.
- App ID in this source: `org.nexo.m1`; version: `0.2.0-prototype`.
- The Android manifest does not declare `android.permission.INTERNET`; the CI workflow also checks the packaged APK permissions.
- The user manually selects `Qwen3-0.6B-Q4_0.gguf`. The app checks the exact filename, a size ceiling and the pinned SHA-256 before loading it into app-private storage.
- Prompt and response text are handled in memory; this client has no durable chat-history feature.
- No remote inference fallback, tool route, Vault, device-control route, Genesis enrollment, or constitutional authority path.
- The model's output is untrusted generated text, not verified facts and not authorization.

## Pinned build/model inputs

- Native `llama.cpp` revision: `10a60cf303566e10d6a7a2774c17d2085503d87b` (asserted by the build workflow).
- Android build: Gradle 8.14.3, Android Gradle Plugin 8.13.2, Kotlin 2.3.0, Java 21, SDK 36, minimum SDK 33.
- Model metadata and expected SHA-256: see [MODEL.md](MODEL.md).

## Evidence boundary

Source inspection is not proof that a particular APK was built, installed or executed on the Moto G52. A successful GitHub build would prove only the steps and artifacts recorded by that run; it would not prove that the installed app matches this source, that every Android/platform path is free of disclosure, or that Genesis/Core authority is established.

Before claiming device behavior, bind the exact workflow run to its commit, APK artifact and SHA-256, then compare that APK identity with the installed package/build on the phone. Keep those facts separate from the user's current installed M1, whose package identity has previously differed from this source.

Never add a network fallback to recover from a missing model or failed local inference.
