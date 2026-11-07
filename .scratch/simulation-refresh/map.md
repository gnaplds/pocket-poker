# Align Simulation with Pass & Play

Label: wayfinder:map
Status: complete

## Destination

A build-ready plan for Simulation with compact clockwise seats, a sticky board, Pass & Play-style controls, visible dealt hole cards, and per-player equity. The user confirmed this destination. Agree the complete behavior before application changes or publishing.

## Notes

- Use wayfinder, grilling, and domain-modeling. Use the local Markdown tracker; child decisions live in `issues/` with Status, Assignee, and Blocked by fields.
- This effort supersedes the historical simulator plan's exclusion of equity. Existing standalone Equity and Pass & Play remain separate modes.
- Planning only: no application edits, commits, pushes, or deployment during this interview.
- Read existing implementation facts before proposing detailed interactions. Distinguish approved requirements from recommendations still awaiting answers.
- The user approved the full specification and proposed defaults on 2026-11-08. Approval completes planning only; implementation requires a separate instruction.
- Subsequent instruction on 2026-11-08 authorized local prototype development with TDD. The [prototype validation record](issues/02-prototype-validation.md) points to branch `codex/simulation-refresh`; user review is pending. The original planning decision remains complete, and publishing is not authorized.

## Decisions so far

- [Agree the visible-card Simulation contract](issues/01-simulation-contract.md): approved compact observer controls, independent practice deals, and per-board Hand equity; full specification linked from the resolved ticket.

## Not yet specified

None blocking implementation planning. Browser layout, worker behavior, and physical-phone performance remain implementation validation requirements, not completed checks.

## Out of scope

- Implementation or publishing during planning.
- Changes to private multiplayer behavior or manual Equity-mode behavior unless separately agreed.
