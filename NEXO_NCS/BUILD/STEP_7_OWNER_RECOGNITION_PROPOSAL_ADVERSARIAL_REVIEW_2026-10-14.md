# STEP 7 — Adversarial Review of the Concrete Owner-Recognition Proposal
Date: 2026-10-14
Branch: `ncs-clean-architecture`
Status: REVIEW / DESIGN DELTA ONLY / NO OWNER RATIFICATION / NO COMMISSIONING

## Why this review exists
Review `BUILD/STEP_7_CONCRETE_OWNER_RECOGNITION_PATH_PROPOSAL_2026-10-14.md` against its actual claim: whether the proposed owner ceremony breaks initial trust circularity, rather than merely documenting an assumption. This is a targeted adversarial review, not a repeat of the owner-credential comparison or the source inventory.

## Finding
The proposal is honest about its limitations, but **it does not yet break the bootstrap circularity**. It can describe a bounded human decision under an explicit honest-device assumption; it cannot independently establish that the device's displayed content, verifier, or approval transcript is the one the owner intended if the device/app/display path is actively compromised.

This is not a reason to invent another cryptographic object. It is a missing trust premise that must be either:
- bounded and explicitly accepted for a narrow initial recognition ceremony; or
- supported by a pre-existing independently recognized reference/verification path.

The owner has not selected either premise. Therefore no commissioning is permitted.

## Attack-oriented review

| Attack / failure | What the proposal currently provides | Result |
|---|---|---|
| Phone displays altered Constitution while computing a correct digest of different bytes | Honest-device assumption explicitly excludes this attack; local digest does not detect a dishonest display | NOT MITIGATED; only excluded by assumption |
| App substitutes a verifier or public key before first enrollment | Proposal says verifier provenance must be resolved before key creation/signing | Correctly blocked as an unresolved prerequisite |
| Same phone computes the digest twice | Can catch ordinary calculation/handling errors, not a compromised host or common-mode substitution | NOT INDEPENDENT EVIDENCE |
| Paper record copied from the same potentially deceptive screen | Preserves what the owner wrote, but does not independently prove the source was authentic | RECOVERY AID ONLY |
| Constitution bytes and readable rendering diverge | Deterministic binding is required, but no verified rendering mechanism exists yet | UNKNOWN |
| Old Constitution or approval is replayed after replacement/revocation | Future protocol calls for freshness/currentness checks, but no canonical current-state owner exists | UNKNOWN |
| Correct signature reaches a route that bypasses the protected transition | Proposal correctly requires sink/bypass tests; no real production sink or complete call graph is evidenced | UNKNOWN |
| All recognized credentials and independent references are lost | Proposal correctly refuses to claim cryptographic recovery from nothing | UNSOLVED BY DESIGN; needs prior governed recovery or remains unrecoverable |

## Standards cross-check and architectural implication
The Update Framework (TUF) is a useful analogy, not a drop-in solution. Its client begins with trusted root metadata provisioned through an out-of-band process; later root rotation is validated against the already trusted predecessor. This protects continuity after bootstrap, but does not create the first trust anchor. See the TUF specification: https://theupdateframework.github.io/specification/v1.0.36/ and its description of the initial trusted root: https://theupdateframework.readthedocs.io/en/latest/api/tuf.ngclient.updater.html.

Consequently, Nexo must not treat any of these as a self-originating trust anchor:
- a key generated during the ceremony;
- a digest or signature;
- a GitHub branch/commit or a CI result;
- Android key attestation;
- possession of the POCO or another phone;
- a paper note whose only source was the same unverified presentation path.

Any of these may provide supporting evidence after the bootstrap premise is stated. None decides that premise by itself.

## Refined trust contract — requirements, not a selected design
Before the first protected Constitution transition can be implemented, the design must name and evidence these separate things:

1. **Owner intent source:** the human act that expresses approval of one complete readable Constitution revision and a narrow scope.
2. **Presentation integrity premise:** what the owner assumes about the device/display/input path, or what independently checks that the presented text is the exact artifact being approved.
3. **Initial recognition reference:** what makes the first verifier/enrollment key or approval record recognizable before Nexo trusts it. Must not be authored solely by the same untrusted flow it validates.
4. **Approval transcript binding:** deterministic canonical bytes, readable rendering, revision, scope, and fresh challenge all refer to the same review event. No digest is computed/promoted as a governing identity while content is mutable.
5. **Verifier provenance:** who/what verifies the transcript, how its own code/configuration is recognized, and how unknown or substituted verifier state fails closed.
6. **Canonical currentness:** one explicit state owner and ordering rule for initial Constitution, amendment, conflict, rollback, revocation and recovery.
7. **Complete enforcement:** the real protected sink and every alternate route are identified; authority is enforced at the last relevant boundary, not just in UI or an injected port.

No one predicate implies another. In particular, owner intent plus a hash does not imply verifier legitimacy; verifier success does not imply currentness; currentness does not imply sink mediation.

## Decision for construction
Do **not** create keys, sign an approval, calculate a commissioning digest, add YubiKey/Keystore support to M1, create a new trust registry, or wire a synthetic effect sink.

The next technically justified step is to define the smallest acceptable bootstrap threat model and compare only concrete candidate premises against it. The known constraints are: no PC/printer, POCO X7 Pro available, Moto G52 and Moto E22i available but not independently trusted merely because they are separate devices, no selected external constitutional authority, and no selected hardware authenticator. A second phone can help compare presentation or hold a copy, but common accounts/software/recovery paths mean it cannot automatically be called an independent trust root.

If the owner does not accept the honest-device assumption and no independently recognized reference can be named, the correct result is UNKNOWN/STOP. Engineering cannot honestly manufacture a proof from no pre-existing trust.

## Evidence and non-actions
- Read-only review of the existing owner-recognition proposal, trust-channel research, and current STATUS.
- TUF cross-check is standards research; no TUF implementation is proposed.
- No source code/tests/workflows/keys/Constitution/digest/signature/APK/device/deployment/runtime authority changed.
- No owner ratification is inferred.
- STEP 7 remains **OPEN / STOP / UNKNOWN**.
