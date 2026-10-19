# Testes de navegador do app 10: touros, protocolos de IATF e monta, manejo no curral, toque geral, vacinas, relatórios do funcionário.
# Rodar com o servidor de teste no ar (script v12):  python3 testes/test_navegador_10.py
import os, json, sys, urllib.request, datetime
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('BASE', 'http://localhost:8765')
SAIDA = os.path.join(os.path.dirname(__file__), 'saida')
PIN = '1537'
HOJE = datetime.date.today()
D0 = (HOJE - datetime.timedelta(days=10)).isoformat()
ok = 0; falhas = []

def srv(c, m='GET'):
    with urllib.request.urlopen(urllib.request.Request(BASE + c, method=m, data=b'' if m == 'POST' else None)) as r:
        t = r.read().decode(); return json.loads(t) if t.startswith('{') else t
def estado(): return srv('/__estado')
def evs(e, tipo): return [x for x in e['eventos'] if x['tipo'] == tipo]

def teste(nome):
    def deco(fn):
        global ok
        try:
            fn(); ok += 1; print('  ok', nome)
        except Exception as ex:
            falhas.append((nome, ex)); print('  FALHOU', nome, '->', repr(ex)[:500])
    return deco

def esperar(cond, ms=10000, pg=None):
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

def sair_dono(pg):
    pg.locator('button[aria-label="Sair do modo proprietário"] >> visible=true').click()

