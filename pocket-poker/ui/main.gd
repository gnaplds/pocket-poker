extends Control

const Poker = preload("res://core/poker.gd")
const Session = preload("res://core/session.gd")
const Store = preload("res://core/save_store.gd")
const Equity = preload("res://core/equity.gd")
const Card = preload("res://ui/card.gd")
const PAPER = Color("f5f4ee")
const INK = Color("173c32")
const GREEN = Color("245c49")
const BLUE = Color("4169e1")
const GOLD = Color("d5ae42")
const RED = Color("bb3541")
const GRAY = Color("65717a")

var screen = "home"
var game: Dictionary = {}
var store = Store.new()
var root: VBoxContainer
var margin: MarginContainer
var scroll: ScrollContainer
var content: VBoxContainer
var private_panel: VBoxContainer
var dialog: ConfirmationDialog
var players = 4
var names = ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6", "Player 7", "Player 8"]
var reveal = "hold"
var guidance = true
var reduced_motion = false
var save_error = ""
var unsaved_allowed = false
var pump_id = 0
var dealing_busy = false
var deal_ghost: Control
var deal_tween: Tween
var celebrated = -1
var frame: Control
var targets: Dictionary = {}
var equity_labels: Dictionary = {}
var equity_status: Label
var equity_key = ""
var equity_results: Array = []
var equity_seats: Array = []
var worker: Thread
var calculator
var equity_cancelled = false
var details_open: Dictionary = {}

func _ready():
	get_tree().auto_accept_quit = false
	var theme_data = Theme.new()
	theme_data.default_font_size = 16
	theme_data.set_color("font_color", "Label", INK)
	theme_data.set_color("font_color", "CheckButton", INK)
	theme_data.set_color("font_color", "LineEdit", INK)
	theme_data.set_stylebox("normal", "LineEdit", box(Color("fffdf6"), Color("a6b9a8")))
	for state in ["normal", "hover", "pressed", "focus"]:
		theme_data.set_stylebox(state, "Button", box(GREEN, Color("b2c4ac")))
		theme_data.set_color("font_color", "Button", Color.WHITE)
	theme = theme_data
	render()

func box(color: Color, border: Color = Color.TRANSPARENT, radius: int = 10) -> StyleBoxFlat:
	var style = StyleBoxFlat.new()
	style.bg_color = color
	style.border_color = border
	style.set_border_width_all(1)
	style.set_corner_radius_all(radius)
	style.content_margin_left = 12
	style.content_margin_right = 12
	style.content_margin_top = 10
	style.content_margin_bottom = 10
	return style

func label(parent: Node, text: String, font_size: int = 16, color: Color = INK) -> Label:
	var item = Label.new()
	item.text = text
	item.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	item.add_theme_font_size_override("font_size", font_size)
	item.add_theme_color_override("font_color", color)
	item.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	parent.add_child(item)
	return item

func button(parent: Node, text: String, callback: Callable, color: Color = GREEN) -> Button:
	var item = Button.new()
	item.text = text
	item.custom_minimum_size.y = 48
	item.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	item.add_theme_stylebox_override("normal", box(color))
	item.add_theme_stylebox_override("hover", box(color.lightened(.08)))
	item.add_theme_stylebox_override("pressed", box(color.darkened(.12)))
	item.add_theme_stylebox_override("disabled", box(color.darkened(.15)))
	item.add_theme_color_override("font_color", INK if color == GOLD else Color.WHITE)
	item.pressed.connect(callback)
	parent.add_child(item)
	return item

func row(parent: Node) -> HBoxContainer:
	var item = HBoxContainer.new()
	item.add_theme_constant_override("separation", 8)
	parent.add_child(item)
	return item

func column(parent: Node) -> VBoxContainer:
	var item = VBoxContainer.new()
	item.add_theme_constant_override("separation", 10)
	item.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	parent.add_child(item)
	return item

func panel(parent: Node, color: Color = Color("fffdf6"), border: Color = Color("ccd7c7")) -> VBoxContainer:
	var item = PanelContainer.new()
	item.add_theme_stylebox_override("panel", box(color, border))
	parent.add_child(item)
	return column(item)

