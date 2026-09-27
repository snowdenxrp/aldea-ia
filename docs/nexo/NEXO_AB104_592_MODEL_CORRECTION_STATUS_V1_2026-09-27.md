AB104.592 model correction status

Historical AB104.589 remains unchanged.

Corrections required and applied conceptually:
- queued admissions become STALE when authority/fence/incarnation changes;
- admission binds incarnation and fence snapshot;
- UNKNOWN records the original outcome incarnation;
- reconciliation requires explicit evidence bound to that incarnation;
- compensation is a distinct typed state and cannot erase original outcome;
- authority restoration does not revive stale admission.

The corrected model is design-reviewed but has NOT been executed by TLC.
First TLC run remains pending tool availability.