extends SceneTree
const Poker = preload("res://core/poker.gd")
const Equity = preload("res://core/equity.gd")
func _initialize():
	var rng = RandomNumberGenerator.new()
	rng.seed = 12
	for i in range(100):
		var deck = Poker.full_deck()
		var cards = []
		for j in range(7): cards.append(deck.pop_at(rng.randi_range(0, deck.size() - 1)))
		assert(Equity.score(cards) == Poker.rank(cards).score, "Fast equity scoring must match best-five ranking")
	var e = Equity.new()
	var results = e.calculate({"hands": [["2c", "3c"], ["4c", "5c"]], "boards": [["As", "Ks", "Qs", "Js", "Ts"]]}, rng)
	assert(results[0].players[0].equity == 0.5 and results[0].players[1].tie == 1.0)
	var exact = e.calculate({"hands": [["As", "Ad"], ["Ks", "Kd"]], "boards": [["Ac", "Ah", "2c", "3d"]]}, rng)
	assert(exact[0].total == 44 and exact[0].players[0].equity == 1.0)
	var two = e.calculate({"hands":[["2c","3c"],["4c","5c"]], "boards":[["As","Ks","Qs","Js","Ts"],["As","Ks","Qs","Jd"]]},rng)
	assert(two.size() == 2 and two[0].players[0].equity == .5 and two[1].total == 42)
	assert(is_equal_approx(two[1].players[0].equity + two[1].players[1].equity, 1.0))
	assert(e.calculate({"hands":[["As","As"],["2c","3c"]], "boards":[[]]})[0].has("error"))
	var cancelled = Equity.new()
	cancelled.cancel()
	assert(cancelled.calculate({"hands":[["As","Ad"],["2c","3c"]], "boards":[[]]}).is_empty())
	assert(cancelled.drain().is_empty())
	print("Equity scoring, tie shares and exact enumeration: passed")
	quit()