func cards(parent: Node, values: Array, count: int = 2, small: bool = false, highlights: Array = []) -> HBoxContainer:
	var line = row(parent)
	line.alignment = BoxContainer.ALIGNMENT_CENTER
	for i in range(count):
		var c = Card.new()
		c.value = values[i] if i < values.size() else ""
		c.small = small
		c.marked = c.value in highlights
		line.add_child(c)
	return line

func navigate(next: String):
	conceal(false)
	stop_equity()
	screen = next
	render()

func render():
	var previous_scroll = scroll.scroll_vertical if is_instance_valid(scroll) else 0
	if is_instance_valid(frame):
		remove_child(frame)
		frame.queue_free()
	targets.clear()
	equity_labels.clear()
	private_panel = null
	frame = MarginContainer.new()
	frame.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(frame)
	margin = frame
	for side in ["left", "right", "top", "bottom"]: margin.add_theme_constant_override("margin_" + side, 16)
	apply_safe_area()
	root = column(frame)
	if screen != "home": header()
	if screen == "game": community(Session.view(game))
	scroll = ScrollContainer.new()
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root.add_child(scroll)
	content = column(scroll)
	match screen:
		"home": opening()
		"modes": modes()
		"setup": setup()
		"game": table()
	if screen == "game": scroll.set_deferred("scroll_vertical", previous_scroll)

func apply_safe_area():
	if not OS.has_feature("android"): return
	var safe = DisplayServer.get_display_safe_area()
	var display = DisplayServer.screen_get_size()
	var viewport = get_viewport_rect().size
	var scale = viewport / Vector2(display)
	margin.add_theme_constant_override("margin_left", 16 + int(safe.position.x * scale.x))
	margin.add_theme_constant_override("margin_top", 12 + int(safe.position.y * scale.y))
	margin.add_theme_constant_override("margin_right", 16 + int((display.x - safe.end.x) * scale.x))
	margin.add_theme_constant_override("margin_bottom", 12 + int((display.y - safe.end.y) * scale.y))

func header():
	var line = row(root)
	var icon = TextureRect.new()
	icon.texture = preload("res://icon.svg")
	icon.custom_minimum_size = Vector2(36, 36)
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	line.add_child(icon)
	label(line, "Pocket Poker", 23)
	var back = button(line, "Save & Leave" if screen == "game" else "Back", go_back)
	back.size_flags_horizontal = Control.SIZE_SHRINK_END

func opening():
	var gap = Control.new()
	gap.custom_minimum_size.y = 100
	content.add_child(gap)
	var icon = TextureRect.new()
	icon.texture = preload("res://icon.svg")
	icon.custom_minimum_size = Vector2(128, 128)
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	content.add_child(icon)
	label(content, "Pocket Poker", 38).horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label(content, "One phone. A seat for everyone.", 18).horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	button(content, "Play", func(): navigate("modes"))
	label(content, "Offline · Pass & Play", 14).horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER

func modes():
	label(content, "Choose your table", 26)
	button(content, "Pass & Play", func(): navigate("setup"))
	var saved = store.inspect()
	if saved.status == "saved":
		button(content, "Resume game", func(): resume_saved(saved.state))
	elif saved.status == "recovery":
		label(content, "The latest save is damaged. A recovery copy is available.", 16, RED)
		button(content, "Recover game", func(): confirm("Recover previous save?", "The most recent action may be missing. The damaged file will be preserved.", func():
			var error = store.save_game(saved.state, true)
			if error != "": inform(error)
			else: resume_saved(saved.state)))
	elif saved.status == "damaged": label(content, "The saved game cannot be read. Starting a new game needs confirmation.", 16, RED)
	button(content, "Simulation · Coming later", func(): pass).disabled = true
	button(content, "Equity · Coming later", func(): pass).disabled = true

