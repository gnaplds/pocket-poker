# Showdown reveal and pot collection

Final alignment approved; implemented in the main local HTML. Keep existing result-card emphasis, with no added shared-board highlighting.

- Flip only newly public eligible hole cards together, about 350 ms. Apply to manual showdown and first public all-in reveal. Already-public and folded cards do not flip. Private Peek remains instant. Simulation's already-visible cards need no reveal flip.
- Private showdown sequence: flip, best-five emphasis, chip collection, winner dialog. Public all-in finish skips the reveal. Fold wins skip reveal and best-five emphasis.
- Chip collection uses one group per pot/board payout: main pot then side pots, A then B within each pot. Tied winners receive their groups together.
- About 250 ms per payout group; cap total collection at 1.5 seconds by shortening groups when needed. Skip zero-chip transfers. Exact amounts stay in the result list.
- Balances/results settle immediately. Next Hand remains usable and cancels any pending effects/dialog. Animations never determine accounting.
- Interruption cancels remaining decoration, with no replay on return. Preserve privacy and already-public status. Reduced motion reveals public cards instantly and shows static results without collection animation.
- Implement locally after final approval; no GitHub push or deployment.


Validation: all 93 tests pass, including reveal eligibility, cancellation restoring card visibility, ordered tied payout groups, zero-share filtering, and the 1.5-second cap. Browser check completed a two-player Simulation fold win through payout and the winner dialog. Physical-phone motion, full private-showdown visual review, and eight-player/two-board visual sequences remain pending. No push or deployment.
