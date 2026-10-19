# Testes de navegador da versão 9.5 (Chromium de verdade, celular e computador) contra o simulador da planilha (script v11).
# Rodar:  node testes/montar_site_teste.mjs && node testes/servidor.cjs 8765 &  python3 testes/test_navegador_95.py
import os, json, sys, urllib.request
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('BASE', 'http://localhost:8765')
SAIDA = os.environ.get('SAIDA', os.path.join(os.path.dirname(__file__), 'saida'))
PIN = '1537'
HOJE = __import__('datetime').date.today().isoformat()
ok = 0; falhas = []

def srv(caminho, metodo='GET'):
    req = urllib.request.Request(BASE + caminho, method=metodo, data=b'' if metodo == 'POST' else None)
    with urllib.request.urlopen(req) as r:
        t = r.read().decode()
        return json.loads(t) if t.startswith('{') else t

def estado():
    return srv('/__estado')

def pesagens(e, brinco=None, data=None):
    return [x for x in e['eventos'] if x['tipo'] == 'pesagem' and (brinco is None or str(x['brinco']) == brinco) and (data is None or x['data'] == data)]

def teste(nome):
    def deco(fn):
        global ok
        try:
            fn(); ok += 1; print('  ok', nome)
        except Exception as ex:
            falhas.append((nome, ex)); print('  FALHOU', nome, '->', repr(ex)[:400])
    return deco

def abrir(ctx, url=BASE + '/'):
    pg = ctx.new_page()
    pg.erros = []
    pg.on('pageerror', lambda e: pg.erros.append(str(e)))
    pg.goto(url)
    pg.wait_for_selector('.foot-note', timeout=20000)
    return pg

def ir(pg, nome):
    pg.get_by_role('navigation', name='Telas (celular)').get_by_role('button', name=nome).click() if pg.viewport_size['width'] < 900 \
        else pg.get_by_role('navigation', name='Telas').get_by_role('button', name=nome).click()

def aba(pg, nome):
    pg.get_by_role('tab', name=nome, exact=True).click()

def entrar_dono(pg):
    pg.get_by_role('button', name='Entrar como proprietário').first.click()
    campo = pg.locator('#pin')
    for ch in PIN:
        campo.press(ch)
    pg.get_by_role('button', name='Entrar', exact=True).click()
    pg.locator('text=DONO >> visible=true').wait_for()

def pesar_linha(pg, brinco, peso):
    pg.locator('#pesar-brinco').fill(brinco)
    pg.locator('#pesar-brinco').press('Enter')
    pg.locator('#pesar-peso').fill(str(peso))
    pg.locator('#pesar-peso').press('Enter')

def esperar(cond, ms=8000, passo=200, pg=None):
    import time
    fim = time.time() + ms / 1000
    while time.time() < fim:
        if cond(): return True
        (pg.wait_for_timeout(passo) if pg else time.sleep(passo / 1000))
    raise AssertionError('condição não aconteceu a tempo')

