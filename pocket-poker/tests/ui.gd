extends SceneTree
const Main = preload("res://main.tscn")
const Session = preload("res://core/session.gd")
const Poker = preload("res://core/poker.gd")
const Store = preload("res://core/save_store.gd")
var app
func find_button(node: Node, text: String):
	if node is Button and node.text == text: return node
	for child in node.get_children():
		var found = find_button(child, text)
		if found != null: return found
	return null
func press(text: String):
	var b = find_button(app, text)
	assert(b != null, "Missing visible control: " + text)
	b.pressed.emit()
func _initialize(): call_deferred("run")
func run():
	app = Main.instantiate()
	root.add_child(app)
	app.store = Store.new("user://ui-test-%d" % Time.get_ticks_usec())
	await process_frame
	press("Play")
	press("Pass & Play")
	assert(find_button(app, "Start game") != null)
	# A known completed hole-card deal reaches the same handoff as animated dealing.
	var s = Session.start(["Alex", "Blair"], Poker.full_deck())
	for i in range(4): s = Session.command(s, {"type":"deal"})
	app.resume_saved(s)
	press("Next turn")
	press("I'm ready")
	assert(find_button(app,"Hold to peek") != null)
	press("Call 1")
	assert(app.dialog != null and app.game.game.pot == 3)
	app.dialog.confirmed.emit()
	assert(app.game.game.pot == 4 and app.game.phase == "handoff")
	press("Save & Leave")
	assert(app.dialog != null)
	app.dialog.confirmed.emit()
	assert(find_button(app,"Play") != null)
	assert(app.store.inspect().status == "saved")
	# Interrupted playback must stop, keep committed cards, and resume without duplicates.
	var partial = Session.start(["One","Two"],Poker.full_deck())
	partial = Session.command(partial,{"type":"interrupt"})
	app.resume_saved(partial)
	press("Continue deal")
	await create_timer(.1).timeout
	app.conceal()
	var cursor = app.game.game.cursor
	assert(cursor == 1 and app.game.phase == "public")
	await create_timer(1.0).timeout
	assert(app.game.game.cursor == cursor and not app.dealing_busy)
	app.reduced_motion = true
	press("Continue deal")
	for wait in range(50):
		if not app.dealing_busy and app.game.phase != "dealing": break
		await create_timer(.1).timeout
	assert(app.game.game.cursor == 4 and app.game.phase == "public")
	press("Next turn")
	press("I'm ready")
	var peek = find_button(app,"Hold to peek")
	peek.button_down.emit()
	assert(app.game.peeking)
	peek.button_up.emit()
	assert(not app.game.peeking)
	peek.button_down.emit()
	app.conceal()
	assert(app.game.phase == "handoff" and not app.game.peeking)
	assert(Session.view(app.game).seats.all(func(p): return p.cards.is_empty()))
	assert(app.store.inspect().status == "saved")
	# Public all-in runout: each street waits, then automatic payout and one popup.
	var allin = Session.start(["A","B","C","D","E","F","G","H"],Poker.full_deck(),0,"hold",true,true)
	for i in range(16): allin = Session.command(allin,{"type":"deal"})
	allin = Session.command(allin,{"type":"continue"})
	while not allin.game.public_cards:
		allin = Session.command(allin,{"type":"ready"})
		var legal = Poker.legal(allin.game)
		allin = Session.command(allin,{"type":"bet","action":"raise" if legal.can_raise else "call","amount":legal.max})
	allin = Session.command(allin,{"type":"ready"})
	allin = Session.command(allin,{"type":"vote","twice":false})
	app.resume_saved(allin)
	assert(app.reduced_motion and Session.restore(Session.encode(allin)).reduced_motion)
	press("Cancel equity")
	assert(app.equity_cancelled and app.equity_results.is_empty())
	for street in ["Flop","Turn","River"]:
		press("Deal " + street)
		await process_frame
		for wait in range(50):
			if not app.dealing_busy and app.game.phase != "dealing": break
			await create_timer(.1).timeout
		assert(not app.dealing_busy and app.game.phase != "dealing", "Street must finish within the bounded wait")
	assert(app.game.phase == "result" and app.game.game.pot == 0)
	assert(app.game.game.stacks.reduce(func(a,b): return a+b,0) == 160)
	assert(app.dialog != null)
	app.dialog.confirmed.emit()
	app.resume_saved(app.store.inspect().state)
	await process_frame
	assert(app.dialog == null and app.game.phase == "result")
	print("Native UI navigation, private turn, confirmed betting and saved exit: passed")
	app.queue_free()
	await process_frame
	quit()
