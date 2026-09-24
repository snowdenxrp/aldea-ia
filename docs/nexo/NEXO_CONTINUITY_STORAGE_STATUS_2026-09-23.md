# Nexo Continuity Storage Status — 2026-09-23

## Persistent memory

The ChatGPT persistent-memory write mechanism is unavailable/disabled in this session. Therefore no claim is made that architectural updates were written to persistent memory. Continuity is being preserved in the repository artifacts and the conversation context instead.

## GitHub

Architectural/formal milestones are being committed to the repository, with each material step recording artifacts, status, findings, limitations, and next work. This repository is the authoritative durable engineering ledger for the current Nexo architecture work.

## Verification discipline

Do not label a model SANY/TLC verified unless those tools have actually been executed successfully. Do not label a design implemented unless corresponding executable/runtime changes exist. Do not infer successful persistence from a failed or ambiguous GitHub operation.

## External research

TLA+ official documentation confirms SANY is a syntax/semantic analyzer and TLC is the executable-spec model checker; TLC checks configured models rather than automatically proving arbitrary implementation correctness. This reinforces the project's separation between design, model checking, and implementation verification.