func setup():
	label(content, "Your table", 26)
	label(content, "20 chips each · Blinds 1 / 2")
	var select = OptionButton.new()
	select.custom_minimum_size.y = 48
	for n in range(2, 9): select.add_item("%d players" % n, n)
	select.select(players - 2)
	select.item_selected.connect(func(index): players = index + 2; render())
	content.add_child(select)
	label(content, "Seat 1 is at the bottom. Enter names clockwise.", 14)
	for i in range(players):
		label(content, "Seat %d" % (i + 1), 14)
		var input = LineEdit.new()
		input.text = names[i]
		input.max_length = 20
		input.custom_minimum_size.y = 48
		input.text_changed.connect(func(value): names[i] = value)
		content.add_child(input)
	var method = OptionButton.new()
	method.add_item("Hold to peek")
	method.add_item("Tap to reveal")
	method.select(0 if reveal == "hold" else 1)
	method.custom_minimum_size.y = 48
	method.item_selected.connect(func(i): reveal = "hold" if i == 0 else "tap")
	content.add_child(method)
	var help = CheckButton.new()
	help.text = "Hand guidance for everyone"
	help.button_pressed = guidance
	help.toggled.connect(func(value): guidance = value)
	content.add_child(help)
	var motion = CheckButton.new()
	motion.text = "Reduced motion"
	motion.button_pressed = reduced_motion
	motion.toggled.connect(func(value): reduced_motion = value)
	content.add_child(motion)
	button(content, "Start game", func():
		if store.inspect().status != "empty": confirm("Replace saved game?", "Start a new group and new chip stacks?", begin_game)
		else: begin_game())

func begin_game():
	var deck = Poker.shuffled()
	var state = Session.start(names.slice(0, players), deck, randi_range(0, players - 1), reveal, guidance, reduced_motion)
	if state.has("error"):
		inform(state.error)
		return
	game = state
	equity_cancelled = false
	unsaved_allowed = false
	celebrated = -1
	save_error = store.save_game(game, true)
	screen = "game"
	render()
	if save_error != "": save_failed()
	else: pump()

func resume_saved(state: Dictionary):
	game = state
	equity_cancelled = false
	celebrated = game.hand if game.phase == "result" else -1
	reveal = game.reveal
	guidance = game.guidance
	reduced_motion = game.reduced_motion
	save_error = ""
	unsaved_allowed = false
	screen = "game"
	render()

func community(v: Dictionary):
	var area = panel(root, GREEN, GREEN)
	var top = row(area)
	label(top, "Pot %d" % v.pot, 20, Color.WHITE)
	var stage = "Hand complete" if v.settled else "Ready for showdown" if v.stage == "showdown" else v.stage.capitalize()
	label(top, ("Two runs" if v.boards.size() == 2 else "One board") + " · " + stage, 13, Color.WHITE).horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	for j in range(v.boards.size()):
		var line = row(area)
		var board_name = label(line, "A" if j == 0 else "B", 14, Color.WHITE)
		board_name.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
		board_name.custom_minimum_size.x = 24
		var card_line = cards(line, v.boards[j], 5)
		card_line.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		card_line.add_theme_constant_override("separation", 5)
		for k in range(card_line.get_child_count()): targets["board-%d-%d" % [j, k]] = card_line.get_child(k)
		if v.shared: label(area, "%d shared cards" % v.shared, 12, Color("d7e7c4"))
		for k in range(0 if dealing_busy else v.pots.size()):
			if j < v.pots[k].shares.size() and v.pots[k].shares[j] != null:
				var share = v.pots[k].shares[j]
				var winners = share.winners.map(func(i): return v.seats[i].name)
				label(area, ("Main pot" if k == 0 else "Side pot %d" % k) + " · " + " & ".join(winners) + " · %d chips" % share.amount, 13, Color("ffdf86"))

