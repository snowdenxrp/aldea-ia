# NCS — M1 Initial Local Model Candidate Decision — 2026-10-09

Status: INITIAL PROTOTYPE MODEL SELECTED FOR INTEGRITY-GATED OFFLINE PROVISIONING; NOT DOWNLOADED OR DEVICE-TESTED.

## Selection

Use the official `ggml-org/Qwen3-0.6B-GGUF` repository's `Qwen3-0.6B-Q4_0.gguf` as the first minimal inference candidate.

- Repository: https://huggingface.co/ggml-org/Qwen3-0.6B-GGUF
- Immutable model repository revision: `a41486f827d17edd055fe6b3b0ba3f8d427c0519`
- File: `Qwen3-0.6B-Q4_0.gguf`
- Immutable file URL: https://huggingface.co/ggml-org/Qwen3-0.6B-GGUF/resolve/a41486f827d17edd055fe6b3b0ba3f8d427c0519/Qwen3-0.6B-Q4_0.gguf
- Reported size: 429 MB.
- Published license: Apache-2.0.
- Published SHA-256: `da2572f16c06133561ce56accaa822216f2391ef4d37fba427801cd6736417d4`.
- Evidence pages: https://huggingface.co/ggml-org/Qwen3-0.6B-GGUF/blob/a41486f827d17edd055fe6b3b0ba3f8d427c0519/Qwen3-0.6B-Q4_0.gguf and https://huggingface.co/ggml-org/Qwen3-0.6B-GGUF/blob/a41486f827d17edd055fe6b3b0ba3f8d427c0519/README.md

## Why this model

- Small enough for an initial local-inference proof of concept compared with 1.5 GB FP16/BF16 variants.
- Official ggml-org conversion/repository, a pinned revision, and a published SHA-256 allow a concrete byte-integrity check.
- Apache-2.0 license is clearly stated in the repository metadata.
- It is a small model and not intended to represent final Nexo intelligence, reasoning quality, identity, authority, or safety. Treat every answer as untrusted model output.

## Required handling

1. Do not download the model inside M1 or from its app process.
2. Kevin will eventually obtain the file separately from the pinned URL, then choose it through an explicit local file-import action.
3. Copy to app-private storage while streaming SHA-256; compare to the exact digest above before any GGUF parser/runtime load. Mismatch => delete the imported copy and remain unavailable.
4. Keep model file/hash and provenance metadata separate from prompts and responses. Model persistence is allowed; conversation persistence is not.
5. The expected hash is trusted only because it is separately documented from the pinned official repository page; the hash proves byte equality, not safety/quality or trustworthiness of the native parser.
6. Before requesting the 429 MB file on the phone, show storage requirements and confirm sufficient free space. The model is not embedded in APK/CI artifacts.
7. Device compatibility, actual memory/thermal performance, and model generation remain UNKNOWN until tested on the exact phone.

## M1 runtime boundary

- Initial system instruction will frame the model as a read-only M1 prototype with no tools, credentials, device-control capability, durable memory, or authority.
- No remote fallback, retrieval, analytics, telemetry, prompt logging, clipboard sharing or external effects.
- Limit generation to a bounded output length and use conservative context/resource settings where the upstream adapter supports them.
- If the model is absent, digest mismatches, load fails, memory is insufficient, or generation fails, show unavailable; never infer a remote or permissive fallback.

## Decision

- 🟢 Selected as the first bounded local-inference test model.
- 🔴 Not a final production model or trusted authority.
- 🔴 Not downloaded, loaded or device-tested yet.
- The choice does not authorize protected commissioning, Genesis-root selection, or any external effect.
