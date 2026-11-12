class_name GameSaveStore
extends RefCounted
const Session = preload("res://core/session.gd")
var directory: String

func _init(path: String = "user://saves"):
	directory = path

func read_valid(path: String) -> Dictionary:
	if not FileAccess.file_exists(path): return {"error": "Missing save"}
	var f = FileAccess.open(path, FileAccess.READ)
	if f == null or f.get_length() > 4000000: return {"error": "Unreadable save"}
	return Session.restore(f.get_as_text())

func inspect() -> Dictionary:
	var current = read_valid(directory + "/game.json")
	if not current.has("error"): return {"status": "saved", "state": current}
	var backup = read_valid(directory + "/recovery.json")
	if not backup.has("error"): return {"status": "recovery", "state": backup}
	return {"status": "damaged" if FileAccess.file_exists(directory + "/game.json") or FileAccess.file_exists(directory + "/recovery.json") else "empty"}

func write_checked(path: String, text: String) -> String:
	var f = FileAccess.open(path, FileAccess.WRITE)
	if f == null: return "Cannot write save: " + error_string(FileAccess.get_open_error())
	f.store_string(text)
	f.flush()
	var error = f.get_error()
	f.close()
	if error != OK: return "Save write failed: " + error_string(error)
	if read_valid(path).has("error"): return "Saved data did not validate"
	return ""

func save_game(state: Dictionary, replace: bool = false) -> String:
	var text = Session.encode(state)
	if Session.restore(text).has("error"): return "Cannot save invalid game state"
	var err = DirAccess.make_dir_recursive_absolute(directory)
	if err != OK: return "Cannot create save folder"
	var current = directory + "/game.json"
	var pending = directory + "/pending.json"
	var error = write_checked(pending, text)
	if error != "": return error
	if FileAccess.file_exists(current):
		if read_valid(current).has("error"):
			if not replace: return "Existing save is damaged. Choose recovery or replacement first."
			if DirAccess.rename_absolute(current, directory + "/damaged-%d.json" % Time.get_ticks_usec()) != OK: return "Cannot preserve damaged save"
		else:
			error = write_checked(directory + "/recovery.tmp", FileAccess.get_file_as_string(current))
			if error != "": return error
			if DirAccess.rename_absolute(directory + "/recovery.tmp", directory + "/recovery.json") != OK: return "Cannot update recovery copy"
	if DirAccess.rename_absolute(pending, current) != OK: return "Cannot replace current save"
	return ""
