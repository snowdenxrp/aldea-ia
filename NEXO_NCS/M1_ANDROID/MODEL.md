# M1 model provisioning — Qwen3-0.6B Q4_0

The prototype accepts only the exact model bytes below. It does not download the model.

- Repository: `ggml-org/Qwen3-0.6B-GGUF`
- Revision: `a41486f827d17edd055fe6b3b0ba3f8d427c0519`
- File: `Qwen3-0.6B-Q4_0.gguf`
- Size reported by the repository: 429 MB
- License: Apache-2.0
- SHA-256: `da2572f16c06133561ce56accaa822216f2391ef4d37fba427801cd6736417d4`
- Pinned source: https://huggingface.co/ggml-org/Qwen3-0.6B-GGUF/resolve/a41486f827d17edd055fe6b3b0ba3f8d427c0519/Qwen3-0.6B-Q4_0.gguf

The app imports a user-selected local file, streams its SHA-256, and compares the digest before passing the file to the GGUF parser. Mismatch or copy/load failure means unavailable. The model remains in app-private storage; prompts and responses are not written to disk.

A matching digest establishes byte equality against the published expected digest. It does not prove that the model is safe, truthful, or authoritative. The model is a small initial inference test, not Nexo's final intelligence.
