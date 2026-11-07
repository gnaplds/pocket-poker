# Poker Mobile

Terms used for the Texas Hold’em simulator and shared-phone multiplayer game.

## Language

**Board result**:
The winners or tied winners of each pot on one completed community board. In two runouts, a board result can be known before the other board finishes; chips are paid when the hand completes.

**Simulation mode**:
A study mode where one observer can inspect all players' cards and the deck while controlling the deal and betting.

**Pass-and-play multiplayer**:
A game in which several people share one device, passing it to the person whose turn it is. Each player's hole cards stay private until an all-in reveal or showdown.
_Avoid_: Online multiplayer

**Game session**:
A series of hands played by the same group, with each player's chips carrying from one hand to the next.

**Seat**:
A player's fixed place in the clockwise order around the table. A seat stays in place while its position relative to the button changes.

**Handoff**:
The transfer of the device to the next acting player while private cards are concealed.

**Peek**:
A temporary view of the acting player's own hole cards and any enabled hand guidance. Other players' private cards remain concealed.

**Hole cards**:
The two private cards held by a player.

**Community cards**:
The shared cards that all players can use to form their final hand. The flop reveals three cards, the turn adds a fourth, and the river adds a fifth.
_Avoid_: Table cards

**Board**:
The community cards used for one comparison of players' hands. Two runouts can share cards revealed before the runs separate.
_Avoid_: Community deck

**Deck**:
The single set of 52 distinct playing cards used for a deal.

**Deck order**:
The sequence of cards from the top of the deck to the bottom.

**Deal**:
One distribution of hole cards and community cards from a shuffled deck. A hand can end before all community cards are dealt if only one player remains after folds.

**Burn card**:
A card set aside before dealing a community-card stage. It is not part of any player's hand or board.

**Street**:
A stage of a Hold’em hand: preflop, flop, turn, or river.

**Runout**:
The remaining community cards dealt to complete a board.

**Run it twice**:
Complete the remaining board twice using the same hole cards and the same deck, without replacing cards. Any community cards revealed before the split are shared by both completed boards.
_Avoid_: Two decks

**Hand category**:
The kind of five-card hand a player has: high card, one pair, two pair, three of a kind, straight, flush, full house, four of a kind, or straight flush. A royal flush is the highest straight flush.
_Avoid_: Card rank

**Card rank**:
A card's face value: two through ten, jack, queen, king, or ace.

**Best five-card hand**:
The strongest five-card combination available from a player's hole cards and one board. It may use zero, one, or both hole cards.

**Hand guidance**:
An explanation of a player's current hand and possible draws using their hole cards and the revealed community cards. During play, it is private to that player; at showdown it can accompany publicly revealed hands.

**Draw**:
A possible hand that needs further community cards to be completed. A draw is not a current hand category, and completing it does not guarantee winning.

**Flush draw**:
Four cards of one suit that need a fifth card of that suit to form a flush.

**Open-ended straight draw**:
Four consecutive ranks that can form a straight by adding a rank at either end.

**Gutshot straight draw**:
A straight possibility with one missing rank inside its five-rank sequence.
_Avoid_: Inside straight draw

**Double-gutshot straight draw**:
Two gutshot possibilities in the same available cards, with different missing ranks that can each complete a straight.

**Backdoor draw**:
A draw on the flop that needs suitable cards on both the turn and river to complete.

**Kicker**:
A card outside a made pair or other matching group that can distinguish otherwise equal hand categories, under the rules for comparing five-card hands.

**Showdown**:
The comparison of players’ best five-card hands to determine who wins or shares the pot.

**Showdown-ready**:
A private hand with completed boards and no remaining betting decisions, awaiting the shared Showdown action before winners are announced and pots awarded. Public all-in runouts finish automatically when all boards are complete.

**All-in reveal**:
Publicly showing the non-folded players' hole cards once all owed decisions are finished and no further betting is possible against all-in opponents. A player covering the others may still have chips; folded cards remain hidden.

**Tied winners**:
Two or more players with equally strong best five-card hands on the same board. Merely sharing a hand category does not establish a tie.

**Button (BTN)**:
The dealer position, which determines the relative order of seats and actions.

**Dead button**:
A button-and-blind convention that keeps the big blind with the next player due to pay it after an elimination. The button or small-blind position can temporarily fall on an empty seat.

**Small blind (SB) and big blind (BB)**:
Forced opening bets and the positions that post them. Heads-up, the button also posts the small blind.

**Under the gun (UTG)**:
The first position to act before the flop at a table with at least three players. UTG+1 means the seat immediately after UTG; short-handed position names can overlap.

**Hijack (HJ) and cutoff (CO)**:
The positions two seats and one seat before the button, respectively.

**Stack**:
The chips a player has available to bet.

**Pot**:
The chips contributed by players and awaiting award to the eligible winner or winners.

**Side pot**:
A separate pot for contributions beyond what a shorter all-in stack can match. Only players who contributed to that pot and have not folded can win it.

**Fold**:
Give up the right to win the current hand. Previously contributed chips remain in the pot.

**Check and call**:
Check passes action without adding chips when nothing is owed. Call contributes enough chips to match the current bet, limited by the player's available stack.

**Raise to**:
The total amount a player commits in the current betting round after increasing the bet, including chips already committed in that round.

**All-in**:
A player has committed their entire available stack and cannot make further bets in the hand.

**Equity**:
The expected fraction of a shared pot a player receives across possible final boards, including their share of tied outcomes.

**Win probability**:
The probability that a player is the sole winner on the final board.

**Tie probability**:
The probability that a player shares the winning hand with at least one other player. This is distinct from the fraction of the pot received.
