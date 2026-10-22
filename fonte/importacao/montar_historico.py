# Monta os nascimentos históricos (2023-2025) da planilha REBANHO 2026 (Dropbox) para importar no app.
# Entrada: dropbox/reb2026.txt (texto da planilha) e planilha/dados.json (planilha do app, lida antes).
# Saída: import/historico.json (eventos) e import/conferencia.json (listas para conferir).
import json, re, datetime, collections, sys
BASE = '/tmp/claude-0/-home-claude/4f53c2e6-6a68-5889-8da9-bf6cc363c86f/scratchpad'
NOW = sys.argv[1] if len(sys.argv) > 1 else datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
rows = json.load(open(f'{BASE}/dropbox/nasc_rows.json'))
D = json.load(open(f'{BASE}/planilha/dados.json'))
txt = open(f'{BASE}/dropbox/reb2026.txt').read().split('\n')

def nb(v):
    if v is None: return ''
    if isinstance(v, float) and v.is_integer(): v = int(v)
    return str(v).strip()
def iso(d):
    dd, mm, aa = d.split('/'); aa = ('20' + aa) if len(aa) == 2 else aa
    return f"{aa}-{int(mm):02d}-{int(dd):02d}"
def br(isod): return f"{isod[8:10]}/{isod[5:7]}/{isod[0:4]}"
def dias(a, b): return (datetime.date.fromisoformat(b) - datetime.date.fromisoformat(a)).days

mat = {nb(m['brinco']): m for m in D['Matrizes']}
H = [r for r in rows if r['ano'] in ('2023', '2024', '2025')]
for r in H: r['iso'] = iso(r['nasc'])

# vendidos na venda de 28/10/2025 (coluna VENDIDO marcada)
venda = {}
i0 = txt.index('VENDA BEZERROS'); i1 = txt.index('MORTE-SAIDA')
for l in txt[i0:i1]:
    c = [x.strip() for x in l.split('\t') if x.strip()]
    nums = [x for x in c if re.fullmatch(r'[3-5]\d{3}', x)]
    if nums and c[-1].upper() == 'X' and (c.count('X') + c.count('x')) >= 2:
        venda[nums[0]] = '2025-10-28'

# machos pesados em 10/10/2026 que estão na fazenda (folha de pesagem)
NA_FAZENDA = {'4626': 'pesado em 10/10/2026; aleijado, para abate (consumo)', '5546': 'pesado em 10/10/2026', '5562': 'pesado em 10/10/2026',
              '5576': 'pesado em 10/10/2026', '5578': 'pesado em 10/10/2026'}
# 5517 e 5521: a folha de 10/10 traz esses números, mas o peso bate com 6517/6521 (decisão do Pandolfi)
DUVIDA_5_6 = {'5517', '5521'}

# Números repetidos na fazenda: vaca adulta e cria com o mesmo brinco.
# Se o número aparece como MÃE de um parto ocorrido DEPOIS do nascimento da cria de mesmo número e antes de a cria ter
# idade para parir (640 dias), são dois animais e a matriz do app é a VACA ADULTA (com a data de nascimento da cria, errada).
maes_por_num = collections.defaultdict(list)
for r in rows: maes_por_num[r['vaca']].append(iso(r['nasc']))
nasc_cria = {r['cria']: iso(r['nasc']) for r in H}
def vaca_adulta(num):
    n = nasc_cria.get(num)
    if not n: return False
    return any(d > n and dias(n, d) < 640 for d in maes_por_num.get(num, []))
COW = {b for b, m in mat.items() if vaca_adulta(b)}
# matriz do app sem cria de mesmo número, mas com data de nascimento que não fecha com os partos dela
for b, m in mat.items():
    dn = nb(m.get('dataNascimento'))[:10]
    if dn and b not in nasc_cria and any(d >= '2023-01-01' and dias(dn, d) < 640 for d in maes_por_num.get(b, [])): COW.add(b)

