# Cosmic Horror - Simulatore di partite di Cowork (V0.4, 2026-10-31)
# Strumento di analisi, NON il prototipo (CT-DES-020). Giocatore simulato semplice: i numeri indicano squilibri, non il bilanciamento fine.
# Uso: python3 CT_SIMULATORE_COWORK_V0.2.py [numero_partite] ; parametri modificabili con variabili d'ambiente (vedi PR).
# I valori predefiniti corrispondono alle regole base V0.8 (CT-DES-055...058).
# V0.4: legge carte ed eventi V0.4 (con citazioni). V0.3: legge carte ed eventi V0.3 (nomi lovecraftiani, CT-DES-060); internamente usa i nomi di lavoro della V0.2, tradotti per id.
import yaml, random, sys, collections
import os
D=os.environ.get('CT_DATI',os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','docs','03-cards-content','01-card-database'))+os.sep
C=yaml.safe_load(open(D+'CT_CARTE_PROTOTIPO_V0.4.yaml',encoding='utf-8'))
_N={'CU01': 'Sentinella del Faro', 'CU02': 'Archivista Vigile', 'CU03': 'Guardiano di Pietra', 'CU04': "Custode dell'Abisso", 'CU05': 'Cerchio di Veglia', 'CU06': 'Lanterna Benedetta', 'CU07': 'Vecchio Bibliotecario', 'CU08': 'Muro di Sale', 'CU09': 'Sigillo Antico', 'CU10': 'Quiete', 'CU11': 'Respiro Profondo', 'CU12': 'Rinforzi', 'CU13': 'Esorcismo', 'CU14': 'Preparare il Sigillo', 'CU15': 'Cacciata', 'CU16': 'Studio delle Stelle', 'CU17': 'Rito di Contenimento', 'CU18': 'Fiamma Sacra', 'RI01': 'Accolito', 'RI02': "Cultista dell'Abisso", 'RI03': 'Profeta Febbricitante', 'RI04': 'Bruto Marchiato', 'RI05': 'Seminatore di Crepe', 'RI06': 'Sacerdotessa del Varco', 'RI07': 'Ombra Strisciante', 'RI08': "Araldo dell'Oltre", 'RI09': 'Marchio', 'RI10': 'Sussurro', 'RI11': 'Offerta di Sangue', 'RI12': 'Profanazione', 'RI13': 'Visioni', 'RI14': 'Corruzione', 'RI15': 'Preparare il Rito', 'RI16': 'Abbraccio del Vuoto', 'RI17': 'Squarcio nel Cielo', 'RI18': "Richiamo dell'Abisso"}
_NC={'CU02': 'Archivista Sussurrante', 'CU03': 'Guardiano Incrinato', 'CU06': 'Lanterna Nera', 'RI01': 'Accolito Divorato', 'RI02': 'Cultista Trasfigurato', 'RI03': 'Profeta Cieco', 'RI04': 'Bruto Deforme', 'RI07': 'Ombra Vorace', 'RI10': 'Urlo'}
_R={'T1': 'Lampo del Faro', 'T2': 'Pagina Perduta', 'T3': 'Frammento Stellare'}
for _f in C['fazioni']:
    for _c in _f['carte']:
        _c['nome']=_N[_c['id']]
        if _c.get('versione_cosmica'): _c['versione_cosmica']['nome']=_NC[_c['id']]
for _t in C['territori']: _t['riserva'][0]['nome']=_R[_t['id']]
E=yaml.safe_load(open(D+'CT_EVENTI_COSMICI_PROTOTIPO_V0.4.yaml',encoding='utf-8'))['eventi']
TN=['Faro','Biblioteca','Cratere']
import os
PR={k:int(os.environ.get(k,v)) for k,v in dict(SIG_MAX=3,RITO_MIN=3,SIG_COST=2,RITO_COST=2,PROF_MIN=3,LATE=1,FRAMM=1,RITO_CTRL=2,SIG_LOCK=0,SECOND_EN=1,CAP=0,PERM=1,FP_EN=-1,REMCOST=0,LATEDISC=0,FRAMM2=1,PROF2=1,BIBLIO2=1).items()}
class Card:
    def __init__(s,d,fac): s.__dict__.update(d); s.fac=fac; s.cos=d.get('versione_cosmica'); s.transformed=False
    def transform(s):
        v=s.cos; s.nome=v['nome']; s.costo=v['costo']; s.potente=v.get('potente',0); s.effetto=v['effetto']
        if 'forza' in v: s.forza=v['forza']
        s.transformed=True; s.cos=None
class Pres:
    def __init__(s,card): s.card=card; s.bonus=0
class P:
    def __init__(s,fac,rng):
        s.fac=fac; s.deck=[]; s.hand=[]; s.disc=[]; s.esp=0; s.tappe=set(); s.turns=0; s.signal_at=None; s.tclock={}
        f=[x for x in C['fazioni'] if x['id']==fac][0]
        for d in f['carte']:
            for _ in range(d['copie']): s.deck.append(Card(dict(d),fac))
        rng.shuffle(s.deck); s.stats=collections.Counter()
class G:
    def __init__(s,seed,log=False):
        s.r=random.Random(seed); s.log=log; s.L=[]
        s.p=[P('custodi',s.r),P('risvegliati',s.r)]
        if s.r.random()<0.5: s.p.reverse()
        s.inst=[0,0,0]; s.pres=[[[],[]] for _ in range(3)]  # pres[t][pi]
        s.ctrl=[None]*3; s.ris={i:[Card(dict(t['riserva'][0]),'neutro') for _ in range(3)] for i,t in enumerate(C['territori'])}
        s.giro=0; s.winner=None; s.tmp=[[0,0,0],[0,0,0]]  # temp -forza until end of next giro
        ph={k:[dict(e) for e in E[k]] for k in ('fase_I','fase_II','fase_III')}
        for e in E['improvvisi']: ph['fase_'+e['fase']].append(dict(e))
        for k in ph: s.r.shuffle(ph[k])
        s.ph=ph
        for i,pl in enumerate(s.p):
            for _ in range(5+i): s.draw(pl)
    def w(s,*a):
        if s.log: s.L.append(' '.join(str(x) for x in a))
    def idx(s,pl): return s.p.index(pl)
    def opp(s,pl): return s.p[1-s.idx(pl)]
    def addesp(s,pl,n):
        old=pl.esp; pl.esp=max(0,min(10,pl.esp+n))
        for th in (3,6,9):
            if old<th<=pl.esp: s.transform(pl,1)
    def transform(s,pl,n):
        for _ in range(n):
            c=[x for x in pl.deck if x.cos]
            if c:
                x=s.r.choice(c); x.transform(); pl.stats['trasf']+=1; s.w('  trasformazione:',pl.fac,x.nome)
    def draw(s,pl,n=1):
        for _ in range(n):
            if not pl.deck:
                if not pl.disc: return
                pl.deck=pl.disc; pl.disc=[]; s.r.shuffle(pl.deck); s.addesp(pl,1); pl.stats['rimescola']+=1
            pl.hand.append(pl.deck.pop())
    def addinst(s,t,n):
        s.inst[t]=max(0,min(5,s.inst[t]+n))
        if PR['SIG_LOCK'] and any(t in p.tappe for p in s.p if p.fac=='custodi'): s.inst[t]=min(s.inst[t],PR['SIG_LOCK'])
    def forza(s,t,pi):
        tot=0; ps=s.pres[t][pi]
        cust=sum(1 for x in ps if x.card.nome=="Custode dell'Abisso")
        for x in ps:
            if x.card.nome=='Marchio': continue
            f=x.card.forza+x.bonus
            if x.card.nome.startswith('Cultista'): f+= (2 if x.card.transformed else 1) if s.inst[t]>=3 else 0
            if x.card.nome!="Custode dell'Abisso": f+=cust
            else: f+=cust-1
            if s.inst[t]>=4: f-=1
            f-=s.tmp[pi][t]
            tot+=max(0,f)
        return tot
    def update_ctrl(s,actor=None):
        for t in range(3):
            a,b=s.forza(t,0),s.forza(t,1)
            new=0 if a>b else 1 if b>a else None
            if new is not None and new!=s.ctrl[t]:
                pl=s.p[new]
                if s.ris[t]: pl.hand.append(s.ris[t].pop()); pl.stats['riserva']+=1
                if t==1 and PR['BIBLIO2']: s.draw(pl)
            s.ctrl[t]=new
    def nctrl(s,pl): return sum(1 for t in range(3) if s.ctrl[t]==s.idx(pl))
    def kill(s,t,pi,x):
        s.pres[t][pi].remove(x); s.p[pi].disc.append(x.card)
    # tappe
    def can_tappa(s,pl,t):
        pi=s.idx(pl)
        if t in pl.tappe: return False
        if len(pl.tappe)==2:
            # turno di avviso: segnale deve essere attivo da prima dell'ultimo turno avversario
            if pl.signal_at is None or pl.signal_at>=s.opp(pl).turns_mark: return False
        if pl.fac=='custodi': return s.ctrl[t]==pi and s.inst[t]<=PR['SIG_MAX']
        ok=(len(s.pres[t][pi])>0) if PR['RITO_CTRL']==0 else (s.ctrl[t]==pi) if PR['RITO_CTRL']==1 else (len(s.pres[t][pi])>0 and s.forza(t,pi)>=s.forza(t,1-pi))
        return ok and s.inst[t]>=PR['RITO_MIN']
    def tappa_cost(s,pl,t):
        c=(PR['SIG_COST'] if pl.fac=='custodi' else PR['RITO_COST'])-s.prep-(1 if PR['LATEDISC'] and s.giro>=PR['LATEDISC'] else 0)
        if pl.fac=='risvegliati': c-=sum(1 for x in s.pres[t][s.idx(pl)] if x.card.nome=='Sacerdotessa del Varco')
        return max(0,c)
    def add_tappa(s,pl,t):
        pl.tappe.add(t); pl.tclock[t]=s.clock; pl.stats['tappe']+=1; s.w('  TAPPA',pl.fac,TN[t],len(pl.tappe))
        if len(pl.tappe)==2 and pl.signal_at is None: pl.signal_at=s.clock; s.w('  SEGNALE',pl.fac)
        if len(pl.tappe)==3: s.winner=pl
    def removable(s,pl,t):
        return t in pl.tappe and (not PR['PERM'] or s.clock-pl.tclock[t]<=1)
    def remove_tappa(s,pl,t):
        pl.tappe.discard(t); pl.stats['tolte']+=1; s.w('  tappa tolta',pl.fac,TN[t])
        if len(pl.tappe)<2: pl.signal_at=None
    # ---- play card
    def play(s,pl,c,t,tgt=None):
        pi=s.idx(pl); o=s.opp(pl); oi=1-pi
        s.en-=c.costo; pl.hand.remove(c); pl.stats['giocate']+=1
        if c.potente:
            s.addesp(pl,c.potente)
            if t is not None: s.addinst(t,1+(1 if t==2 else 0))
        n=c.nome; s.w('  gioca',pl.fac,n,TN[t] if t is not None else '')
        if c.tipo=='presenza':
            x=Pres(c); s.pres[t][pi].append(x)
            if n in('Archivista Vigile',): s.addinst(t,-1)
            elif n=='Archivista Sussurrante': s.addinst(t,-1); s.draw(pl)
            elif n=='Guardiano Incrinato': s.addinst(t,1)
            elif n in('Lanterna Benedetta','Profeta Febbricitante'): s.draw(pl)
            elif n in('Lanterna Nera','Profeta Cieco'): s.draw(pl,2)
            elif n=='Sigillo Antico':
                if s.can_tappa(pl,t): s.add_tappa(pl,t)
            elif n=='Accolito': s.addinst(t,1)
            elif n=='Accolito Divorato': s.addinst(t,2)
            elif n in('Ombra Strisciante','Ombra Vorace'):
                if s.pres[t][oi]:
                    y=max(s.pres[t][oi],key=lambda z:z.card.forza+z.bonus); y.bonus-= 2 if 'Vorace' in n else 1
            if n=='Cerchio di Veglia': pass
        else:
            pl.disc.append(c)
            if n in('Quiete',): s.addinst(t,-1)
            elif n=='Respiro Profondo': s.addesp(pl,-1)
            elif n in('Rinforzi','Abbraccio del Vuoto'): tgt.bonus+= 2 if n=='Rinforzi' else 3
            elif n=='Esorcismo': s.en-=PR['REMCOST']; s.remove_tappa(o,t)
            elif n in('Preparare il Sigillo','Preparare il Rito'): s.prep=1
            elif n=='Cacciata': s.kill(t,oi,tgt)
            elif n in('Studio delle Stelle','Visioni'): s.draw(pl,2)
            elif n=='Rito di Contenimento':
                for k in range(3): s.addinst(k,-2)
            elif n=='Fiamma Sacra':
                for y in list(s.pres[t][oi]):
                    if s.pf(t,oi,y)<=2: s.kill(t,oi,y)
            elif n=='Sussurro': s.addinst(t,1)
            elif n=='Urlo': s.addinst(t,2)
            elif n=='Offerta di Sangue': s.en+=2
            elif n=='Profanazione': s.en-=PR['REMCOST']; s.remove_tappa(o,t)
            elif n=='Corruzione': tgt.bonus-=2
            elif n=='Squarcio nel Cielo':
                for k in range(3): s.addinst(k,1)
                if tgt: s.kill(tgt[0],oi,tgt[1])
            elif n=="Richiamo dell'Abisso":
                for k in (0,1):
                    for y in list(s.pres[t][k]):
                        if s.pf(t,k,y)<=3: s.kill(t,k,y)
            elif n=='Lampo del Faro': s.draw(pl)
            elif n=='Pagina Perduta':
                a=[x for x in pl.deck if x.tipo=='azione']
                if a: x=s.r.choice(a); pl.deck.remove(x); pl.hand.append(x)
            elif n=='Frammento Stellare':
                s.en+=1
                if not PR['FRAMM2']: s.addinst(t,1)
        # Cerchio di Veglia cap
        for k in range(3):
            if any(x.card.nome=='Cerchio di Veglia' for q in (0,1) for x in s.pres[k][q]) and s.inst[k]>3: s.inst[k]=3
        s.update_ctrl()
    def pf(s,t,pi,x):
        f=x.card.forza+x.bonus-(1 if s.inst[t]>=4 else 0)-s.tmp[pi][t]
        return f
    # ---- AI
    def ai_turn(s,pl):
        pi=s.idx(pl); o=s.opp(pl); oi=1-pi; cust=pl.fac=='custodi'
        s.prep=0; reduced=False; guard=0
        while s.winner is None and guard<30:
            guard+=1
            hand=[c for c in pl.hand if c.costo<=s.en]
            def find(names): return [c for c in hand if c.nome in names]
            # 1 avversario a un passo
            if len(o.tappe)==2:
                if cust:
                    cand=[t for t in range(3) if t not in o.tappe and s.pres[t][oi]]
                    q=find(['Quiete']); e=find(['Esorcismo'])
                    tt=[t for t in cand if s.inst[t]>=3]
                    if e and e[0].costo+PR['REMCOST']<=s.en and any(s.removable(o,t) and s.ctrl[t]==pi for t in range(3)):
                        t=[t for t in o.tappe if s.removable(o,t) and s.ctrl[t]==pi][0]; s.play(pl,e[0],t); continue
                    if q and tt: s.play(pl,q[0],max(tt,key=lambda t:s.inst[t])); continue
                    rc=find(['Rito di Contenimento'])
                    if rc and tt: s.play(pl,rc[0],None); continue
                else:
                    cand=[t for t in range(3) if t not in o.tappe and s.inst[t]<=2]
                    pr=[c for c in find(['Profanazione']) if c.costo+PR['REMCOST']<=s.en]; sigs=[t for t in o.tappe if s.inst[t]>=PR['PROF_MIN'] and s.removable(o,t) and (not PR['PROF2'] or (s.pres[t][pi] and s.forza(t,pi)>=s.forza(t,oi)))]
                    if pr and sigs: s.play(pl,pr[0],sigs[0]); continue
                    su=find(['Sussurro','Urlo'])
                    if su and cand: s.play(pl,su[0],max(cand,key=lambda t:s.inst[t])); continue
            # 2 tappa
            done=False
            for t in sorted(range(3),key=lambda t:-s.inst[t] if not cust else s.inst[t]):
                if s.can_tappa(pl,t):
                    pre=find(['Preparare il Sigillo','Preparare il Rito'])
                    if s.tappa_cost(pl,t)<=s.en:
                        s.en-=s.tappa_cost(pl,t); s.prep=0; s.add_tappa(pl,t); done=True; break
                    if pre and s.en>=pre[0].costo+s.tappa_cost(pl,t)-1:
                        s.play(pl,pre[0],None); done=True; break
            if done: continue
            # sigillo antico
            if cust:
                sa=find(['Sigillo Antico'])
                ts=[t for t in range(3) if t not in pl.tappe and s.inst[t]<=2 and len(s.pres[t][pi])<4]
                # play there if it would control after
                if sa and ts:
                    t=ts[0]; s.play(pl,sa[0],t); continue
            # 3 risvegliati: potenti
            if not cust:
                pot=[c for c in hand if c.potente and c.tipo=='azione' and c.nome not in('Visioni','Offerta di Sangue')]
                for c in pot:
                    if c.nome=='Abbraccio del Vuoto':
                        mine=[(t,x) for t in range(3) for x in s.pres[t][pi]]
                        if mine: t,x=max(mine,key=lambda z:s.inst[z[0]]); s.play(pl,c,t,x); done=True; break
                    elif c.nome=='Squarcio nel Cielo':
                        tg=[(t,x) for t in range(3) for x in s.pres[t][oi] if s.pf(t,oi,x)<=2]
                        s.play(pl,c,None,tg[0] if tg else None); done=True; break
                    elif c.nome=="Richiamo dell'Abisso":
                        tg=[t for t in range(3) if sum(1 for y in s.pres[t][oi] if s.pf(t,oi,y)<=3)>sum(1 for y in s.pres[t][pi] if s.pf(t,pi,y)<=3)+1]
                        if tg: s.play(pl,c,tg[0]); done=True; break
                if done: continue
            # 4 instabilita' / esposizione
            if cust and pl.esp>=5:
                rp=find(['Respiro Profondo'])
                if rp: s.play(pl,rp[0],None); continue
                if not reduced and s.en>=2: s.en-=2; s.addesp(pl,-1); reduced=True; continue
            if not cust:
                su=find(['Sussurro','Urlo'])
                tt=[t for t in range(3) if s.pres[t][pi] and s.inst[t]<3 and t not in pl.tappe]
                if su and tt: s.play(pl,su[0],tt[0]); continue
            if cust:
                q=find(['Quiete']); tt=[t for t in range(3) if s.inst[t]>=3 and t not in pl.tappe]
                if q and tt: s.play(pl,q[0],tt[0]); continue
            # presenze: territorio piu' conteso
            pres=[c for c in hand if c.tipo=='presenza']
            if pres:
                c=max(pres,key=lambda c:(c.forza,c.costo))
                ts=[t for t in range(3) if len(s.pres[t][pi])<4]
                if not cust: ts=[t for t in ts if t not in pl.tappe] or ts
                if ts:
                    t=min(ts,key=lambda t:(abs(s.forza(t,pi)-s.forza(t,oi)), t in pl.tappe))
                    s.play(pl,c,t); continue
            # altre azioni
            oth=[c for c in hand if c.tipo=='azione']
            ok=False
            for c in oth:
                n=c.nome
                if n in('Studio delle Stelle','Visioni','Lampo del Faro','Pagina Perduta'): s.play(pl,c,None); ok=True; break
                if n in('Rinforzi','Corruzione'):
                    tg=[(t,x) for t in range(3) for x in s.pres[t][pi if n=='Rinforzi' else oi]]
                    if tg: t,x=tg[0]; s.play(pl,c,t,x); ok=True; break
                if n=='Cacciata':
                    tg=[(t,x) for t in range(3) for x in s.pres[t][oi] if s.pf(t,oi,x)<=3]
                    if tg: t,x=max(tg,key=lambda z:z[1].card.forza); s.play(pl,c,t,x); ok=True; break
                if n=='Fiamma Sacra':
                    tg=[t for t in range(3) if sum(1 for y in s.pres[t][oi] if s.pf(t,oi,y)<=2)>=2]
                    if tg: s.play(pl,c,tg[0]); ok=True; break
                if n=='Offerta di Sangue' and pl.esp<8: s.play(pl,c,None); ok=True; break
                if n=='Frammento Stellare' and (PR['FRAMM'] or pl.fac!='custodi'): s.play(pl,c,2); ok=True; break
            if ok: continue
            if not reduced and pl.esp>=4 and s.en>=2: s.en-=2; s.addesp(pl,-1); reduced=True; continue
            break
    def turn(s,pl):
        pi=s.idx(pl); pl.turns+=1
        s.en=min(2+pl.turns-1,8)+(1 if s.nctrl(pl)>=2 else 0)+(PR['SECOND_EN'] if (pi==1 and pl.turns==1) else 0)+(PR['FP_EN'] if (pi==0 and pl.turns==1) else 0)
        s.draw(pl,1+(1 if s.ctrl[0]==pi else 0))
        for t in range(3):
            for x in s.pres[t][pi]:
                if x.card.nome=='Vecchio Bibliotecario': s.addinst(t,-1)
                if x.card.nome=='Seminatore di Crepe': s.addinst(t,1)
        s.update_ctrl()
        s.ai_turn(pl)
        s.clock+=1; pl.turns_mark=s.clock
    def most_exp(s):
        m=max(p.esp for p in s.p); return [p for p in s.p if p.esp==m]
    def most_inst(s):
        m=max(s.inst); c=[t for t in range(3) if s.inst[t]==m]; return s.r.choice(c)
    def event(s):
        k='fase_I' if s.giro<=3 else 'fase_II' if s.giro<=6 else 'fase_III'
        d=s.ph[k]
        if not d:
            d.extend([dict(e) for e in E[k]]); s.r.shuffle(d)
        e=d.pop(0); i=e['id']; s.w(' EVENTO',e['nome'])
        if i=='E01': s.addinst(s.most_inst(),1)
        elif i=='E02':
            t=max(range(3),key=lambda t:len(s.pres[t][0])+len(s.pres[t][1]))
            s.tmp=[[0,0,0],[0,0,0]]; s.tmp[0][t]=1; s.tmp[1][t]=1; s.tmp_left=2
        elif i=='E03':
            for p in s.most_exp():
                if p.hand: p.disc.append(p.hand.pop(s.r.randrange(len(p.hand))))
        elif i=='E04':
            for t in range(3):
                if s.inst[t]==0: s.inst[t]=1
        elif i=='E05': s.addinst(2,1)
        elif i=='E06':
            for p in s.p: s.draw(p)
        elif i=='E07': s.addinst(s.most_inst(),2)
        elif i=='E08':
            for p in s.most_exp():
                pi=s.idx(p); a=[(t,x) for t in range(3) for x in s.pres[t][pi]]
                if a: t,x=min(a,key=lambda z:s.pf(z[0],pi,z[1])); s.kill(t,pi,x)
        elif i=='E09':
            for t in range(3): s.addinst(t,1)
        elif i=='E10':
            if s.ctrl[0] is not None: s.addesp(s.p[s.ctrl[0]],1)
        elif i=='E11':
            for p in s.most_exp():
                for _ in range(2):
                    if p.hand: p.disc.append(p.hand.pop(s.r.randrange(len(p.hand))))
        elif i=='E12':
            for p in s.most_exp(): s.transform(p,1)
        elif i=='E13':
            t=s.most_inst(); s.addinst(t,2)
            for q in (0,1):
                for x in s.pres[t][q]: x.bonus-=1
        elif i=='E14':
            for p in s.most_exp(): s.addesp(p,2)
        elif i=='E15':
            for t in range(3): s.addinst(t,1)
            for t in range(3):
                for q in (0,1):
                    for x in list(s.pres[t][q]):
                        if s.pf(t,q,x)<=1 and x.card.nome!='Marchio': s.kill(t,q,x)
        elif i=='E16':
            t=s.most_inst(); a=[(q,x) for q in (0,1) for x in s.pres[t][q]]
            if a: q,x=max(a,key=lambda z:s.pf(t,z[0],z[1])); s.kill(t,q,x)
        elif i=='E17':
            for t in range(3): s.addinst(t,1)
            for p in s.p:
                if p.esp>=6 and p.hand: p.disc.append(p.hand.pop(s.r.randrange(len(p.hand))))
        elif i=='E18':
            me=s.most_exp()
            for p in s.p: s.addesp(p,1)
            for p in me: s.addesp(p,1)
        elif i=='E19':
            for t in range(3): s.addinst(t,-1)
        elif i=='E20':
            for p in s.most_exp(): s.transform(p,2)
    def run(s,maxgiri=30):
        s.clock=0
        for p in s.p: p.turns_mark=0
        s.tmp_left=0
        if PR['CAP']: maxgiri=PR['CAP']
        while s.winner is None and s.giro<maxgiri:
            s.giro+=1; s.w('GIRO',s.giro,'inst',s.inst,'esp',[(p.fac,p.esp) for p in s.p],'tappe',[(p.fac,sorted(p.tappe)) for p in s.p])
            for pl in s.p:
                s.turn(pl)
                if s.winner: break
            if s.winner: break
            s.event()
            if s.giro>=7 and PR['LATE']:
                for t in range(3): s.addinst(t,1)
            for t in range(3):
                if s.inst[t]==5:
                    c=s.ctrl[t]
                    if t==0 and c is not None: s.addesp(s.p[c],1)
                    if t==1 and c is not None and s.p[c].hand: p=s.p[c]; p.disc.append(p.hand.pop(s.r.randrange(len(p.hand))))
                    if t==2:
                        for q in (0,1):
                            for x in list(s.pres[t][q]):
                                if s.pf(t,q,x)<=1 and x.card.nome!='Marchio': s.kill(t,q,x)
            if s.tmp_left: 
                s.tmp_left-=1
                if s.tmp_left==0: s.tmp=[[0,0,0],[0,0,0]]
            s.update_ctrl()
        if s.winner is None and PR['CAP']:
            a,b=len(s.p[0].tappe),len(s.p[1].tappe)
            if a!=b: s.winner=s.p[0] if a>b else s.p[1]
            else:
                fa=sum(s.forza(t,0) for t in range(3)); fb=sum(s.forza(t,1) for t in range(3))
                if fa!=fb: s.winner=s.p[0] if fa>fb else s.p[1]
        return s
if __name__=='__main__':
    N=int(sys.argv[1]) if len(sys.argv)>1 else 1000
    res=collections.Counter(); giri=[]; st=collections.defaultdict(list); first=collections.Counter()
    for seed in range(N):
        g=G(seed).run(); w=g.winner.fac if g.winner else 'nessuno'; res[w]+=1; giri.append(g.giro)
        first[(g.p[0].fac,w)]+=1
        for p in g.p:
            for k in ('trasf','tolte','rimescola','riserva','giocate'): st[(p.fac,k)].append(p.stats[k])
            st[(p.fac,'esp_fine')].append(p.esp)
        st[('inst','fine')].append(sum(g.inst)/3)
    print('vittorie',dict(res)); giri.sort()
    print('giri: media %.1f mediana %d min %d max %d'%(sum(giri)/N,giri[N//2],giri[0],giri[-1]))
    print('distribuzione giri',sorted(collections.Counter(giri).items()))
    print('chi inizia -> vince',dict(first))
    for k,v in sorted(st.items()): print(k,'%.2f'%(sum(v)/len(v)))