func table():
	var v = Session.view(game)
	label(content, "Hand %d · Blinds 1 / 2" % v.hand, 14)
	var felt = panel(content, Color("315c49"), Color("c1d1b7"))
	var felt_style = box(Color("315c49"),Color("c1d1b7"),160)
	felt.get_parent().add_theme_stylebox_override("panel",felt_style)
	var deck_line = row(felt)
	deck_line.alignment = BoxContainer.ALIGNMENT_CENTER
	var deck_cards = cards(deck_line, [], 1, true)
	targets["deck"] = deck_cards.get_child(0)
	label(deck_line, "%d in deck · %d burns" % [v.remaining, v.burns], 12, Color.WHITE)
	var burns = cards(deck_line, [], 1, true)
	targets["burn"] = burns.get_child(0)
	var grid = GridContainer.new()
	grid.columns = 3
	grid.add_theme_constant_override("h_separation", 6)
	grid.add_theme_constant_override("v_separation", 8)
	felt.add_child(grid)
	# Fixed clockwise seats in compact paired rows, with top/bottom seats centered.
	var n = v.seats.size()
	var rows = int(ceil(float(n - 2) / 2)) + 2
	for r in range(rows):
		for col in range(3):
			var i = -1
			if r == 0 and col == 1: i = int(n / 2)
			elif r == rows - 1 and col == 1: i = 0
			elif r > 0 and r < rows - 1:
				if col == 0: i = int(n / 2) - r
				elif col == 2: i = int(n / 2) + r
				if i <= 0 or i >= n: i = -1
			if i < 0:
				var empty = Control.new()
				empty.size_flags_horizontal = Control.SIZE_EXPAND_FILL
				grid.add_child(empty)
			else: seat(grid, v, i)
	if v.public_cards:
		equity_status = label(content, "Hand equity · equal pot, not side-pot payouts. Public cards only.", 12)
		var eq_buttons = row(content)
		button(eq_buttons, "Cancel equity", func(): stop_equity(); equity_cancelled = true; equity_status.text = "Equity cancelled"; update_equity_labels())
		button(eq_buttons, "Calculate again", func(): equity_cancelled = false; equity_key = ""; sync_equity(v))
	if save_error != "":
		label(content, "Not saved: " + save_error, 14, RED)
		button(content, "Retry save", func(): persist(); render(); if_can_pump())
	var turn = panel(content)
	turn_controls(turn, v)
	if v.phase == "result" and not dealing_busy: results(content, v)
	history(v)
	sync_equity(v)
	if v.phase == "result" and not dealing_busy and celebrated != v.hand:
		celebrated = v.hand
		call_deferred("winner_dialog", v)

func seat(parent: Node, v: Dictionary, i: int):
	var p = v.seats[i]
	var color = {"neutral":Color("f5f5e9"),"red":Color("eed8d7"),"blue":Color("dce6ff"),"green":Color("d9f0df"),"gold":Color("f9e7ad")}[p.color]
	if v.settled and p.award == 0: color = Color("daddd6")
	var area = panel(parent, color, Color("7649a8") if i == v.actor else GOLD if p.award > 0 else Color("a9baa1"))
	var seat_style = box(color, Color("7649a8") if i == v.actor else GOLD if p.award > 0 else Color("a9baa1"))
	seat_style.content_margin_left = 4
	seat_style.content_margin_right = 4
	area.get_parent().add_theme_stylebox_override("panel",seat_style)
	area.get_parent().size_flags_horizontal = Control.SIZE_EXPAND_FILL
	area.add_theme_constant_override("separation", 2)
	label(area, p.name + (" · D" if i == v.button else ""), 14).horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label(area, p.position, 11).horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label(area, "%d chips" % p.stack, 12).horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	var line = cards(area, p.cards if p.public else [], 2, true)
	for j in range(2): targets["hole-%d-%d" % [i,j]] = line.get_child(j)
	for j in range(0 if dealing_busy else p.categories.size()):
		if p.categories[j] != "": label(area, (("A: " if j == 0 else "B: ") if v.boards.size() == 2 else "") + p.categories[j], 11).horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	equity_labels[i] = label(area, "", 11)
	label(area, "Won %d" % p.award if p.award > 0 and not dealing_busy else p.last_action, 11).horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	if v.settled and p.award == 0: area.get_parent().modulate.a = .7
	if p.award > 0 and not reduced_motion and not dealing_busy:
		var tween = area.create_tween().set_loops(3)
		tween.tween_property(area, "modulate", Color(1.16,1.10,.8), .5)
		tween.tween_property(area, "modulate", Color.WHITE, .5)

