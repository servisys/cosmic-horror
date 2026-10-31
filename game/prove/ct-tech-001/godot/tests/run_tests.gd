extends SceneTree
# Test della logica senza interfaccia: godot --headless --path . -s tests/run_tests.gd
const GameLogic = preload("res://logic/game_logic.gd")

var fallimenti := 0


func check(nome: String, ok: bool) -> void:
	if ok:
		print("  OK: ", nome)
	else:
		fallimenti += 1
		print("  FALLITO: ", nome)


func _init() -> void:
	var f: Dictionary = GameLogic.carica_fixture("res://data/fixture.json")

	var g = GameLogic.new(f)
	check("carta-territorio: la carta della persona imposta lo stato", g.gioca_carta("C1") and g.stato == "stato-uno" and g.carte_in_mano().is_empty())

	g = GameLogic.new(f)
	check("una carta non in mano non si gioca", not g.gioca_carta("C2"))

	g = GameLogic.new(f)
	g.gioca_carta("C1")
	g.fine_turno()
	check("avversario minimo: gioca la sua carta", g.stato == "stato-due")
	g.fine_turno()
	check("avversario minimo: poi passa", str(g.log).contains("Avversario passa"))

	g = GameLogic.new(f)
	g.gioca_carta("C1")
	g.fine_turno()
	check("evento cosmico: non scatta prima del round", g.eventi_scattati.is_empty())
	g.fine_turno()
	check("evento cosmico: scatta una volta al round previsto", g.eventi_scattati == ["E1"] and g.stato == "stato-evento")
	g.fine_turno()
	check("evento cosmico: non scatta due volte", g.eventi_scattati == ["E1"])

	g = GameLogic.new(f)
	var ok := true
	for passo in f["sequenza_di_prova"]:
		if passo["azione"] == "gioca":
			g.gioca_carta(passo["carta"])
		else:
			g.fine_turno()
		var atteso: Dictionary = passo["atteso"]
		if g.stato != atteso["stato"] or g.stato2 != atteso["stato2"] or g.round_n != int(atteso["round"]) or g.eventi_scattati != atteso["eventi_scattati"]:
			ok = false
	check("sequenza di prova condivisa dalla fixture", ok)

	print("RISULTATO: ", "TUTTI I TEST OK" if fallimenti == 0 else "%d FALLITI" % fallimenti)
	quit(1 if fallimenti > 0 else 0)
