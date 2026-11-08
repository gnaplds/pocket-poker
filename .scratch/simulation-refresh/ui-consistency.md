# Shared UI alignment

Simulation and Pass & Play now share community-card sizing, spacing, A/B label padding, and a board header with One board/Two runs, shared-card count, and the current street. Both use Preflop, Flop, Turn, River, and Hand complete labels.

Other fixes: matching betting-button text size, selected raise amount below the action button, Deal Flop/Turn/River wording, and matching pot-result emphasis and pending-payout text.

Intentional differences: Simulation keeps visible cards, Hand equity, independent deals, and Study Tools. Pass & Play keeps private handoffs, saved games, player votes, and manual showdown for private hands. These are mode rules, not presentation inconsistencies.

Validation: 79 tests pass, including a shared-header test across both modes. Physical-phone verification remains separate.
