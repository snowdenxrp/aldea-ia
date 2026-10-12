# M1 — native chat-context and generation-boundary regression plan

Status: required before considering the APK installable. Source/build checks are not device-runtime proof.

## Preconditions
- Use a build from the reviewed fix branch only after its build workflow passes.
- Keep the existing installed M1 apps untouched until a candidate passes these tests.
- Enable airplane mode and disable Wi-Fi for the runtime test.
- Start from a fresh app process and load the already-verified local GGUF. Do not re-import or re-download the model unless integrity verification fails.

## Cases

1. **Exact short answer**
   - Prompt: `Responde exactamente con la palabra VERDE. No agregues nada más.`
   - Expected: visible answer includes `VERDE`; no visible `<think>` or `</think>`; no repeated default phrase.
   - Record the full visible answer, not a partial screenshot crop.

2. **Single-turn arithmetic**
   - Prompt: `¿Cuánto es 17 × 23? Responde brevemente.`
   - Expected: answer gives `391`; no visible reasoning tags.

3. **Multi-turn context**
   - First prompt: `Recuerda solo durante esta conversación que la clave es AZUL-27.`
   - Follow-up: `¿Cuál era la clave que te acabo de dar? Responde solo la clave.`
   - Expected: answer includes `AZUL-27`. This is volatile in-process context only; it must not be described as persistent memory.

4. **Repeated-turn stability**
   - Send three distinct short prompts sequentially without restarting the app.
   - Expected: each response is relevant to its own prompt; no stale/repeated answer copied from the previous turn; no crash or empty response.

5. **Generation bound**
   - Use a prompt that requests a long enumerated answer.
   - Verify the native generated-token count does not exceed the requested `n_predict` limit of 256. Do not infer token count from characters or whitespace-separated words. If the build exposes no reliable count, mark this case PENDING and add bounded native test instrumentation before claiming it passed.

6. **Fail-closed template mismatch**
   - Source-level assertion must verify the previous rendered history is checked as an exact prefix before substring extraction.
   - A deliberate mismatch in a test-only harness must return an error rather than produce a suffix. Do not alter production model/template data to simulate this on the user's phone.

## Acceptance
- All source assertions and native compilation pass.
- Cases 1–4 pass on-device offline.
- Case 5 has an actual token-count measurement, not a textual estimate.
- Any failure remains UNKNOWN/PENDING until raw evidence is captured; do not call the issue fixed based only on a successful APK build.
