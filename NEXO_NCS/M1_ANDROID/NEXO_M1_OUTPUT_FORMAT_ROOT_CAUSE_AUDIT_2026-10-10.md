# Nexo M1 — output-format root-cause audit
Date: 2026-10-10
Scope: read-only source audit of safetest16 output behavior.
Branch: `ncs-safe-install-test`
Pinned llama.cpp source: `10a60cf303566e10d6a7a2774c17d2085503d87b`
Model declared by M1: `Qwen3-0.6B-Q4_0.gguf`
Expected SHA-256 declared by M1: `da2572f16c06133561ce56accaa822216f2391ef4d37fba427801cd6736417d4`

## Device evidence supplied by user

- The model UI said “Modelo verificado y cargado”.
- With airplane mode enabled and Wi-Fi disabled, the app generated a coherent response to `17 × 23` and arrived at `391`.
- Several prompts caused visible `<think>…</think>` content.
- The strict prompt asking for only `VERDE` returned a thinking block and, in the supplied extraction, no final `VERDE`.

Classification: observed behavior reported from the device; the supplied transcript is not a native log or a token-level runtime trace. Offline generation is practical evidence of local generation in that test, not a complete security audit.

## Source findings

### F1 — UI forwards the native text stream without a presentation boundary (confirmed)

File: `app/src/main/kotlin/org/nexo/m1/MainActivity.kt`, `sendPrompt()` around lines 357–361:

```kotlin
activeEngine.sendUserPrompt(userText, MAX_GENERATED_TOKENS).collect { token ->
    output.append(token)
}
```

Every non-empty text fragment emitted by the inference wrapper is appended directly to the visible output. The UI does not distinguish a reasoning segment from final answer content. This explains why visible `<think>` text is not removed or separated at the presentation layer; it does not, by itself, prove whether the model or the template caused it to be generated.

### F2 — M1 system prompt does not configure non-thinking mode (confirmed)

The `SYSTEM_PROMPT` asks for Spanish, clarity and brevity, but contains no explicit policy for suppressing reasoning-format output. A natural-language instruction alone is not a reliable control over model-specific chat-template behavior.

### F3 — pinned upstream wrapper uses the legacy chat-template path (confirmed)

In the pinned upstream `examples/llama.android/lib/src/main/cpp/ai_chat.cpp`, `chat_add_and_format()` calls:

```cpp
common_chat_format_single(
    g_chat_templates.get(), chat_msgs, new_msg,
    role == ROLE_USER, /* use_jinja */ false);
```

In the same pinned upstream revision, `common_chat_templates_apply()` dispatches `use_jinja == false` to `common_chat_templates_apply_legacy()`. The wrapper does not pass an explicit `enable_thinking=false` setting for Qwen3. This is a strong configuration-level candidate for why the model defaults to thinking output, but it still needs a controlled validation against this exact GGUF/template before being treated as the sole root cause.

### F4 — native token generation does not parse or separate reasoning segments (confirmed)

In pinned upstream `ai_chat.cpp`, `generateNextToken()` converts sampled tokens to text and returns them through JNI until the model emits an EOG token or the generation position is reached. It does not separate `<think>` and `</think>` from final answer content. Kotlin's `InferenceEngineImpl.sendUserPrompt()` emits those returned fragments as a `Flow<String>`. The M1 UI then appends them verbatim (F1).

Therefore the observed output is consistent with a combined prompt/template + raw-stream contract issue, not merely a cosmetic label issue.

### F5 — generation-limit accounting appears inconsistent (confirmed source arithmetic; separate defect)

In pinned upstream `ai_chat.cpp`, `processUserPrompt()` first executes `current_position += user_prompt_size`, then sets:

```cpp
stop_generation_position = current_position + user_prompt_size + n_predict;
```

Because `current_position` already includes the user prompt, this adds `user_prompt_size` a second time. The nominal prediction limit can therefore be exceeded by approximately the prompt token count. This does not explain why `<think>` appears and is not evidence that the `VERDE` answer was cut off; it is a separate bounded-generation contract defect that should be corrected and tested when source changes are authorized.

## Root-cause assessment

- **Confirmed:** M1 visibly streams raw generated text without a reasoning/final-answer boundary.
- **Strong candidate, not yet runtime-proven:** the pinned wrapper's legacy chat-template path and lack of explicit Qwen3 non-thinking configuration allow default thinking-format output.
- **Confirmed separate defect:** native generation stop-position arithmetic double-counts the user-prompt length.
- **Not established:** that one defect alone explains the missing final `VERDE`; the supplied image extraction is not a full native token trace.
- **Not established:** a complete local-runtime/security guarantee from the offline test alone.

## Corrective design requirements — no code changed in this audit

1. Inspect and pin the exact GGUF chat-template metadata used by the declared Qwen3 model.
2. Use the model-supported template mechanism and explicitly configure non-thinking mode if the template supports it; do not rely only on natural-language instructions.
3. Define the output contract at the inference boundary: distinguish model control/reasoning segments from user-visible final content using template/token semantics, not a blanket string replacement that merely hides `<think>`.
4. Correct the generation-position arithmetic so `n_predict` means the actual maximum number of generated tokens, and add a deterministic test for this invariant.
5. Add regression cases: exact-output prompt `VERDE`, arithmetic `17 × 23`, a short Spanish explanation, EOG completion, and a generation-limit boundary.
6. Keep local-only behavior: no network permission, no remote fallback, no prompt/model content logging.
7. Do not produce another APK until the root-cause patch and source-level regression checks are reviewed. The user's currently installed safetest16 remains the reference runtime for these observations.

## Change/evidence status

- This document records a read-only audit.
- No Kotlin/C++ runtime source was changed.
- No new APK was built.
- No claim is made that the output defect is fixed.
