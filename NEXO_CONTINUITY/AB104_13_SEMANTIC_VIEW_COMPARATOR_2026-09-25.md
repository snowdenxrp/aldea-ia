# AB104.13 — semantic-view comparator — 2026-09-25

## Change
Extended the AB104.11 research harness with `semantic_view_compare()` and two bounded adversarial constructors.

## Comparator contract
- TRUE only when all 13 bridge dimensions are present, resolved, and equal, and the selected admission link has equal attempt identity and used context.
- FALSE only when a known compared component differs.
- UNKNOWN when required bridge/admission information is missing or unresolved.

## Adversarial cases
- Omission of ReplayBinding: must not be accepted as equivalent; reconstruction is UNKNOWN.
- Altered admitted attempt A1 -> A9: comparator returns FALSE for the known admission-link difference.

## Interpretation
This strengthens representation-level testing but still does not establish future behavioral congruence. In particular, no LEASE_RENEW, LEASE_CONSUME, RETRY, or other unresolved protocol law is invented.

## Verification boundary
Source was written and read back through GitHub. Runtime execution is not claimed in this round because no executable repository runner has been established. Formal verification remains NOT_PERFORMED.
