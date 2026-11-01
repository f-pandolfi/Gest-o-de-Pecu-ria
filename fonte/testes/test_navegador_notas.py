# Observação por brinco no Manejo > Geral (app 10.6): funcionário anota ao conferir (ficha, linha da lista, de fora, sem cadastro),
# o rascunho guarda as observações, a conferência e o PDF mostram, o proprietário vê "Observações para efetivar",
# marca como efetivada, desfaz e marca todas. Nada de PIN em tela pública: o PIN é o do servidor de teste.
import os, json, sys, urllib.request
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright, expect
BASE = os.environ.get('BASE', 'http://localhost:8765')
SAIDA = os.path.join(os.path.dirname(__file__), 'saida'); os.makedirs(SAIDA, exist_ok=True)
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
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, locale='pt-BR', timezone_id='America/Sao_Paulo', accept_downloads=True)
    pg = ctx.new_page(); erros = []; pg.on('pageerror', lambda e: erros.append(str(e)))
    ir = lambda n: pg.get_by_role('navigation', name='Telas (celular)').get_by_role('button', name=n).click()
    aba = lambda n: pg.get_by_role('tab', name=n).first.click()
    campo = lambda: pg.get_by_label('Brinco para conferir')
    pg.goto(BASE + '/'); pg.wait_for_selector('.foot-note'); pg.wait_for_timeout(3000)
    e0 = estado()
    paridas = sorted([m for m in e0['matrizes'] if m['lote'] == 'Paridas' and m['status'] not in ('Vendida', 'Morta')], key=lambda m: int(m['brinco']))
    solteira = next(m for m in e0['matrizes'] if m['lote'] == 'Solteiras')
    A, B, C = paridas[1], paridas[2], paridas[4]  # A: ficha + marca; B: linha da lista + marca; C: nota sem marcar

    @teste('Ficha do animal do lote tem campo de observação e a nota aparece na linha depois de marcar')
    def _():
        ir('Manejo'); aba('Geral')
        pg.get_by_role('button', name='Novo manejo').click()
        pg.locator('#mg-lote').select_option('Paridas')
        pg.locator('#mg-desc').fill('Pour-on'); pg.locator('#mg-resp').fill('João')
        campo().fill(str(A['brinco']))
        ficha = pg.get_by_test_id(f"ficha-m:{A['id']}"); ficha.wait_for()
        ficha.get_by_test_id(f"nota-{A['brinco']}").fill('cadastrar a cria dela')
        ficha.get_by_test_id('ficha-acao').click()
        txt = pg.get_by_test_id(f"nota-txt-{A['brinco']}")
        expect(txt).to_have_text('cadastrar a cria dela')
        expect(pg.get_by_role('button', name=f"Observação do brinco {A['brinco']} (tem observação)")).to_be_visible()

    @teste('Linha da lista: botão de observação abre o campo; nota em animal que não foi marcado também fica')
    def _():
        pg.get_by_label(f"Marcar {B['brinco']}").click()
        pg.get_by_test_id(f"nota-bt-{B['brinco']}").click()
        pg.get_by_test_id(f"nota-{B['brinco']}").fill('sem brinco auricular')
        pg.get_by_test_id(f"nota-bt-{C['brinco']}").click()
        pg.get_by_test_id(f"nota-{C['brinco']}").fill('não veio, procurar')
        pg.get_by_test_id(f"nota-bt-{B['brinco']}").click(); pg.get_by_test_id(f"nota-bt-{C['brinco']}").click()
        expect(pg.get_by_test_id(f"nota-txt-{B['brinco']}")).to_have_text('sem brinco auricular')
        expect(pg.get_by_test_id(f"nota-txt-{C['brinco']}")).to_have_text('não veio, procurar')
        expect(pg.get_by_test_id('contador')).to_contain_text('2 de')

    @teste('De outro lote e sem cadastro: observação digitada na ficha segue para a linha de fora')
    def _():
        campo().fill(str(solteira['brinco']))
        f = pg.get_by_test_id(f"ficha-m:{solteira['id']}"); f.wait_for()
        f.get_by_test_id(f"nota-{solteira['brinco']}").fill('trocar para o lote Paridas')
        expect(f).to_contain_text('gravada quando você incluir')
        f.get_by_test_id('ficha-acao').click()
        expect(pg.get_by_test_id(f"fora-{solteira['brinco']}").get_by_test_id(f"nota-{solteira['brinco']}")).to_have_value('trocar para o lote Paridas')
        campo().fill('77777')
        sc = pg.get_by_test_id('ficha-sem-cadastro'); sc.wait_for()
        sc.get_by_test_id('nota-77777').fill('brinco perdido, cadastrar')
        pg.get_by_test_id('incluir-sem-cadastro').click()
        expect(pg.get_by_test_id('fora-77777').get_by_test_id('nota-77777')).to_have_value('brinco perdido, cadastrar')

    @teste('Rascunho guarda as observações (recarregar a página não perde)')
    def _():
        pg.reload(); pg.wait_for_selector('.foot-note'); ir('Manejo'); aba('Geral')
        pg.get_by_test_id('geral-form').wait_for()
        expect(pg.get_by_test_id(f"nota-txt-{A['brinco']}")).to_have_text('cadastrar a cria dela')
        expect(pg.get_by_test_id('fora-77777').get_by_test_id('nota-77777')).to_have_value('brinco perdido, cadastrar')
        expect(pg.get_by_test_id(f"fora-{solteira['brinco']}").get_by_test_id(f"nota-{solteira['brinco']}")).to_have_value('trocar para o lote Paridas')
        pg.screenshot(path=os.path.join(SAIDA, 'notas_form.png'))

    @teste('Tirar um brinco de fora também tira a observação dele')
    def _():
        campo().fill('66666'); pg.get_by_test_id('ficha-sem-cadastro').get_by_test_id('nota-66666').fill('esse sai')
        pg.get_by_test_id('incluir-sem-cadastro').click()
        pg.get_by_role('button', name='Tirar 66666').click()
        assert pg.get_by_test_id('fora-66666').count() == 0

    @teste('Gravar: manejo e observações vão para a planilha; conferência e mensagem mostram as 5 observações')
    def _():
        antes = len(gerais(estado()))
        pg.get_by_role('button', name='Gravar manejo').click()
        conf = pg.get_by_test_id('conferencia'); conf.wait_for()
        t = conf.inner_text()
        assert 'Manejo gravado' in t and '5 observação(ões) por brinco gravada(s) para o proprietário efetivar' in t, t[:700]
        assert 'Observações por brinco' in t.replace('OBSERVAÇÕES', 'Observações') or 'OBSERVAÇÕES POR BRINCO' in t.upper(), t[:900]
        for txt in ('cadastrar a cria dela', 'sem brinco auricular', 'não veio, procurar', 'trocar para o lote Paridas', 'brinco perdido, cadastrar'):
            assert txt in t, txt
        assert 'esse sai' not in t
        esperar(lambda: len(gerais(estado())) == antes + 1, pg)
        g = gerais(estado())[-1]; fo = json.loads(g['foraDoLote'])
        notas = {(x['animal'] or 'b:' + x['brinco']): x['nota'] for x in fo if x.get('nota')}
        assert notas == {A['id']: 'cadastrar a cria dela', B['id']: 'sem brinco auricular', C['id']: 'não veio, procurar', solteira['id']: 'trocar para o lote Paridas', 'b:77777': 'brinco perdido, cadastrar'}, notas
        assert [x['doLote'] for x in fo if x['animal'] in (A['id'], B['id'], C['id'])] == [True, True, True]
        assert C['id'] in g['ausentes'].split(',') and A['id'] in g['presentes'].split(',')
        pg.screenshot(path=os.path.join(SAIDA, 'notas_conferencia.png'))
        with pg.expect_download() as d: pg.get_by_role('button', name='PDF da conferência').click()
        assert d.value.suggested_filename.endswith('.pdf')

    @teste('Funcionário não vê "Observações para efetivar"; a lista de manejos conta as observações')
    def _():
        pg.get_by_role('button', name='Voltar').first.click()
        assert pg.get_by_test_id('pendencias-notas').count() == 0
        expect(pg.get_by_test_id('geral-inicio')).to_contain_text('5 observação(ões)')

    @teste('Proprietário: aba Geral mostra o número, o cartão lista as observações e Efetivada grava na planilha')
    def _():
        pg.get_by_role('button', name='Entrar como proprietário').first.click()
        for ch in PIN: pg.locator('#pin').press(ch)
        pg.get_by_role('button', name='Entrar', exact=True).click(); pg.locator('text=DONO >> visible=true').wait_for()
        ir('Manejo')
        expect(pg.get_by_role('tab', name='Geral').first).to_contain_text('6')  # 5 observações + 1 mudança de lote
        aba('Geral')
        cartao = pg.get_by_test_id('pendencias-notas'); cartao.wait_for()
        expect(cartao).to_contain_text('Observações para efetivar'); expect(cartao).to_contain_text('5')
        expect(cartao).to_contain_text('brinco perdido, cadastrar'); expect(cartao).to_contain_text('sem cadastro')
        pg.screenshot(path=os.path.join(SAIDA, 'notas_pendencias.png'))
        pg.get_by_role('button', name='Efetivada a observação do brinco 77777').click()
        expect(cartao).to_contain_text('1 observação(ões) marcada(s) como efetivada(s)')
        esperar(lambda: any(x.get('notaOk') for x in json.loads(gerais(estado())[-1]['foraDoLote'])), pg)
        fo = json.loads(gerais(estado())[-1]['foraDoLote'])
        assert [x['brinco'] for x in fo if x.get('notaOk')] == ['77777'] and all(x['nota'] for x in fo if x['brinco'] == '77777')
        assert pg.get_by_test_id('nota-pend-77777').count() == 0

    @teste('Desfazer devolve a observação para a lista; "marcar todas" efetiva as que restam')
    def _():
        cartao = pg.get_by_test_id('pendencias-notas')
        pg.get_by_test_id('desfazer-notas').click()
        expect(cartao).to_contain_text('Voltou para a lista')
        esperar(lambda: not any(x.get('notaOk') for x in json.loads(gerais(estado())[-1]['foraDoLote'])), pg)
        expect(pg.get_by_test_id('nota-pend-77777')).to_be_visible()
        pg.get_by_test_id('efetivar-todas').click()
        expect(cartao).to_contain_text('5 observação(ões) marcada(s) como efetivada(s)')
        esperar(lambda: sum(1 for x in json.loads(gerais(estado())[-1]['foraDoLote']) if x.get('notaOk')) == 5, pg)
        # o pedido de mudança de lote continua do jeito que estava
        assert [x['mudar'] for x in json.loads(gerais(estado())[-1]['foraDoLote']) if x['animal'] == solteira['id']] == ['pendente']
        expect(pg.get_by_role('tab', name='Geral').first).to_contain_text('1')

    @teste('Conferência mostra que as observações foram efetivadas')
    def _():
        pg.get_by_test_id('desfazer-notas').count()
        pg.get_by_role('button', name='Fechar aviso').first.click()
        pg.locator('[data-testid^=manejo-]').first.click()
        t = pg.get_by_test_id('conferencia').inner_text()
        assert t.lower().count('sim, ') == 5, t[:900]

    @teste('Computador: sem rolagem lateral e sem erros')
    def _():
        c2 = b.new_context(viewport={'width': 1280, 'height': 900}, locale='pt-BR', timezone_id='America/Sao_Paulo')
        p2 = c2.new_page(); e2 = []; p2.on('pageerror', lambda e: e2.append(str(e)))
        p2.goto(BASE + '/'); p2.wait_for_selector('.foot-note')
        p2.get_by_role('navigation', name='Telas').get_by_role('button', name='Manejo').click()
        p2.get_by_role('tab', name='Geral').first.click(); p2.get_by_role('button', name='Novo manejo').click()
        p2.locator('#mg-lote').select_option('Paridas')
        p2.get_by_test_id(f"nota-bt-{A['brinco']}").click()
        assert p2.evaluate('document.documentElement.scrollWidth') <= 1280
        p2.screenshot(path=os.path.join(SAIDA, 'notas_computador.png'))
        assert not e2, e2; c2.close()
        assert pg.evaluate('document.documentElement.scrollWidth') <= 390

    @teste('Sem erros de tela no celular')
    def _(): assert not erros, erros
    b.close()
print(f'navegador observação por brinco: {ok} ok, {len(falhas)} falha(s)')
sys.exit(1 if falhas else 0)
