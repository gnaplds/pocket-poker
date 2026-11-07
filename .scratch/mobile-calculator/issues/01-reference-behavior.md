# Establish the reference calculator’s behavior

Parent: [Plan the Android poker calculator](../map.md)
Label: wayfinder:research
Type: research
Status: resolved
Assignee: reference_research
Blocked by:

## Question

What observable input, validation, calculation, and result behaviors of the reference calculator matter for an offline, known-hand, 2–6-player Android version? Distinguish observed behavior from website claims and unresolved details. Inspect card selection, duplicate-card prevention, board entry, player changes, recalculation, win/tie presentation, and reset where accessible.

## Context

Reference: https://pokercoaching.com/odds-calculator/

Write cited findings to `../research/reference-behavior.md`. Do not treat undocumented source internals or marketing claims as verified behavior. The website describes both exhaustive evaluation and simulation; note the uncertainty rather than choosing one.

## Answer

See [Reference calculator behavior](../research/reference-behavior.md) for live observations, website claims, recommendations, and explicit limits. Confirmed the basic known-hand entry flow, automatic calculation after a second hand, separate Win/Tie display, used-card dimming, an incomplete-board zero-result state, and reset. Calculation method, mobile behavior, and advanced editing remain unverified and should not be copied by assumption.

Research was completed locally on 2026-11-05; no branch was published to the unrelated game remote. This resolves the evidence-gathering ticket, not the Android interaction design.
