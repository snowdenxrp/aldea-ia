# STEP 7 — Genesis Recognition-Basis Precondition Focused Attack
Date: 2026-10-08
Status: FOCUSED REVIEW COMPLETE — SEMANTIC PRECONDITION SURVIVES; EVIDENCE SOURCE STILL ABSENT

## Scope
Attack only the newly clarified precondition in `STEP_7_GENESIS_RECOGNITION_BASIS_PRECONDITION_2026-10-08.md` for contradictions or claims that overstate what the contract establishes. Reuse existing genesis, composition, root governance and human emergency attacks; do not repeat them as new investigations.

## Focused cases
1. **“Pre-existing” treated as “trusted.”** A credential or account existed before Nexo, but its provenance and control are unknown. The precondition does not accept age/existence alone; prior recognition and enrollment provenance remain required. Result: UNKNOWN.
2. **Owner decision treated as message authentication.** Kevin is the normative initial authority, but a later message cannot be attributed to him solely because the governance decision is recorded. The contract separates normative authority from technical recognition. Result: UNKNOWN until the evidence path is justified.
3. **Phone selection treated as enrollment.** Kevin names the phone as candidate; the phone/app/session then claims it was recognized. Candidate selection is not enrollment evidence. Result: UNKNOWN.
4. **Credential possession treated as attribution.** A key/signature proves only the bounded key relation under the selected mechanism; it does not alone establish Kevin's current authority or voluntary informed approval. Attribution and scope remain separate predicates.
5. **Canonical content mismatch.** Kevin reviews a human-readable display while a different object is submitted. The precondition requires display-to-submitted-object binding, not merely a matching digest copied into caller fields. Missing mechanism/evidence means UNKNOWN.
6. **Freshness confused with current authority.** A fresh challenge is used with a revoked or superseded credential. Freshness and lifecycle/currentness are separate requirements; both must pass.
7. **Dependencies omitted from closure.** A nominally separate authenticator shares the phone account, provider, update path, or recovery authority. No independence credit is granted from labels or physical separation alone; unresolved dependency remains UNKNOWN.
8. **Protected Core API mistaken for root.** A protected capability accepts caller-provided “verified” fields and returns an authority context. The precondition forbids caller fields from elevating themselves; until a real governed trust basis exists, the capability cannot legitimately establish the context.
9. **Recovery path bootstraps itself.** Lost phone or account recovery nominates a new credential and that credential validates the recovery. Existing recovery-self-root attack applies; result remains UNKNOWN/STOP.
10. **Scope inflation.** A commissioning approval is reused to authorize later missions, policy changes, succession, or effects. Explicit claim limitation prevents this promotion; a separate governed transition is required.

## Result
No contradiction found between this precondition and the existing NCS genesis/composition/root-role contracts or reused MASTER/AB/P112 constraints. The precondition does not claim that the mechanism, source, or evidence already exists.

The missing fact remains concrete: a governed, pre-existing recognition/enrollment basis that Core can validate without trusting the uncommissioned candidate Nexo/channel to create its own authority.

## Gate
- Semantic precondition: survives focused review at design level.
- Actual recognition/enrollment evidence source: NOT SELECTED / NOT ESTABLISHED.
- No implementation, protected activation or production effect authorized.
- No general device audit; no frozen AB/TLC/Kafka reruns; no Lúmina changes.
