extends RefCounted
# Logica della fetta CT-TECH-001: nessuna dipendenza da scene o interfaccia.
# FIXTURE TECNICA NON DI DESIGN: i valori vengono da data/fixture.json.

var fixture: Dictionary
var round_n: int = 1
var stato: String = ""
var stato2: String = ""
var carte_giocate: Array = []
var eventi_scattati: Array = []
var log: Array = []


static func carica_fixture(percorso: String) -> Dictionary:
	var f := FileAccess.open(percorso, FileAccess.READ)
	assert(f != null, "fixture non trovata: %s" % percorso)
	return JSON.parse_string(f.get_as_text())


func _init(p_fixture: Dictionary) -> void:
	fixture = p_fixture
	stato = fixture["territorio"]["stato_iniziale"]
	stato2 = fixture["territorio"]["stato2_iniziale"]
	log.append("Inizio partita di prova")


func carte_in_mano() -> Array:
	var r: Array = []
	for c in fixture["carte"]:
		if c["proprietario"] == "persona" and not carte_giocate.has(c["id"]):
			r.append(c)
	return r


func gioca_carta(id_carta: String) -> bool:
	for c in carte_in_mano():
		if c["id"] == id_carta:
			carte_giocate.append(id_carta)
			stato = c["effetto"]["imposta_stato"]
			log.append("Persona gioca %s: stato = %s" % [id_carta, stato])
			return true
	return false


# Avversario minimo: script tecnico, non IA di gioco.
func _turno_avversario() -> void:
	for c in fixture["carte"]:
		if c["proprietario"] == "avversario" and not carte_giocate.has(c["id"]):
			carte_giocate.append(c["id"])
			stato = c["effetto"]["imposta_stato"]
			log.append("Avversario gioca %s: stato = %s" % [c["id"], stato])
			return
	log.append("Avversario passa")


func fine_turno() -> void:
	_turno_avversario()
	round_n += 1
	var ev: Dictionary = fixture["evento_cosmico"]
	if round_n == int(ev["al_round"]) and not eventi_scattati.has(ev["id"]):
		eventi_scattati.append(ev["id"])
		stato = ev["effetto"]["imposta_stato"]
		if ev["effetto"].has("imposta_stato2"):
			stato2 = ev["effetto"]["imposta_stato2"]
		log.append("Evento cosmico %s: stato = %s" % [ev["id"], stato])