func turn_controls(parent: Node, v: Dictionary):
	if dealing_busy:
		label(parent, "Dealing…", 23)
		return
	match v.phase:
		"dealing": label(parent, "Dealing…", 23)
		"handoff":
			label(parent, "♣  ♥  ◇  ♠  ♦", 24).horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
			label(parent, "Pass to " + v.seats[v.actor].name, 24)
			label(parent, "Cards are public. Choose one run or two." if v.public_cards else "Only this player should use the phone.", 14)
			button(parent, "I'm ready", func(): send({"type":"ready"}))
		"public":
			label(parent, "Ready for " + v.next_street + "?" if v.next_street != "" else "Take a look", 23)
			label(parent, "Continue when everyone is ready.", 14)
			button(parent, "Deal " + v.next_street if v.next_street != "" else "Next turn" if v.actor >= 0 else "Continue deal", func(): send({"type":"continue"}))
		"showdown":
			label(parent, "Ready for Showdown", 24)
			button(parent, "Showdown", func(): send({"type":"showdown"}))
		"result":
			var alive = v.seats.filter(func(p): return p.stack > 0)
			label(parent, alive[0].name + " wins the game!" if alive.size() == 1 else "Hand result", 24)
			if alive.size() > 1: button(parent, "Next Hand", func(): send({"type":"next_hand","deck":Poker.shuffled()}))
		"turn":
			label(parent, v.seats[v.actor].name, 23)
			var peek = button(parent, "Hold for guidance" if v.public_cards else "Hold to peek", func(): pass, GRAY)
			peek.custom_minimum_size.y = 62
			private_panel = column(parent)
			if reveal == "hold":
				peek.button_down.connect(func(): show_peek(true))
				peek.button_up.connect(func(): show_peek(false))
				peek.mouse_exited.connect(func(): show_peek(false))
				peek.focus_exited.connect(func(): show_peek(false))
			else:
				peek.text = "Show / hide guidance" if v.public_cards else "Reveal / hide cards"
				peek.pressed.connect(func(): show_peek(not game.peeking))
			show_peek(false)
			if v.voting:
				button(parent, "Run it twice", func(): send({"type":"vote","twice":true}))
				button(parent, "Run once", func(): send({"type":"vote","twice":false}))
			else: betting_controls(parent, v)
			button(parent, "Pause turn", func(): send({"type":"hide"}), GRAY)

func betting_controls(parent: Node, v: Dictionary):
	var l = v.legal
	label(parent, "%d chips left · %s" % [v.seats[v.actor].stack, "%d to call" % l.call if l.owed else "Nothing to call"], 14)
	var line = row(parent)
	button(line, "Fold", func(): confirm_bet("fold"), RED)
	button(line, "Call %d" % l.call if l.owed else "Check", func(): confirm_bet("call" if l.owed else "check"))
	label(parent, "Bet size", 14)
	var slider = HSlider.new()
	slider.min_value = l.min
	slider.max_value = l.max
	slider.step = 1
	slider.value = l.min
	slider.editable = l.can_raise and l.min < l.max
	slider.custom_minimum_size.y = 44
	parent.add_child(slider)
	label(parent, "Min · %d                                      Max · %d" % [l.min,l.max], 12)
	var raise_button = button(parent, "Raise", func(): confirm_bet("raise", int(slider.value)), BLUE)
	raise_button.disabled = not l.can_raise
	var detail = label(parent, "", 13)
	var update = func(value):
		raise_button.text = "All-in %d" % v.seats[v.actor].stack if value == l.max else ("Raise to " if game.game.current_bet > 0 else "Bet ") + str(int(value))
		raise_button.add_theme_stylebox_override("normal", box(GOLD if value == l.max else BLUE))
		raise_button.add_theme_color_override("font_color", INK if value == l.max else Color.WHITE)
		detail.text = "%d total this round · %d chips now" % [value,value-v.seats[v.actor].paid] if l.can_raise else "Raising is unavailable. Use Call or Check."
	slider.value_changed.connect(update)
	update.call(slider.value)
	label(parent, "Raise-to includes chips already paid. Max uses your full stack.", 12)

