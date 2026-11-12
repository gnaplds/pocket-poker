class_name HandEquity
extends RefCounted
const Poker = preload("res://core/poker.gd")
var mutex = Mutex.new()
var stopped = false
var updates: Array = []

func cancel():
	mutex.lock()
	stopped = true
	mutex.unlock()

func cancelled() -> bool:
	mutex.lock()
	var value = stopped
	mutex.unlock()
	return value

func drain() -> Array:
	mutex.lock()
	var result = updates.duplicate(true)
	updates.clear()
	mutex.unlock()
	return result

static func straight_top(values: Array) -> int:
	var run = 0
	for v in range(14, 0, -1):
		if (14 if v == 1 else v) in values:
			run += 1
			if run == 5: return v + 4
		else: run = 0
	return 0

static func packed(cat: int, kick: Array) -> int:
	var value = cat
	for i in range(5): value = value * 15 + (kick[i] if i < kick.size() else 0)
	return value

static func score(cards: Array) -> int:
	var counts = Poker.filled(15, 0)
	var suits = [[], [], [], []]
	for c in cards:
		var v = Poker.RANKS.find(c[0]) + 2
		counts[v] += 1
		suits[Poker.SUITS.find(c[1])].append(v)
	var values = []
	var pairs = []
	var trips = []
	var four = 0
	for v in range(14, 1, -1):
		if counts[v] > 0: values.append(v)
		if counts[v] >= 2: pairs.append(v)
		if counts[v] >= 3: trips.append(v)
		if counts[v] == 4: four = v
	var flush = []
	for suit in suits:
		if suit.size() >= 5:
			suit.sort()
			suit.reverse()
			var sf = straight_top(suit)
			if sf: return packed(8, [sf])
			flush = suit
	if four: return packed(7, [four, values.filter(func(v): return v != four)[0]])
	if not trips.is_empty():
		var other = pairs.filter(func(v): return v != trips[0])
		if not other.is_empty(): return packed(6, [trips[0], other[0]])
	if not flush.is_empty(): return packed(5, flush.slice(0, 5))
	var straight = straight_top(values)
	if straight: return packed(4, [straight])
	if not trips.is_empty(): return packed(3, [trips[0]] + values.filter(func(v): return v != trips[0]).slice(0, 2))
	if pairs.size() >= 2: return packed(2, pairs.slice(0, 2) + values.filter(func(v): return v != pairs[0] and v != pairs[1]).slice(0, 1))
	if pairs.size() == 1: return packed(1, pairs + values.filter(func(v): return v != pairs[0]).slice(0, 3))
	return packed(0, values.slice(0, 5))

func calculate(snapshot: Dictionary, rng: RandomNumberGenerator = null) -> Array:
	if rng == null:
		rng = RandomNumberGenerator.new()
		rng.randomize()
	var hands = snapshot.get("hands", [])
	var boards = snapshot.get("boards", [])
	if hands.size() < 2 or hands.size() > 8 or boards.size() < 1 or boards.size() > 2:
		return [{"error": "Invalid equity input"}]
	var known = []
	for h in hands:
		if h.size() != 2: return [{"error": "Two hole cards required"}]
		for c in h:
			if c in known or c not in Poker.full_deck(): return [{"error": "Invalid hole cards"}]
			known.append(c)
	for b in boards:
		if b.size() not in [0, 3, 4, 5]: return [{"error": "Wait for a completed street"}]
		var seen = []
		for c in b:
			if c in seen or c in known or c not in Poker.full_deck(): return [{"error": "Invalid board"}]
			seen.append(c)
	var used = known.duplicate()
	for b in boards:
		for c in b:
			if c not in used: used.append(c)
	var deck = Poker.full_deck().filter(func(c): return c not in used)
	var output = []
	for j in range(boards.size()):
		var board = boards[j]
		var exact = not board.is_empty()
		var total = 20000 if not exact else 1 if board.size() == 5 else deck.size() if board.size() == 4 else deck.size() * (deck.size() - 1) / 2
		var sums = []
		for h in hands: sums.append({"equity": 0.0, "win": 0.0, "tie": 0.0})
		var done = 0
		var first = 0
		var second = 1
		while done < total:
			if cancelled(): return []
			var complete = board.duplicate()
			if not exact:
				var available = deck.duplicate()
				for k in range(5): complete.append(available.pop_at(rng.randi_range(0, available.size() - 1)))
			elif board.size() == 4: complete.append(deck[done])
			elif board.size() == 3:
				complete.append(deck[first])
				complete.append(deck[second])
				second += 1
				if second == deck.size():
					first += 1
					second = first + 1
			var scores = hands.map(func(h): return score(h + complete))
			var best = scores.max()
			var ties = scores.count(best)
			for i in range(hands.size()):
				if scores[i] == best:
					sums[i].equity += 1.0 / ties
					sums[i].win += 1.0 if ties == 1 else 0.0
					sums[i].tie += 1.0 if ties > 1 else 0.0
			done += 1
			if done % 250 == 0 or done == total:
				var report = {"board": j, "exact": exact, "done": done == total, "completed": done, "total": total, "players": []}
				if not exact or done == total:
					for p in sums: report.players.append({"equity": p.equity / done, "win": p.win / done, "tie": p.tie / done})
				mutex.lock()
				updates.append(report)
				mutex.unlock()
				if done == total: output.append(report)
	return output
