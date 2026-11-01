# Com a planilha ainda no script 13 (antes de implantar o 14): editar e incluir funcionam; excluir avisa que precisa do script 14 e não apaga.
import os, json, sys, urllib.request
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright, expect
BASE = os.environ.get('BASE', 'http://localhost:8766')
PIN = '1537'
ok = 0; falhas = []
def srv(c, m='GET'):
    with urllib.request.urlopen(urllib.request.Request(BASE + c, method=m, data=b'' if m == 'POST' else None)) as r:
        t = r.read().decode(); return json.loads(t) if t.startswith('{') else t
def estado(): return srv('/__estado')
def gerais(e): return [x for x in e['eventos'] if x['tipo'] == 'manejo' and x.get('etapa') == 'Geral']
def teste(nome):
    def deco(fn):
        global ok
        try: fn(); ok += 1; print('  ok', nome)
        except Exception as ex: falhas.append((nome, ex)); print('  FALHOU', nome, '->', repr(ex)[:700])
    return deco
def esperar(cond, pg, ms=15000):
    import time; fim = time.time() + ms / 1000
    while time.time() < fim:
        try:
            if cond(): return True
        except Exception: pass
        pg.wait_for_timeout(250)
    raise AssertionError('condição não aconteceu a tempo')
srv('/__reset', 'POST')
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, locale='pt-BR', timezone_id='America/Sao_Paulo')
    pg = ctx.new_page(); erros = []; pg.on('pageerror', lambda e: erros.append(str(e)))
    ir = lambda n: pg.get_by_role('navigation', name='Telas (celular)').get_by_role('button', name=n).click()
    pg.goto(BASE + '/'); pg.wait_for_selector('.foot-note'); pg.wait_for_timeout(3000)
    e0 = estado()
    A = sorted([m for m in e0['matrizes'] if m['lote'] == 'Paridas' and m['status'] not in ('Vendida', 'Morta')], key=lambda m: int(m['brinco']))[1]

    @teste('Planilha no script 13: rodapé mostra v13')
    def _(): assert 'planilha v13' in pg.inner_text('.foot-note')

    @teste('Proprietário grava um manejo e edita (o script 13 já aceita editar)')
    def _():
        pg.get_by_role('button', name='Entrar como proprietário').first.click()
        for ch in PIN: pg.locator('#pin').press(ch)
        pg.get_by_role('button', name='Entrar', exact=True).click(); pg.locator('text=DONO >> visible=true').wait_for()
        ir('Manejo'); pg.get_by_role('tab', name='Geral').first.click()
        pg.get_by_role('button', name='Novo manejo').click()
        pg.locator('#mg-lote').select_option('Paridas'); pg.locator('#mg-desc').fill('Pour-on')
        pg.get_by_role('button', name=f"Marcar {A['brinco']}", exact=True).click()
        pg.get_by_role('button', name='Gravar manejo').click(); pg.get_by_test_id('conferencia').wait_for()
        esperar(lambda: len(gerais(estado())) == 1, pg)
        pg.get_by_test_id('abrir-manejo').click(); pg.get_by_test_id('geral-form').wait_for()
        pg.locator('#mg-desc').fill('Pour-on e vermífugo')
        pg.get_by_role('button', name='Salvar alterações').click(); pg.get_by_test_id('conferencia').wait_for()
        esperar(lambda: gerais(estado())[0]['descricao'] == 'Pour-on e vermífugo', pg)

    @teste('Excluir no script 13: avisa que precisa do script 14 e não apaga nada')
    def _():
        pg.get_by_test_id('excluir-manejo').click()
        pg.get_by_test_id('confirmar-exclusao-sim').click()
        expect(pg.get_by_test_id('confirmar-exclusao')).to_contain_text('precisa do script 14')
        pg.wait_for_timeout(1500)
        assert len(gerais(estado())) == 1
        assert not any(x.get('action') == 'excluirEventos' for x in estado()['posts'])

    @teste('Sem erros de tela')
    def _(): assert not erros, erros
    b.close()
print(f'editar com script 13: {ok} ok, {len(falhas)} falha(s)')
sys.exit(1 if falhas else 0)
