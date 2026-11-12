class_name PokerSession
extends RefCounted
const Poker = preload("res://core/poker.gd")

static func start(names: Array, deck: Array, button: int = 0, reveal: String = "hold", guidance: bool = true, reduced_motion: bool = false) -> Dictionary:
	if names.size() < 2 or names.size() > 8 or names.any(func(n): return not n is String or n.strip_edges().is_empty() or n.length() > 20) or reveal not in ["hold", "tap"]:
		return {"error": "Choose two to eight named players"}
	var g = Poker.create(Poker.filled(names.size(), 20), deck, button)
	if g.has("error"): return g
	return {"names": names, "reveal": reveal, "guidance": guidance, "reduced_motion": reduced_motion, "game": g, "hand": 1, "phase": "dealing", "peeking": false, "voters": [], "run_choice": 0, "seed": deal_seed(g), "moves": []}

static func deal_seed(g: Dictionary) -> Dictionary:
	var stacks = []
	for i in range(g.players): stacks.append(g.stacks[i] + g.paid[i])
	return {"stacks": stacks, "deck": g.deck.duplicate(), "button": g.button, "sb": g.sb, "bb": g.bb}

static func route(s: Dictionary, pause: bool = false):
	s.peeking = false
	if s.game.stage == "showdown" and s.game.public_cards:
		s.game = Poker.showdown(s.game)
	if s.game.settled: s.phase = "result"
	elif s.game.stage == "showdown": s.phase = "showdown"
	elif s.run_choice == 0 and Poker.can_run_twice(s.game):
		s.voters = []
		for k in range(s.names.size()):
			var i = (s.game.button + 1 + k) % s.names.size()
			if not s.game.folded[i]: s.voters.append(i)
		s.phase = "handoff"
	elif pause: s.phase = "public"
	else: s.phase = "dealing" if s.game.actor == -1 else "handoff"

static func command(state: Dictionary, c: Dictionary) -> Dictionary:
	var s = state.duplicate(true)
	var changed = false
	match c.get("type", ""):
		"deal":
			if s.phase != "dealing": return {"error": "Wait for shared readiness"}
			s.game = Poker.deal(s.game)
			changed = true
			if not s.game.has("error") and s.game.log[-1].end: route(s, true)
		"continue":
			if s.phase != "public": return {"error": "No public pause"}
			route(s)
		"ready":
			if s.phase != "handoff": return {"error": "No handoff waiting"}
			s.phase = "turn"
			s.peeking = false
		"peek":
			if s.phase != "turn": return {"error": "Acknowledge the turn"}
			s.peeking = c.get("show", false)
		"hide":
			s.peeking = false
			if s.phase == "turn": s.phase = "handoff"
		"interrupt":
			s.peeking = false
			if s.phase == "turn": s.phase = "handoff"
			elif s.phase == "dealing": s.phase = "public"
		"bet":
			if s.phase != "turn" or not s.voters.is_empty(): return {"error": "No betting turn"}
			s.game = Poker.act(s.game, c.get("action", ""), int(c.get("amount", 0)))
			changed = true
			if not s.game.has("error"): route(s, s.game.actor == -1)
		"vote":
			if s.phase != "turn" or s.voters.is_empty() or not c.get("twice") is bool: return {"error": "No vote waiting"}
			s.peeking = false
			if c.twice and s.voters.size() > 1:
				s.voters.pop_front()
				s.phase = "handoff"
			else:
				s.run_choice = 2 if c.twice else 1
				if c.twice: s.game = Poker.run_twice(s.game)
				s.voters = []
				s.phase = "public"
		"showdown":
			if s.phase != "showdown": return {"error": "Not ready for showdown"}
			s.game = Poker.showdown(s.game)
			changed = true
			if not s.game.has("error"): route(s)
		"next_hand":
			if s.phase != "result": return {"error": "Finish the hand first"}
			s.game = Poker.next_hand(s.game, c.get("deck", []))
			if s.game.has("error"): return s.game
			s.seed = deal_seed(s.game)
			s.moves = []
			s.hand += 1
			s.phase = "dealing"
			s.peeking = false
			s.voters = []
			s.run_choice = 0
			return s
		_: return {"error": "Unknown session action"}
	if changed and s.game.has("error"): return s.game
	# Replay confirmed transitions, never Peek state or UI input.
	if c.type != "peek": s.moves.append(c.duplicate(true))
	return s

