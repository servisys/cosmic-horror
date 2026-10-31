extends Control
# Presentazione della fetta CT-TECH-001 (UI 2D + un solo elemento 3D minimo).
# FIXTURE TECNICA NON DI DESIGN. La logica e' in res://logic/game_logic.gd.
const GameLogic = preload("res://logic/game_logic.gd")

var g
var radice: BoxContainer
var lbl_stato: Label
var lbl_stato2: Label
var lbl_round: Label
var lbl_evento: Label
var btn_carta: Button
var btn_fine: Button
var log_txt: RichTextLabel
var oggetto: MeshInstance3D
var cont3d: SubViewportContainer


func _ready() -> void:
	g = GameLogic.new(GameLogic.carica_fixture("res://data/fixture.json"))
	_costruisci()
	resized.connect(_layout)
	_layout()
	_aggiorna()
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--demo="):
			_demo(a.substr(7))


func _process(delta: float) -> void:
	if oggetto:
		oggetto.rotate_y(0.6 * delta)
		oggetto.rotate_x(0.25 * delta)


func _etichetta(testo: String, dimensione: int, colore := Color(0.91, 0.91, 0.94)) -> Label:
	var l := Label.new()
	l.text = testo
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l.add_theme_font_size_override("font_size", dimensione)
	l.add_theme_color_override("font_color", colore)
	return l


func _pannello(colore: Color) -> PanelContainer:
	var p := PanelContainer.new()
	var s := StyleBoxFlat.new()
	s.bg_color = colore
	s.set_corner_radius_all(14)
	s.set_border_width_all(2)
	s.border_color = Color(0.23, 0.23, 0.36)
	s.set_content_margin_all(16)
	p.add_theme_stylebox_override("panel", s)
	return p


func _stile_pulsante(b: Button) -> void:
	for nome in ["normal", "hover", "pressed", "disabled"]:
		var st := StyleBoxFlat.new()
		st.set_corner_radius_all(10)
		st.bg_color = {"normal": Color(0.56, 0.42, 0.85), "hover": Color(0.64, 0.5, 0.92), "pressed": Color(0.46, 0.33, 0.75), "disabled": Color(0.23, 0.23, 0.36)}[nome]
		b.add_theme_stylebox_override(nome, st)
	b.add_theme_color_override("font_color", Color(0.96, 0.96, 1))
	b.add_theme_color_override("font_disabled_color", Color(0.7, 0.7, 0.8))
	b.add_theme_font_size_override("font_size", 18)