srv('/__reset', 'POST')
with sync_playwright() as p:
    nav_ = p.chromium.launch()
    ctx = nav_.new_context(viewport={'width': 400, 'height': 900}, accept_downloads=True, locale='pt-BR', timezone_id='America/Sao_Paulo')
    pg = ctx.new_page(); erros = []
    pg.on('pageerror', lambda e: erros.append(str(e)))
    pg.goto(BASE + '/'); pg.wait_for_selector('.foot-note')

    # ------------------------------------------------------------ touros
    @teste('Touros: dono cadastra sêmen com partida e doses, e touro vivo com exame andrológico')
    def _():
        entrar_dono(pg)
        nav(pg, 'Rebanho'); aba(pg, 'Touros')
        pg.get_by_role('button', name='Cadastrar touro ou sêmen').click()
        pg.get_by_test_id('form-touro').get_by_role('button', name='Sêmen', exact=True).click()
        pg.locator('#tr-nome').fill('Sêmen Angus X'); pg.locator('#tr-raca').fill('Angus')
        pg.locator('#tr-fornecedor').fill('Central ABC'); pg.locator('#tr-partida').fill('P55')
        pg.locator('#tr-tipoSemen').select_option('Sexado fêmea'); pg.locator('#tr-doses').fill('20'); pg.locator('#tr-botijao').fill('B1')
        pg.get_by_role('button', name='Salvar', exact=True).click()
        pg.get_by_role('button', name='Cadastrar touro ou sêmen').click()
        pg.get_by_test_id('form-touro').get_by_role('button', name='Touro vivo').click()
        pg.locator('#tr-nome').fill('Trovão'); pg.locator('#tr-brinco').fill('900'); pg.locator('#tr-andrologicoData').fill('2026-09-01')
        pg.locator('#tr-andrologicoResultado').select_option('Apto'); pg.locator('#tr-circEscrotal').fill('36')
        pg.get_by_role('button', name='Salvar', exact=True).click()
        esperar(lambda: len(estado()['touros']) == 4, pg=pg)
        t = {x['nome']: x for x in estado()['touros']}
        assert t['Sêmen Angus X']['partida'] == 'P55' and t['Sêmen Angus X']['tipo'] == 'Sêmen' and t['Sêmen Angus X']['doses'] == 20
        assert t['Trovão']['tipo'] == 'Touro vivo' and t['Trovão']['andrologicoData'] == '2026-09-01' and t['Trovão']['circEscrotal'] == 36
        assert '20 dose(s)' in pg.get_by_test_id('touros').inner_text()

    @teste('Touros: alterar cadastro (sêmen vira inativo)')
    def _():
        pg.get_by_role('button', name='Abrir Faraó').click()
        pg.get_by_role('button', name='Alterar cadastro').click()
        pg.get_by_test_id('form-touro').get_by_role('button', name='Touro vivo').click()
        pg.locator('#tr-brinco').fill('901')
        pg.get_by_role('button', name='Salvar', exact=True).click()
        esperar(lambda: any(x['nome'] == 'Faraó' and x.get('tipo') == 'Touro vivo' and str(x.get('brinco')) == '901' for x in estado()['touros']), pg=pg)

    # ------------------------------------------------------------ protocolo IATF (dono)
    @teste('Protocolo: dono cria IATF com sêmen, vazias e vaca pelo brinco (mostra último parto e última IATF)')
    def _():
        nav(pg, 'Manejo'); aba(pg, 'Protocolos')
        pg.get_by_role('button', name='Novo protocolo de IATF').click()
        pg.locator('#pr-nome').fill('IATF Teste'); pg.locator('#pr-data').fill(D0)
        pg.locator('#pr-semen').select_option(label='Sêmen Angus X (20 doses)')
        pg.locator('#pr-tec').fill('Zé Técnico')
        pg.get_by_role('button', name='+ Todas as vazias').click()
        assert pg.get_by_test_id('animais-protocolo').locator('.marca-lin').count() == 18
        pg.get_by_role('button', name='Tirar 3005').click()
        pg.locator('#pr-busca').fill('3005')
        sug = pg.get_by_test_id('sugestoes-protocolo').inner_text()
        assert 'Último parto: 12/03/26' in sug and 'Última IATF: nenhuma' in sug, sug
        pg.get_by_test_id('sugestoes-protocolo').locator('button').first.click()
        assert pg.get_by_test_id('animais-protocolo').locator('.marca-lin').count() == 18
        pg.get_by_role('button', name='Salvar protocolo').click()
        pg.get_by_test_id('detalhe-protocolo').wait_for()
        esperar(lambda: len(estado()['protocolos']) == 1, pg=pg)
        pr = estado()['protocolos'][0]
        assert pr['nome'] == 'IATF Teste' and len(pr['animais'].split(',')) == 18 and pr['tecnico'] == 'Zé Técnico'
        assert len(json.loads(pr['manejos'])) == 3

    # ------------------------------------------------------------ funcionário faz os manejos
    @teste('Funcionário: manejo D0 com lista DESMARCADA, avisa vaca fora do protocolo, grava presentes e vacina')
    def _():
        sair_dono(pg)
        nav(pg, 'Manejo'); aba(pg, 'Protocolos')
        pg.get_by_test_id('prot-IATF Teste').click()
        pg.get_by_role('button', name='Fazer').first.click()
        expect(pg.get_by_test_id('contador')).to_contain_text('0 de 18')
        busca = pg.get_by_label('Brinco para marcar')
        busca.fill('3025'); busca.press('Enter')
        assert 'não está no protocolo IATF Teste' in pg.get_by_test_id('msg-marcar').inner_text()
        busca.fill('3001'); busca.press('Enter')
        pg.get_by_role('button', name='Marcar 3002').click(); pg.get_by_role('button', name='Marcar 3003').click()
        expect(pg.get_by_test_id('contador')).to_contain_text('3 de 18')
        pg.get_by_role('button', name='Aplicação').click()
        pg.get_by_test_id('aplicacoes').locator('select').first.select_option('Vacina reprodutiva')
        pg.get_by_role('button', name='Gravar 3 presente(s)').click()
        pg.wait_for_selector('text=Gravado: 3 animal(is) presentes')
        esperar(lambda: len(evs(estado(), 'manejo')) == 1, pg=pg)
        mj = evs(estado(), 'manejo')[0]
        assert mj['etapa'] == 'D0' and sorted(mj['presentes'].split(',')) == ['m1', 'm2', 'm3'] and 'Vacina reprodutiva' in mj['aplicacoes']
        assert len(mj['ausentes'].split(',')) == 15

    @teste('Funcionário: dia da IA lança IATF por vaca com o sêmen (troca o sêmen de uma)')
    def _():
        pg.get_by_role('button', name='Voltar').click()
        botoes = pg.get_by_test_id('detalhe-protocolo').get_by_role('button', name='Fazer', exact=True)
        botoes.last.click()
        assert pg.locator('#mj-semen').input_value() != ''
        assert pg.locator('#mj-resp').input_value() == 'Zé Técnico'
        pg.get_by_role('button', name='Marcar 3001').click(); pg.get_by_role('button', name='Marcar 3002').click()
        pg.get_by_label('Sêmen da vaca 3002').select_option(label='Full Metal')
        pg.get_by_role('button', name='Gravar 2 presente(s)').click()
        pg.wait_for_selector('text=2 inseminação(ões) lançada(s)')
        esperar(lambda: len(evs(estado(), 'iatf')) == 2, pg=pg)
        ia = {x['matrizId']: x for x in evs(estado(), 'iatf')}
        touros = {x['id']: x['nome'] for x in estado()['touros']}
        assert touros[ia['m1']['touroId']] == 'Sêmen Angus X' and touros[ia['m2']['touroId']] == 'Full Metal'
        assert ia['m1']['protocoloId'] == estado()['protocolos'][0]['id'] and ia['m1']['tecnico'] == 'Zé Técnico'

    @teste('Dono: mandar para o repasse cria o lote de monta com vários touros')
    def _():
        entrar_dono(pg)
        nav(pg, 'Manejo'); aba(pg, 'Protocolos')
        pg.get_by_test_id('prot-IATF Teste').click()
        pg.get_by_role('button', name='Mandar para o repasse (monta)').click()
        assert pg.locator('#pr-nome').input_value() == 'Repasse de IATF Teste'
        pg.get_by_role('button', name='Trovão').click(); pg.get_by_role('button', name='Faraó').click()
        pg.get_by_role('button', name='Salvar lote de monta').click()
        pg.get_by_test_id('detalhe-protocolo').wait_for()
        esperar(lambda: len(estado()['protocolos']) == 2, pg=pg)
        m = [x for x in estado()['protocolos'] if x['tipo'] == 'Monta'][0]
        assert len(m['touros'].split(',')) == 2 and len(m['animais'].split(',')) == 18
        assert 'Trovão' in pg.get_by_test_id('detalhe-protocolo').inner_text()

    # ------------------------------------------------------------ toque geral
    @teste('Toque: cabeçalho, cada vaca mostra crias, parto, serviço e vacina; marca cheia/vazia/descarte/apta')
    def _():
        sair_dono(pg)
        nav(pg, 'Manejo'); aba(pg, 'Toque')
        pg.locator('#tq-vet').fill('Dr. Paulo')
        pg.get_by_role('button', name='Ultrassom').click()
        pg.get_by_role('button', name='Começar o toque').click()
        expect(pg.get_by_test_id('placar-toque')).to_contain_text('0 de 30 avaliadas')
        b = pg.get_by_label('Buscar brinco no toque')
        b.fill('3001')
        lin = pg.get_by_test_id('toque-3001')
        txt = lin.inner_text()
        assert 'IATF' in txt and 'Sêmen Angus X' in txt and 'Vacina reprodutiva' in txt, txt
        lin.get_by_role('button', name='Cheia').click()
        lin.get_by_label('Dias de prenhez da 3001').fill('9')
        assert 'parto previsto' in lin.inner_text() and 'IATF de' in lin.inner_text()
        b.fill('3002'); pg.get_by_test_id('toque-3002').get_by_role('button', name='Vazia').click()
        b.fill('3004'); l4 = pg.get_by_test_id('toque-3004')
        assert l4.get_by_role('button', name='Apta', exact=True).count() == 1
        l4.get_by_role('button', name='Apta', exact=True).click()
        b.fill('3010'); l10 = pg.get_by_test_id('toque-3010')
        l10.get_by_role('button', name='Descarte').click(); l10.get_by_label('Motivo do descarte da 3010').select_option('Idade')
        b.fill('3025'); l25 = pg.get_by_test_id('toque-3025')
        l25.get_by_role('button', name='Vazia').click()
        assert 'perda' in l25.inner_text()
        expect(pg.get_by_test_id('placar-toque')).to_contain_text('5 de 30 avaliadas')

    @teste('Toque: marcações ficam guardadas no celular (recarregar não perde)')
    def _():
        pg.reload(); pg.wait_for_selector('.foot-note')
        nav(pg, 'Manejo'); aba(pg, 'Toque')
        expect(pg.get_by_test_id('placar-toque')).to_contain_text('5 de 30 avaliadas')

    @teste('Toque sem internet: grava no celular; com internet vai para a planilha e muda status')
    def _():
        ctx.set_offline(True)
        pg.get_by_role('button', name='Gravar 5 avaliação(ões)').click()
        pg.wait_for_selector('text=5 avaliação(ões) gravada(s)')
        expect(pg.get_by_test_id('chip-fila').first).to_contain_text('no celular')
        ctx.set_offline(False)
        pg.evaluate("window.dispatchEvent(new Event('online'))")
        esperar(lambda: len([d for d in evs(estado(), 'diagnostico') if d.get('toqueId')]) == 5, ms=20000, pg=pg)
        esperar(lambda: pg.get_by_test_id('chip-fila').count() == 0, ms=20000, pg=pg)
        st = {x['brinco']: x['status'] for x in estado()['matrizes']}
        assert st['3001'] == 'Cheia' and st['3002'] == 'Vazia' and st['3010'] == 'Descarte' and st['3025'] == 'Vazia', st
        dg = [d for d in evs(estado(), 'diagnostico') if d.get('toqueId') and d['matrizId'] == 'm4'][0]
        assert dg['apta'] == 'Sim' and dg['veterinario'] == 'Dr. Paulo' and dg['metodo'] == 'Ultrassom', dg

    @teste('Toque: encerrar mostra o resumo com taxa de prenhez e PDF')
    def _():
        pg.get_by_role('button', name='Encerrar toque').click()
        pg.get_by_role('button', name='Confirmar encerrar').click()
        r = pg.get_by_test_id('resumo-toque').inner_text()
        assert 'TAXA DE PRENHEZ' in r.upper() and '33% (1 de 3)' in r, r[:400]
        with pg.expect_download() as d:
            pg.get_by_role('button', name='PDF do toque').click()
        d.value.save_as(os.path.join(SAIDA, 'toque.pdf'))
        assert open(os.path.join(SAIDA, 'toque.pdf'), 'rb').read()[:4] == b'%PDF'

    @teste('Dono: do resumo do toque monta o próximo protocolo já com vazias e novilhas aptas')
    def _():
        entrar_dono(pg)
        nav(pg, 'Manejo'); aba(pg, 'Toque')
        pg.locator('.card-prot').first.click()
        pg.get_by_role('button', name='Montar protocolo com vazias e novilhas aptas (3)').click()
        pg.get_by_test_id('form-protocolo').wait_for()
        assert pg.get_by_test_id('animais-protocolo').locator('.marca-lin').count() == 3
        pg.get_by_role('button', name='Cancelar').click()

    # ------------------------------------------------------------ vacinas
    @teste('Vacinas: pendências de Lepto atrasada, vacina reprodutiva e brucelose; "Foi vacinada?" resolve')
    def _():
        sair_dono(pg)
        nav(pg, 'Manejo'); aba(pg, 'Vacinas')
        t = pg.get_by_test_id('tela-vacinas').inner_text()
        assert 'Reforço Lepto' in t and 'Atrasado' in t and 'Vacina reprodutiva' in t and 'Brucelose' in t, t[:500]
        g = pg.get_by_test_id('grupo-reprodutiva')
        n0 = g.locator('.led-r').count()
        g.locator('.led-r').first.get_by_role('button', name='Sim').click()
        pg.wait_for_selector('text=vacina reprodutiva registrada')
        assert pg.get_by_test_id('grupo-reprodutiva').locator('.led-r').count() == n0 - 1

    @teste('Vacinas: "Vacinar estes" (brucelose) abre a lista desmarcada e grava quem tomou')
    def _():
        pg.get_by_test_id('grupo-brucelose').get_by_role('button', name='Vacinar estes').click()
        expect(pg.get_by_test_id('contador')).to_contain_text('0 de')
        assert pg.get_by_test_id('aplicacoes').locator('select').first.input_value() == 'Brucelose'
        pg.get_by_role('button', name='Marcar 6003').click()
        pg.get_by_role('button', name='Gravar 1 presente(s)').click()
        pg.wait_for_selector('text=Gravado: 1 animal(is)')
        pg.get_by_role('button', name='Voltar').click()
        assert '6003' not in pg.get_by_test_id('grupo-brucelose').inner_text()
        esperar(lambda: any('c:n3' in x['presentes'] for x in evs(estado(), 'manejo')), pg=pg)

    @teste('Parto: vaca cheia mostra Lepto atrasada e pede confirmação do reforço')
    def _():
        nav(pg, 'Parto')
        corpo = pg.inner_text('body')
        assert 'COM VACINA PENDENTE' in corpo.upper() and 'Lepto atrasada' in corpo, corpo[:1500]
        pg.locator('button.led-r').first.click()
        det = pg.locator('.detalhe').inner_text()
        assert 'Reforço Lepto ATRASADO' in det and 'Já tomou o reforço da Lepto?' in det, det

    # ------------------------------------------------------------ relatórios do funcionário
    @teste('Relatórios: funcionário vê os de campo, sem Planilha e sem valores; PDF funciona')
    def _():
        nav(pg, 'Relatórios')
        abas = [t.inner_text().split('·')[0].strip() for t in pg.get_by_role('tab').all()]
        for a in ['Crias', 'Vazias', 'Prenhas', 'Situação', 'Parto', 'Toque', 'IATF', 'Vacinas', 'Pesagens', 'Descartes', 'Mortes', 'Vendas', 'Touros']:
            assert any(x.upper() == a.upper() for x in abas), (a, abas)
        assert not any(x.upper() in ('PLANILHA', 'MELHORES VACAS') for x in abas), abas
        aba(pg, 'Vendas')
        assert 'Receita' not in pg.inner_text('.sheet.pad') and 'R$' not in pg.inner_text('.sheet.pad')
        aba(pg, 'Vazias')
        with pg.expect_download() as d:
            pg.get_by_role('button', name='PDF', exact=True).click()
        assert d.value.suggested_filename.startswith('matrizes-vazias')
        aba(pg, 'Crias')
        t = pg.inner_text('.sheet.pad')
        assert 'Fêmeas (ordem numérica)' in t and 'Machos (ordem numérica)' in t

    @teste('Sem erros de tela em todo o fluxo')
    def _():
        assert not erros, erros

    # ------------------------------------------------------------ computador
    ctx2 = nav_.new_context(viewport={'width': 1280, 'height': 900})
    pg2 = ctx2.new_page(); erros2 = []
    pg2.on('pageerror', lambda e: erros2.append(str(e)))
    pg2.goto(BASE + '/'); pg2.wait_for_selector('.foot-note')

    @teste('Computador: Manejo, protocolos, toque e vacinas abrem sem erro (dono)')
    def _():
        entrar_dono(pg2)
        nav(pg2, 'Manejo')
        for a in ['Protocolos', 'Toque', 'Vacinas']:
            aba(pg2, a); pg2.wait_for_timeout(200)
        aba(pg2, 'Vacinas'); pg2.get_by_role('button', name='Calendário de vacinas').click()
        pg2.get_by_role('button', name='Vacina periódica (ex.: clostridioses, raiva)').click()
        pg2.get_by_label('Nome da vacina').last.fill('Clostridioses')
        pg2.get_by_role('button', name='Salvar calendário').click()
        pg2.wait_for_selector('text=Calendário salvo')
        esperar(lambda: 'Clostridioses' in str(estado()['config'].get('calendarioVacinas', '')), pg=pg2)
        assert not erros2, erros2
    pg2.close(); ctx2.close()
    nav_.close()

print(f'navegador app 10: {ok} ok, {len(falhas)} falha(s)')
sys.exit(1 if falhas else 0)
