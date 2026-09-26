# NEXO AB104.265 — Authority transition linearization point — 2026-09-26

Research-only.

Findings:
- Raft terms are logical clocks; stale-term requests are rejected. Different servers can observe term transitions at different times. This means a transition must have a protocol-defined boundary, not rely on local observation time.
- etcd transactions evaluate all comparisons atomically and apply success/failure operations as one transaction; revisions give the transaction a single logical ordering point. etcd describes completed operations as committed through consensus and notes that clients can remain uncertain after timeout/network disruption.
- Candidate Nexo requirement: authority transition and external-effect acceptance need a defined linearization relation. A worker using F7 may race with activation of F8. It is unsafe to decide from local clocks, message arrival, or a pre-read alone.
- Candidate outcomes: if target atomically observes F7 as current and accepts mutation before F8 linearizes, the effect belongs to the F7 side of the boundary; if F8 is already current at the target boundary, F7 must be rejected/fenced. If the ordering cannot be proven after crash, retain UNKNOWN rather than infer success/non-occurrence.
- Fence update alone is insufficient if target mutation occurs outside the same protected ordering domain. Resource CAS/version remains orthogonal.
- Current Nexo prototype does not demonstrate such a target-side linearization boundary. No implementation or architecture selection.

Status: RESEARCHED_NOT_FORMALLY_VERIFIED. AB50–AB58 residuals unchanged.