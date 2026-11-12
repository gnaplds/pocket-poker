class_name PokerRules
extends RefCounted

const RANKS = "23456789TJQKA"
const SUITS = "cdhs"
const CATEGORIES = ["High card", "One pair", "Two pair", "Three of a kind", "Straight", "Flush", "Full house", "Four of a kind", "Straight flush"]

static func full_deck() -> Array:
	var cards = []
	for r in RANKS:
		for s in SUITS:
			cards.append(r + s)
	return cards

static func shuffled() -> Array:
	var cards = full_deck()
	var crypto = Crypto.new()
	for i in range(51, 0, -1):
		var limit = 4294967296 - 4294967296 % (i + 1)
		var value = crypto.generate_random_bytes(4).decode_u32(0)
		while value >= limit:
			value = crypto.generate_random_bytes(4).decode_u32(0)
		var j = value % (i + 1)
		var temp = cards[i]
		cards[i] = cards[j]
		cards[j] = temp
	return cards

static func rank(cards: Array) -> Dictionary:
	if cards.size() < 5 or cards.size() > 7:
		return {"error": "Rank needs five to seven cards"}
	var seen = {}
	for c in cards:
		if c not in full_deck() or seen.has(c):
			return {"error": "Cards must be valid and unique"}
		seen[c] = true
	var best = {"score": -1}
	for a in range(cards.size() - 4):
		for b in range(a + 1, cards.size() - 3):
			for c in range(b + 1, cards.size() - 2):
				for d in range(c + 1, cards.size() - 1):
					for e in range(d + 1, cards.size()):
						var hand = [cards[a], cards[b], cards[c], cards[d], cards[e]]
						var result = five(hand)
						if result.score > best.score:
							best = result
	return best

static func five(hand: Array) -> Dictionary:
	var values = hand.map(func(c): return RANKS.find(c[0]) + 2)
	values.sort()
	values.reverse()
	var groups = []
	for v in values:
		if not groups.any(func(g): return g[1] == v):
			groups.append([values.count(v), v])
	groups.sort_custom(func(a, b): return a[0] > b[0] or (a[0] == b[0] and a[1] > b[1]))
	var flush = hand.all(func(c): return c[1] == hand[0][1])
	var straight = 0
	if groups.size() == 5:
		if values[0] - values[4] == 4:
			straight = values[0]
		elif values == [14, 5, 4, 3, 2]:
			straight = 5
	var cat = 0
	var kick = values
	if flush and straight:
		cat = 8
		kick = [straight]
	elif groups[0][0] == 4:
		cat = 7
		kick = groups.map(func(g): return g[1])
	elif groups[0][0] == 3 and groups[1][0] == 2:
		cat = 6
		kick = groups.map(func(g): return g[1])
	elif flush:
		cat = 5
	elif straight:
		cat = 4
		kick = [straight]
	elif groups[0][0] == 3:
		cat = 3
		kick = groups.map(func(g): return g[1])
	elif groups[0][0] == 2:
		cat = 2 if groups[1][0] == 2 else 1
		kick = groups.map(func(g): return g[1])
	var score = cat
	for i in range(5):
		score = score * 15 + (kick[i] if i < kick.size() else 0)
	hand.sort_custom(func(a, b): return RANKS.find(a[0]) > RANKS.find(b[0]))
	return {"score": score, "category": "Royal flush" if cat == 8 and straight == 14 else CATEGORIES[cat], "cards": hand, "kind": cat}

static func filled(n: int, value) -> Array:
	var a = []
	a.resize(n)
	a.fill(value)
	return a

