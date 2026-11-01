# Testes de navegador do app 11: busca geral e ficha do animal, Rebanho com todos os animais (bois), Nascimentos,
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
nov = next(m for m in est['matrizes'] if m['categoria'] == 'Novilha' and m['status'] not in ('Vendida', 'Morta'))
srv('/exec', 'POST', {'action': 'appendEventos', 'itens': [
    {'tipo': 'nascimento', 'evento': {'id': 'tp1', 'tipo': 'nascimento', 'data': '2024-02-10', 'matrizId': vaca['id'], 'sexo': 'Macho', 'brincoBezerro': '4401', 'resultadoParto': 'Vivo', 'observacoes': 'Histórico (planilha REBANHO 2026) · situação: VENDIDO em 03/06/2024 · raça Nelore'}},
    {'tipo': 'nascimento', 'evento': {'id': 'tp2', 'tipo': 'nascimento', 'data': '2025-03-01', 'matrizId': vaca['id'], 'sexo': 'Fêmea', 'brincoBezerro': '', 'resultadoParto': 'Vivo', 'observacoes': 'Histórico (planilha REBANHO 2026) · situação: A CONFIRMAR · sem número da cria na planilha'}},
]})

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, locale='pt-BR', timezone_id='America/Sao_Paulo', accept_downloads=True)
    pg = ctx.new_page(); erros = []; pg.on('pageerror', lambda e: erros.append(str(e)))
    pg.goto(BASE + '/'); pg.wait_for_selector('.foot-note')

    @teste('Menu novo: Diagnóstico e Nascimentos no lugar de Parto e Crias')
    def _():
        bar = pg.get_by_role('navigation', name='Telas (celular)')
        for n in ['Lançar', 'Manejo', 'Diagnóstico', 'Nascimentos', 'Rebanho', 'Produtividade', 'Relatórios']:
            expect(bar.get_by_role('button', name=n)).to_be_visible()
        assert bar.get_by_role('button', name='Parto').count() == 0 and bar.get_by_role('button', name='Crias').count() == 0

    @teste('Busca pelo brinco abre a ficha completa da vaca com os 3 partos e a cria clicável')
    def _():
        pg.locator('[data-testid=buscar-animal] >> visible=true').click()
        pg.get_by_label('Brinco do animal').fill('3005'); pg.keyboard.press('Enter')
        f = pg.locator('.fx-sobre'); expect(f).to_contain_text('Partos e crias')
        t = f.inner_text()
        assert '3 partos' in t and '6501' in t and '4401' in t and 's/ nº' in t, t[:900]
        assert t.index('12/03/26') < t.index('01/03/25') < t.index('10/02/24'), 'partos fora de ordem'
        f.get_by_role('button', name='4401').first.click()
        expect(f).to_contain_text('Vendido')
        expect(f).to_contain_text('Irmãos')
        pg.get_by_role('button', name='Voltar').click(); expect(f).to_contain_text('Reprodução agora')
        pg.get_by_role('button', name='Fechar').click(); expect(f).to_have_count(0)

    @teste('Rebanho: resumo, abas Todos/Matrizes/Crias/Touros/Bois e linha da vaca com última cria')
    def _():
        nav(pg, 'Rebanho')
        expect(pg.get_by_test_id('resumo-rebanho')).to_contain_text('Vacas')
        for a in ['Todos', 'Matrizes', 'Crias', 'Touros', 'Bois']: expect(pg.get_by_role('tab', name=a).first).to_be_visible()
        aba(pg, 'Matrizes')
        pg.get_by_label('Filtrar pelo brinco').fill('3005')
        lin = pg.get_by_test_id('animal-3005').first.inner_text()
        assert 'Últ. cria 6501' in lin and '3 partos' in lin, lin
        pg.get_by_label('Filtrar pelo brinco').fill('')
        nl = pg.get_by_test_id(f"animal-{nov['brinco']}").first.inner_text()
        assert 'Não induzida' in nl, nl
        aba(pg, 'Crias'); expect(pg.locator('.fx-li').first).to_be_visible()
        aba(pg, 'Bois'); expect(pg.locator('body')).to_contain_text('Nenhum boi cadastrado')

    @teste('Nascimentos: aba Nascimentos por ano com gráfico e Crias, Pesar continuam')
    def _():
        nav(pg, 'Nascimentos')
        expect(pg.get_by_test_id('nascimentos-ano')).to_contain_text('Nascimentos por mês')
        pg.get_by_role('button', name='2025').click()
        expect(pg.get_by_test_id('nascimentos-ano')).to_contain_text('Nascimentos 2025')
        pg.get_by_role('button', name='Faltando dados').click()
        expect(pg.get_by_test_id('nascimentos-ano')).to_contain_text('s/ nº')
        aba(pg, 'Crias'); aba(pg, 'Pesar')

    @teste('Diagnóstico: Cheias, Vazias e Toque (que saiu do Manejo); ficha a partir da lista')
    def _():
        nav(pg, 'Diagnóstico'); expect(pg.locator('h1')).to_have_text('Diagnóstico')
        aba(pg, 'Vazias'); pg.locator('button.led-r').first.click()
        pg.get_by_role('button', name='Ficha completa').first.click(); expect(pg.locator('.fx-sobre')).to_contain_text('Identificação')
        pg.get_by_role('button', name='Fechar').click()
        aba(pg, 'Toque'); expect(pg.locator('body')).to_contain_text('Toque')
        nav(pg, 'Manejo'); assert pg.get_by_role('tab', name='Toque').count() == 0

    @teste('Funcionário não vê Cadastros e não tem "Alterar cadastro" na ficha')
    def _():
        assert pg.get_by_test_id('abrir-cadastros').count() == 0
        pg.locator('[data-testid=buscar-animal] >> visible=true').click(); pg.get_by_label('Brinco do animal').fill('3005'); pg.keyboard.press('Enter')
        expect(pg.locator('.fx-sobre')).to_contain_text('Alterar cadastro só com a senha')
        assert pg.get_by_role('button', name='Alterar cadastro').count() == 0
        pg.get_by_role('button', name='Fechar').click()

    @teste('Manejo > Indução: D0 grava manejo de indução e a novilha passa a "Induzida em"')
    def _():
        nav(pg, 'Manejo'); aba(pg, 'Indução')
        pg.get_by_test_id('nova-inducao').click()
        pg.get_by_test_id('ind-brinco').fill('3005')
        expect(pg.get_by_test_id('inducao-form')).to_contain_text('não entra na indução')
        pg.get_by_test_id('ind-brinco').fill(str(nov['brinco'])); pg.get_by_test_id('ind-brinco').press('Enter')
        expect(pg.get_by_test_id('inducao-form')).to_contain_text('1 marcada(s)')
        expect(pg.get_by_test_id('ind-brinco')).to_have_value('')
        pg.get_by_test_id('gravar-inducao').click()
        expect(pg.get_by_test_id('inducao')).to_contain_text('Indução gravada')
        esperar(lambda: any(e['tipo'] == 'manejo' and str(e.get('etapa', '')).startswith('Indução · D0') and nov['id'] in str(e.get('presentes', '')) for e in estado()['eventos']), pg)
        # avaliação: já traz a novilha do D0; marca Ciclando
        pg.get_by_test_id('nova-inducao').click()
        pg.get_by_test_id('etapa-Avaliação').click()
        pg.get_by_test_id(f"res-{nov['brinco']}-Ciclando").click()
        pg.get_by_test_id('gravar-inducao').click()
        expect(pg.get_by_test_id('inducao')).to_contain_text('1 ciclando')
        nav(pg, 'Rebanho'); aba(pg, 'Matrizes')
        assert 'Induzida em' in pg.get_by_test_id(f"animal-{nov['brinco']}").first.inner_text()
        pg.get_by_test_id(f"animal-{nov['brinco']}").first.click()
        t = pg.locator('.fx-sobre').inner_text(); assert 'D0 · Implante' in t and 'Ciclando' in t, t[:800]
        pg.get_by_role('button', name='Fechar').click()

    @teste('Dono: cadastra boi, ele aparece no Rebanho e não aparece como touro reprodutor')
    def _():
        entrar_dono(pg)
        nav(pg, 'Rebanho'); aba(pg, 'Bois'); pg.get_by_test_id('cadastrar-boi').click()
        pg.locator('#boi-brinco').fill('701'); pg.locator('#boi-pesoAtual').fill('410'); pg.locator('#boi-lote').fill('Engorda')
        pg.get_by_role('button', name='Cadastrar', exact=True).click()
        expect(pg.get_by_test_id('animal-701')).to_contain_text('Na fazenda')
        esperar(lambda: any(t.get('tipo') == 'Boi' and str(t.get('brinco')) == '701' for t in estado()['touros']), pg)
        aba(pg, 'Touros'); assert 'Boi 701' not in pg.inner_text('body')
        pg.locator('[data-testid=buscar-animal] >> visible=true').click(); pg.get_by_label('Brinco do animal').fill('701'); pg.keyboard.press('Enter')
        f = pg.locator('.fx-sobre'); expect(f).to_contain_text('410 kg'); expect(f).to_contain_text('Engorda')
        pg.get_by_role('button', name='Alterar cadastro').click()
        expect(pg.get_by_role('dialog', name='Boi 701')).to_be_visible(); pg.keyboard.press('Escape')
        pg.get_by_role('button', name='Fechar').click()

    @teste('Dono: ficha da vaca tem "Alterar cadastro" que abre direto a edição')
    def _():
        pg.locator('[data-testid=buscar-animal] >> visible=true').click(); pg.get_by_label('Brinco do animal').fill('3005'); pg.keyboard.press('Enter')
        pg.get_by_role('button', name='Alterar cadastro').click()
        expect(pg.get_by_role('button', name='Salvar alterações')).to_be_visible()
        pg.get_by_role('button', name='Cancelar').click(); pg.keyboard.press('Escape')
        if pg.locator('.fx-sobre').count(): pg.get_by_role('button', name='Fechar').click()

    @teste('Cadastros: acrescenta causa de morte, desativa outra, grava na Config e a aba Morte usa a lista')
    def _():
        pg.locator('[data-testid=abrir-cadastros] >> visible=true').click()
        expect(pg.locator('h1')).to_have_text('Cadastros')
        c = pg.get_by_test_id('cad-causasMorte')
        c.get_by_role('button', name='adicionar').click(); c.get_by_label('Novo item em Causas de morte').fill('Afogamento'); pg.keyboard.press('Enter')
        c.get_by_role('button', name='Desativar Raio').click()
        esperar(lambda: 'Afogamento' in str(estado()['config'].get('cadastros', '')), pg)
        cad = json.loads(estado()['config']['cadastros'])
        assert {'v': 'Raio', 'ativo': False} in cad['causasMorte'] and {'v': 'Afogamento', 'ativo': True} in cad['causasMorte'], cad
        nav(pg, 'Lançar'); pg.get_by_role('tab', name='Morte').first.click()
        opts = pg.locator('#f-causa option').all_inner_texts()
        assert 'Afogamento' in opts and 'Raio' not in opts, opts

    @teste('Produtividade: aba nova com números, situação de cada matriz, filtro de 6 meses e ficha ao tocar')
    def _():
        nav(pg, 'Produtividade')
        t = pg.get_by_test_id('produtividade'); expect(t).to_contain_text('Meta: cada vaca dá um bezerro por ano')
        expect(t).to_contain_text('Onde está cada matriz')
        expect(pg.get_by_test_id('prod-3005')).to_contain_text('12/03/26')
        pg.get_by_test_id('kpi-seis').click()
        n = pg.locator('[data-testid=tabela-produtividade] tbody tr').count(); assert n >= 1, n
        pg.get_by_role('button', name='Todas').first.click()
        pg.get_by_test_id('prod-3005').click(); expect(pg.locator('.fx-sobre')).to_contain_text('Partos e crias')
        pg.get_by_role('button', name='Fechar').click()

    @teste('Produtividade: PDF do estudo filtrado e PDF completo')
    def _():
        nav(pg, 'Produtividade'); pg.get_by_test_id('kpi-seis').click()
        with pg.expect_download() as d: pg.get_by_test_id('pdf-lista').click()
        assert d.value.suggested_filename.startswith('produtividade-seis'), d.value.suggested_filename
        with pg.expect_download() as d2: pg.get_by_test_id('pdf-tudo').click()
        assert d2.value.suggested_filename.startswith('produtividade-completa'), d2.value.suggested_filename
        assert pg.evaluate('window.__ultimoPDF.paginas') >= 1

    @teste('Diagnóstico avisa vacas com mais de 6 meses sem emprenhar e filtra as Vazias')
    def _():
        nav(pg, 'Diagnóstico')
        expect(pg.get_by_test_id('alerta-6meses')).to_contain_text('meses sem emprenhar')
        pg.get_by_role('button', name='Ver em Vazias').click()
        expect(pg.get_by_test_id('filtro-6meses')).to_contain_text('mostrando')
        assert pg.locator('[data-testid^=vazia-]').count() >= 1
        pg.get_by_test_id('filtro-6meses').click()

    @teste('Celular e computador sem rolagem lateral; sem erros de tela')
    def _():
        for tela in ['Rebanho', 'Nascimentos', 'Diagnóstico', 'Manejo', 'Produtividade']:
            nav(pg, tela); w = pg.evaluate('document.documentElement.scrollWidth'); assert w <= 390, (tela, w)
        pg.screenshot(path=os.path.join(SAIDA, 'v11_celular.png'))
        pg.set_viewport_size({'width': 1280, 'height': 900})
        nav(pg, 'Rebanho'); w = pg.evaluate('document.documentElement.scrollWidth'); assert w <= 1280, w
        pg.locator('[data-testid=buscar-animal] >> visible=true').click(); pg.get_by_label('Brinco do animal').fill('3005'); pg.keyboard.press('Enter')
        pg.screenshot(path=os.path.join(SAIDA, 'v11_ficha_pc.png'))
        assert not erros, erros
    b.close()
print(f'navegador app 11: {ok} ok, {len(falhas)} falha(s)')
sys.exit(1 if falhas else 0)
