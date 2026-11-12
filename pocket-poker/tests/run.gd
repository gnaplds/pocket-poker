extends SceneTree

const Poker = preload("res://core/poker.gd")
var checks = 0
var failures = 0

func check(ok: bool, message: String):
	checks += 1
	if not ok:
		failures += 1
		if failures < 5:
			push_error(message)

func _initialize():
	var royal = Poker.rank(["As", "Ks", "Qs", "Js", "Ts", "2c", "3h"])
	check(royal.category == "Royal flush", "Royal flush from seven cards")
	check(Poker.rank(["As", "2d", "3c", "4h", "5s"]).score < Poker.rank(["2s", "3d", "4c", "5h", "6s"]).score, "Wheel loses to six-high straight")
	check(Poker.rank(["Ah", "Ad", "As", "Kh", "Kd", "Ks", "2c"]).category == "Full house", "Two triplets form full house")
	var g = Poker.create([20, 20], Poker.full_deck(), 0)
	for i in range(4):
		g = Poker.deal(g)
	check(g.stage == "preflop" and g.actor == 0, "Heads-up button acts first")
	g = Poker.act(g, "call")
	g = Poker.act(g, "check")
	check(g.actor == -1 and g.boards[0].is_empty(), "Betting finishes before dealing flop")
	for count in [4, 2, 2]:
		for i in range(count):
			g = Poker.deal(g)
		g = Poker.act(g, "check")
		g = Poker.act(g, "check")
	check(g.stage == "showdown" and g.pot == 4, "Private river waits for showdown")
	g = Poker.showdown(g)
	check(g.settled and g.stacks.reduce(func(a, b): return a + b, 0) == 40, "Showdown conserves chips")
	var fixtures = JSON.parse_string(FileAccess.get_file_as_string("res://tests/reference.json"))
	for fixture in fixtures:
		var stacks = fixture.stacks.map(func(v): return int(v))
		var state = Poker.create(stacks, fixture.deck, 0)
		for step in fixture.steps:
			var cmd = step.command
			match cmd.type:
				"deal": state = Poker.deal(state)
				"act": state = Poker.act(state, cmd.action, int(cmd.amount))
				"twice": state = Poker.run_twice(state)
				"showdown": state = Poker.showdown(state)
			for key in step.expected:
				check(state.get(key) == integers(step.expected[key]), "Web parity: %s / %s / %s" % [stacks, cmd, key])
	print("%d checks; %d failures" % [checks, failures])
	quit(1 if failures else 0)

func integers(value):
	if value is float: return int(value)
	if value is Array: return value.map(integers)
	return value
