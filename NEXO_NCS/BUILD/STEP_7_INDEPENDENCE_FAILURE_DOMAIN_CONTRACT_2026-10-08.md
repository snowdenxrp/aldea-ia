# STEP 7 — Independence / Failure-Domain Contract — 2026-10-08

Status: DESIGN CANDIDATE — BROAD ATTACK REQUIRED

## Research convergence
NIST roots-of-trust guidance treats a root as an implicitly trusted starting point and requires protection against lower-trust software; RFC 9334 separates Endorser, Attester, Verifier, appraisal policy, reference values and relying party rather than collapsing them into one trust source. This supports Nexo's existing separation: evidence/attestation can inform trust without becoming authority by itself. citeturn0search36turn0search4

## Core semantic definition
For a specific bootstrap claim C, two supports A and B are independent only if compromise/failure of the material dependencies shared by A and B cannot invalidate both supports for C under the declared threat model.

Independence is therefore not a property of labels, process count, keys, providers, devices, or network paths. It is a claim-scoped property of dependency and failure domains.

## Minimum dependency dimensions
For each support, the protected composition boundary must be able to reason about material dependencies across at least:
- trust/root basis
- authority/endorser
- verification/appraisal policy
- reference values or equivalent acceptance basis
- key material / credential custody where material
- software/firmware/platform dependencies where material
- recovery authority/path
- organization/provider/control-plane dependencies where material
- physical/device/failure domain where material
- temporal/currentness dependencies.

These are semantic categories, not a mandate to implement every field immediately.

## Independence result
For the claim-specific composition:
- `INDEPENDENT`: required material shared dependencies are absent or governed as non-common under the threat model.
- `DEPENDENT`: a material common dependency can invalidate both supports.
- `UNKNOWN`: dependency closure or failure-domain knowledge is incomplete.

Never convert UNKNOWN to INDEPENDENT merely because sources differ syntactically.

## Scope rule
Independence established for claim C does not imply independence for claim D. A support set may be sufficient for firmware integrity while insufficient for constitutional authority.

## Composition consequence
A threshold/AND composition may consume `INDEPENDENT` supports only where its governing rule requires them. A `DEPENDENT` or `UNKNOWN` support cannot silently count as an independent vote.

## Common-mode rule
Separate processes, vendors, credentials or networks do not establish independence if they share a material root, authority, policy, recovery path, organization/control plane, firmware/platform dependency, or other common failure domain relevant to C.

## Recovery and succession
Recovery dependencies are part of independence when the claim includes survivability/recovery. A new root cannot be considered independent merely because it was generated after an epoch change. Succession requires a governed transition relation.

## Future-countereffect constraints
- Do not create a universal graph engine merely to model theoretical dependencies.
- Do not equate organizational separation with technical independence without evidence.
- Do not equate technical separation with authority independence.
- Do not hard-code one threat model as eternal.
- Do not let the composition engine certify its own independence.
- Do not use availability, latency, confidence, timestamps, scores, or provider diversity as independence substitutes.
- Do not silently weaken the independence rule to make bootstrap available.

## Architectural boundary
The independence contract evaluates whether bootstrap support relationships satisfy a claim-specific independence requirement. It does not establish trust by itself, issue authority, select Policy, authorize actions, execute, commit, or recover external effects.