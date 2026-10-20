# Manejo > Geral (app 10.3) no navegador: funcionário faz o manejo no celular (lote, manejo, crias ao pé, marca quem passou,
# brinco de fora entra com observação), rascunho não se perde, conferência + PDF, pedido de mudança de lote vai para o
# proprietário confirmar; proprietário gravando confirma na hora; sem internet; ficha da vaca e relatório.
import os, json, sys, urllib.request, datetime
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
def matriz(e, brinco): return next(m for m in e['matrizes'] if str(m['brinco']) == str(brinco))
def teste(nome):
    def deco(fn):
        global ok
        try: fn(); ok += 1; print('  ok', nome)
        except Exception as ex: falhas.append((nome, ex)); print('  FALHOU', nome, '->', repr(ex)[:600])
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
    def marcar(brinco):
        pg.get_by_label('Brinco para marcar').fill(str(brinco)); pg.get_by_label('Brinco para marcar').press('Enter')
    pg.goto(BASE + '/'); pg.wait_for_selector('.foot-note'); pg.wait_for_timeout(3000)
    e0 = estado()
    paridas = sorted([m for m in e0['matrizes'] if m['lote'] == 'Paridas'], key=lambda m: int(m['brinco']))
    solteira = next(m for m in e0['matrizes'] if m['lote'] == 'Solteiras')

    @teste('Funcionário: aba Geral, novo manejo com lote, botão rápido e crias ao pé')
    def _():
        ir('Manejo'); aba('Geral')
        pg.get_by_role('button', name='Novo manejo').click()
        pg.locator('#mg-lote').select_option('Paridas')
        pg.get_by_role('button', name='Brinco mosquicida').click()
        assert pg.locator('#mg-desc').input_value() == 'Brinco mosquicida'
        assert 'Brinco mosquicida' in [o for o in pg.get_by_label('Tipo de aplicação').first.evaluate('e=>e.value').split('\n')]
        pg.locator('#mg-resp').fill('João')
        expect(pg.get_by_test_id('incluir-crias')).to_be_checked()
        txt = pg.get_by_test_id('lista-marcar').inner_text()
        assert 'ao pé' in txt and 'mãe' in txt, txt[:300]
        expect(pg.get_by_test_id('contador')).to_contain_text('0 de')

    @teste('Marca quem passou (tocando e digitando), brinco de outro lote e sem cadastro entram com observação')
    def _():
        for m in paridas[2:]: marcar(m['brinco'])
        pg.get_by_role('button', name=f"Marcar {paridas[1]['brinco']}").click()
        marcar(solteira['brinco'])
        expect(pg.get_by_test_id('msg-marcar')).to_contain_text('Não é do lote Paridas (está em Solteiras)')
        marcar('99999')
        fora = pg.get_by_test_id('fora-lote').inner_text()
        assert 'Brinco não cadastrado' in fora and solteira['brinco'] in fora and 'proprietário confirmar' in fora, fora

    @teste('Rascunho: recarregar a página não perde nada')
    def _():
        pg.reload(); pg.wait_for_selector('.foot-note'); ir('Manejo'); aba('Geral')
        pg.get_by_test_id('geral-form').wait_for()
        assert pg.locator('#mg-desc').input_value() == 'Brinco mosquicida'
        assert 'Brinco não cadastrado' in pg.get_by_test_id('fora-lote').inner_text()
        pg.screenshot(path=os.path.join(SAIDA, 'geral_form.png'), full_page=False)

    @teste('Gravar: conferência mostra esperados, conferidos, faltando e de fora; lote NÃO muda sem o proprietário')
    def _():
        pg.get_by_role('button', name='Gravar manejo').click()
        conf = pg.get_by_test_id('conferencia'); conf.wait_for()
        t = conf.inner_text()
        assert 'Manejo gravado' in t and 'esperando o proprietário' in t, t[:500]
        assert paridas[0]['brinco'] in t, 'faltando listado'
        esperar(lambda: len(gerais(estado())) == 1, pg)
        g = gerais(estado())[0]
        assert g['lote'] == 'Paridas' and g['descricao'] == 'Brinco mosquicida' and g['responsavel'] == 'João'
        fora = json.loads(g['foraDoLote'])
        assert [f['mudar'] for f in fora if f['animal'] == solteira['id']] == ['pendente'], fora
        assert any(f['obs'] == 'Brinco não cadastrado' for f in fora)
        assert matriz(estado(), solteira['brinco'])['lote'] == 'Solteiras'
        pg.screenshot(path=os.path.join(SAIDA, 'geral_conferencia.png'))
        with pg.expect_download() as d: pg.get_by_role('button', name='PDF da conferência').click()
        assert d.value.suggested_filename.endswith('.pdf')

    @teste('Funcionário não vê os pedidos de mudança de lote')
    def _():
        pg.get_by_role('button', name='Voltar').first.click()
        assert pg.get_by_test_id('pendencias-lote').count() == 0
        expect(pg.get_by_test_id('geral-inicio')).to_contain_text('Brinco mosquicida')

    @teste('Proprietário: vê o pedido (número na aba) e confirma; o lote muda na planilha')
    def _():
        pg.get_by_role('button', name='Entrar como proprietário').first.click()
        for ch in PIN: pg.locator('#pin').press(ch)
        pg.get_by_role('button', name='Entrar', exact=True).click(); pg.locator('text=DONO >> visible=true').wait_for()
        ir('Manejo')
        expect(pg.get_by_role('tab', name='Geral').first).to_contain_text('1')
        aba('Geral')
        pend = pg.get_by_test_id(f"pend-{solteira['brinco']}")
        expect(pend).to_contain_text('Solteiras → Paridas')
        pg.screenshot(path=os.path.join(SAIDA, 'geral_pendencia.png'))
        pg.get_by_role('button', name=f"Confirmar mudança de lote da {solteira['brinco']}").click()
        expect(pg.get_by_test_id('pendencias-lote')).to_contain_text('1 animal(is) mudado(s) de lote')
        esperar(lambda: matriz(estado(), solteira['brinco'])['lote'] == 'Paridas', pg)
        assert json.loads(gerais(estado())[0]['foraDoLote'])[0]['mudar'] in ('aprovada',)

    @teste('Proprietário fazendo o manejo: marca "mudar para o lote" e o lote muda na hora; desmarcado fica como está')
    def _():
        e = estado(); sols = [m for m in e['matrizes'] if m['lote'] == 'Solteiras'][:2]
        pg.get_by_role('button', name='Novo manejo').click()
        pg.locator('#mg-lote').select_option('__outro__'); pg.locator('#mg-lote-novo').fill('Pasto da Grota')
        pg.get_by_role('button', name='Conferência', exact=True).click()
        marcar(sols[0]['brinco']); marcar(sols[1]['brinco'])
        pg.get_by_label(f"Mudar {sols[1]['brinco']} para o lote Pasto da Grota").uncheck()
        pg.get_by_role('button', name='Gravar manejo').click()
        expect(pg.get_by_test_id('conferencia')).to_contain_text('1 animal(is) mudado(s) para o lote Pasto da Grota')
        esperar(lambda: matriz(estado(), sols[0]['brinco'])['lote'] == 'Pasto da Grota', pg)
        assert matriz(estado(), sols[1]['brinco'])['lote'] == 'Solteiras'

    @teste('Sem internet: o manejo fica no celular e vai sozinho quando a internet volta')
    def _():
        pg.get_by_role('button', name='Voltar').first.click()
        ctx.set_offline(True)
        pg.get_by_role('button', name='Novo manejo').click()
        pg.locator('#mg-lote').select_option('Paridas')
        pg.get_by_role('button', name='Pour-on no lombo').click()
        marcar(paridas[3]['brinco'])
        pg.get_by_role('button', name='Gravar manejo').click()
        expect(pg.get_by_test_id('conferencia')).to_contain_text('ficou no celular')
        n = len(gerais(estado())); assert n == 2, n
        ctx.set_offline(False); pg.evaluate("window.dispatchEvent(new Event('online'))")
        esperar(lambda: len(gerais(estado())) == 3 and pg.get_by_test_id('chip-fila').count() == 0, pg, 20000)

    @teste('Ficha da vaca (Rebanho) mostra os manejos em que ela passou')
    def _():
        ir('Rebanho'); pg.get_by_test_id(f"reb-{paridas[3]['brinco']}").click()
        h = pg.get_by_test_id('historico').inner_text()
        assert 'Brinco mosquicida · lote Paridas' in h and 'Pour-on no lombo · lote Paridas' in h, h
        pg.keyboard.press('Escape')

    @teste('Relatórios: "Manejos" lista os manejos do ano com quem faltou')
    def _():
        pg.goto(BASE + '/'); pg.wait_for_selector('.foot-note'); ir('Relatórios')
        pg.get_by_role('tab', name='Manejos').first.click()
        t = pg.inner_text('body')
        assert 'Manejos gerais' in t and 'Brinco mosquicida' in t and 'Pasto da Grota' in t, t[:800]

    @teste('Computador: tela Geral abre sem rolagem lateral e sem erros')
    def _():
        c2 = b.new_context(viewport={'width': 1280, 'height': 900}, locale='pt-BR', timezone_id='America/Sao_Paulo')
        p2 = c2.new_page(); e2 = []; p2.on('pageerror', lambda e: e2.append(str(e)))
        p2.goto(BASE + '/'); p2.wait_for_selector('.foot-note')
        p2.get_by_role('navigation', name='Telas').get_by_role('button', name='Manejo').click()
        p2.get_by_role('tab', name='Geral').first.click(); p2.get_by_role('button', name='Novo manejo').click()
        p2.locator('#mg-lote').select_option('Paridas')
        assert p2.evaluate('document.documentElement.scrollWidth') <= 1280
        p2.screenshot(path=os.path.join(SAIDA, 'geral_computador.png'))
        assert not e2, e2; c2.close()
        assert pg.evaluate('document.documentElement.scrollWidth') <= 390

    @teste('Sem erros de tela no celular')
    def _(): assert not erros, erros
    b.close()
print(f'navegador manejo geral: {ok} ok, {len(falhas)} falha(s)')
sys.exit(1 if falhas else 0)
