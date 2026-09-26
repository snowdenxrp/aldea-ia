# NEXO AB104.299 — Operation-contract versioning
Date: 2026-09-26
Status: RESEARCH-ONLY

## Findings
1. A contract revision must be immutable for the lifetime of an admitted operation. A later contract version must not silently reinterpret an existing operation_id.
2. RFC 9110 treats protocol/version semantics explicitly and distinguishes idempotent intended effect from retry mechanics; therefore contract version is part of the semantics governing whether a retry is equivalent. See cited source.
3. RFC 9880 models semantic definitions separately from concrete serializations, supporting separation between semantic contract and representation format.
4. Current IETF draft work on idempotency requires a reused key not be paired with a different payload and recommends fingerprint/normalized comparison; this is draft evidence, not a final standard.
5. A current IETF draft pattern captures the exact contract/recipe revision at synthesis time and keeps that revision stable rather than mutating an in-flight contract. Draft evidence only.

## Candidate Nexo rule
An admitted operation should bind an immutable operation_contract_id or contract digest plus contract_version/schema lineage. New contract versions create a new admissible contract lineage. Existing operations continue under their captured contract unless an explicit authenticated migration/revalidation transition proves semantic preservation.

## Version transition states
UNCHANGED = same contract semantics;
COMPATIBLE = explicitly proven to preserve all identity/effect semantics relevant to this operation;
MIGRATABLE = requires authenticated migration contract and new lineage;
BREAKING = old operation cannot silently inherit the new contract;
UNKNOWN = preservation cannot be established.

## Security consequence
A version number alone is not evidence of compatibility. The transition relation and evidence must be explicit. Never infer semantic preservation from a major/minor label, serialization compatibility, or successful parsing.

## Non-claims
No implementation or formal verification performed.

## Next exact step
AB104.300 — study authenticated contract-transition evidence: what must be bound/signed so a migration from contract Vn to Vn+1 cannot silently change operation meaning.