static func create(stacks: Array, deck: Array, button: int, sb: int = -1, bb: int = -1) -> Dictionary:
	var n = stacks.size()
	if n < 2 or n > 8 or button < 0 or button >= n or stacks.any(func(v): return not (v is int) or v < 0) or stacks.filter(func(v): return v > 0).size() < 2:
		return {"error": "Invalid players, stacks or button"}
	if deck.size() != 52 or full_deck().any(func(c): return deck.count(c) != 1):
		return {"error": "A deck needs 52 unique cards"}
	var order = []
	for k in range(n):
		var i = (button + 1 + k) % n
		if stacks[i] > 0:
			order.append(i)
	if sb < 0:
		sb = button if order.size() == 2 else order[0]
	if bb < 0:
		bb = order[0] if order.size() == 2 else order[1]
	if sb == bb or sb >= n or bb >= n or stacks[bb] == 0:
		return {"error": "Invalid blind seats"}
	var g = {"players": n, "button": button, "sb": sb, "bb": bb, "deck": deck.duplicate(), "cursor": 0,
		"hands": [], "boards": [[]], "burns": [], "log": [], "queue": [], "stage": "dealing", "board": 0,
		"twice": false, "shared": 0, "stacks": stacks.duplicate(), "paid": filled(n, 0), "total": filled(n, 0),
		"folded": stacks.map(func(v): return v == 0), "seated": stacks.map(func(v): return v > 0),
		"returned": filled(n, 0), "awards": filled(n, 0), "actions": filled(n, null), "pending": [], "acted_at": [],
		"actor": -1, "current_bet": 2, "last_raise": 2, "pot": 0, "history": [], "settled": false,
		"public_cards": false, "pots": []}
	for i in range(n):
		g.hands.append([])
	for i in range(order.size() * 2):
		g.queue.append({"kind": "hole", "player": order[i % order.size()], "end": i == order.size() * 2 - 1, "stage": "preflop", "board": 0})
	for blind in [[sb, 1], [bb, 2]]:
		var i = blind[0]
		var amount = mini(blind[1], stacks[i])
		g.stacks[i] -= amount
		g.paid[i] = amount
		g.total[i] = amount
		g.pot += amount
		if amount:
			g.history.append({"player": i, "stage": "preflop", "board": 0, "text": ("Small blind " if blind[1] == 1 else "Big blind ") + str(amount)})
			if g.stacks[i] == 0:
				g.actions[i] = {"kind": "all", "text": "All-in " + str(amount)}
	return g

static func open_round(g: Dictionary):
	g.acted_at = filled(g.players, -1)
	if g.stage != "preflop":
		g.paid.fill(0)
		g.current_bet = 0
		g.last_raise = 2
	g.pending = []
	for i in range(g.players):
		g.pending.append(g.stacks[i] > 0 and not g.folded[i])
	if g.pending.count(true) < 2:
		g.current_bet = 0
		for i in range(g.players):
			if not g.folded[i]:
				g.current_bet = maxi(g.current_bet, g.paid[i])
		for i in range(g.players):
			g.pending[i] = g.pending[i] and g.paid[i] < g.current_bet
	var first = (g.button + 1) % g.players
	if g.stage == "preflop":
		first = g.button if g.seated.count(true) == 2 else (g.bb + 1) % g.players
	g.actor = find_pending(g, first)

static func find_pending(g: Dictionary, first: int) -> int:
	for k in range(g.players):
		var i = (first + k) % g.players
		if g.pending[i] and not g.folded[i] and g.stacks[i] > 0:
			return i
	return -1

static func legal(g: Dictionary) -> Dictionary:
	var i = g.actor
	if i < 0 or g.settled:
		return {}
	var owed = maxi(0, g.current_bet - g.paid[i])
	var maximum = g.paid[i] + g.stacks[i]
	var reopened = g.acted_at[i] == -1 or g.current_bet - g.acted_at[i] >= g.last_raise
	var opponent = false
	for j in range(g.players):
		if j != i and not g.folded[j] and g.stacks[j] > 0:
			opponent = true
	return {"owed": owed, "call": mini(owed, g.stacks[i]), "min": mini(maximum, g.current_bet + g.last_raise), "max": maximum, "can_raise": reopened and maximum > g.current_bet and opponent}

static func act(state: Dictionary, action: String, target: int = 0) -> Dictionary:
	var g = state.duplicate(true)
	var l = legal(g)
	if l.is_empty():
		return {"error": "No player is waiting"}
	var i = g.actor
	var amount = 0
	var text = action.capitalize()
	match action:
		"fold": g.folded[i] = true
		"check":
			if l.owed > 0:
				return {"error": "Call or fold when facing a bet"}
		"call":
			if not l.owed:
				return {"error": "Nothing to call"}
			amount = l.call
			text = "Call " + str(amount)
		"raise":
			if not l.can_raise or target <= g.current_bet or target > l.max or (target < g.current_bet + g.last_raise and target != l.max):
				return {"error": "Illegal raise amount or raise rights"}
			amount = target - g.paid[i]
			text = ("Raise to " if g.current_bet else "Bet ") + str(target)
			g.last_raise = maxi(g.last_raise, target - g.current_bet)
			g.current_bet = target
			for j in range(g.players):
				g.pending[j] = g.stacks[j] > 0 and not g.folded[j]
		_:
			return {"error": "Unknown action"}
	g.stacks[i] -= amount
	g.paid[i] += amount
	g.total[i] += amount
	g.pot += amount
	g.pending[i] = false
	g.acted_at[i] = g.current_bet
	g.actions[i] = {"kind": "all" if g.stacks[i] == 0 and amount > 0 else action, "text": "All-in · %d total" % g.paid[i] if g.stacks[i] == 0 and amount > 0 else text}
	g.history.append({"player": i, "stage": g.stage, "board": g.board, "text": text + (" · all-in" if g.stacks[i] == 0 else "")})
	g.actor = find_pending(g, (i + 1) % g.players)
	var can_act = []
	for j in range(g.players):
		if not g.folded[j] and g.stacks[j] > 0:
			can_act.append(j)
	if g.actor >= 0 and can_act.size() == 1 and g.paid[g.actor] >= g.current_bet:
		g.actor = -1
	if g.folded.count(false) == 1:
		g.actor = -1
	finish_round(g)
	return g

