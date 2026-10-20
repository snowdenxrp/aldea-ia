# NCS M0 — enforcement boundary of CI evidence (2026-10-20)

Branch: `ncs-clean-architecture`
Observed branch head during review: `a2e141c522b09bd8ac6d3904a50224e943783d59`.

## Evidence observed

- GitHub branch metadata for `ncs-clean-architecture` returned `protected: false`, and the embedded protection summary reported `enabled: false`, with required status checks enforcement `off` and no configured contexts.
- The dedicated branch-protection endpoint could not be inspected by the connected integration (HTTP 403). Therefore this note relies only on the branch metadata response and does not claim to know hidden organization-level rules.
- On the exact observed head SHA, [deterministic persistence run 39443704746](https://github.com/snowdenxrp/aldea-ia/actions/runs/39443704746) completed `success`.
- The preceding test-bearing SHA `72cc1b1d55f72d29ee8b9f17b0ada76ac41c6d24` had four relevant workflows complete successfully: runs `39443509056`, `39443509170`, `39443509438`, and `39443509057`.

## Interpretation

CI success is evidence that the executed workflow passed on its exact SHA. It is **not** evidence that GitHub blocks merging or direct pushes when checks fail. Current branch metadata indicates that required status checks are not enforced for this branch.

This is a repository governance/enforcement gap, not a demonstrated runtime vulnerability. No branch settings were changed; this integration does not have confirmed permission to change repository administration settings. Do not claim that branch protection was enabled.

## Bounded recommendation

When the repository owner is ready to change repository governance, configure required status checks for the relevant M0 workflows and verify the resulting branch-protection/ruleset configuration with sufficient permissions. Until then, continue recording exact SHA + workflow run IDs and treat CI as evidence, not as an enforced merge gate.

## M0 state unchanged

M0 remains `INCOMPLETO`; `authorization: NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`. This finding does not resolve constitutional review or authorize protected execution.
