# Hand rankings guide

## Agreed scope

Add a Hand rankings button after the existing choices on Study. Open a separate `/hand-rankings` route with the shared app header; Back returns to Study. Direct links and reloads show the guide.

List ten entries, strongest first: Royal flush, Straight flush, Four of a kind, Full house, Flush, Straight, Three of a kind, Two pair, One pair, High card. Explain that royal flush is the highest straight flush, not a separate evaluator category.

Each entry starts closed and displays its position and name. Multiple entries may stay open. Use accessible native disclosure controls, existing card visuals, and readable examples on narrow screens.

Each expanded entry includes five example cards, a short plain-language explanation, and category-specific tie comparison rules. Include brief general notes: use the best five of seven cards; zero, one, or both hole cards may be used; suits have equal strength; an ace can be high or low in a straight but cannot wrap around; equal best five-card hands split the pot.

## Implementation and validation

Update Study rendering, shared header Back target, route map, styles, route/UI tests, and current route documentation. Keep game rules, saves, and calculators unchanged. Check route reload, Back, keyboard disclosure behavior, multiple open entries, and mobile card layout.

## Delivery

Await final approval before coding. Build and validate locally; do not push or deploy without a later request.
