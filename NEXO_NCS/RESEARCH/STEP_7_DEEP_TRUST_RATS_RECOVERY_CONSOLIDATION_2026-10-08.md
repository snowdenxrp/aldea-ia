# STEP 7 — Deep Trust / RATS / Recovery Research Consolidation — 2026-10-08

Status: RESEARCH CHECKPOINT — DO NOT IMPLEMENT ROOT YET

## Important correction to the previous step
The deeper research confirms that we should not invent a generic 'independence engine'. RATS itself models trust as a relationship established by a relying party using protected trust anchors, while Evidence, Endorsements, Verifier/Appraisal Policy and Attestation Results have distinct roles. A trust anchor constrains what an authoritative key is authoritative for; it is not an unlimited trust token. This matches Nexo's separation of evidence, policy, authority and execution.

## What the research adds
1. A root of trust is function-specific. NIST SP 800-193 distinguishes roots for update, detection and recovery; they may share components but are logical responsibilities, not automatically one universal root.
2. A composite system can have multiple attesting environments, but composite trust depends on appraisal of the relevant subcomponents. 'Multiple components' does not itself mean independent roots.
3. RATS explicitly treats trust-anchor storage/protection and appraisal policy as security-critical. Therefore the bootstrap problem is not solved merely by authenticating a signature; the trust-anchor configuration and policy basis themselves require protected establishment.
4. Freshness and replay are part of trustworthiness appraisal. Historical evidence, signatures, or valid old epochs cannot automatically become current authority.
5. RATS allows an Endorser to vouch for an Attester, but the Verifier's trust anchor is what lets the endorsement be authenticated. This is another instance of the bootstrap relation being external to the evidence being evaluated.
6. NIST's root separation suggests that Nexo should not force 'one root' semantics if the actual security functions naturally require separate roots for integrity/update, detection, recovery, and governance.

## New architectural conclusion
Before choosing a physical bootstrap mechanism, Nexo should define a **Trust Function / Root Role Map**, not a single universal root.

Minimum semantic roles to investigate:
- governance/constitutional trust root
- integrity/measurement root
- recovery/succession root
- identity/attestation root

These roles may share a physical mechanism only when the threat model explicitly permits it. Sharing is an implementation choice; semantic authority remains separated.

## Critical future-countereffect
If we create one universal 'GenesisRoot' now, we risk coupling Constitution, platform integrity, identity and recovery to one mechanism. That would make later compromise/recovery and platform migration much harder and could create an authority amplification bug.

Therefore the next research target is not 'which root wins?', but **which trust functions must be independent and which may safely share a root under explicit common-mode assumptions**.

## Frozen strict rules
- No implementation from this research checkpoint alone.
- No generic quorum engine.
- No `trusted=true`.
- No self-authenticating provenance.
- No root promotion from signatures/hashes/epochs alone.
- No recovery root hidden inside normal authority.
- No provider-selected root.
- No claim that current repository runtime supports any of this until an actual protected mechanism exists.
- UNKNOWN remains UNKNOWN.
