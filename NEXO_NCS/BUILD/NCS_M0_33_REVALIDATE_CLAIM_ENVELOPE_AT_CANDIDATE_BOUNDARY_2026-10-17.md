# NCS M0.33 — Revalidate ClaimEnvelope at candidate boundary

Date: 2026-10-17
Branch: `ncs-clean-architecture`

## Finding

`createCandidate()` previously checked only that `claim.claimId` was a string before accepting the claim as a `ClaimEnvelope`. That allowed callers to bypass the stricter public `createClaimEnvelope()` constructor with look-alike objects, including blank claim IDs or malformed collection fields.

## Change

`createCandidate()` now rejects non-object/array claim inputs and rebuilds the claim through `createClaimEnvelope()` before returning the candidate. This reapplies the existing envelope contract at the candidate boundary and detaches the validated claim rather than retaining a caller-supplied look-alike object.

Regression coverage:
- blank `claimId` is rejected when passed directly to `createCandidate()`;
- malformed string-shaped `dependencies` is rejected;
- the candidate's validated claim is detached from the original claim object.

## Evidence

- Source commit: `e409a27fa43d8778ce12b2af7f5a488022d158e5`
- Test commit / CI head: `1155acd9c7ffa9b9fdb96a6ab32fa7a2adf6c8a7`
- M0 core contracts CI: [success](https://github.com/snowdenxrp/aldea-ia/actions/runs/38989354196)
- STEP 4 semantic validation CI: [success](https://github.com/snowdenxrp/aldea-ia/actions/runs/38989354182)
- STEP 5 outcome classification CI: [success](https://github.com/snowdenxrp/aldea-ia/actions/runs/38989354194)
- policyContext contract CI: [success](https://github.com/snowdenxrp/aldea-ia/actions/runs/38989354155)

These are focused GitHub Actions runs. No full-repository test run is claimed.

## Limits

This is structural contract validation, not proof that a claim's contents are truthful, that a source is authentic, or that `authoritative: true` represents legitimate constitutional authority. It does not prove production runtime reachability, protected-sink closure, or bypass prevention. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.

## Next

Continue M0 by selecting another concrete contract-level gap from current code/tests, without repeating M0.1–M0.33 or reopening the separate STEP 7 investigation.
