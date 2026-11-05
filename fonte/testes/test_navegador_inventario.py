# Testes de navegador do Inventário (app 11.3). Base copiada do app 11: busca geral e ficha do animal, Rebanho com todos os animais (bois), Nascimentos,
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
     'presentes': vaca['id'] + ',c:h3558', 'ausentes': outra['id'], 'foraDoLote': json.dumps([
        {'animal': vaca['id'], 'brinco': '3005', 'tipo': 'matriz', 'mudar': 'pendente', 'nota': 'casco ruim'},
        {'animal': '', 'brinco': '8888', 'semCadastro': True, 'nota': 'brinco novo'}, {'animal': '', 'brinco': '4501', 'semCadastro': True}])}},
    {'tipo': 'nascimento', 'evento': {'id': 'h3558', 'tipo': 'nascimento', 'data': '2023-08-27', 'sexo': 'Macho', 'brincoBezerro': '3558', 'resultadoParto': 'Vivo', 'observacoes': 'Histórico (planilha REBANHO 2026) · situação: VENDIDO · raça Nelore · mãe 4002 (fora do cadastro)'}},
    {'tipo': 'nascimento', 'evento': {'id': 'hc1', 'tipo': 'nascimento', 'data': '2024-08-10', 'matrizId': outra['id'], 'sexo': 'Fêmea', 'brincoBezerro': '4501', 'resultadoParto': 'Vivo', 'observacoes': 'Histórico (planilha REBANHO 2026) · situação: A CONFIRMAR · raça Nelore'}},
]})

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, locale='pt-BR', timezone_id='America/Sao_Paulo', accept_downloads=True)
    pg = ctx.new_page(); erros = []; pg.on('pageerror', lambda e: erros.append(str(e)))
    pg.goto(BASE + '/'); pg.wait_for_selector('.foot-note')

    @teste('Menu Inventário: resumo por categoria e rodada 1 desde 01/10/26')
    def _():
        nav(pg, 'Inventário')
        expect(pg.get_by_test_id('inventario')).to_contain_text('Rodada 1: desde 01/10/26')
        expect(pg.get_by_test_id('inv-tabela-cat')).to_contain_text('Vacas')
        expect(pg.get_by_test_id('inv-tabela-cat')).to_contain_text('Total')

    @teste('Animais: lote do sistema x lote conferido, data e observação')
    def _():
        aba(pg, 'Animais')
        pg.get_by_label('Buscar brinco no inventário').fill('3005')
        lin = pg.get_by_test_id('inv-3005').inner_text()
        for txt in ('Conferido', '31/10/26', 'Teste', vaca['lote'], 'casco ruim'):
            assert txt in lin, (txt, lin)
        pg.get_by_label('Buscar brinco no inventário').fill('')
        pg.get_by_test_id('inv-f-nao').click()
        expect(pg.get_by_test_id(f"inv-{outra['brinco']}")).to_contain_text('Não conferido')
        with pg.expect_download() as d: pg.get_by_test_id('inv-pdf-lista').click()
        assert d.value.suggested_filename.startswith('inventario-lista')

    @teste('Divergências: sem cadastro aparece; funcionário não aplica lote')
    def _():
        aba(pg, 'Divergências')
        expect(pg.get_by_test_id('inv-semcad')).to_contain_text('8888')
        assert pg.get_by_test_id('aplicar-lotes').count() == 0
        with pg.expect_download() as d: pg.get_by_test_id('inv-pdf-divergencias').first.click()
        caminho = os.path.join(SAIDA, 'inventario_divergencias.pdf'); d.value.save_as(caminho); assert os.path.getsize(caminho) > 2000

    @teste('Proprietário aplica o lote conferido e confirma a novilha na fazenda')
    def _():
        entrar_dono(pg); nav(pg, 'Inventário'); aba(pg, 'Divergências')
        expect(pg.get_by_test_id('aplicar-lotes')).to_contain_text('3005')
        pg.get_by_test_id('aplicar-lotes-sim').click()
        esperar(lambda: next(m for m in estado()['matrizes'] if m['id'] == vaca['id'])['lote'] == 'Teste', pg)
        expect(pg.get_by_test_id('confirmar-fazenda')).to_contain_text('4501')
        pg.get_by_test_id('confirmar-fazenda-sim').click()
        esperar(lambda: any(m['id'] == 'cria-hc1' for m in estado()['matrizes']), pg)

    @teste('Dono: ficha abre com o cadastro editável e grava na hora (matriz)')
    def _():
        aba(pg, 'Animais'); pg.get_by_label('Buscar brinco no inventário').fill('3005'); pg.get_by_test_id('inv-3005').click()
        ed = pg.locator('.fx-sobre [data-testid=editor-cadastro]'); expect(ed).to_be_visible()
        ed.get_by_label('Raça').fill('Sindi'); ed.get_by_label('Lote').fill('Maternidade')
        ed.get_by_test_id('editor-salvar').click()
        esperar(lambda: (lambda m: m['raca'] == 'Sindi' and m['lote'] == 'Maternidade')(next(m for m in estado()['matrizes'] if m['id'] == vaca['id'])), pg)
        expect(ed.get_by_test_id('editor-msg')).to_contain_text('salvo')
        pg.get_by_role('button', name='Fechar').click()
        pg.get_by_label('Buscar brinco no inventário').fill('')

    @teste('Dono: 3558 vendido no histórico vira touro da fazenda pela ficha')
    def _():
        aba(pg, 'Divergências')
        pg.locator('[data-testid=inv-divergencias] .fx-li', has_text='3558').first.click()
        pg.get_by_test_id('alterar-situacao').click()
        pg.get_by_test_id('alterar-situacao-painel').get_by_role('button', name='Virou touro da fazenda').click()
        pg.get_by_test_id('alterar-situacao-painel').get_by_label('Lote').fill('Touro')
        pg.get_by_test_id('alterar-situacao-gravar').click()
        esperar(lambda: any(str(t.get('brinco')) == '3558' and t.get('tipo') == 'Touro vivo' for t in estado()['touros']), pg)
        esperar(lambda: 'situação definida pelo dono: TOURO' in next(e for e in estado()['eventos'] if e['id'] == 'h3558').get('observacoes', ''), pg)
        pg.get_by_role('button', name='Fechar').click()
        aba(pg, 'Resumo'); expect(pg.get_by_test_id('inv-tabela-cat')).to_contain_text('Touros')

    @teste('PDF completo; ficha abre da lista; celular sem rolagem lateral; sem erros')
    def _():
        aba(pg, 'Resumo')
        with pg.expect_download() as d: pg.get_by_test_id('inv-pdf-completo').click()
        caminho = os.path.join(SAIDA, 'inventario_completo.pdf'); d.value.save_as(caminho); assert os.path.getsize(caminho) > 3000
        pg.screenshot(path=os.path.join(SAIDA, 'v113_inv_resumo_celular.png'), full_page=False)
        aba(pg, 'Animais'); pg.get_by_test_id('inv-3005').click()
        expect(pg.locator('.fx-sobre [data-testid=no-curral]')).to_contain_text('Passou no curral')
        pg.get_by_role('button', name='Fechar').click()
        w = pg.evaluate('document.documentElement.scrollWidth'); assert w <= 390, w
        pg.screenshot(path=os.path.join(SAIDA, 'v113_inv_animais_celular.png'), full_page=False)
        pg.set_viewport_size({'width': 1366, 'height': 900}); pg.wait_for_timeout(300)
        pg.screenshot(path=os.path.join(SAIDA, 'v113_inv_animais_pc.png'), full_page=False)
        aba(pg, 'Lotes'); pg.wait_for_timeout(200)
        pg.screenshot(path=os.path.join(SAIDA, 'v113_inv_lotes_pc.png'), full_page=False)
        assert not erros, erros
    b.close()
print(f'navegador inventário: {ok} ok, {len(falhas)} falha(s)')
sys.exit(1 if falhas else 0)