func _costruisci() -> void:
	var sfondo := ColorRect.new()
	sfondo.color = Color(0.043, 0.043, 0.078)
	sfondo.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(sfondo)

	var margine := MarginContainer.new()
	margine.set_anchors_preset(Control.PRESET_FULL_RECT)
	for lato in ["left", "top", "right", "bottom"]:
		margine.add_theme_constant_override("margin_" + lato, 12)
	add_child(margine)

	radice = BoxContainer.new()
	radice.add_theme_constant_override("separation", 12)
	margine.add_child(radice)

	var terr := _pannello(Color(0.09, 0.09, 0.15))
	terr.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	terr.size_flags_vertical = Control.SIZE_EXPAND_FILL
	terr.size_flags_stretch_ratio = 1.4
	radice.add_child(terr)

	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 8)
	terr.add_child(col)
	var riga := HBoxContainer.new()
	col.add_child(riga)
	var titolo := _etichetta("Territorio T1", 20)
	titolo.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	riga.add_child(titolo)

	# Elemento 3D minimo: un oggetto che ruota nella scheda del territorio.
	cont3d = SubViewportContainer.new()
	cont3d.stretch = true
	cont3d.custom_minimum_size = Vector2(110, 110)
	riga.add_child(cont3d)
	var vp := SubViewport.new()
	vp.transparent_bg = true
	vp.size = Vector2i(110, 110)
	cont3d.add_child(vp)
	var cam := Camera3D.new()
	cam.position = Vector3(0, 0, 1.7)
	vp.add_child(cam)
	var luce := DirectionalLight3D.new()
	luce.rotation_degrees = Vector3(-30, 30, 0)
	vp.add_child(luce)
	oggetto = MeshInstance3D.new()
	var mesh := SphereMesh.new()
	mesh.radial_segments = 6
	mesh.rings = 3
	oggetto.mesh = mesh
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.56, 0.42, 0.85)
	oggetto.material_override = mat
	vp.add_child(oggetto)

	lbl_stato = _etichetta("", 26, Color(0.56, 0.42, 0.85))
	lbl_stato.size_flags_vertical = Control.SIZE_EXPAND_FILL
	lbl_stato.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	col.add_child(lbl_stato)
	lbl_stato2 = _etichetta("", 18)
	col.add_child(lbl_stato2)
	lbl_evento = _etichetta("", 15, Color(0.85, 0.44, 0.29))
	col.add_child(lbl_evento)
	lbl_round = _etichetta("", 16)
	col.add_child(lbl_round)

	var dx := VBoxContainer.new()
	dx.add_theme_constant_override("separation", 10)
	dx.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	dx.size_flags_vertical = Control.SIZE_EXPAND_FILL
	radice.add_child(dx)
	btn_carta = Button.new()
	btn_carta.custom_minimum_size = Vector2(0, 56)
	btn_carta.pressed.connect(_on_carta)
	_stile_pulsante(btn_carta)
	dx.add_child(btn_carta)
	btn_fine = Button.new()
	btn_fine.text = "Fine turno"
	btn_fine.custom_minimum_size = Vector2(0, 56)
	btn_fine.pressed.connect(_on_fine)
	_stile_pulsante(btn_fine)
	dx.add_child(btn_fine)
	var p_log := _pannello(Color(0.06, 0.06, 0.11))
	p_log.size_flags_vertical = Control.SIZE_EXPAND_FILL
	dx.add_child(p_log)
	log_txt = RichTextLabel.new()
	log_txt.fit_content = false
	log_txt.add_theme_font_size_override("normal_font_size", 13)
	p_log.add_child(log_txt)


func _layout() -> void:
	# Verticale se lo schermo e' piu' alto che largo (telefono), orizzontale altrimenti (PC).
	radice.vertical = size.x < size.y


func _on_carta() -> void:
	var mano: Array = g.carte_in_mano()
	if mano.size() > 0:
		g.gioca_carta(mano[0]["id"])
	_aggiorna()


func _on_fine() -> void:
	g.fine_turno()
	_aggiorna()


func _aggiorna() -> void:
	lbl_stato.text = "Stato: %s" % g.stato
	lbl_stato2.text = "Secondo stato: %s" % g.stato2
	lbl_round.text = "Round %d" % g.round_n
	lbl_evento.text = ("Evento cosmico: %s" % ", ".join(g.eventi_scattati)) if g.eventi_scattati.size() > 0 else ""
	var mano: Array = g.carte_in_mano()
	btn_carta.text = ("Gioca carta %s" % mano[0]["id"]) if mano.size() > 0 else "Nessuna carta in mano"
	btn_carta.disabled = mano.is_empty()
	log_txt.text = "\n".join(g.log.slice(-6))


# Modalita' di verifica automatica: godot --path . -- --demo=/percorso/prefisso
func _demo(prefisso: String) -> void:
	await _frame(8)
	_salva(prefisso + "-1-iniziale.png")
	_on_carta()
	await _frame(4)
	_salva(prefisso + "-2-carta.png")
	_on_fine()
	_on_fine()
	await _frame(4)
	_salva(prefisso + "-3-evento.png")
	print("STATO_FINALE ", g.stato, " round=", g.round_n, " eventi=", g.eventi_scattati)
	get_tree().quit()


func _frame(n: int) -> void:
	for i in n:
		await RenderingServer.frame_post_draw


func _salva(percorso: String) -> void:
	var img := get_viewport().get_texture().get_image()
	img.save_png(percorso)
	print("CATTURA ", percorso, " ", img.get_size())