eventos = []; conf = collections.defaultdict(list)
vistos = collections.Counter(r['cria'] for r in H)
for r in sorted(H, key=lambda x: (x['iso'], int(x['cria']) if x['cria'].isdigit() else 0)):
    cria, d = r['cria'], r['iso']
    sexo = 'Macho' if r['sexo'] == 'M' else 'Fêmea'
    notas = []
    brinco = cria
    # número repetido na própria planilha (3020): o macho fica sem número
    if vistos[cria] > 1 and r['sexo'] == 'M' and int(cria[-3:]) < 500:
        brinco = ''; notas.append(f'anotado como {cria} na planilha (número repetido com uma fêmea)'); conf['numero_repetido_planilha'].append(r)
    # mãe
    matrizId = ''; maeTxt = ''
    m = mat.get(r['vaca'])
    vaca_ok = bool(re.fullmatch(r'[0-9/]+', r['vaca']))
    if m:
        dn = nb(m.get('dataNascimento'))[:10]
        if r['vaca'] in COW or not dn or dias(dn, d) >= 640:
            matrizId = m['id']
        else:
            maeTxt = f"mãe {r['vaca']} (fora do cadastro, número repetido: a matriz {r['vaca']} do app nasceu em {br(dn)})"
            conf['mae_numero_repetido'].append({**r, 'matriz_nasc': dn})
    elif vaca_ok:
        maeTxt = f"mãe {r['vaca']} (fora do cadastro)"
    else:
        notas.append(f"mãe anotada como '{r['vaca']}' na planilha"); conf['mae_estranha'].append(r)
    # ligação com matriz do cadastro (cria que virou matriz/novilha)
    alvo = mat.get(cria) if brinco else None
    ligada = False
    dn_alvo = nb(alvo.get('dataNascimento'))[:10] if alvo else ''
    if alvo and cria not in COW and (dn_alvo == d or not dn_alvo):
        ligada = True
        if not dn_alvo: conf['matriz_sem_data_ligada'].append({**r, 'categoria': alvo['categoria'], 'status': alvo['status']})
        if sexo != 'Fêmea':
            notas.append('na planilha está como macho (número de macho), mas está no cadastro como ' + alvo['categoria'])
            conf['macho_no_cadastro_de_matrizes'].append({**r, 'categoria': alvo['categoria'], 'lote': alvo.get('lote')})
            sexo = 'Fêmea'
    elif alvo and cria in COW:
        notas.append(f"mesmo número da vaca {cria} do cadastro (outro animal)")
        conf['vaca_com_data_da_cria'].append({**r, 'matriz': cria, 'categoria': alvo['categoria'], 'status': alvo['status'], 'lote': alvo.get('lote'), 'dn_app': nb(alvo.get('dataNascimento'))[:10]})
    elif alvo:
        notas.append(f"mesmo número da matriz {cria} do cadastro (outro animal)")
        conf['mesmo_numero_outro_animal'].append({**r, 'dn_app': nb(alvo.get('dataNascimento'))[:10]})
    # situação
    s = r['sit'].upper()
    if s == 'MORTE CRIA': sit = 'MORTO'
    elif ligada: sit = 'MATRIZ'
    elif s == 'VENDIDO': sit = 'VENDIDO'
    elif sexo == 'Macho':
        if cria in NA_FAZENDA: sit = 'NA FAZENDA'; notas.append(NA_FAZENDA[cria])
        else: sit = 'VENDIDO'
        if cria in DUVIDA_5_6: conf['duvida_5_ou_6'].append(r)
    else: sit = 'A CONFIRMAR'
    quando = ''
    if sit == 'VENDIDO':
        dv = r.get('data') or ''
        if re.fullmatch(r'\d{1,2}/\d{1,2}/\d{2,4}', dv): quando = iso(dv)
        elif cria in venda: quando = venda[cria]
    raca = r['raca'].capitalize() if r['raca'] else ''
    touro = r['touro'].strip()
    touro = '' if touro.upper() in ('', '0', 'ERROR:#N/A') else touro.upper()
    partes = ['Histórico (planilha REBANHO 2026)', f"situação: {sit}" + (f" em {br(quando)}" if quando else '')]
    if raca: partes.append(f'raça {raca}')
    if maeTxt: partes.append(maeTxt)
    partes += notas
    ev = {'id': f"hist-{cria}-{d.replace('-', '')}" + ('m' if not brinco else ''), 'tipo': 'nascimento', 'data': d, 'matrizId': matrizId,
          'resultadoParto': 'Vivo', 'sexo': sexo, 'pesoNascer': '', 'brincoBezerro': brinco, 'pelagem': '', 'touroId': '', 'touroOutro': touro,
          'tipoParto': '', 'observacoes': ' · '.join(partes), 'createdAt': NOW}
    eventos.append(ev)
    conf['por_situacao'].append((r['ano'], sexo, sit))

json.dump(eventos, open(f'{BASE}/import/historico.json', 'w'), ensure_ascii=False, indent=0)
resumo = {k: (collections.Counter(map(tuple, v)) if k == 'por_situacao' else v) for k, v in conf.items()}
print('eventos', len(eventos), 'ids unicos', len({e['id'] for e in eventos}))
print('com mae ligada', sum(1 for e in eventos if e['matrizId']), '| maes distintas', len({e['matrizId'] for e in eventos if e['matrizId']}))
c = collections.Counter((e['data'][:4], e['sexo'], re.search(r'situação: ([A-Z ]+)', e['observacoes']).group(1).strip()) for e in eventos)
for k in sorted(c): print(k, c[k])
for k, v in conf.items():
    if k != 'por_situacao': print('==', k, len(v)); [print('   ', x) for x in v[:15]]
print('COW', sorted(COW)); print('vendidos com data 28/10/25:', sum(1 for e in eventos if 'em 28/10/2025' in e['observacoes']))
conf['cow'] = sorted(COW)
json.dump({k: v for k, v in conf.items() if k != 'por_situacao'}, open(f'{BASE}/import/conferencia.json', 'w'), ensure_ascii=False, indent=1)
