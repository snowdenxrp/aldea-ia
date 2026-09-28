# NEXO GLOBAL AUDIT — GLOBAL-AUDIT-005 — AB1–AB49 CHRONOLOGY RECOVERY — 2026-09-27

Status: AUDIT ONLY. No implementation, no V21, no semantic freeze.

## Method

This pass used Git commit ancestry rather than relying only on current filenames. GitHub's commit API exposes commit parents and changed files, so ancestry can be used to distinguish an absent filename from an absent historical commit. citeturn0search0

## Key correction

The Phase-1 filename inventory reported AB1–AB6 as absent. The current tree still has no files named AB1–AB6, but ancestry shows a substantial pre-AB7 research chain.

Therefore:
- AB1–AB6 filename recovery = NOT ESTABLISHED.
- Historical pre-AB7 research = DEFINITELY EXISTS.
- It is NOT safe to assign those earlier artifacts to AB1–AB6 without an explicit mapping.

## Recovered pre-AB7 ancestry

The parent chain immediately preceding AB7 includes these real commits/artifacts:

d9cdeb933541afd87f72dcd181b57c4c5aea338c
  AB7 — NEXO_AB7_ADVERSARIAL_SEMANTICS_CLOSURE_PREORDERS_COUNTERMODELS...

parent:
44a5ff4a11334eed4ddb909c86cec46e8541ea05
  NEXO_HISTORY_TRANSITIONS_DEPENDENCY_CLOSURE_ORDER_DISCIPLINE_RESEARCH_V1

parent:
df253f1aaff837580a34af72aeb0ac242df42401
  NEXO_CONCRETE_HISTORY_COMMON_MODE_THREE_ORDERS_COUNTERMODELS_RESEARCH_V1

parent:
9d260a3a097c44ad411f5855ce33d8bdddf15057
  NEXO_JOINT_REALIZABILITY_COMMON_MODE_DACP_RESEARCH_V1

parent:
69117612c41a0966602d0ac05d035d6d3dc52233
  NEXO_AUTHORITY_LOSS_RELATIONAL_COMPOSITION_ADVERSARIAL_RESEARCH_V1

parent:
6afc83a053a800e32d634ca45192b55e84cb19fe
  NEXO_ABSTRACTION_RELATION_AUTHORITY_LOSS_COMPOSITION_RESEARCH_V1

parent:
fc38f887632bf2ccbe44804401c37b194260f331
  NEXO_CONCRETE_ABSTRACT_HYPERGRAPH_CLAIM_DIRECTION_RESEARCH_V1

parent:
feaf42091e182ed2ea96042b2dca9e1ded355f65
  NEXO_RESEARCH_CONTINUITY_AUDIT_ABSTRACTION_FRONTIER_V1

parent:
61e052b3119c2ba43a271d024249bfe53ff41391
  NEXO_ABSTRACTION_SOUNDNESS_OVERAPPROXIMATION_CLAIM_DIRECTION_RESEARCH_V1

parent:
d875b4346c51f47b0f1925fe40c7f5bd30e2a4d5
  NEXO_CLAIM_PRESERVING_HYPERGRAPH_ABSTRACTION_REFINEMENT_SOUNDNESS_RESEARCH_V1

parent:
96ae3af5216113f5bf3839796b1d0aa85650259e
  NEXO_HYPERGRAPH_PROJECTION_SOUNDNESS_REFINEMENT_RESEARCH_V1

parent:
09d2ea8c039a8e923fbece55e72ad6ff362cb0cb
  NEXO_CLOSURE_HYPERGRAPH_TYPED_COMPOSITION_RESEARCH_V1

parent:
25fa8c306d53c8c3185c0d2ab5c2a30a8195fb4c
  NEXO_TYPED_CLOSURE_COMPOSITION_ORDER_REFINEMENT_RESEARCH_V1

parent:
2a60389883a5d45aeead6eda27b7af9636f2b031
  NEXO_RETENTION_FIXED_POINT_MONOTONICITY_CYCLES_NONCONVERGENCE_RESEARCH_V1

This proves the early research corpus is older than AB7, but it does not prove which numbered AB labels were assigned to each artifact.

## AB7–AB18 chronology

AB7 is directly followed by the numbered AB chain. Recovered commits include:

AB7 d9cdeb933541afd87f72dcd181b57c4c5aea338c
AB12 690159da590a6e5a6fabf853e06abe59091a2c28
AB13 0f919ff602b92cd03af33222bd1158f74feedc5f
AB14 7fab30d19060a8b8a11c9a4f1130464938584e19
AB15 fea6a96619b9f7b5352ad1c479a8c47944bd9703
AB16 bcb1e7a82030dfe3bc039a158eb18dd568dfe14a

Current tree also contains explicit AB8, AB9, AB10, AB17 and AB18 artifacts. Their historical commit SHAs still need exact ancestry mapping before the chronology table is declared complete.

Thus the prior "missing AB8–AB11" style filename gaps must be treated as inventory gaps, not historical nonexistence.

## AB19–AB49

Current tree contains explicit artifacts for AB19 through AB49, including the large AB36A–AB36Z research block.

The recovered sequence shows a clear semantic progression:
- state/history reduction;
- admission-binding quotient;
- transition matrices and reduced products;
- dependency/order closure;
- TLA/reduced-product drafts;
- protocol/history closure;
- future-observation and distinguishability attacks;
- joint bridge/binding collision analysis;
- protocol-specific/common projection analysis;
- support-language separator/joint closure.

However, chronology presence is not claim closure. In particular, the existence of TLA artifacts does not establish TLC execution or formal verification.

## AB1–AB6 status

AB1–AB6 remain:
- filename-level recovery: UNKNOWN;
- exact numbered assignment: UNKNOWN;
- pre-AB7 research lineage: CONFIRMED;
- claim-level conclusions: NOT PROMOTED from filename/chronology evidence.

No inferred renumbering will be performed.

## Audit interpretation

This pass materially changes the chronology map:

🟢 Historical pre-AB7 research exists.
🟢 AB7–AB49 corpus exists as named artifacts.
🔵 Exact mapping of every early pre-AB7 artifact to AB1–AB6 remains unresolved.
🟡 Claim-level semantic closure across AB1–AB49 is still pending.
⚫ AB1–AB6 exact artifact identities remain unreconstructed.

## Hard epistemic boundaries

- Research artifact existence != correctness.
- TLA source != TLC execution.
- Model construction != formal proof.
- Commit chronology != semantic validity.
- A missing filename != historical nonexistence.
- A parent chain != proof that two artifacts were intended as the same AB number.

## Exact next action

GLOBAL-AUDIT-006:
1. Recover exact AB8–AB11 commit ancestry.
2. Recover exact AB17–AB18 ancestry.
3. Continue exact AB19–AB49 ancestry where needed.
4. Build a claim/evidence matrix for AB1–AB49 only after chronology is sufficiently mapped.
5. Preserve unresolved AB1–AB6 assignment as UNKNOWN rather than guessing.

## DO-NOT-REPEAT

Do not relabel the pre-AB7 artifacts as AB1–AB6 without evidence.
Do not call the AB36 TLA artifacts formally verified merely because they exist.
Do not reopen AB50–AB103 chronology unless a conflicting parent/artifact is discovered.