func show_peek(show: bool):
	if game.is_empty() or game.phase != "turn" or not is_instance_valid(private_panel): return
	game = Session.command(game, {"type":"peek","show":show})
	for child in private_panel.get_children():
		private_panel.remove_child(child)
		child.queue_free()
	var v = Session.view(game)
	cards(private_panel, v.seats[v.actor].cards if show else [], 2)
	if show and game.guidance:
		for j in range(v.boards.size()):
			if v.boards.size() == 2: label(private_panel, "Board " + ("A" if j == 0 else "B"), 16)
			guidance_view(private_panel, v.seats[v.actor].cards, v.boards[j], true)

func guidance_view(parent: Node, hole: Array, board: Array, draws: bool):
	var g = Poker.guide(hole, board)
	if g.is_empty(): return
	label(parent, "You have · " + g.category, 17)
	label(parent, g.description, 13)
	if not g.cards.is_empty():
		guided_cards(parent, g.cards, hole, g.defining)
		label(parent, "Outlined cards make the hand; others are kickers.", 12)
	if draws:
		for draw in g.draws:
			label(parent, draw.title + " · " + draw.description, 13)
			guided_cards(parent, draw.cards, hole, draw.cards)
		if not g.draws.is_empty(): label(parent, "Completing a draw does not guarantee winning.", 12)

func guided_cards(parent: Node, values: Array, hole: Array, defining: Array):
	var line = row(parent)
	line.alignment = BoxContainer.ALIGNMENT_CENTER
	for value in values:
		var item = column(line)
		cards(item, [value], 1, true, defining)
		label(item, "Hand" if value in hole else "Board", 11).horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER

func history(v: Dictionary):
	label(content, "Betting history", 21)
	var rounds = [{"stage":"preflop","board":0}]
	for event in game.game.log:
		if event.kind == "board" and event.end: rounds.append({"stage":event.stage,"board":event.board})
	for entry in rounds:
		label(content, entry.stage.capitalize() + (" · " + ("A" if entry.board == 0 else "B") if v.boards.size() == 2 and entry.stage != "preflop" else ""), 16)
		var actions = v.history.filter(func(a): return a.stage == entry.stage and a.board == entry.board)
		if actions.is_empty(): label(content, "No betting", 13)
		for a in actions: label(content, v.seats[a.player].name + ": " + a.text, 13)

func results(parent: Node, v: Dictionary):
	for i in range(v.seats.size()):
		var p = v.seats[i]
		var area = panel(parent)
		var expanded = details_open.get(i, false)
		button(area, ("▾ " if expanded else "▸ ") + p.name + (" · Won %d" % p.award if p.award else " · No pot won"), func(): details_open[i] = not expanded; render(), GREEN if p.award else GRAY)
		if expanded:
			if not p.public: label(area, "Cards remain private.", 14)
			else:
				cards(area, p.cards)
				for j in range(v.boards.size()):
					label(area, "Board " + ("A" if j == 0 else "B") + " · " + p.categories[j], 16)
					if game.guidance: guidance_view(area, p.cards, v.boards[j], false)

func confirm_bet(action: String, amount: int = 0):
	var cmd = {"type":"bet","action":action,"amount":amount}
	var validation = Session.command(game, cmd)
	if validation.has("error"): inform(validation.error); return
	show_peek(false)
	var v = Session.view(game)
	var text = "raise to %d chips (%d more)" % [amount, amount - v.seats[v.actor].paid] if action == "raise" else "call %d chips" % v.legal.call if action == "call" else action
	confirm("Confirm " + action, v.seats[v.actor].name + ", are you sure you want to " + text + "?", func(): send(cmd))

func confirm(title_text: String, body: String, accepted: Callable, yes: String = "Confirm"):
	close_dialog()
	dialog = ConfirmationDialog.new()
	dialog.title = title_text
	dialog.dialog_text = body
	dialog.ok_button_text = yes
	dialog.cancel_button_text = "Go back"
	dialog.get_label().autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	dialog.get_label().custom_minimum_size.x = 260
	dialog.get_ok_button().custom_minimum_size.y = 48
	dialog.get_cancel_button().custom_minimum_size.y = 48
	dialog.add_theme_stylebox_override("panel", box(PAPER, GOLD, 16))
	add_child(dialog)
	dialog.confirmed.connect(func(): close_dialog(); accepted.call())
	dialog.canceled.connect(close_dialog)
	dialog.popup_centered(Vector2i(mini(360, int(get_viewport_rect().size.x) - 24), 230))

