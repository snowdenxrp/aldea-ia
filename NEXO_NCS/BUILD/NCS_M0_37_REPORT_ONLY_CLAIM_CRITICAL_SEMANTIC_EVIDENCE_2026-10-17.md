# NCS M0.37 — Report only claim-critical semantic evidence

Date: 2026-10-17
Branch: `ncs-clean-architecture`

## Finding

After M0.36 scoped decision-making to claim-critical requirements, the PASS result still constructed its `evidence` field from every item in `context.requirements`. Thus unrelated requirements could appear in the proof/evidence attached to a successful claim, despite not being part of the decision. This is an evidence-provenance mismatch.

## Change

The PASS evidence list now derives from the claim's required IDs, preserving their first-seen order and deduplicating IDs. Unrelated context requirements are excluded. Regression coverage asserts that a passing claim with an unrelated FAILED requirement reports only `dep-a` and `pred-a`.

## Commits and CI

- Source commit: `fc552cb6d520f75781df042047daa119991c6fa6`
- Test commit: `15e9ad14f284af88c161a92410a4cc9d9e9bc8b1`
- STEP 4 run: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993158799
- STEP 5 run: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993158792

Both listed CI runs on the test commit completed successfully. M0.37 has focused STEP 4/STEP 5 CI verification.

## Limits

This corrects the semantic evidence payload only. It does not authenticate sources, establish constitutional authority, prove production runtime reachability or protected-sink closure. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP. No full-repository or device test is claimed.
