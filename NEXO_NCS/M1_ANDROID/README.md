# Nexo M1 Android — Stage 1 shell

This is an isolated Android project subtree. It does not import the existing Node.js/Lúmina simulation runtime.

## Current stage

- Minimal single-screen UI only.
- No Android `INTERNET` permission.
- No third-party runtime dependencies.
- No model, local inference, durable conversation history, tool/effect route, Vault, remote fallback, or Genesis/authority path.
- Pressing the button deliberately returns an explicit unavailable state. It does not fabricate an answer.

## Build

The pinned CI workflow builds this project with Gradle 8.13, Android Gradle Plugin 8.13.2, Kotlin 2.3.0, compile/target SDK 36, min SDK 33 and Java 21 on GitHub Actions. The environment used for the initial repository inspection does not have the Android SDK/NDK, Gradle, or adb installed, so local APK/device claims are not available yet.

## Important

This is not a working local LLM yet. The next stage must pin and review an upstream `llama.cpp` commit, its native build inputs, dependencies and licenses before integration. Model selection/provisioning is a separate later gate. Never add a network fallback.
