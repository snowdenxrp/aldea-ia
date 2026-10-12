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

## External standards cross-check — Genesis is a trust decision, not a primitive (2026-10-12)

Reviewed against primary-source specifications and platform documentation:

- **IETF RATS, RFC 9334:** the Verifier consumes Evidence, Reference Values, Endorsements, and an appraisal policy to produce Attestation Results. A separate Relying Party consumes those results under its own appraisal policy for application-specific decisions. Therefore a verifier's result is not itself constitutional authorization; trust in the verifier and its policy remains a prerequisite. Source: https://www.rfc-editor.org/rfc/rfc9334.html
- **The Update Framework (TUF):** Root metadata delegates trust to named roles and thresholds. Root rotation is validated through continuity from an already trusted root, with old/new threshold signatures and rollback checks. This gives a strong pattern for later updates but does not identify who legitimately selected the initial trusted root. Sources: https://theupdateframework.github.io/specification/v1.0.36/ and https://theupdateframework.github.io/specification/draft/
- **Android Verified Boot (AVB):** Android verifies boot-critical partitions through a chain rooted in a platform key and supports rollback protection. Its claims concern the platform code/data covered by that chain. They do not automatically cover Nexo Constitution approval, Nexo verifier provenance, or Core's protected activation/effect path. User-settable roots are an optional platform feature with their own requirements; do not assume the current phone supports or exposes an appropriate authenticated signal to Nexo. Sources: https://source.android.com/docs/security/features/verifiedboot/verified-boot and https://source.android.com/docs/security/features/verifiedboot/device-state
- **NIST SP 800-193:** platform resiliency separates protection against unauthorized change, detection of changes, and secure recovery. These are distinct security functions; recovery ability must not be interpreted as constitutional succession authority. Source: https://csrc.nist.gov/pubs/sp/800/193/final

### Cross-source conclusion

These sources strengthen the role-separation model but do not remove the initial-recognition problem. Cryptography can authenticate data relative to a key; attestation can support a scoped integrity claim; update frameworks can preserve trust continuity from a previously trusted root. None can derive the legitimacy of the first root solely from a bundle whose legitimacy depends on that same root.

For STEP 7, do not conflate four separate propositions:
1. Kevin recognized and approved the exact Constitution bytes/rendering and commissioning scope.
2. The verifier, appraisal policy, reference values and provenance are independently trustworthy for the claim.
3. A named Core-owned state and governed transition establish which Constitution is canonically current.
4. Every protected decision/effect that relies on this state is mediated by a demonstrated final boundary.

A human comparison can support proposition 1 only under its explicitly accepted recognition assumption. Platform attestation may support a platform-integrity subclaim only if an authenticated, independently appraised signal is actually integrated. Neither substitutes for propositions 2–4.

### Implementation gate clarified

Before implementation, two independent choices/evidence packages must exist:
- **Recognition input:** a concrete, owner-recognized reference/channel for one exact Constitution revision and scope, with substitution and replay behavior defined.
- **Target boundary:** a named deployment whose canonical active-Constitution state owner, verifier composition, create/replace/restore/consume paths, and final protected activation boundary can be traced and attacked.

If either is absent, the correct engineering result is STOP/UNKNOWN, not a generic trust registry, a simulated “production” boundary, a self-generated root, or an M1-only proof. This is a bounded prerequisite, not a claim that the whole STEP 7 program is solved or permanently blocked.

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


### Additional primary-source cross-check — Android key attestation, Play Integrity, and SLSA (2026-10-12)

This bounded follow-up asks whether existing Android attestation and software-supply-chain provenance mechanisms could fill STEP 7's initial trust or final-enforcement gap.

- **Android Key Attestation:** the Android security documentation says a relying verifier must validate the attestation certificate chain and inspect the security level; hardware-backed claims depend on actual device support and a trusted attestation chain. This can support a narrowly scoped claim about a key's hardware/security properties when properly verified. It does not prove that Kevin approved a Constitution, that a Nexo verifier/policy is legitimate, or that every protected Core path is mediated. Device capability must be established, not assumed. Source: https://source.android.com/docs/security/features/keystore/attestation
- **Play Integrity API:** Google's documented scope concerns whether important actions come from an unmodified app binary installed by Google Play and running on a genuine Android device, with a backend deciding what to do. It is a platform/app integrity signal, not a constitutional owner-approval mechanism; using it would also introduce Google Play/service availability and policy dependencies into the threat model. Source: https://developer.android.com/google/play/integrity
- **SLSA provenance:** build provenance can bind an artifact to claimed build inputs and builder identity, but verification depends on preconfigured trusted builder identities/root-of-trust expectations and trust in the builder's provenance. It is useful for source-to-artifact correspondence (for example, future APK evidence), not for selecting Nexo's first constitutional trust root or proving that an installed artifact is the intended production activation boundary. Sources: https://slsa.dev/spec/v1.2/provenance and https://slsa.dev/spec/v1.0-rc1/verifying-artifacts

**Result:** these mechanisms may contribute evidence to separate claims if a real target deployment later consumes and verifies them. None independently closes the current STEP 7 Genesis bootstrap, owner-recognition, canonical active-Constitution ownership, or final anti-bypass boundary. Do not add them as mandatory dependencies, assume this phone supports hardware-backed attestation, or treat an APK build attestation as commissioning evidence before a concrete need and target are established.

This is a research addition only. No device, key, Constitution, APK, policy, or runtime behavior was changed.