with sync_playwright() as p:
    nav = p.chromium.launch()
    def contexto(largura=400):
        return nav.new_context(viewport={'width': largura, 'height': 880}, accept_downloads=True, locale='pt-BR', timezone_id='America/Sao_Paulo')

    # ------------------------------------------------------------------ abre e mostra versão
    srv('/__reset', 'POST')
    ctx = contexto(); pg = abrir(ctx)

    @teste('abre com app 10.0 e planilha v12, sem erros')
    def _():
        nota = pg.inner_text('.foot-note')
        assert 'app 10.0' in nota and 'planilha v12' in nota, nota
        assert not pg.erros, pg.erros

    # ------------------------------------------------------------------ Pesar: ficha rápida
    ir(pg, 'Crias'); aba(pg, 'Pesar')

    @teste('Pesar: ao digitar o número mostra idade em meses, nascimento, mãe e último peso')
    def _():
        pg.locator('#pesar-brinco').fill('6501')
        f = pg.get_by_test_id('ficha-rapida').inner_text()
        assert 'Bezerro' in f and 'Nasceu 12/03/26' in f and 'Mãe 3005' in f, f
        assert 'meses' in f and 'Último peso 196 kg em 10/10/26' in f, f

    @teste('Pesar: cria nunca pesada mostra "Ainda não foi pesado"; número errado avisa')
    def _():
        pg.locator('#pesar-brinco').fill('6003')
        f = pg.get_by_test_id('ficha-rapida').inner_text()
        assert 'Ainda não foi pesado' in f and 'Bezerra' in f and 'Mãe 3007' in f, f
        pg.locator('#pesar-brinco').fill('9999')
        assert 'não encontrado' in pg.get_by_test_id('ficha-rapida').inner_text()
        pg.locator('#pesar-brinco').fill('')

    # ------------------------------------------------------------------ Pesar: duplicado na mesma data
    @teste('Pesar: número já pesado na mesma data avisa com número e peso; Cancelar não põe na lista')
    def _():
        pg.locator('#pesar-data').fill('2026-10-10')
        pesar_linha(pg, '6501', 199)
        av = pg.get_by_test_id('aviso-duplicado').inner_text()
        assert '6501' in av and '196 kg' in av and 'Verifique a duplicidade' in av, av
        pg.get_by_role('button', name='Cancelar').click()
        assert pg.get_by_test_id('lista-pesar').count() == 0

    @teste('Pesar: "Lançar mesmo assim" grava os dois pesos e marca 2x (lista, resumo do dia e planilha)')
    def _():
        pesar_linha(pg, '6501', 199)
        pg.get_by_role('button', name='Lançar mesmo assim').click()
        linha = pg.get_by_test_id('linha-6501').inner_text()
        assert '2x' in linha and '196 kg' in linha, linha
        pesar_linha(pg, '6505', 188)
        pg.get_by_role('button', name='Gravar 2 pesagem(ns)').click()
        pg.wait_for_selector('text=2 pesagem(ns) gravada(s)')
        esperar(lambda: len(pesagens(estado(), '6501', '2026-10-10')) == 2, pg=pg)
        e = estado()
        pes = sorted(x['peso'] for x in pesagens(e, '6501', '2026-10-10'))
        assert pes == [196, 199], pes
        assert len(pesagens(e, '6505', '2026-10-10')) == 1
        resumo = pg.get_by_test_id('resumo-dia').inner_text()
        assert '2x: 6501' in resumo, resumo

    @teste('Pesar: PDF da pesagem do dia baixa um PDF de verdade')
    def _():
        with pg.expect_download() as d:
            pg.get_by_role('button', name='PDF da pesagem').click()
        arq = os.path.join(SAIDA, 'pesagem.pdf'); d.value.save_as(arq)
        assert d.value.suggested_filename == 'pesagem-2026-10-10.pdf', d.value.suggested_filename
        dados = open(arq, 'rb').read()
        assert dados[:4] == b'%PDF' and len(dados) > 3000, len(dados)
        info = pg.evaluate('window.__ultimoPDF')
        assert info['paginas'] >= 1

    @teste('Pesar: lista colada com número já pesado na data fica de fora com aviso')
    def _():
        pg.get_by_text('Colar uma lista pronta').click()
        pg.locator('#pesar-colar').fill('6502 215\n6507 170')
        pg.locator('button.btn.quiet', has_text='Adicionar à lista').click()
        txt = pg.locator('.aviso').first.inner_text()
        assert '6502 já foi pesado em 10/10/26 com 213 kg' in txt, txt
        assert pg.get_by_test_id('linha-6507').count() == 1
        assert pg.locator('#pesar-colar').input_value().strip() == '6502 215'

    @teste('Pesar: a lista fica guardada no celular (recarregar não perde)')
    def _():
        pg.reload(); pg.wait_for_selector('.foot-note')
        ir(pg, 'Crias'); aba(pg, 'Pesar')
        assert pg.get_by_test_id('linha-6507').count() == 1
        assert pg.locator('#pesar-data').input_value() == '2026-10-10'
        pg.get_by_role('button', name='Tirar 6507 da lista').click()

    pg.close(); ctx.close()

    # ------------------------------------------------------------------ sem internet
    srv('/__reset', 'POST')
    ctx = contexto(); pg = abrir(ctx)
    pg.wait_for_timeout(5000)  # deixa o service worker guardar o app

    @teste('Sem internet: pesar e gravar fica no celular (aviso e contador), nada chega na planilha')
    def _():
        ctx.set_offline(True)
        ir(pg, 'Crias'); aba(pg, 'Pesar')
        pesar_linha(pg, '6502', 230); pesar_linha(pg, '6504', 231)
        pg.get_by_role('button', name='Gravar 2 pesagem(ns)').click()
        pg.wait_for_selector('text=ficou guardado neste celular')
        expect(pg.get_by_test_id('chip-fila').first).to_contain_text('no celular')
        assert len(pesagens(estado(), data=HOJE)) == 0

    @teste('Sem internet: o app reabre (recarregar) com o que foi lançado, ainda na fila')
    def _():
        pg.reload(); pg.wait_for_selector('.foot-note', timeout=20000)
        pg.wait_for_timeout(1500)
        corpo = pg.inner_text('body')
        assert 'guardados no celular' in pg.inner_text('.foot-note') and 'Sem internet agora' in corpo, (pg.inner_text('.foot-note'), corpo[:600])
        expect(pg.get_by_test_id('chip-fila').first).to_contain_text('no celular')
        ir(pg, 'Crias'); aba(pg, 'Pesar')
        pg.locator('#pesar-brinco').fill('6502')
        fr = pg.get_by_test_id('ficha-rapida').inner_text(); assert '230 kg' in fr, fr
        pg.locator('#pesar-brinco').fill('')

    @teste('Sem internet: morte e nascimento também ficam na fila')
    def _():
        ir(pg, 'Lançar')
        pg.get_by_role('tab', name='Morte').click()
        pg.locator('#morte-brinco').fill('6508')
        pg.locator('#f-causa').select_option('Doença')
        pg.get_by_role('button', name='Registrar morte').click()
        pg.wait_for_selector('text=Morte registrada')
        assert 'ficou guardado neste celular' in pg.inner_text('body')

    @teste('Internet volta: a fila vai sozinha para a planilha, uma vez só, e o contador some')
    def _():
        ctx.set_offline(False)
        pg.evaluate("window.dispatchEvent(new Event('online'))")
        esperar(lambda: pg.get_by_test_id('chip-fila').count() == 0, ms=15000, pg=pg)
        e = estado()
        assert sorted(x['peso'] for x in pesagens(e, data=HOJE)) == [230, 231]
        assert len([x for x in e['eventos'] if x['tipo'] == 'morte' and str(x['brinco']) == '6508']) == 1

    @teste('Resposta perdida (internet caiu no meio): reenvia e a planilha não duplica')
    def _():
        srv('/__perderResposta?n=1', 'POST')
        aba_c = None
        ir(pg, 'Crias'); aba(pg, 'Pesar')
        pesar_linha(pg, '6510', 170)
        pg.get_by_role('button', name='Gravar 1 pesagem(ns)').click()
        pg.evaluate('window.__fila.enviar()')
        esperar(lambda: pg.get_by_test_id('chip-fila').count() == 0, ms=40000, passo=500, pg=pg)
        e = estado()
        assert len(pesagens(e, '6510', HOJE)) == 1, pesagens(e, '6510', HOJE)
        assert sum(1 for b in e['posts'] if b.get('action') == 'appendEventos' and any(str(i['evento'].get('brinco')) == '6510' for i in b['itens'])) == 2

    @teste('Planilha recusa: aparece "erro ao gravar"; o dono pode descartar o item')
    def _():
        srv('/__erroProximo?n=50', 'POST')
        pesar_linha(pg, '6511', 160)
        pg.get_by_role('button', name='Gravar 1 pesagem(ns)').click()
        expect(pg.get_by_test_id('chip-fila').first).to_contain_text('erro ao gravar', timeout=10000)
        entrar_dono(pg)
        pg.get_by_test_id('chip-fila').first.click()
        assert 'erro de teste da planilha' in pg.get_by_test_id('lista-fila').inner_text()
        pg.get_by_role('button', name='Descartar este lançamento da fila').click()
        pg.get_by_role('button', name='Confirmar').click()
        esperar(lambda: pg.get_by_test_id('chip-fila').count() == 0, pg=pg)
        srv('/__erroProximo?n=0', 'POST')
        pg.keyboard.press('Escape')

    @teste('Sem erros de tela no fluxo sem internet')
    def _():
        assert not pg.erros, pg.erros

    pg.close(); ctx.close()

    # ------------------------------------------------------------------ desmama
    srv('/__reset', 'POST')
    ctx = contexto(); pg = abrir(ctx)
    ir(pg, 'Lançar'); pg.get_by_role('tab', name='Desmama').click()

    @teste('Desmama: ao digitar a cria mostra mãe, nascimento e idade em meses e dias (automática)')
    def _():
        pg.locator('#f-data').fill('2026-10-19')
        pg.locator('#f-brincoBezerro').fill('6003')
        f = pg.get_by_test_id('ficha-rapida').inner_text()
        assert 'Mãe 3007' in f and 'Nasceu 02/04/26' in f and '6 meses e 17 dias' in f, f
        assert pg.locator('#idade-meses').input_value() == '6' and pg.locator('#idade-dias').input_value() == '17'
        assert 'Calculada pelo nascimento' in pg.get_by_test_id('hint-idade').inner_text()

    @teste('Desmama: dá para alterar a idade e voltar para a calculada')
    def _():
        pg.locator('#idade-meses').fill('7')
        assert 'digitada à mão' in pg.get_by_test_id('hint-idade').inner_text()
        assert pg.locator('#idade-dias').input_value() == '17'
        pg.get_by_role('button', name='Usar a calculada').click()
        assert pg.locator('#idade-meses').input_value() == '6'

    @teste('Desmama: grava idade em dias (alterada à mão) e a fêmea vai para as novilhas')
    def _():
        pg.locator('#idade-dias').fill('20')
        pg.locator('#f-pesoDesmama').fill('182')
        pg.get_by_role('button', name='Salvar registro').click()
        pg.wait_for_selector('text=Salvo:')
        esperar(lambda: any(x['tipo'] == 'desmama' for x in estado()['eventos']), pg=pg)
        e = estado()
        d = [x for x in e['eventos'] if x['tipo'] == 'desmama'][0]
        assert d['idadeDias'] == 203, d  # 02/04 + 6 meses + 20 dias = 22/10
    pg.close(); ctx.close()

    # ------------------------------------------------------------------ relatório em PDF (dono, computador)
    srv('/__reset', 'POST')
    ctx = contexto(1280); pg = abrir(ctx)

    @teste('Computador: Relatórios do dono têm botão PDF e o arquivo sai certo')
    def _():
        entrar_dono(pg)
        ir(pg, 'Relatórios')
        aba(pg, 'Mortes')
        with pg.expect_download() as d:
            pg.get_by_role('button', name='PDF', exact=True).click()
        arq = os.path.join(SAIDA, 'relatorio.pdf'); d.value.save_as(arq)
        assert open(arq, 'rb').read()[:4] == b'%PDF'
        assert d.value.suggested_filename.startswith('mortalidade'), d.value.suggested_filename
        assert not pg.erros, pg.erros
    pg.close(); ctx.close()

    # ------------------------------------------------------------------ passeio por todas as telas (nada quebra)
    srv('/__reset', 'POST')
    for largura in (400, 1280):
        ctx = contexto(largura); pg = abrir(ctx)

        @teste(f'Passeio por todas as telas e abas sem erro ({"celular" if largura < 900 else "computador"})')
        def _():
            entrar_dono(pg)
            for tela in ['Painel', 'Lançar', 'Parto', 'Crias', 'Rebanho', 'Relatórios']:
                ir(pg, tela); pg.wait_for_timeout(150)
                for t in pg.get_by_role('tab').all():
                    t.click(); pg.wait_for_timeout(80)
            assert not pg.erros, pg.erros
        pg.close(); ctx.close()

    nav.close()

print(f'navegador 9.5: {ok} ok, {len(falhas)} falha(s)')
sys.exit(1 if falhas else 0)
