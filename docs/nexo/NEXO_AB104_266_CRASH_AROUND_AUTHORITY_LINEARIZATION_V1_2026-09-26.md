# NEXO AB104.266 — Crash around authority/effect linearization — 2026-09-26

Research-only.

Evidence:
- Raft requires persistent current term/log state and rejects stale-term requests; its linearizable read path must establish current leadership/commit knowledge rather than trust stale local state.
- etcd transactions atomically evaluate guards and apply the selected branch; KV operations are linearizable by default, while watches are not themselves linearizable.

Finding:
- The critical crash cases are not resolved by knowing whether the coordinator persisted F8 first or F7 first. The decisive question is whether the target-side acceptance/effect boundary has a durable ordering relation with the authority transition.
- Case A: target atomically accepts F7 before F8's effective linearization point; effect belongs to F7 and must remain historically committed even if coordinator crashes.
- Case B: F8 is already effective at target boundary; F7 must be rejected/fenced.
- Case C: target accepted/mutated but crash prevents receipt/registry observation; outcome remains UNKNOWN unless authoritative target evidence reconstructs the commit.
- Case D: coordinator persisted F8 but target had already accepted F7 under its valid boundary; F8 does not retroactively erase the historical F7 effect. Current authority and historical effect are separate.
- Case E: target and coordinator have no common protected ordering boundary; after crash the relative order is unknowable, so recovery must not invent it. Preserve UNKNOWN/CONFLICT and reconcile.

Candidate invariant:
No external effect is considered authorized merely because local authority state says F7/F8; acceptance must be fenced at the effect boundary using authenticated authority generation + target incarnation + operation identity/fingerprint, with a durable linearization/receipt path or equivalent evidence.

Prototype status: no demonstrated target-side authority fence or common linearization point. Research only; no architecture selection or implementation.

AB50–AB58 residuals unchanged. Next: AB104.267 — whether authority transition and target effect must share one atomic domain vs a two-phase protocol with UNKNOWN.