# NEXO AB105 — final-field vs reference-publication boundary — 2026-10-06

## Scope
Refine the AclCache immutability finding against the Java Memory Model, specifically whether final fields inside a newly-created immutable AclCache can themselves publish the new AclCache reference to D1.

## 🟢 Verified JMM rule
JLS 17.5 gives special initialization guarantees for final fields of a properly constructed immutable object. A thread that obtains a reference to a completely initialized object is guaranteed the correctly initialized final-field values.

## 🔵 Boundary
That guarantee concerns the final fields *inside the object*. It does not make the separate reference variable that points to that object a synchronization variable.

In AB105, the relevant publication is:
1. W1 creates a new AclCache.
2. W1 assigns that object to plain StandardAuthorizerData.aclCache.
3. D1 reads plain StandardAuthorizerData.aclCache.

The final fields of the new AclCache may be safely initialized if the object reference is observed, but final-field semantics do not themselves establish W1→D1 happens-before for the plain aclCache reference.

The JLS separately identifies volatile writes/reads, monitor unlock/lock, thread start/join, and other synchronization mechanisms as sources of happens-before. Temporal ordering alone is not sufficient.

## 🟢 Result
This closes a subtle possible argument: "AclCache is immutable/final, therefore D1 must see the newly published snapshot."

That argument is not valid as a JMM publication proof.

No new runtime sample was created.

## Epistemic state
- W1→ENQUEUE JMM HB: UNKNOWN / NOT IDENTIFIED.
- W1→D1 JMM HB: UNKNOWN / NOT IDENTIFIED.
- stale-read: NOT OBSERVED / NOT DISPROVEN.
- vulnerability: NOT ESTABLISHED.

## DO-NOT-REPEAT
Do not reopen final-field semantics as a publication bridge unless a concrete synchronization action on the aclCache reference is identified.