static func finish_round(g: Dictionary):
	if g.actor != -1:
		return
	var totals = g.total.duplicate()
	totals.sort()
	var excess = totals[-1] - totals[-2]
	if excess > 0:
		var i = g.total.find(totals[-1])
		g.total[i] -= excess
		g.paid[i] -= excess
		g.stacks[i] += excess
		g.returned[i] += excess
		g.pot -= excess
	var alive = []
	for i in range(g.players):
		if not g.folded[i]:
			alive.append(i)
	if alive.size() > 1 and alive.filter(func(i): return g.stacks[i] > 0).size() <= 1:
		g.public_cards = true
	if alive.size() == 1:
		settle(g)
	elif g.boards.all(func(b): return b.size() == 5):
		g.stage = "showdown"

static func deal(state: Dictionary) -> Dictionary:
	var g = state.duplicate(true)
	if g.actor >= 0 or g.stage in ["complete", "showdown"]:
		return {"error": "Finish the current decision first"}
	if g.queue.is_empty():
		g.actions = g.actions.map(func(a): return a if a != null and a.kind in ["fold", "all"] else null)
		var size = g.boards[g.board].size()
		var stage = "flop" if size == 0 else "turn" if size == 3 else "river"
		g.queue.append({"kind": "burn", "board": g.board, "stage": stage, "end": false})
		for i in range(3 if size == 0 else 1):
			g.queue.append({"kind": "board", "board": g.board, "stage": stage, "end": i == (2 if size == 0 else 0)})
	var event = g.queue.pop_front()
	if g.cursor >= 52:
		return {"error": "Deck exhausted"}
	var card = g.deck[g.cursor]
	g.cursor += 1
	event.card = card
	event.position = g.cursor
	match event.kind:
		"hole": g.hands[event.player].append(card)
		"burn": g.burns.append(card)
		"board": g.boards[event.board].append(card)
	g.log.append(event)
	if event.end:
		g.stage = event.stage
		if event.stage == "river" and g.twice and g.board == 0:
			g.board = 1
			g.stage = "preflop" if g.shared == 0 else "flop" if g.shared == 3 else "turn"
		open_round(g)
		finish_round(g)
	return g

static func pot_results(g: Dictionary) -> Array:
	var levels = []
	for v in g.total:
		if v > 0 and v not in levels:
			levels.append(v)
	levels.sort()
	var previous = 0
	var pots = []
	for level in levels:
		var contributors = []
		var eligible = []
		for i in range(g.players):
			if g.total[i] >= level:
				contributors.append(i)
				if not g.folded[i]:
					eligible.append(i)
		var amount = (level - previous) * contributors.size()
		previous = level
		var shares = []
		var boards = [[]] if g.folded.count(false) == 1 else g.boards
		for j in range(boards.size()):
			if boards[j].size() != 5 and g.folded.count(false) > 1:
				shares.append(null)
				continue
			var winners = []
			var best = -1
			for i in eligible:
				var score = 0 if g.folded.count(false) == 1 else rank(g.hands[i] + boards[j]).score
				if score > best:
					winners = [i]
					best = score
				elif score == best:
					winners.append(i)
			winners.sort_custom(func(a, b): return (a - g.button - 1 + g.players) % g.players < (b - g.button - 1 + g.players) % g.players)
			var share = amount / boards.size() + (1 if j < amount % boards.size() else 0)
			var awards = []
			for k in range(winners.size()):
				awards.append({"player": winners[k], "amount": share / winners.size() + (1 if k < share % winners.size() else 0)})
			shares.append({"amount": share, "winners": winners, "awards": awards})
		pots.append({"amount": amount, "eligible": eligible, "shares": shares})
	return pots

static func settle(g: Dictionary):
	if g.settled:
		return
	g.pots = pot_results(g)
	for pot in g.pots:
		for share in pot.shares:
			for award in share.awards:
				g.awards[award.player] += award.amount
				g.stacks[award.player] += award.amount
	g.pot = 0
	g.actor = -1
	g.settled = true
	g.stage = "complete"

static func showdown(state: Dictionary) -> Dictionary:
	if state.stage != "showdown" or state.settled:
		return {"error": "Not ready for showdown"}
	var g = state.duplicate(true)
	settle(g)
	return g

