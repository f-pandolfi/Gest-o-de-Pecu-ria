# Parto > Vazias (app 10.5): todas as datas de parto da vaca e a cria de cada parto na mesma linha,
# "último parto há N dias" embaixo da categoria, detalhe de cada parto ao tocar, busca pelo brinco da vaca ou da cria.
import os, json, sys, urllib.request, datetime
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright, expect
BASE = os.environ.get('BASE', 'http://localhost:8765')
SAIDA = os.path.join(os.path.dirname(__file__), 'saida'); os.makedirs(SAIDA, exist_ok=True)
def srv(c, m='GET', corpo=None):
    dados = json.dumps(corpo).encode() if corpo is not None else (b'' if m == 'POST' else None)
    with urllib.request.urlopen(urllib.request.Request(BASE + c, method=m, data=dados)) as r:
        t = r.read().decode(); return json.loads(t) if t.startswith('{') else t
srv('/__reset', 'POST')
est = srv('/__estado')
vaca = next(m for m in est['matrizes'] if m['brinco'] == '3005')
srv('/exec', 'POST', {'action': 'appendEventos', 'itens': [
    {'tipo': 'nascimento', 'evento': {'id': 'tp1', 'tipo': 'nascimento', 'data': '2024-02-10', 'matrizId': vaca['id'], 'sexo': 'Macho', 'brincoBezerro': '4401'}},
    {'tipo': 'nascimento', 'evento': {'id': 'tp2', 'tipo': 'nascimento', 'data': '2025-03-01', 'matrizId': vaca['id'], 'sexo': 'Fêmea', 'brincoBezerro': ''}},
    {'tipo': 'nascimento', 'evento': {'id': 'tp3', 'tipo': 'nascimento', 'data': '2023-02-01', 'matrizId': vaca['id'], 'resultadoParto': 'Natimorto', 'sexo': 'Macho', 'brincoBezerro': ''}},
]})
falhas = []; ok = 0
def confere(cond, msg):
    global ok
    if cond: ok += 1
    else: falhas.append(msg); print('  FALHOU', msg)
with sync_playwright() as p:
    b = p.chromium.launch()
    for nome, vp in [('celular', {'width': 390, 'height': 844}), ('computador', {'width': 1280, 'height': 900})]:
        ctx = b.new_context(viewport=vp, locale='pt-BR', timezone_id='America/Sao_Paulo')
        pg = ctx.new_page(); erros = []; pg.on('pageerror', lambda e: erros.append(str(e)))
        pg.goto(BASE + '/'); pg.wait_for_selector('.foot-note'); pg.wait_for_timeout(1500)
        nm = 'Telas (celular)' if vp['width'] < 900 else 'Telas'
        pg.get_by_role('navigation', name=nm).get_by_role('button', name='Diagnóstico').click()
        pg.get_by_role('tab', name='Vazias').first.click()
        lin = pg.get_by_test_id('vazia-3005'); lin.scroll_into_view_if_needed()
        datas = lin.get_by_test_id('parto-datas').locator('span').all_inner_texts()
        crias = lin.get_by_test_id('parto-crias').locator('span').all_inner_texts()
        confere(datas[:4] == ['12/03/26', '01/03/25', '10/02/24', '01/02/23'], f'{nome}: datas {datas}')
        confere(crias[:4] == ['6501', 's/ nº', '4401', 'natim.'], f'{nome}: crias {crias}')
        ys_p = [s.bounding_box()['y'] for s in lin.get_by_test_id('parto-datas').locator('span').all()[:4]]
        ys_c = [s.bounding_box()['y'] for s in lin.get_by_test_id('parto-crias').locator('span').all()[:4]]
        confere(all(abs(a - c) <= 1 for a, c in zip(ys_p, ys_c)), f'{nome}: desalinhado {ys_p} {ys_c}')
        txt = lin.inner_text()
        dias = (datetime.date.today() - datetime.date(2026, 3, 12)).days
        confere('Multípara' in txt and f'último parto há {dias} dias' in txt, f'{nome}: categoria/último parto {txt!r}')
        cab = pg.locator('.led-h').first.inner_text().upper().split()
        confere(cab[:4] == ['BRINCO', 'CATEGORIA', 'PARTOS', 'CRIAS'], f'{nome}: cabeçalho {cab}')
        lin.click()
        det = pg.get_by_test_id('vazia-detalhe'); det.wait_for()
        linhas = det.get_by_test_id('parto-lin').all_inner_texts()
        confere(len(linhas) == 4, f'{nome}: {len(linhas)} partos no detalhe')
        dt = det.inner_text()
        confere('cria 6501' in dt and 'macho' in dt and ('mamando' in dt or 'desmamado' in dt), f'{nome}: detalhe da cria 6501 {dt!r}')
        confere('natimorto' in dt and 'cria s/ nº' in dt and 'cria 4401' in dt and 'fêmea' in dt, f'{nome}: detalhe geral {dt!r}')
        confere('IATF' in dt or 'Monta' in dt or 'Mãe' in dt or 'monta' in dt, f'{nome}: pai/origem {dt!r}')
        pg.screenshot(path=os.path.join(SAIDA, f'parto_vazias_{nome}.png'))
        # busca pelo brinco da cria
        pg.get_by_label('Buscar pelo brinco').fill('4401')
        confere(pg.get_by_test_id('vazia-3005').count() == 1 and pg.locator('[data-testid^=vazia-]').count() == 2, f'{nome}: busca pela cria ({pg.locator("[data-testid^=vazia-]").count()} linhas)')
        pg.get_by_label('Buscar pelo brinco').fill('3001')
        confere(pg.locator('button[data-testid^=vazia-]').count() == 1, f'{nome}: busca pela vaca')
        # vaca sem parto lançado
        pg.get_by_label('Buscar pelo brinco').fill('')
        sem = pg.get_by_test_id('vazia-3002'); sem.scroll_into_view_if_needed()
        confere('sem parto lançado' in sem.inner_text(), f'{nome}: vaca sem parto {sem.inner_text()!r}')
        # a aba Cheias continua igual
        pg.get_by_role('tab', name='Cheias').first.click()
        confere('Previsão' in pg.locator('.led-h').first.inner_text() or 'PREVISÃO' in pg.locator('.led-h').first.inner_text().upper(), f'{nome}: aba Cheias mudou')
        confere(pg.evaluate('document.documentElement.scrollWidth') <= vp['width'], f'{nome}: rolagem lateral')
        confere(not erros, f'{nome}: erros de tela {erros}')
        ctx.close()
    b.close()
print(f'parto vazias: {ok} ok, {len(falhas)} falha(s)')
sys.exit(1 if falhas else 0)
