# NEXO AB105 G0 — Causal Timing Discriminator Design — 2026-10-02

## Objective
Determine whether any ALLOWED authorization can be temporally placed strictly after the measured return boundary of removeAcl(), without using a completion flag, latch, volatile gate, or other synchronization primitive to release readers.

## Measurement model
Writer records:
- writerRemoveEnter = System.nanoTime() immediately before removeAcl()
- writerRemoveReturn = System.nanoTime() immediately after removeAcl() returns

Each reader records:
- readerAuthorizeEnter immediately before authorize()
- readerAuthorizeReturn immediately after authorize()

Classify an ALLOWED result as causally-after-return only when:
readerAuthorizeEnter > writerRemoveReturn

Classify an ALLOWED result that overlaps the writer interval separately:
readerAuthorizeEnter <= writerRemoveReturn && readerAuthorizeReturn >= writerRemoveEnter

The test uses System.nanoTime() only as a monotonic timing instrument. This establishes a temporal ordering observable on the same JVM/runtime; it does NOT establish a Java Memory Model happens-before edge.

## Constraints
- No completion flag after removeAcl().
- No latch/barrier/volatile marker used to release readers after removeAcl().
- No TLC rerun.
- No AB105.117R.
- AB105.116R unchanged.
- A post-return ALLOWED observation is escalation evidence, not automatically a vulnerability finding.

## Required witness fields
CAUSAL_JMM_RACE ITERATIONS=<n> READERS=<n> OBSERVATIONS=<n> POST_RETURN_ALLOWED=<n> POST_RETURN_DENIED=<n> OVERLAP_ALLOWED=<n> OVERLAP_DENIED=<n> UNEXPECTED=<n>

## Epistemic rule
POST_RETURN_ALLOWED=0 means no such result was observed in this diagnostic; it does not prove JMM safety or a global happens-before relationship.
POST_RETURN_ALLOWED>0 materially escalates the source-level concurrency question and requires preservation of exact evidence and follow-up source/runtime analysis.