static func view(s: Dictionary) -> Dictionary:
	var g = s.game
	var actor = s.voters[0] if not s.voters.is_empty() else g.actor
	var showdown = g.settled and g.folded.count(false) > 1
	var labels = Poker.positions(g)
	var seats = []
	for i in range(g.players):
		var public = (g.public_cards or showdown) and not g.folded[i]
		var visible = public or (s.phase == "turn" and s.peeking and actor == i)
		var categories = []
		if public:
			for b in g.boards:
				categories.append(Poker.rank(g.hands[i] + b).category if b.size() >= 3 else "")
		var color = "neutral"
		var action = g.actions[i]
		if action != null:
			match action.kind:
				"fold": color = "red"
				"all": color = "gold"
				"raise": color = "blue"
				"call": color = "green" if g.paid[i] == g.current_bet else "neutral"
		seats.append({"name": s.names[i], "position": labels[i], "stack": g.stacks[i], "paid": g.paid[i], "folded": g.folded[i], "seated": g.seated[i], "cards": g.hands[i].duplicate() if visible else [], "card_count": g.hands[i].size(), "public": public, "categories": categories, "award": g.awards[i], "color": color, "last_action": action.text if action != null else ""})
	var next = ""
	if s.phase == "public" and actor == -1 and g.queue.is_empty():
		next = {0: "Flop", 3: "Turn", 4: "River"}.get(g.boards[g.board].size(), "")
	var event = g.log[-1].duplicate(true) if not g.log.is_empty() else {}
	if not event.is_empty() and event.kind != "board": event.erase("card")
	return {"hand": s.hand, "phase": s.phase, "actor": actor, "voting": not s.voters.is_empty(), "seats": seats, "boards": g.boards.duplicate(true), "shared": g.shared, "stage": g.stage, "pot": g.pot, "button": g.button, "burns": g.burns.size(), "remaining": 52 - g.cursor, "public_cards": g.public_cards, "settled": g.settled, "showdown": showdown, "next_street": next, "legal": Poker.legal(g) if s.phase == "turn" and s.voters.is_empty() else {}, "pots": Poker.pot_results(g) if (g.public_cards or showdown or g.settled) else [], "history": g.history.duplicate(true), "event": event}

static func encode(s: Dictionary) -> String:
	return JSON.stringify({"version": 1, "names": s.names, "reveal": s.reveal, "guidance": s.guidance, "reduced_motion": s.reduced_motion, "seed": s.seed, "moves": s.moves, "hand": s.hand, "phase": s.phase})

static func integers(value):
	if value is float: return int(value) if is_finite(value) and value == floor(value) else value
	if value is Array: return value.map(integers)
	if value is Dictionary:
		var out = {}
		for key in value: out[key] = integers(value[key])
		return out
	return value

static func restore(text: String) -> Dictionary:
	var parser = JSON.new()
	if parser.parse(text) != OK: return {"error": "Invalid save JSON"}
	var raw = integers(parser.data)
	if not raw is Dictionary or raw.get("version") != 1: return {"error": "Unsupported save"}
	if not raw.get("names") is Array or not raw.get("seed") is Dictionary or not raw.get("moves") is Array or raw.moves.size() > 10000 or not raw.get("hand") is int or raw.hand < 1 or not raw.get("guidance") is bool or raw.get("reveal") not in ["hold", "tap"] or not raw.get("reduced_motion", false) is bool:
		return {"error": "Invalid save structure"}
	var seed_data = raw.seed
	if not seed_data.get("stacks") is Array or not seed_data.get("deck") is Array or not seed_data.get("button") is int or not seed_data.get("sb") is int or not seed_data.get("bb") is int:
		return {"error": "Invalid saved deal"}
	var s = start(raw.names, seed_data.deck, seed_data.button, raw.reveal, raw.guidance, raw.get("reduced_motion", false))
	if s.has("error"): return s
	if seed_data.stacks.size() != raw.names.size() or seed_data.stacks.reduce(func(a,b): return a + (b if b is int else -100000), 0) != raw.names.size() * 20:
		return {"error": "Saved chips do not balance"}
	s.game = Poker.create(seed_data.stacks, seed_data.deck, seed_data.button, seed_data.sb, seed_data.bb)
	if s.game.has("error"): return s.game
	s.seed = seed_data
	s.hand = raw.hand
	for move in raw.moves:
		if not move is Dictionary or move.get("type") not in ["deal", "continue", "ready", "bet", "vote", "showdown", "hide", "interrupt"]:
			return {"error": "Invalid saved transition"}
		if move.get("type") == "bet" and (not move.get("action") is String or not move.get("amount", 0) is int): return {"error": "Invalid saved bet"}
		s = command(s, move)
		if s.has("error"): return s
	s.peeking = false
	if s.phase in ["turn", "dealing"]: s = command(s, {"type": "interrupt"})
	return s
