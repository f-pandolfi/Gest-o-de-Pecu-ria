# Teste da lista de matrizes (app 10.1): lote, último parto e número da cria aparecem no celular em pé e no computador.
import os, json, sys, urllib.request
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright
BASE = os.environ.get('BASE', 'http://localhost:8765')
SAIDA = os.path.join(os.path.dirname(__file__), 'saida'); os.makedirs(SAIDA, exist_ok=True)
def srv(c, m='GET'):
    with urllib.request.urlopen(urllib.request.Request(BASE + c, method=m, data=b'' if m == 'POST' else None)) as r:
        t = r.read().decode(); return json.loads(t) if t.startswith('{') else t
srv('/__reset', 'POST')
est = srv('/__estado')
nasc = [e for e in est['eventos'] if e['tipo'] == 'nascimento' and e.get('matrizId')]
mid = {m['id']: m for m in est['matrizes']}
# vaca com parto: pega o parto mais recente dela
porvaca = {}
for e in nasc:
    if e['matrizId'] not in porvaca or e['data'] > porvaca[e['matrizId']]['data']: porvaca[e['matrizId']] = e
alvo_id, alvo = next((k, v) for k, v in porvaca.items() if v.get('brincoBezerro'))
vaca = mid[alvo_id]; d = alvo['data']; dbr = f"{d[8:10]}/{d[5:7]}/{d[2:4]}"
print('vaca', vaca['brinco'], 'lote', vaca.get('lote'), 'parto', dbr, 'cria', alvo['brincoBezerro'])
falhas = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for nome, vp in [('celular', {'width': 390, 'height': 844}), ('computador', {'width': 1280, 'height': 900})]:
        ctx = b.new_context(viewport=vp, locale='pt-BR', timezone_id='America/Sao_Paulo')
        pg = ctx.new_page(); erros = []; pg.on('pageerror', lambda e: erros.append(str(e)))
        pg.goto(BASE + '/'); pg.wait_for_selector('.foot-note')
        nm = 'Telas (celular)' if vp['width'] < 900 else 'Telas'
        pg.get_by_role('navigation', name=nm).get_by_role('button', name='Rebanho').click()
        lin = pg.get_by_test_id(f"reb-{vaca['brinco']}")
        lin.scroll_into_view_if_needed()
        txt = lin.inner_text()
        for esperado in [dbr, str(alvo['brincoBezerro'])]:
            if esperado not in txt: falhas.append(f'{nome}: falta {esperado} em {txt!r}')
        situ = lin.locator('.so-cel').is_visible()
        if situ != (nome == 'celular'): falhas.append(f'{nome}: situação em texto visível={situ}')
        if lin.locator('.vac-tag, .tag').first.is_visible() if nome == 'celular' and lin.locator('.vac-tag, .tag').count() else False: falhas.append('celular: etiqueta de situação sobrando')
        caixa = lin.bounding_box()
        if caixa['height'] > 80: falhas.append(f'{nome}: linha alta demais {caixa}')
        largura = pg.evaluate('document.documentElement.scrollWidth')
        if largura > vp['width']: falhas.append(f'{nome}: rolagem lateral {largura}')
        if erros: falhas.append(f'{nome}: erros {erros}')
        pg.screenshot(path=os.path.join(SAIDA, f'rebanho_{nome}.png'))
        ctx.close()
    b.close()
print('FALHAS:', falhas) if falhas else print('ok: lista de matrizes no celular e no computador')
sys.exit(1 if falhas else 0)
