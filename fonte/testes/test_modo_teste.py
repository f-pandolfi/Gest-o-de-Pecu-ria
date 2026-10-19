# A área /teste/ continua sem gravar nada na planilha (e simula a falta de internet sem perder o lançamento).
import os, json, sys, urllib.request
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright
BASE = 'http://localhost:8765'
def srv(c, m='GET'):
    with urllib.request.urlopen(urllib.request.Request(BASE + c, method=m, data=b'' if m == 'POST' else None)) as r: t = r.read().decode(); return json.loads(t) if t.startswith('{') else t
srv('/__reset', 'POST')
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 400, 'height': 880}); pg = ctx.new_page()
    erros = []; pg.on('pageerror', lambda e: erros.append(str(e)))
    pg.goto(BASE + '/'); pg.wait_for_selector('.foot-note')
    assert 'MODO TESTE' in pg.inner_text('.banner-teste')
    assert 'TESTE' in pg.inner_text('.foot-note')
    pg.get_by_role('navigation', name='Telas (celular)').get_by_role('button', name='Crias').click()
    pg.get_by_role('tab', name='Pesar', exact=True).click()
    for br, w in [('6502', 230)]:
        pg.locator('#pesar-brinco').fill(br); pg.locator('#pesar-brinco').press('Enter'); pg.locator('#pesar-peso').fill(str(w)); pg.locator('#pesar-peso').press('Enter')
    pg.get_by_role('button', name='Gravar 1 pesagem(ns)').click()
    pg.wait_for_selector('text=modo teste: só na tela')
    pg.wait_for_timeout(1000)
    assert srv('/__estado')['posts'] == [], 'modo teste gravou na planilha!'
    assert len(pg.evaluate('window.__gravacoesSimuladas')) == 1
    assert not erros, erros
    b.close()
print('modo teste: ok (nada foi gravado na planilha)')