func close_dialog():
	if is_instance_valid(dialog):
		dialog.hide()
		dialog.queue_free()
		dialog = null

func inform(text: String):
	confirm("Pocket Poker", text, func(): pass, "OK")

func winner_dialog(v: Dictionary):
	if screen != "game" or game.hand != v.hand or game.phase != "result": return
	var winners = []
	for p in v.seats:
		if p.award > 0: winners.append("%s receives %d chips" % [p.name,p.award])
	confirm("♠  Hand complete", "\n".join(winners) + ("\nEveryone else folded." if not v.showdown else ""), func(): pass, "Continue")
	dialog.get_cancel_button().hide()
	if not reduced_motion:
		for i in range(30):
			var bit = ColorRect.new()
			bit.color = [GOLD,BLUE,RED,GREEN][i % 4]
			bit.size = Vector2(7,12)
			bit.position = Vector2(randf_range(0,size.x), -20)
			bit.mouse_filter = Control.MOUSE_FILTER_IGNORE
			add_child(bit)
			var tween = bit.create_tween()
			tween.tween_property(bit, "position:y", size.y + 20, randf_range(1.5,2.7))
			tween.tween_callback(bit.queue_free)

func persist() -> bool:
	save_error = store.save_game(game)
	if save_error == "": unsaved_allowed = false
	return save_error == ""

func save_failed():
	confirm("Game is not saved", save_error + "\nBetting and dealing are paused. Retry the save, or continue knowing progress could be lost.", func():
		if persist(): render(); if_can_pump()
		else: save_failed(), "Retry save")
	var extra = dialog.add_button("Continue without saving", false, "unsaved")
	extra.custom_minimum_size.y = 48
	dialog.custom_action.connect(func(action):
		if action == "unsaved":
			close_dialog()
			confirm("Continue unsaved?", "New progress may be lost if this app closes. Save & Leave stays blocked until saving works.", func(): unsaved_allowed = true; render(); if_can_pump()))

func send(command: Dictionary):
	if dealing_busy: return
	if command.type == "next_hand": equity_cancelled = false
	if save_error != "" and not unsaved_allowed: save_failed(); return
	var next = Session.command(game, command)
	if next.has("error"): inform(next.error); return
	game = next
	var saved = persist()
	render()
	if not saved and not unsaved_allowed: save_failed()
	else: if_can_pump()

func if_can_pump():
	if screen == "game" and game.phase == "dealing": pump()

func clear_deal_animation():
	if is_instance_valid(deal_tween): deal_tween.kill()
	if is_instance_valid(deal_ghost): deal_ghost.queue_free()
	dealing_busy = false

func pump():
	pump_id += 1
	var token = pump_id
	stop_equity()
	equity_cancelled = false
	scroll.scroll_vertical = 0
	await get_tree().process_frame
	while screen == "game" and token == pump_id and game.phase == "dealing":
		dealing_busy = true
		var next = Session.command(game, {"type":"deal"})
		if next.has("error"):
			clear_deal_animation()
			inform(next.error)
			return
		game = next
		if not persist() and not unsaved_allowed:
			clear_deal_animation()
			render()
			save_failed()
			return
		var v = Session.view(game)
		render()
		await get_tree().process_frame
		if token != pump_id: return
		var event = v.event
		var key = "burn"
		if event.kind == "hole": key = "hole-%d-%d" % [event.player, game.game.hands[event.player].size()-1]
		elif event.kind == "board": key = "board-%d-%d" % [event.board, v.boards[event.board].size()-1]
		var target = targets.get(key)
		if is_instance_valid(target):
			if event.kind == "hole": scroll.ensure_control_visible(target)
			else: scroll.scroll_vertical = 0
			await get_tree().process_frame
			if token != pump_id: return
			if not reduced_motion:
				deal_ghost = Card.new()
				deal_ghost.value = event.get("card", "") if event.kind == "board" else ""
				deal_ghost.mouse_filter = Control.MOUSE_FILTER_IGNORE
				add_child(deal_ghost)
				deal_ghost.global_position = targets.deck.global_position if event.kind != "hole" else Vector2(size.x / 2, 220)
				target.modulate.a = 0
				deal_tween = create_tween()
				deal_tween.tween_property(deal_ghost,"global_position",target.global_position,.65).set_trans(Tween.TRANS_QUAD)
		await get_tree().create_timer(.85 if not reduced_motion else .05).timeout
		if token != pump_id: return
		clear_deal_animation()
		if is_instance_valid(target): target.modulate.a = 1
	dealing_busy = false
	if token == pump_id and screen == "game": render()

