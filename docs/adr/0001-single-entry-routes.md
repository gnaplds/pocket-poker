# One website entry with screen routes

Pocket Poker keeps one HTML entry and uses clean URLs for its screens, while source files separate rules, UI, styles, and workers. Separate HTML documents would reload shared state and discard same-visit study hands; client-side navigation preserves them and centralizes private-card cleanup. Existing saves retain their original storage key, and deployment must serve the entry page for screen routes.
