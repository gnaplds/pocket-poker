# Slider, showdown and public action feedback

Status: Q1–Q7 approved; implemented in the browser prototype on 2026-11-06. Automated validation complete; live visual and phone checks remain.

## Requested changes

- Replace pot presets with a whole-chip slider labelled Min and Max.
- Preserve the combined Bet/Raise/All-in button and existing action confirmations. Max describes the slider endpoint; the action still states All-in when it uses the full stack.
- Wait for a Showdown action before revealing normal river results. A fold-only win remains immediate.
- Reveal remaining hands publicly when all-in betting is finished.
- Show each seat's last decision with action colors.

## Round one — approved

1. Hold payouts, winner labels, hand reveals and confetti until Showdown; for two runs wait for both boards. Fold-only wins pay immediately without showing hole cards.
2. Reveal non-folded hands once all owed decisions finish and no further betting is possible, including a covering stack. Never expose hands while a side pot can still be bet.
3. Blue for the last bet/raise, green for calls matching the current bet, faded red for folds, gold for all-ins. Keep the bettor blue when called. Remove green if a later raise leaves that caller owing chips.
4. Reset ordinary actions/colors when dealing the next street; preserve folded/all-in states. Check is neutral, acting-player outline is separate, and raise text names the amount.

## Round two — approved

- Q5: Show readable face-up hole cards at their fixed seats during all-in runouts, while withholding public rankings, draws, winner labels, payouts, and confetti until Showdown. Existing optional Peek guidance remains private during voting.
- Q6: Retain named, clockwise, unanimous run-it-twice votes. Public cards remain visible through voting, readiness pauses, dealing, and resume. Normal private hands still resume concealed. Use truthful voting text rather than saying all cards are hidden.

## Final behavior

### Whole-chip slider

The multiplayer slider runs from the legal minimum raise-to total to the player's maximum, one chip at a time. Show Min and Max endpoint labels and the selected total plus chips added now. Remove all pot presets. Keep the wide combined action: royal blue for Bet/Raise, gold and labelled All-in when the chosen amount uses the full stack. Selection alone commits nothing; every betting action still requires confirmation. Each new turn starts at Min. If only a short all-in raise is legal, display that single amount without pretending the slider has a range. If raising is forbidden, keep the control disabled and retain any legal Call action.

### Showdown and public cards

Ordinary hands with multiple players remaining stop after the final confirmed river action. Keep cards concealed, the pot unawarded, stacks unpaid, and winner labels/confetti absent. A shared Showdown button resolves the hand once, reveals eligible cards and explanations, and awards the pots.

An all-in reveal is a separate event: expose remaining hole cards after all owed decisions finish and no further betting is possible. Do not expose cards merely because one player goes all-in while others can still bet a side pot. A covering player with chips left does not prevent the reveal once betting is over. Revealed cards stay visible at their fixed seats through voting, street pauses, animations, and recovery. Keep burns, future cards, deck order, and folded cards hidden.

Run-it-twice votes remain named and clockwise, with unanimity required. The voting screen explains that hole cards are public. Optional Peek guidance remains private to the voting player. After both boards finish, wait for Showdown before displaying any public hand categories, winners, payouts, or confetti. Existing readiness pauses remain.

If folds leave one player, finish and award the hand immediately, with no Showdown tap and no hole-card disclosure.

### Seat feedback

Display the last confirmed action in text at the seat as well as its color. Pending confirmations do not change it.

- Bet/Raise: blue, with the street total, such as “Raise to 8.” Further raises stay blue; no 3-bet/4-bet terminology is needed.
- Call: green only while the player's street contribution matches the current bet. A later raise removes green until they match again; the previous action text remains until replaced or reset.
- Fold: faded red for the rest of the hand. Keep names and labels readable.
- All-in: gold for the rest of the hand, taking priority over Bet/Raise or Call color.
- Check: neutral. Players awaiting their first action are neutral too.

Reset ordinary last-action labels and blue/green colors when dealing the next street. Preserve Fold and All-in states until the hand ends. Keep the acting-player outline visually distinct from action colors. Blind contributions remain visible but are not described as a voluntary call or raise.

## Review examples

| Situation | Expected result |
|---|---|
| Legal minimum 4, maximum 20 | Slider selects 4, 5, 6 … 20. At 20 the button is gold and says All-in; confirmation is still required. |
| Last player confirms Check on the river | Show Showdown; cards remain private, the pot and stacks do not yet change. |
| Someone taps Showdown | Reveal non-folded hands, announce winners, pay each pot once, and celebrate. |
| Alex goes all-in; Blair still owes a decision | Keep hole cards private until Blair confirms Call or Fold. |
| Blair calls Alex's all-in and still has chips left; nobody else can bet | Reveal both hands publicly, retain any runout vote/readiness pauses, and wait for Showdown after the board finishes. |
| Two other players can still bet a side pot | Keep all private hole cards hidden. |
| Two runouts finish | Keep the already-public cards visible; award neither board's pots until Showdown. |
| Alex raises to 4; Blair calls; Casey raises to 8 | Alex is blue; Blair becomes green after calling 4, then neutral after Casey raises. Casey is blue. Blair's “Call” text remains until Blair acts again. |
| All but one player fold | Award the survivor immediately and keep all hole cards hidden. |

## Implementation and acceptance

Scope: multiplayer betting controls, public seat rendering, session/engine completion transitions, save/replay, and their existing public-behavior/UI tests. Keep Simulation's current completion flow and existing saved games compatible. Completed old saves remain completed; unfinished games gain the new behavior.

Verify legal one-chip selection, short stacks, unavailable raises, exact confirmation amounts, and reset/cancellation behavior. Verify no winner or payout leaks before Showdown, a single payout despite repeat clicks or recovery, immediate fold wins, side-pot reveal boundaries, both runouts, concealed normal recovery versus persistent public recovery, and per-street action/color transitions. Check readable public cards and action labels at 2–6 seats, keyboard slider control, and confirmation privacy in the browser when available.

No new dependency or odds calculation is required. Physical-phone testing and any unavailable browser checks must be reported explicitly.

## Final alignment

Q7 approved: the user confirmed the complete review and authorized implementation in the current browser prototype.

## Implementation and validation record

Implemented in `prototypes/dealing-prototype.html`. Multiplayer defers engine settlement until an explicit Showdown command; Simulation retains automatic settlement. Saved games replay decisions, including Showdown, and reconstruct public-card visibility and last actions. The save format is now version 2, with version 1 recovery: completed old hands stay completed and unfinished hands gain the new rules. The local-storage key is unchanged.

52 tests pass (44 command/ranking/session tests and eight DOM-boundary tests). They cover whole-chip controls, confirmations, short stacks, unpaid Showdown and recovery, legacy settlement, all-in reveal with outstanding calls and side pots, two boards, folded-card privacy, private guidance during public voting, action colors/reset, and continuing-game chip conservation. All four inline scripts pass syntax checks.

Local browser control reports “Local browser use is disabled in Work settings.” Live visual checks, keyboard slider behavior, 2–6-seat public-card readability, and physical-phone touch checks remain unverified. No new screenshot is claimed. Review the updated local prototype on the user's device.

The local preview HTTP check was blocked by the execution sandbox (`Operation not permitted`), so this pass does not confirm the running server response. The updated HTML file and automated tests are saved locally.
