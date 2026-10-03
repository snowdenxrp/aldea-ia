# AB105 G0 — Thread-confined visibility capture specification — 2026-10-03

## Objective

Distinguish:
- cache object installed by W1;
- cache object observed by D1 authorization;

without publishing W1 information to the authorization thread during the measured race.

## Candidate

Use a process-local ThreadLocal recorder in the injected probe.

During the race:
- W1 records the identity of the newly assigned immutable AclCache into the MetadataLoader thread's ThreadLocal recorder.
- AUTH_ENTER records the identity of the AclCache snapshot actually captured by authorize() into the Processor thread's ThreadLocal recorder.
- No shared collection, volatile flag, latch, Future, queue, synchronized block, shared PrintStream, or W1-triggered wait is used for the race.

After D1 result is complete:
1. test initiates normal broker shutdown;
2. MetadataLoader owner thread exits through KafkaEventQueue cleanup;
3. Processor owner thread exits through Processor.closeAll();
4. each owner thread flushes its own ThreadLocal recorder to a diagnostic file;
5. test reads those files only after joins/shutdown.

## Key semantic check

The authorization probe must record the exact AclCache object captured by findAclRule() immediately before rule evaluation, not merely a timestamp.

W1 must record the exact new AclCache object after the plain assignment.

If W1 cache identity != D1 authorization snapshot identity, that is evidence that D1 read a different cache object from the one installed by W1. It is not by itself proof that the result was stale/incorrect; ordering and ACL semantics must still be correlated.

If identities are equal, no stale-read instance was observed.

If capture cannot be made without introducing a publication edge or materially changing scheduling, visibility remains UNKNOWN.

## Implementation gate

Before implementation, inspect the exact owner-thread shutdown hooks to ensure the flush occurs after the measured window and before the thread terminates.

No workflow run from this specification.
AB105.116R unchanged.