static func can_run_twice(g: Dictionary) -> bool:
	return not g.twice and g.queue.is_empty() and g.stage in ["preflop", "flop", "turn"] and g.actor == -1 and g.public_cards

static func run_twice(state: Dictionary) -> Dictionary:
	if not can_run_twice(state):
		return {"error": "Two runs are not available"}
	var g = state.duplicate(true)
	g.twice = true
	g.shared = g.boards[0].size()
	g.boards.append(g.boards[0].duplicate())
	return g

static func next_hand(g: Dictionary, deck: Array) -> Dictionary:
	if not g.settled or g.stacks.filter(func(v): return v > 0).size() < 2:
		return {"error": "No next hand available"}
	var bb = (g.bb + 1) % g.players
	while g.stacks[bb] == 0:
		bb = (bb + 1) % g.players
	var button = g.sb
	var sb = g.bb
	if g.stacks.filter(func(v): return v > 0).size() == 2:
		for i in range(g.players):
			if g.stacks[i] > 0 and i != bb:
				button = i
				sb = i
	return create(g.stacks, deck, button, sb, bb)

static func positions(g: Dictionary) -> Array:
	var labels = g.seated.map(func(v): return "" if v else "Out")
	labels[g.button] = "BTN"
	labels[g.sb] = "BTN / SB" if g.seated.count(true) == 2 else "SB"
	labels[g.bb] = "BB"
	var rest = []
	for k in range(g.players):
		var i = (g.bb + 1 + k) % g.players
		if g.seated[i] and labels[i] == "":
			rest.append(i)
	var extra = {0: [], 1: ["UTG / CO"], 2: ["UTG / HJ", "CO"], 3: ["UTG", "HJ / UTG+1", "CO"], 4: ["UTG", "UTG+1", "HJ", "CO"], 5: ["UTG", "UTG+1", "UTG+2", "HJ", "CO"]}[rest.size()]
	for k in range(rest.size()):
		labels[rest[k]] = extra[k]
	return labels

static func guide(hole: Array, board: Array) -> Dictionary:
	if hole.size() != 2 or board.size() not in [0, 3, 4, 5]: return {}
	if board.is_empty():
		return {"category": "Starting hand", "description": "Pocket " + hole[0][0] + "s" if hole[0][0] == hole[1][0] else hole[0][0] + "–" + hole[1][0] + (", suited" if hole[0][1] == hole[1][1] else ", offsuit"), "cards": [], "defining": [], "draws": []}
	var available = hole + board
	var best = rank(available)
	if best.has("error"): return {}
	var board_only = board.size() == 5 and rank(board).score == best.score
	if board_only: best = rank(board)
	var defining = []
	for c in best.cards:
		if best.kind in [1, 2, 3, 7]:
			if best.cards.filter(func(other): return other[0] == c[0]).size() > 1: defining.append(c)
		elif best.kind > 3 or c == best.cards[0]: defining.append(c)
	var descriptions = ["Your highest card and four kickers.", "Two cards of the same rank.", "Two different pairs.", "Three cards of the same rank.", "Five consecutive ranks.", "Five cards of one suit.", "Three of one rank and two of another.", "Four cards of the same rank.", "Five consecutive ranks in one suit."]
	var out = {"category": best.category, "description": "Your best hand is on the board; your hole cards do not improve it." if board_only else descriptions[best.kind], "cards": best.cards, "defining": defining, "draws": []}
	if board.size() == 5: return out
	if best.kind < 4:
		var patterns = []
		for top in range(5, 15):
			var missing = []
			var support = []
			for v in range(top - 4, top + 1):
				var r = "A" if v == 1 else RANKS[v - 2]
				var found = available.filter(func(c): return c[0] == r)
				if found.is_empty(): missing.append(r)
				else: support.append(found[0])
			if missing.size() == 1: patterns.append({"missing": missing[0], "cards": support, "inside": missing[0] not in ["A" if top == 5 else RANKS[top - 6], RANKS[top - 2]]})
		if not patterns.is_empty():
			var title = "Straight draw"
			if patterns.size() == 1: title = "Gutshot / inside straight draw" if patterns[0].inside else "Straight draw"
			elif patterns.size() >= 2: title = "Open-ended straight draw" if patterns[0].cards.all(func(c): return c in patterns[1].cards) else "Double-gutshot straight draw"
			for p in patterns: out.draws.append({"title": title, "description": "A " + ("10" if p.missing == "T" else p.missing) + " completes a straight.", "cards": p.cards})
	if best.kind < 5:
		for i in range(4):
			var support = available.filter(func(c): return c[1] == SUITS[i])
			if support.size() == 4: out.draws.append({"title": "Flush draw", "description": "One more " + ["club", "diamond", "heart", "spade"][i] + " completes a flush.", "cards": support})
	return out
