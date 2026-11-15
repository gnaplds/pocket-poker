# Website UI/UX refresh

Status: interviewing; redesign not yet approved. 2026-11-15.

## Confirmed direction

- Website work only; preserve the separate Godot branch.
- No serif type. User prefers GT Maru or PP Mori over Inter.
- Focus on enjoyment and replayability, with clarifications before redesign.
- Remove player-facing prototype wording. This explicit copy change is implemented; file names and the existing save key stay stable to preserve links and saves.
- App name remains Pocket Poker until the user selects a replacement.

## Design questions

1. Which experience leads: social Pass & Play or study?
2. What repeat-play experience should improve: next hand/rematch, versus new progression features?
3. Which visual personality and font should lead?
4. Are suitable font files/licensing already available?
5. Which screens belong in the first redesign pass?

## References and intended use

- https://www.userinterface.wiki/laws-of-ux
- https://lawsofux.com/
- Fitts: large reachable actions; keep destructive/committing actions distinct.
- Hick/choice overload: fewer competing actions at each stage.
- Proximity/common region: group each player’s cards, status and actions clearly.
- Peak-end: clear, enjoyable hand endings and an obvious next step.
- These are design heuristics, not evidence that a design is enjoyable. Validate the complete flow through play.

## Font facts

Inter currently exists locally. GT Maru and PP Mori are commercial foundry fonts. Resolve files and the license appropriate to this web game before embedding or publishing them. Do not add proprietary font files to the public repository without permission from their license.

- https://www.grillitype.com/shops/gt-maru
- https://pangrampangram.com/products/mori
- https://pangrampangram.com/pages/eula

No ADR yet: visual style is reversible and no architectural trade-off is settled. Existing GLOSSARY.md terms remain valid; no new domain terms agreed.

## Source audit and first interview round

Current friction candidates: confirmation on every action; Continue then Next hand; eight-seat table above active controls; repeated explanatory text; Resume inside mode menu; Simulation Replay inside Study Tools. These are candidates for user review, not authorized removals.

Q1–Q5 pending: social-play priority; shared style with Pass & Play first; playful GT Maru versus restrained PP Mori; licensed font availability; smoother existing replay loop versus new progression features. Later questions will address table/action layout, confirmations, pacing, feedback and results once these choices settle.

Copy-only update passed the existing UI test script. No typography replacement, gameplay change, push or deployment in this planning turn.

## Round 1 answers

Accepted Q1, Q2, Q3, Q5: social play leads; shared style across modes with Opening/Setup/Pass & Play/Results implemented first; playful GT Maru direction; improve existing resume/next-hand/rematch loop before new progression features.

Q4: user supplied https://font.download/font/gt-maru and requested download. Downloaded its webfont archive to `/tmp/pocket-gt-maru-webfont.zip`, outside Git. Contains 10 WOFF files, CSS and example HTML, no license document. Third-party Donationware label conflicts with foundry web licensing. Font publishing rights remain unresolved; no font embedded from that archive.

## Animation skill applied

User requested installation of LemonFace0309/charles-skills, skills/charles-ux-animation. Installed under ~/.codex/skills/charles-ux-animation and read. Use existing CSS/WAAPI rather than introduce a library. Named timings/curves and a storyboard for dealing; prioritize actionable feedback and readable state changes over decoration.

Interaction inventory: navigation (tap/keyboard, few times per session, destination); Peek (hold/release/tap, every turn, private visibility); bet slider (touch/keyboard, frequent, exact chip amount); confirmation (tap/keyboard, frequent, commitment); dealing (readiness tap plus timed cards, each street, card destination); result (automatic, each hand, payout and next action); rematch (tap, each game, reset summary).

Explicit constraints take precedence over generic skill advice: conceal private cards immediately without an exit animation; keep integer-chip slider steps; preserve non-clickable branding; never allow animation interruption to duplicate a deal or action; keep save failures visible. Deliberate game pacing is distinct from routine UI response time.

## Round 2 pending

Q6 direct Continue/Play together plus Study route; Q7 fixed board and reachable turn controls around scrollable compact table; Q8 direct Check only, other decisions still confirmed; Q9 retain street pauses/card pacing while speeding UI feedback; Q10 next hand/review and explicit same-group rematch; Q11 brief hand celebration, stronger overall winner, reduced-motion support and no sound in first pass.

Further alignment after answers: precise small-screen behavior and private guidance, result/reset edge cases, detailed visual hierarchy and final implementation approval. No redesign code or deployment authorized by these unanswered recommendations.

## Round 2 answers

Q6–Q11 accepted in full. Opening prioritizes Continue game when a save exists, otherwise Play together; Study remains secondary. Board/pot stay above a scrollable compact table with reachable private turn controls. Check becomes immediate; Fold/Call/Bet/Raise/All-in still confirm. Keep shared readiness pauses and deliberate dealing pace. Results offer Next hand plus Review hand; game completion offers same-group Rematch with explicit reset summary, 20 chips each, and a new random first dealer. Hand celebration is brief; overall-game celebration is stronger; actions do not wait for celebration; reduced motion supported; sound deferred.

## Round 3 pending

Q12 short-screen adaptation and guidance: compact bottom turn panel; expandable scrollable guidance; preserve immediate concealment and accessible tap method. Q13 home alternatives and rematch: visible New game beside secondary Study when Continue exists; confirm replacement of unfinished saves; rematch restores all original seats including eliminated players. Q14 visual hierarchy: retain cream/forest green, existing action colors, rounded sans typography, calmer supporting text; make GT Maru publishing contingent on appropriate license/files and retain Inter until resolved.


## Round 3 answers

Q12–Q14 accepted: compact private turn panel with expandable Hand details; detail visibility remains coupled to Peek; visible secondary New game and Study routes; confirmation before replacing unfinished saves; Rematch includes all original players. Preserve cream/forest-green palette and existing action colors; use Inter temporarily. GT Maru remains the visual target pending suitable publishing rights.

Final review: [build specification](spec.md). Q15 pending; no redesign implementation or publication approved yet.

## Implementation approval and delivery

The user requested “start building the redesign plan,” authorizing local implementation of the final specification. Built on `codex/web-sans-typography`, with no publication. See [validation notes](validation.md) for implemented changes, 89 passing automated checks, browser observations, and remaining visual checks.