func conceal(redraw: bool = true):
	pump_id += 1
	clear_deal_animation()
	close_dialog()
	if game.is_empty() or screen != "game": return
	game = Session.command(game, {"type":"interrupt"})
	persist()
	stop_equity()
	if redraw: render()

func go_back():
	if is_instance_valid(dialog): close_dialog(); return
	if screen == "game":
		conceal()
		confirm("Save & Leave?", "Save this game and return to the opening screen?", func():
			if persist(): navigate("home")
			else: save_failed(), "Save & Leave")
	elif screen == "home": get_tree().quit()
	else: navigate("home" if screen == "modes" else "modes")

func _notification(what):
	if not is_node_ready(): return
	if what in [NOTIFICATION_APPLICATION_FOCUS_OUT, NOTIFICATION_APPLICATION_PAUSED]: conceal()
	elif what in [NOTIFICATION_WM_GO_BACK_REQUEST, NOTIFICATION_WM_CLOSE_REQUEST]: go_back()
	elif what == NOTIFICATION_RESIZED and is_instance_valid(margin): apply_safe_area()

func stop_equity():
	if calculator != null: calculator.cancel()
	if worker != null and worker.is_started(): worker.wait_to_finish()
	worker = null
	calculator = null
	equity_key = ""
	equity_results = []

func sync_equity(v: Dictionary):
	if not v.public_cards or v.phase == "dealing" or dealing_busy or equity_cancelled: return
	if v.boards.any(func(b): return b.size() not in [0,3,4,5]): return
	var seats = []
	for i in range(v.seats.size()):
		if v.seats[i].public and not v.seats[i].folded: seats.append(i)
	if seats.size() < 2: return
	var snapshot = {"hands":seats.map(func(i): return v.seats[i].cards),"boards":v.boards}
	var key = JSON.stringify([seats,snapshot])
	if key != equity_key:
		stop_equity()
		equity_key = key
		equity_seats = seats
		calculator = Equity.new()
		worker = Thread.new()
		var error = worker.start(calculator.calculate.bind(snapshot.duplicate(true)))
		if error != OK:
			equity_status.text = "Equity unavailable. You can continue playing."
			worker = null
	update_equity_labels()

func update_equity_labels():
	for k in range(equity_seats.size()):
		var seat_label = equity_labels.get(equity_seats[k])
		if not is_instance_valid(seat_label): continue
		var lines = []
		for j in range(game.game.boards.size()):
			var result = equity_results[j] if j < equity_results.size() else {}
			var text = "Equity cancelled" if equity_cancelled else "… equity"
			if not result.is_empty() and not result.players.is_empty(): text = ("" if result.exact else "≈ ") + "%.1f%% equity" % (result.players[k].equity*100)
			lines.append((("A: " if j == 0 else "B: ") if game.game.twice else "") + text)
		seat_label.text = "\n".join(lines)

func _process(_delta):
	if calculator == null or screen != "game": return
	for update in calculator.drain():
		while equity_results.size() <= update.board: equity_results.append({})
		equity_results[update.board] = update
		if is_instance_valid(equity_status): equity_status.text = "Hand equity · %s · %d/%d boards\nEqual pot, not side-pot payouts. Public cards only." % ["Exact" if update.exact else "Estimated",update.completed,update.total]
		update_equity_labels()
	if worker != null and not worker.is_alive():
		var result = worker.wait_to_finish()
		worker = null
		if result is Array and not result.is_empty() and result[0].has("error") and is_instance_valid(equity_status): equity_status.text = result[0].error

func _exit_tree():
	stop_equity()
