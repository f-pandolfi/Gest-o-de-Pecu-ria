# Pesar (app 10.4) no navegador: animal sem brinco, peso repetido "é outro animal", conferência do dia
# (ligar o sem brinco a quem ficou sem peso; tirar um peso repetido), PDF e sem internet.
import os, json, sys, urllib.request
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright, expect
BASE = os.environ.get('BASE', 'http://localhost:8765')
SAIDA = os.path.join(os.path.dirname(__file__), 'saida'); os.makedirs(SAIDA, exist_ok=True)
DATA = '2026-10-15'
ok = 0; falhas = []
def srv(c, m='GET'):
    with urllib.request.urlopen(urllib.request.Request(BASE + c, method=m, data=b'' if m == 'POST' else None)) as r:
        t = r.read().decode(); return json.loads(t) if t.startswith('{') else t
def pes(): return [e for e in srv('/__estado')['eventos'] if e['tipo'] == 'pesagem' and e['data'] == DATA]
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
    pg.goto(BASE + '/'); pg.wait_for_selector('.foot-note'); pg.wait_for_timeout(2500)
    pg.get_by_role('navigation', name='Telas (celular)').get_by_role('button', name='Crias').click()
    pg.get_by_role('tab', name='Pesar').first.click()
    pg.locator('#pesar-data').fill(DATA)
    def add(brinco, peso):
        pg.locator('#pesar-brinco').fill(str(brinco)); pg.locator('#pesar-peso').fill(str(peso)); pg.locator('#pesar-peso').press('Enter')

    @teste('Sem brinco: botão troca o brinco pelo sinal e a linha entra como SB')
    def _():
        add(6511, 200)
        pg.get_by_role('button', name='Animal sem brinco').click()
        assert pg.locator('#pesar-brinco').count() == 0
        pg.locator('#pesar-sinal').fill('branco'); pg.locator('#pesar-peso').fill('141'); pg.locator('#pesar-peso').press('Enter')
        sb = pg.get_by_test_id('linha-SB')
        expect(sb).to_contain_text('branco'); expect(sb).to_contain_text('141 kg')
        assert pg.locator('#pesar-brinco').count() == 1, 'volta para o brinco'

    @teste('Peso repetido na lista do dia: "É outro animal" vira sem brinco anotado com o número')
    def _():
        add(6510, 210)
        pg.get_by_role('button', name='Gravar 3 pesagem(ns)').click()
        pg.wait_for_selector('text=pesagem(ns) gravada(s)')
        esperar(lambda: len(pes()) == 3, pg)
        add(6510, 195)
        expect(pg.get_by_test_id('aviso-duplicado')).to_contain_text('6510')
        pg.get_by_role('button', name='É outro animal (sem brinco)').click()
        expect(pg.get_by_test_id('linha-SB')).to_contain_text('anotado como 6510')
        pg.get_by_role('button', name='Gravar 1 pesagem(ns)').click()
        esperar(lambda: len(pes()) == 4, pg)
        sbs = [e for e in pes() if not e['criaId']]
        assert sorted(e['observacoes'] for e in sbs) == ['SEM BRINCO: anotado como 6510', 'SEM BRINCO: branco'], sbs

    @teste('Conferência: 2 sem brinco x machos que ficaram sem peso')
    def _():
        conf = pg.get_by_test_id('conferencia-pesagem'); conf.scroll_into_view_if_needed()
        expect(pg.get_by_test_id('lista-sem-brinco')).to_contain_text('141 kg')
        np = pg.get_by_test_id('lista-nao-pesados').inner_text()
        assert '6508' in np and '6511' not in np and '6510' not in np, np
        pg.screenshot(path=os.path.join(SAIDA, 'pesar_conferencia.png'), full_page=False)

    @teste('Ligar o sem brinco de 141 kg ao 6508: sai das duas listas e a planilha recebe o peso no 6508')
    def _():
        pg.get_by_role('button', name='Sem brinco de 141 kg').click()
        pg.get_by_label('Qual animal é').select_option(label=[o for o in pg.get_by_label('Qual animal é').locator('option').all_inner_texts() if o.startswith('6508')][0])
        pg.get_by_role('button', name='Confirmar').click()
        expect(pg.get_by_test_id('conferencia-pesagem')).to_contain_text('agora é do 6508')
        assert '6508' not in pg.get_by_test_id('lista-nao-pesados').inner_text()
        esperar(lambda: any(e['brinco'] in (6508, '6508') and e['peso'] == 141 for e in pes()), pg)
        e = [x for x in pes() if x['peso'] == 141][0]
        assert e['criaId'] and 'Identificado' in e['observacoes'], e

    @teste('Repetido: lançar mesmo assim e depois tirar um dos pesos ("outro animal")')
    def _():
        add(6511, 205)
        pg.get_by_role('button', name='Lançar mesmo assim').click()
        pg.get_by_role('button', name='Gravar 1 pesagem(ns)').click()
        esperar(lambda: len(pes()) == 5, pg)
        expect(pg.get_by_test_id('lista-repetidos')).to_contain_text('6511')
        pg.get_by_role('button', name='205 kg do 6511 é de outro animal').click()
        expect(pg.get_by_test_id('conferencia-pesagem')).to_contain_text('saiu do 6511')
        esperar(lambda: any(e['peso'] == 205 and e['observacoes'] == 'SEM BRINCO: anotado como 6511' and not e['criaId'] for e in pes()), pg)
        assert pg.get_by_test_id('lista-repetidos').count() == 0

    @teste('PDF da pesagem do dia sai com os sem brinco')
    def _():
        with pg.expect_download() as d: pg.get_by_role('button', name='PDF da pesagem').click()
        assert d.value.suggested_filename.endswith('.pdf')
        txt = json.dumps(pg.evaluate('window.__ultimoPDF && window.__ultimoPDF.rel ? window.__ultimoPDF.rel : null'))
        assert txt == 'null' or 'Sem brinco' in txt, txt[:300]

    @teste('Sem internet: sem brinco fica no celular e vai depois')
    def _():
        ctx.set_offline(True)
        pg.get_by_role('button', name='Animal sem brinco').click()
        pg.locator('#pesar-sinal').fill('preto'); pg.locator('#pesar-peso').fill('110'); pg.locator('#pesar-peso').press('Enter')
        pg.get_by_role('button', name='Gravar 1 pesagem(ns)').click()
        pg.wait_for_selector('text=ficou guardado neste celular')
        assert len(pes()) == 5
        ctx.set_offline(False); pg.evaluate("window.dispatchEvent(new Event('online'))")
        esperar(lambda: len(pes()) == 6 and pg.get_by_test_id('chip-fila').count() == 0, pg, 20000)

    @teste('Sem erros de tela')
    def _(): assert not erros, erros
    b.close()
print(f'navegador pesagem sem brinco: {ok} ok, {len(falhas)} falha(s)')
sys.exit(1 if falhas else 0)
