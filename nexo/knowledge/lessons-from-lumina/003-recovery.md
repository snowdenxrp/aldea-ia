# Lesson 003 — Recovery must be designed before failure

## General lesson
Recovery cannot be an afterthought. A component that may fail needs explicit detection, isolation, rollback, and verification paths before it becomes a dependency of higher layers.

## Nexo application
Every critical Nexo subsystem will define its failure states and recovery contract before higher-level orchestration depends on it.

## Provenance
Engineering lesson distilled from the Lúmina development experience. This file intentionally contains no Lúmina runtime code or state.
