extends SceneTree
const Main = preload("res://main.tscn")
const Session = preload("res://core/session.gd")
const Poker = preload("res://core/poker.gd")
var app
var viewport
func _initialize(): call_deferred("run")
func snap(path):
	await process_frame
	await process_frame
	await RenderingServer.frame_post_draw
	viewport.get_texture().get_image().save_png(path)
func run():
	viewport = SubViewport.new()
	viewport.size = Vector2i(432,900)
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	viewport.gui_embed_subwindows = true
	root.add_child(viewport)
	app = Main.instantiate()
	viewport.add_child(app)
	await snap("/tmp/pocket-godot-opening.png")
	var s = Session.start(["Player 1","Player 2","Player 3","Player 4","Player 5","Player 6","Player 7","Player 8"], Poker.full_deck())
	for i in range(16): s = Session.command(s, {"type":"deal"})
	s = Session.command(s, {"type":"continue"})
	while not s.game.public_cards:
		if s.phase == "handoff": s = Session.command(s, {"type":"ready"})
		var l = Poker.legal(s.game)
		s = Session.command(s, {"type":"bet","action":"raise" if l.can_raise else "call","amount":l.max})
	while not s.voters.is_empty():
		s = Session.command(s, {"type":"ready"})
		s = Session.command(s, {"type":"vote","twice":true})
	s = Session.command(s, {"type":"continue"})
	for i in range(4): s = Session.command(s, {"type":"deal"})
	app.resume_saved(s)
	await snap("/tmp/pocket-godot-table.png")
	while s.phase != "result":
		s = Session.command(s, {"type":"continue" if s.phase == "public" else "deal"})
	app.resume_saved(s)
	await snap("/tmp/pocket-godot-result.png")
	app.winner_dialog(Session.view(s))
	await snap("/tmp/pocket-godot-winner.png")
	app.close_dialog()
	var private = Session.start(["Player 1","Player 2"], Poker.full_deck())
	for i in range(4): private = Session.command(private,{"type":"deal"})
	private = Session.command(private,{"type":"continue"})
	private = Session.command(private,{"type":"ready"})
	app.resume_saved(private)
	app.show_peek(true)
	await process_frame
	await process_frame
	app.scroll.scroll_vertical = 10000
	await snap("/tmp/pocket-godot-turn.png")
	quit()
