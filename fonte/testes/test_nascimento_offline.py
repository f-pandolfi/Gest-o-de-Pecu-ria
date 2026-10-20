# Nascimento sem internet (pergunta do Pandolfi em 20/10/26): o funcionário abre o app no campo sem internet,
# lança o nascimento, a cria aparece no app na hora, fica guardada no celular e vai para a planilha quando a internet voltar.
import os, json, sys, urllib.request, datetime
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright
BASE = os.environ.get('BASE', 'http://localhost:8765')
def srv(c, m='GET'):
    with urllib.request.urlopen(urllib.request.Request(BASE + c, method=m, data=b'' if m == 'POST' else None)) as r:
        t = r.read().decode(); return json.loads(t) if t.startswith('{') else t
def nascs(): return [e for e in srv('/__estado')['eventos'] if e['tipo'] == 'nascimento']
srv('/__reset', 'POST'); antes = len(nascs())
falhas = []; passo = lambda ok, msg: (print('  ok' if ok else '  FALHOU', msg), ok or falhas.append(msg))
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844}, locale='pt-BR', timezone_id='America/Sao_Paulo')
    pg = ctx.new_page(); erros = []; pg.on('pageerror', lambda e: erros.append(str(e)))
    ir = lambda n: pg.get_by_role('navigation', name='Telas (celular)').get_by_role('button', name=n).click()
    pg.goto(BASE + '/'); pg.wait_for_selector('.foot-note'); pg.wait_for_timeout(5000)  # 1ª vez com internet: guarda o app
    # no campo: sem internet, abre o app de novo
    ctx.set_offline(True); pg.reload(); pg.wait_for_selector('.foot-note', timeout=20000); pg.wait_for_timeout(1000)
    passo('Sem internet agora' in pg.inner_text('body'), 'app abre sem internet')
    ir('Parto'); vaca_lin = pg.locator('button.led-r').first; vaca = vaca_lin.locator('.b').inner_text()
    vaca_lin.click(); pg.get_by_role('button', name='Lançar nascimento desta vaca').click()
    pg.get_by_role('button', name='Fêmea', exact=True).click()
    pg.locator('#f-brincoBezerro').fill('7777')
    pg.get_by_role('button', name='Salvar registro').click()
    pg.wait_for_selector('text=ficou guardado neste celular', timeout=5000)
    passo(True, f'nascimento da vaca {vaca} salvo sem internet')
    passo('no celular' in pg.get_by_test_id('chip-fila').first.inner_text(), 'contador "no celular" aparece')
    passo(len(nascs()) == antes, 'nada chegou na planilha ainda')
    ir('Crias'); passo('7777' in pg.inner_text('body'), 'cria 7777 já aparece em Crias')
    ir('Rebanho'); passo('7777' in pg.get_by_test_id(f'reb-{vaca}').inner_text(), 'parto e cria já aparecem no Rebanho')
    # fecha e reabre o app ainda sem internet: não perde
    pg.reload(); pg.wait_for_selector('.foot-note', timeout=20000); pg.wait_for_timeout(1000)
    ir('Rebanho'); passo('7777' in pg.get_by_test_id(f'reb-{vaca}').inner_text(), 'reabrindo sem internet, o nascimento continua lá')
    # internet volta
    ctx.set_offline(False); pg.evaluate("window.dispatchEvent(new Event('online'))")
    for _ in range(60):
        if len(nascs()) == antes + 1 and pg.get_by_test_id('chip-fila').count() == 0: break
        pg.wait_for_timeout(250)
    n = [e for e in nascs() if e.get('brincoBezerro') == '7777']
    passo(len(n) == 1, f'internet voltou: chegou na planilha uma vez só ({len(n)})')
    passo(pg.get_by_test_id('chip-fila').count() == 0, 'contador some')
    passo(not erros, f'sem erros de tela {erros}')
    b.close()
print('FALHAS:', falhas) if falhas else print('nascimento sem internet: tudo ok')
sys.exit(1 if falhas else 0)
