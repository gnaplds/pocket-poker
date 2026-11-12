extends PanelContainer
var value = ""
var marked = false
var small = false

func _ready():
	custom_minimum_size = Vector2(43, 62) if not small else Vector2(32, 46)
	var style = StyleBoxFlat.new()
	style.bg_color = Color("fffdf6") if value != "" else Color("315f4e")
	style.border_color = Color("b88b23") if marked else Color("ccd7c7")
	style.set_border_width_all(3 if marked else 1)
	style.set_corner_radius_all(5)
	add_theme_stylebox_override("panel", style)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	var label = Label.new()
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", 24 if not small else 19)
	label.add_theme_color_override("font_color", Color("b52f3d") if value != "" and value[1] in "dh" else Color("183c32") if value != "" else Color("e6eddf"))
	label.text = "◆" if value == "" else ("10" if value[0] == "T" else value[0]) + "\n" + {"s":"♠", "c":"♣", "h":"♥", "d":"♦"}[value[1]]
	add_child(label)
