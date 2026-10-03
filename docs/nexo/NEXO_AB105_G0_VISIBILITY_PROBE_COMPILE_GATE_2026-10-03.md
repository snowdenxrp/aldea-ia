# NEXO AB105 G0 — visibility probe compile gate — 2026-10-03

- Branch: `nexo-ab105-g0-visibility-probe`
- AB105.116R: unchanged.
- AB105.117R: not created.
- TLC: not rerun.
- PR #94: unmerged.
- Kafka pin: `99b940733a9f6bc409457dba7108f08421d81e42`.

## Workflow validation finding

The original compile-only workflow repeatedly produced a GitHub Actions run with `conclusion=failure` and `jobs=[]`, before any runner job started. This was not treated as a compilation result.

A temporary minimal Actions smoke workflow was added only to distinguish infrastructure/trigger behavior. Run `37145984491` completed SUCCESS, proving the branch can execute Actions. The temporary smoke workflow was then deleted.

The compile workflow was simplified so the workflow YAML only orchestrates the runner. Probe injection was moved to:

`tools/nexo/ab105_visibility_probe_inject.py`

This made the compile job start normally.

## Compile result — VERIFIED

Run:
`37146088213`

Job:
`111270212910`

Head:
`7f2a0aed74b6ac0649e2f740a770b266afda60b3`

Kafka:
`99b940733a9f6bc409457dba7108f08421d81e42`

Observed steps:
- checkout: SUCCESS
- Java 21: SUCCESS
- pinned Kafka clone: SUCCESS
- isolated recorder/probe injection: SUCCESS
- `:metadata:compileJava`: SUCCESS
- `:core:compileScala`: SUCCESS
- Gradle: `BUILD SUCCESSFUL`
- artifact upload: SUCCESS

Artifact:
`nexo-ab105-g0-visibility-probe-compile`

Artifact ID:
`11282260527`

Digest:
`sha256:83ab75754a46642fcd28ccbc76864721935b291600259fe51164f632c2657527`

## Source correction discovered during compile gate

The first implementation assumed a different indentation/marker at the pinned `StandardAuthorizerData.findAclRule()` read site. The pinned source has:

`AclCache aclCacheSnapshot = aclCache;`

with the exact source indentation at that location. The injection script was corrected accordingly and the pinned source also required the `ResourceType` import.

The corrected injection then compiled successfully against the pinned Kafka source.

## Meaning

This closes **compile feasibility** for the current isolated visibility probe.

It does NOT establish:
- JMM happens-before between W1 and AUTH.
- stale-read behavior.
- incorrect authorization.
- exploitability.
- generalization.
- production impact.

No real-broker visibility experiment has been executed from this probe yet.

## Next gate

1. Preserve the successful compile artifact.
2. Audit the exact generated source diff again.
3. Add/verify the neutral control path before real execution.
4. Only then run the real-broker visibility witness.
5. Classify differing cache identities carefully: they show which cache object AUTH observed; they do not alone prove stale or incorrect authorization.

## DO-NOT-REPEAT

Do not rerun TLC.
Do not create AB105.117R while the semantic/reachability audit remains open.
Do not merge PR #94.
Do not treat the compile SUCCESS as runtime visibility evidence.
