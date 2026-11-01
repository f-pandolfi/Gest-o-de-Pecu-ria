# Editar, incluir e excluir manejo geral já gravado (app 10.7).
# Funcionário: reabre o manejo e só ACRESCENTA (mais brincos, observações novas ou corrigidas); não muda cabeçalho, não tira nem desmarca nada.
# Proprietário: muda tudo, tira brincos, decide a mudança de lote e exclui o manejo (script 14 guarda cópia na aba Excluidos).
# Nada de PIN em tela pública: o PIN é o do servidor de teste.
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
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, locale='pt-BR', timezone_id='America/Sao_Paulo')
    pg = ctx.new_page(); erros = []; pg.on('pageerror', lambda e: erros.append(str(e)))
    ir = lambda n: pg.get_by_role('navigation', name='Telas (celular)').get_by_role('button', name=n).click()
    aba = lambda n: pg.get_by_role('tab', name=n).first.click()
    campo = lambda: pg.get_by_label('Brinco para conferir')
    marcar = lambda br: pg.get_by_role('button', name=f'Marcar {br}', exact=True)
    desmarcar = lambda br: pg.get_by_role('button', name=f'Desmarcar {br}', exact=True)
    pg.goto(BASE + '/'); pg.wait_for_selector('.foot-note'); pg.wait_for_timeout(3000)
    e0 = estado()
    paridas = sorted([m for m in e0['matrizes'] if m['lote'] == 'Paridas' and m['status'] not in ('Vendida', 'Morta')], key=lambda m: int(m['brinco']))
    solteira = next(m for m in e0['matrizes'] if m['lote'] == 'Solteiras')
    A, B, C, D = paridas[1], paridas[2], paridas[4], paridas[5]
    manejo_id = {}

    @teste('Funcionário grava um manejo com brinco de fora (pedido de lote), sem cadastro e observação')
    def _():
        ir('Manejo'); aba('Geral')
        pg.get_by_role('button', name='Novo manejo').click()
        pg.locator('#mg-lote').select_option('Paridas')
        pg.locator('#mg-desc').fill('Pour-on'); pg.locator('#mg-resp').fill('João')
        marcar(A['brinco']).click(); marcar(B['brinco']).click()
        campo().fill(str(solteira['brinco']))
        f = pg.get_by_test_id(f"ficha-m:{solteira['id']}"); f.wait_for()
        f.get_by_test_id(f"nota-{solteira['brinco']}").fill('veio junto, conferir lote')
        f.get_by_test_id('ficha-acao').click()
        campo().fill('88888')
        sc = pg.get_by_test_id('ficha-sem-cadastro'); sc.wait_for()
        sc.get_by_test_id('nota-88888').fill('brinco perdido')
        pg.get_by_test_id('incluir-sem-cadastro').click()
        pg.get_by_role('button', name='Gravar manejo').click()
        pg.get_by_test_id('conferencia').wait_for()
        esperar(lambda: len(gerais(estado())) == 1, pg)
        manejo_id['id'] = gerais(estado())[0]['id']

    @teste('Funcionário vê só "Incluir brincos e observações": sem Editar e sem Excluir')
    def _():
        conf = pg.get_by_test_id('conferencia')
        expect(conf.get_by_test_id('abrir-manejo')).to_have_text('Incluir brincos e observações')
        assert pg.get_by_test_id('excluir-manejo').count() == 0

    @teste('Funcionário reabre: cabeçalho travado, quem já passou continua marcado e não dá para tirar nada')
    def _():
        pg.get_by_test_id('abrir-manejo').click()
        form = pg.get_by_test_id('geral-form'); form.wait_for()
        expect(form).to_contain_text('Incluir brincos e observações')
        expect(pg.get_by_test_id('cabecalho-travado')).to_contain_text('Pour-on')
        assert pg.locator('#mg-desc').count() == 0 and pg.locator('#mg-lote').count() == 0 and pg.locator('#mg-obs').count() == 0
        expect(desmarcar(A['brinco'])).to_be_visible(); expect(desmarcar(B['brinco'])).to_be_visible()
        desmarcar(B['brinco']).click()
        expect(desmarcar(B['brinco'])).to_be_visible()
        expect(form).to_contain_text('só o proprietário pode desmarcar')
        assert pg.get_by_role('button', name=f"Tirar {solteira['brinco']}").count() == 0
        assert pg.get_by_role('button', name='Tirar 88888').count() == 0
        # as observações já gravadas aparecem e podem ser corrigidas
        expect(pg.get_by_test_id(f"fora-{solteira['brinco']}").get_by_test_id(f"nota-{solteira['brinco']}")).to_have_value('veio junto, conferir lote')
        expect(pg.get_by_test_id('fora-88888').get_by_test_id('nota-88888')).to_have_value('brinco perdido')
        pg.screenshot(path=os.path.join(SAIDA, 'editar_funcionario.png'))

    @teste('Funcionário inclui mais um animal, mais um sem cadastro, corrige uma observação e escreve outra: grava sem perder nada')
    def _():
        marcar(C['brinco']).click()
        pg.get_by_test_id(f"nota-bt-{D['brinco']}").click()
        pg.get_by_test_id(f"nota-{D['brinco']}").fill('mancando da pata esquerda')
        pg.get_by_test_id('fora-88888').get_by_test_id('nota-88888').fill('brinco perdido, achei a vaca: 6 ou 7 anos')
        campo().fill('99999')
        sc = pg.get_by_test_id('ficha-sem-cadastro'); sc.wait_for()
        sc.get_by_test_id('nota-99999').fill('sem brinco nenhum')
        pg.get_by_test_id('incluir-sem-cadastro').click()
        pg.get_by_role('button', name='Salvar alterações').click()
        conf = pg.get_by_test_id('conferencia'); conf.wait_for()
        expect(conf).to_contain_text('Brincos e observações incluídos no manejo')
        def pronto():
            g = gerais(estado())[0]
            return 'sem brinco nenhum' in g['foraDoLote']
        esperar(pronto, pg)
        assert len(gerais(estado())) == 1
        g = gerais(estado())[0]; fo = json.loads(g['foraDoLote'])
        assert g['descricao'] == 'Pour-on' and g['responsavel'] == 'João' and g['lote'] == 'Paridas'
        pres = g['presentes'].split(',')
        assert A['id'] in pres and B['id'] in pres and C['id'] in pres and solteira['id'] in pres, pres
        notas = {(x['animal'] or 'b:' + x['brinco']): x['nota'] for x in fo if x.get('nota')}
        assert notas == {solteira['id']: 'veio junto, conferir lote', 'b:88888': 'brinco perdido, achei a vaca: 6 ou 7 anos', 'b:99999': 'sem brinco nenhum', D['id']: 'mancando da pata esquerda'}, notas
        # o pedido de mudança de lote que o funcionário fez continua pendente e a matriz não mudou de lote
        assert [x['mudar'] for x in fo if x['animal'] == solteira['id']] == ['pendente']
        assert next(m for m in estado()['matrizes'] if m['id'] == solteira['id'])['lote'] == 'Solteiras'

    @teste('Funcionário não tem como mexer em outro cabeçalho nem excluir: a conferência mostra tudo certo')
    def _():
        t = pg.get_by_test_id('conferencia').inner_text()
        for txt in ('sem brinco nenhum', 'mancando da pata esquerda', 'achei a vaca'): assert txt in t, txt
        assert pg.get_by_test_id('excluir-manejo').count() == 0
        pg.get_by_role('button', name='Voltar').first.click()
        expect(pg.get_by_test_id('geral-inicio')).to_contain_text('4 observação(ões)')

    @teste('Proprietário entra e vê "Editar manejo" e "Excluir manejo"')
    def _():
        pg.get_by_role('button', name='Entrar como proprietário').first.click()
        for ch in PIN: pg.locator('#pin').press(ch)
        pg.get_by_role('button', name='Entrar', exact=True).click(); pg.locator('text=DONO >> visible=true').wait_for()
        ir('Manejo'); aba('Geral')
        pg.locator('[data-testid^=manejo-]').first.click()
        conf = pg.get_by_test_id('conferencia'); conf.wait_for()
        expect(conf.get_by_test_id('abrir-manejo')).to_have_text('Editar manejo')
        expect(conf.get_by_test_id('excluir-manejo')).to_be_visible()

    @teste('Proprietário edita: muda o manejo, desmarca, tira um brinco e confirma a mudança de lote')
    def _():
        pg.get_by_test_id('abrir-manejo').click()
        form = pg.get_by_test_id('geral-form'); form.wait_for()
        expect(form).to_contain_text('Editar manejo')
        expect(pg.locator('#mg-desc')).to_have_value('Pour-on')
        expect(pg.locator('#mg-resp')).to_have_value('João')
        expect(pg.locator('#mg-lote')).to_have_value('Paridas')
        pg.locator('#mg-desc').fill('Pour-on e vermífugo')
        pg.locator('#mg-resp').fill('Raylon')
        desmarcar(B['brinco']).click()
        pg.get_by_role('button', name='Tirar 99999').click()
        pg.get_by_role('checkbox', name=f"Mudar {solteira['brinco']} para o lote Paridas").check()
        pg.screenshot(path=os.path.join(SAIDA, 'editar_dono.png'))
        pg.get_by_role('button', name='Salvar alterações').click()
        conf = pg.get_by_test_id('conferencia'); conf.wait_for()
        expect(conf).to_contain_text('Manejo alterado')
        esperar(lambda: gerais(estado())[0]['descricao'] == 'Pour-on e vermífugo', pg)
        g = gerais(estado())[0]; fo = json.loads(g['foraDoLote'])
        assert g['responsavel'] == 'Raylon'
        assert B['id'] in g['ausentes'].split(',') and B['id'] not in g['presentes'].split(',')
        assert not any(x['brinco'] == '99999' for x in fo)
        assert 'sem brinco nenhum' not in g['foraDoLote']
        assert [x['mudar'] for x in fo if x['animal'] == solteira['id']] == ['aprovada']
        assert next(m for m in estado()['matrizes'] if m['id'] == solteira['id'])['lote'] == 'Paridas'
        # o que não mudou fica como estava
        assert any(x['brinco'] == '88888' and x['nota'] == 'brinco perdido, achei a vaca: 6 ou 7 anos' for x in fo)
        assert any(x['animal'] == D['id'] and x['nota'] == 'mancando da pata esquerda' for x in fo)

    @teste('Excluir pede confirmação e explica o que acontece; "Não, manter" não apaga')
    def _():
        pg.get_by_test_id('excluir-manejo').click()
        c = pg.get_by_test_id('confirmar-exclusao'); c.wait_for()
        expect(c).to_contain_text('Excluir este manejo?')
        expect(c).to_contain_text('aba Excluidos')
        expect(c).to_contain_text('1 mudança(s) de lote já confirmada(s) NÃO voltam')
        expect(c).to_contain_text('observação(ões) ainda não efetivada(s)')
        pg.screenshot(path=os.path.join(SAIDA, 'excluir_confirmacao.png'))
        c.get_by_role('button', name='Não, manter').click()
        assert pg.get_by_test_id('confirmar-exclusao').count() == 0
        assert len(gerais(estado())) == 1

    @teste('Excluir de verdade: some do app e da planilha, o animal fica no lote novo, e o aviso aparece')
    def _():
        pg.get_by_test_id('excluir-manejo').click()
        pg.get_by_test_id('confirmar-exclusao-sim').click()
        ini = pg.get_by_test_id('geral-inicio'); ini.wait_for()
        expect(pg.locator('body')).to_contain_text('Manejo excluído')
        esperar(lambda: len(gerais(estado())) == 0, pg)
        assert any(x.get('action') == 'excluirEventos' and x.get('ids') == [manejo_id['id']] for x in estado()['posts'])
        assert pg.locator('[data-testid^=manejo-]').count() == 0
        assert next(m for m in estado()['matrizes'] if m['id'] == solteira['id'])['lote'] == 'Paridas'
        assert pg.get_by_test_id('pendencias-notas').count() == 0
        pg.screenshot(path=os.path.join(SAIDA, 'excluir_feito.png'))

    @teste('Depois de recarregar o manejo excluído continua fora (a planilha confirmou)')
    def _():
        pg.reload(); pg.wait_for_selector('.foot-note'); pg.wait_for_timeout(2500)
        ir('Manejo'); aba('Geral')
        assert pg.locator('[data-testid^=manejo-]').count() == 0

    @teste('Computador: tela de edição sem rolagem lateral e sem erros')
    def _():
        c2 = b.new_context(viewport={'width': 1280, 'height': 900}, locale='pt-BR', timezone_id='America/Sao_Paulo')
        p2 = c2.new_page(); e2 = []; p2.on('pageerror', lambda e: e2.append(str(e)))
        p2.goto(BASE + '/'); p2.wait_for_selector('.foot-note')
        p2.get_by_role('navigation', name='Telas').get_by_role('button', name='Manejo').click()
        p2.get_by_role('tab', name='Geral').first.click()
        assert p2.evaluate('document.documentElement.scrollWidth') <= 1280
        assert not e2, e2; c2.close()
        assert pg.evaluate('document.documentElement.scrollWidth') <= 390

    @teste('Sem erros de tela no celular')
    def _(): assert not erros, erros
    b.close()
print(f'navegador editar/incluir/excluir manejo: {ok} ok, {len(falhas)} falha(s)')
sys.exit(1 if falhas else 0)
