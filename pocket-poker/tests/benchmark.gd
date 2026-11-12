extends SceneTree
const Poker = preload("res://core/poker.gd")
const Equity = preload("res://core/equity.gd")
func _initialize():
	for n in [2,8]:
		var deck = Poker.full_deck()
		var hands = []
		for i in range(n): hands.append([deck.pop_front(),deck.pop_front()])
		for size in [0,3,4,5]:
			var rng = RandomNumberGenerator.new()
			rng.seed = 42
			var start = Time.get_ticks_msec()
			var result = Equity.new().calculate({"hands":hands,"boards":[deck.slice(0,size)]},rng)
			assert(result[0].done and result[0].completed == result[0].total)
			assert(is_equal_approx(result[0].players.reduce(func(a,p): return a+p.equity,0.0),1.0))
			print("%d players, %d board cards: %d ms (%d boards)" % [n,size,Time.get_ticks_msec()-start,result[0].total])
	var two_hands = [["As","Ad"],["Ks","Kd"]]
	var start = Time.get_ticks_msec()
	var two = Equity.new().calculate({"hands":two_hands,"boards":[[],[]]})
	assert(two.size() == 2 and two.all(func(r): return r.completed == 20000))
	print("Two-player, two-board preflop: %d ms" % (Time.get_ticks_msec()-start))
	quit()
