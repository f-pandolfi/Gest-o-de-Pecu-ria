# Teste da lista de matrizes (app 10.2): todos os partos da vaca (data) e a cria de cada parto na mesma linha,
# no celular em pé e no computador. Usa uma vaca com 3 partos para conferir o alinhamento.
import os, json, sys, urllib.request
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright
BASE = os.environ.get('BASE', 'http://localhost:8765')
SAIDA = os.path.join(os.path.dirname(__file__), 'saida'); os.makedirs(SAIDA, exist_ok=True)
def srv(c, m='GET', corpo=None):
    dados = json.dumps(corpo).encode() if corpo is not None else (b'' if m == 'POST' else None)
    with urllib.request.urlopen(urllib.request.Request(BASE + c, method=m, data=dados)) as r:
        t = r.read().decode(); return json.loads(t) if t.startswith('{') else t
srv('/__reset', 'POST')
est = srv('/__estado')
vaca = next(m for m in est['matrizes'] if m['brinco'] == '3005')
# mais dois partos antigos para a 3005 (um sem número de cria)
srv('/exec', 'POST', {'action': 'appendEventos', 'itens': [
    {'tipo': 'nascimento', 'evento': {'id': 'tp1', 'tipo': 'nascimento', 'data': '2024-02-10', 'matrizId': vaca['id'], 'sexo': 'Macho', 'brincoBezerro': '4401'}},
    {'tipo': 'nascimento', 'evento': {'id': 'tp2', 'tipo': 'nascimento', 'data': '2025-03-01', 'matrizId': vaca['id'], 'sexo': 'Fêmea', 'brincoBezerro': ''}},
]})
falhas = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for nome, vp in [('celular', {'width': 390, 'height': 844}), ('computador', {'width': 1280, 'height': 900})]:
        ctx = b.new_context(viewport=vp, locale='pt-BR', timezone_id='America/Sao_Paulo')
        pg = ctx.new_page(); erros = []; pg.on('pageerror', lambda e: erros.append(str(e)))
        pg.goto(BASE + '/'); pg.wait_for_selector('.foot-note')
        nm = 'Telas (celular)' if vp['width'] < 900 else 'Telas'
        pg.get_by_role('navigation', name=nm).get_by_role('button', name='Rebanho').click()
        lin = pg.get_by_test_id('reb-3005'); lin.scroll_into_view_if_needed()
        partos = lin.get_by_test_id('reb-partos').locator('span').all_inner_texts()
        crias = lin.get_by_test_id('reb-crias').locator('span').all_inner_texts()
        if partos[:3] != ['12/03/26', '01/03/25', '10/02/24']: falhas.append(f'{nome}: partos {partos}')
        if crias[:3] != ['6501', 's/ nº', '4401']: falhas.append(f'{nome}: crias {crias}')
        # cada cria na mesma altura do seu parto
        ys_p = [s.bounding_box()['y'] for s in lin.get_by_test_id('reb-partos').locator('span').all()[:3]]
        ys_c = [s.bounding_box()['y'] for s in lin.get_by_test_id('reb-crias').locator('span').all()[:3]]
        if any(abs(a - c) > 1 for a, c in zip(ys_p, ys_c)): falhas.append(f'{nome}: desalinhado {ys_p} {ys_c}')
        txt = lin.inner_text()
        if 'Multípara' not in txt or 'vazia' not in txt: falhas.append(f'{nome}: categoria/situação {txt!r}')
        nov = pg.get_by_test_id('reb-3001').inner_text()
        if '—' not in nov: falhas.append(f'{nome}: novilha sem parto {nov!r}')
        if 'Paridas' in txt: falhas.append(f'{nome}: ainda mostra lote')
        largura = pg.evaluate('document.documentElement.scrollWidth')
        if largura > vp['width']: falhas.append(f'{nome}: rolagem lateral {largura}')
        if erros: falhas.append(f'{nome}: erros {erros}')
        pg.screenshot(path=os.path.join(SAIDA, f'rebanho_{nome}.png'))
        ctx.close()
    b.close()
print('FALHAS:', falhas) if falhas else print('ok: partos e crias alinhados no celular e no computador')
sys.exit(1 if falhas else 0)
