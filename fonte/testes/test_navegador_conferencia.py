# Testes de navegador da Conferência do rebanho (app 11.2). Base copiada do app 11: busca geral e ficha do animal, Rebanho com todos os animais (bois), Nascimentos,
# Diagnóstico com Toque, Manejo > Indução e Cadastros. Rodar com o servidor de teste no ar (script v15).
import os, json, sys, urllib.request, datetime
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('BASE', 'http://localhost:8765')
SAIDA = os.path.join(os.path.dirname(__file__), 'saida'); os.makedirs(SAIDA, exist_ok=True)
PIN = '1537'
ok = 0; falhas = []
def srv(c, m='GET', corpo=None):
    dados = json.dumps(corpo).encode() if corpo is not None else (b'' if m == 'POST' else None)
    with urllib.request.urlopen(urllib.request.Request(BASE + c, method=m, data=dados)) as r:
        t = r.read().decode(); return json.loads(t) if t.startswith('{') else t
def estado(): return srv('/__estado')
def teste(nome):
    def deco(fn):
        global ok
        try:
            fn(); ok += 1; print('  ok', nome)
        except Exception as ex:
            falhas.append((nome, ex)); print('  FALHOU', nome, '->', repr(ex)[:600])
    return deco
def esperar(cond, pg, ms=10000):
    import time
    fim = time.time() + ms / 1000
    while time.time() < fim:
        try:
            if cond(): return True
        except Exception:
            pass
        pg.wait_for_timeout(250)
    raise AssertionError('condição não aconteceu a tempo')
def nav(pg, nome):
    nm = 'Telas (celular)' if pg.viewport_size['width'] < 900 else 'Telas'
    pg.get_by_role('navigation', name=nm).get_by_role('button', name=nome).click()
def aba(pg, nome): pg.get_by_role('tab', name=nome).first.click()
def entrar_dono(pg):
    pg.get_by_role('button', name='Entrar como proprietário').first.click()
    for ch in PIN: pg.locator('#pin').press(ch)
    pg.get_by_role('button', name='Entrar', exact=True).click()
    pg.locator('text=DONO >> visible=true').wait_for()

srv('/__reset', 'POST')
est = srv('/__estado')
vaca = next(m for m in est['matrizes'] if m['brinco'] == '3005')
outra = next(m for m in est['matrizes'] if m['brinco'] != '3005' and m['status'] not in ('Vendida', 'Morta'))
srv('/exec', 'POST', {'action': 'appendEventos', 'itens': [
    {'tipo': 'manejo', 'evento': {'id': 'mjc1', 'tipo': 'manejo', 'etapa': 'Geral', 'data': '2026-10-31', 'lote': 'Teste', 'descricao': 'Vermífugo teste',
     'presentes': vaca['id'], 'ausentes': outra['id'], 'foraDoLote': json.dumps([{'animal': '', 'brinco': '8888', 'semCadastro': True, 'nota': 'brinco novo'}, {'animal': '', 'brinco': '4501', 'semCadastro': True}])}},
    {'tipo': 'nascimento', 'evento': {'id': 'hc1', 'tipo': 'nascimento', 'data': '2024-08-10', 'matrizId': outra['id'], 'sexo': 'Fêmea', 'brincoBezerro': '4501', 'resultadoParto': 'Vivo', 'observacoes': 'Histórico (planilha REBANHO 2026) · situação: A CONFIRMAR · raça Nelore'}},
]})

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, locale='pt-BR', timezone_id='America/Sao_Paulo', accept_downloads=True)
    pg = ctx.new_page(); erros = []; pg.on('pageerror', lambda e: erros.append(str(e)))
    pg.goto(BASE + '/'); pg.wait_for_selector('.foot-note')

    @teste('Rebanho > Conferência: números da rodada 1 e quem passou')
    def _():
        nav(pg, 'Rebanho'); aba(pg, 'Conferência')
        c = pg.get_by_test_id('conferencia'); expect(c).to_contain_text('Rodada 1: desde 01/10/26')
        expect(pg.get_by_test_id('kpi-faltam')).to_be_visible()
        pg.get_by_test_id('f-passaram').click()
        lin = pg.get_by_test_id('conf-3005').inner_text()
        assert '31/10/26' in lin and 'Vermífugo teste' in lin, lin
        pg.get_by_test_id('f-faltam').click()
        assert pg.get_by_test_id('conf-3005').count() == 0
        expect(pg.get_by_test_id(f"conf-{outra['brinco']}")).to_be_visible()

    @teste('Anotações: brinco sem cadastro aparece para conferir')
    def _():
        expect(pg.get_by_test_id('conf-anotacoes')).to_contain_text('8888')

    @teste('Ficha mostra se passou no curral; PDF para o curral baixa')
    def _():
        pg.get_by_test_id('f-passaram').click(); pg.get_by_test_id('conf-3005').click()
        expect(pg.locator('.fx-sobre [data-testid=no-curral]')).to_contain_text('Passou no curral em 31/10/26')
        pg.get_by_role('button', name='Fechar').click()
        pg.get_by_test_id('f-faltam').click(); pg.get_by_test_id(f"conf-{outra['brinco']}").click()
        expect(pg.locator('.fx-sobre [data-testid=no-curral]')).to_contain_text('Ainda não passou no curral')
        pg.get_by_role('button', name='Fechar').click()
        with pg.expect_download() as d: pg.get_by_test_id('conf-pdf-curral').click()
        caminho = os.path.join(SAIDA, 'conferencia_curral.pdf'); d.value.save_as(caminho)
        assert os.path.getsize(caminho) > 2000
        with pg.expect_download() as d2: pg.get_by_test_id('conf-pdf-lista').click()
        assert d2.value.suggested_filename.startswith('conferencia-faltam')

    @teste('Proprietário confirma na fazenda a novilha a confirmar que passou no curral')
    def _():
        expect(pg.get_by_test_id('conf-anotacoes')).to_contain_text('a confirmar')
        assert pg.get_by_test_id('confirmar-fazenda').count() == 0, 'funcionário não vê o botão'
        entrar_dono(pg); nav(pg, 'Rebanho'); aba(pg, 'Conferência')
        box = pg.get_by_test_id('confirmar-fazenda'); expect(box).to_contain_text('4501')
        box.get_by_label('Lote das novilhas confirmadas').fill('NOVILHAS')
        pg.get_by_test_id('confirmar-fazenda-sim').click()
        esperar(lambda: any(str(m['brinco']) == '4501' and m['id'] == 'cria-hc1' and m['categoria'] == 'Novilha' and m['lote'] == 'NOVILHAS' for m in estado()['matrizes']), pg)
        expect(pg.get_by_test_id('confirmar-fazenda')).to_have_count(0)
        pg.get_by_test_id('f-passaram').click(); expect(pg.get_by_test_id('conf-4501')).to_contain_text('Novilha')

    @teste('Celular sem rolagem lateral; sem erros de tela')
    def _():
        w = pg.evaluate('document.documentElement.scrollWidth'); assert w <= 390, w
        pg.screenshot(path=os.path.join(SAIDA, 'v112_conferencia_celular.png'), full_page=False)
        pg.set_viewport_size({'width': 1280, 'height': 900}); pg.wait_for_timeout(300)
        pg.screenshot(path=os.path.join(SAIDA, 'v112_conferencia_pc.png'), full_page=True)
        assert not erros, erros
    b.close()
print(f'navegador conferência: {ok} ok, {len(falhas)} falha(s)')
sys.exit(1 if falhas else 0)
