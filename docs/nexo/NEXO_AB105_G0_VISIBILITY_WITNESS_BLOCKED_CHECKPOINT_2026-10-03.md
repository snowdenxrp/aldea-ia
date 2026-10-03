# NEXO AB105 G0 — visibility witness checkpoint

Date: 2026-10-03

## State
- AB105.116R remains frozen.
- TLC not rerun.
- AB105.117R not created.
- Experiment and matched-control variants compile successfully.
- Runtime dual witness is not yet executed.

## Evidence boundary
The experiment records the cache object already read/installed by the existing code paths, using thread-confined storage and owner-thread flush after shutdown/join. The matched control records a fixed sentinel through the same recorder structure. Neither variant establishes a Java Memory Model happens-before edge from W1 to AUTH.

## Current blocker
The GitHub write path rejected the attempted workflow/harness update. No runtime witness result is claimed.

## Next action
Resume by installing the dual runtime witness through an accepted repository write path, then execute experiment and matched control under identical topology/cycle schedule. Interpret only raw post-window records; missing, truncated, ambiguous, or structurally unequal records remain UNKNOWN.
