// Regras do app 10: protocolos IATF e monta, manejo de curral, toque geral, vacinas (Lepto, brucelose), touros, relatórios.
import assert from 'assert';
import { createRequire } from 'module';
import * as L from '../src/logica.js';
import * as M from '../src/manejo.js';
const require = createRequire(import.meta.url);
const { dadosExemplo } = require('./dados_exemplo.cjs');
let ok = 0;
const t = (nome, fn) => { fn(); ok++; console.log('  ok', nome); };
const HOJE = '2026-11-20';
const base = () => M.normalizarTudo({ ...dadosExemplo(), protocolos: [], config: {} });

t('normaliza touros (tipo) e protocolos (listas e manejos)', () => {
  const d = M.normalizarTudo({ ...dadosExemplo(), protocolos: [{ id: 'p', tipo: 'Monta', nome: 'x', animais: 'm1,m2', touros: 't1', manejos: '[{"id":"ENTRADA","dias":0}]', dataInicio: '2026-01-01' }] });
  assert.deepStrictEqual(d.protocolos[0].animais, ['m1', 'm2']); assert.strictEqual(d.protocolos[0].manejos[0].id, 'ENTRADA');
  assert.strictEqual(d.touros[0].situacao, 'Ativo');
  const volta = M.protocoloParaPlanilha(d.protocolos[0]); assert.strictEqual(volta.animais, 'm1,m2'); assert.strictEqual(typeof volta.manejos, 'string');
});

let d = base();
let prot;
t('protocolo IATF: validação, datas dos manejos e agenda', () => {
  const p0 = { tipo: 'IATF', nome: 'IATF Nov/26', dataInicio: '2026-11-03', manejos: M.MODELOS_IATF['3 manejos'], animais: ['m1', 'm2', 'm3', 'm5'], semenPadrao: 't2' };
  assert.deepStrictEqual(M.validarProtocolo(d, { ...p0, animais: [] }).erros, ['Coloque pelo menos um animal.']);
  prot = M.prepararProtocolo(p0);
  assert.deepStrictEqual(M.validarProtocolo(d, prot).erros, []);
  d = { ...d, protocolos: [prot] };
  const ag = M.agendaProtocolo(d, prot, '2026-11-11');
  assert.deepStrictEqual(ag.map((m) => m.data), ['2026-11-03', '2026-11-11', '2026-11-13']);
  assert.ok(ag[0].atrasado && ag[1].hoje && !ag[2].atrasado);
  assert.strictEqual(M.dataIA(prot), '2026-11-13');
});

t('vaca fora do protocolo é avisada pelo brinco', () => {
  assert.ok(M.acharNoProtocolo(d, prot, '3001').matriz && !M.acharNoProtocolo(d, prot, '3001').fora);
  const r = M.acharNoProtocolo(d, prot, '3004'); assert.ok(r.fora); assert.match(r.erro, /não está no protocolo IATF Nov\/26/);
  assert.match(M.acharNoProtocolo(d, prot, '9999').erro, /Não achei/);
});

t('manejo D0 com aplicações; presentes e ausentes; vacina vai para a ficha', () => {
  const r = M.aplicarManejo(d, { protocolo: prot, manejo: prot.manejos[0], data: '2026-11-03', responsavel: 'Zé', aplicacoes: [{ tipo: 'Vacina reprodutiva', produto: 'X' }], presentes: ['m1', 'm2', 'm3'] });
  assert.deepStrictEqual(r.erros, []);
  assert.strictEqual(r.eventosNovos.length, 1);
  assert.strictEqual(r.eventosNovos[0].ausentes, 'm5');
  d = r.estado;
  assert.ok(M.agendaProtocolo(d, prot, '2026-11-04')[0].feito);
  assert.strictEqual(M.aplicacoesPorAnimal(d).get('m1')[0].tipo, 'Vacina reprodutiva');
  assert.ok(M.aplicarManejo(d, { protocolo: prot, manejo: prot.manejos[1], data: '2026-11-11', presentes: [] }).erros.length);
});

t('manejo da IA cria um lançamento de IATF por vaca com o sêmen e o protocolo', () => {
  const r = M.aplicarManejo(d, { protocolo: prot, manejo: prot.manejos[2], data: '2026-11-13', responsavel: 'Técnico', presentes: ['m1', 'm2'], semen: { m2: 't1' } });
  const ias = r.eventosNovos.filter((e) => e.tipo === 'iatf');
  assert.strictEqual(ias.length, 2);
  assert.strictEqual(ias.find((e) => e.matrizId === 'm1').touroId, 't2');
  assert.strictEqual(ias.find((e) => e.matrizId === 'm2').touroId, 't1');
  assert.ok(ias.every((e) => e.protocoloId === prot.id && e.numeroServico === '1ª' && e.tecnico === 'Técnico' && e.dataInicioProtocolo === '2026-11-03'));
  d = r.estado;
  assert.strictEqual(M.estoqueSemen(d.touros.find((x) => x.id === 't2'), d.eventos).usadas, 1);
});

let monta;
t('repasse: monta 17 dias depois da IA, 90 dias, com vários touros', () => {
  monta = M.prepararProtocolo(M.montaDeRepasse(d, prot, { touros: ['t1', 't2'] }));
  assert.strictEqual(monta.dataInicio, '2026-11-30'); assert.strictEqual(monta.dataFim, '2027-02-28');
  assert.deepStrictEqual(monta.animais, ['m1', 'm2', 'm3', 'm5']); assert.strictEqual(monta.origemId, prot.id);
  d = { ...d, protocolos: [prot, monta] };
});

t('pai provável: parto da monta mostra os touros do lote (A ou B)', () => {
  const nasc = { id: 'nx', tipo: 'nascimento', data: '2027-09-20', matrizId: 'm3', resultadoParto: 'Vivo', sexo: 'Macho', brincoBezerro: '7501' };
  const o = L.origemDaCria(nasc, d.eventos, d.touros, d.protocolos);
  assert.strictEqual(o.origem, 'Monta'); assert.strictEqual(o.pai, 'Faraó ou Full Metal');
  const nasc2 = { ...nasc, matrizId: 'm1', data: '2027-08-25' }; // 285 dias depois da IA de 13/11
  assert.strictEqual(L.origemDaCria(nasc2, d.eventos, d.touros, d.protocolos).origem, 'IATF');
});

let sessao;
t('toque geral: elegíveis incluem novilhas; marcações mudam status; avisos', () => {
  const eleg = M.elegiveisToque(d);
  assert.strictEqual(eleg.length, 30);
  sessao = { id: 'tq1', data: '2026-12-15', veterinario: 'Dr. Paulo', metodo: 'Ultrassom', aplicacoes: [{ tipo: 'Vermífugo' }] };
  const m1 = d.matrizes.find((x) => x.id === 'm1');
  assert.deepStrictEqual(M.avisosToque(d, m1, { resultado: 'Cheia', dg: '' }, sessao.data), ['Falta o número de dias de prenhez.']);
  assert.deepStrictEqual(M.avisosToque(d, m1, { resultado: 'Cheia', dg: 32 }, sessao.data), []); // bate com a IA de 13/11
  const m6 = d.matrizes.find((x) => x.id === 'm6');
  assert.match(M.avisosToque(d, m6, { resultado: 'Cheia', dg: 300 }, sessao.data)[0], /290/);
  const m20 = d.matrizes.find((x) => x.id === 'm20');
  assert.match(M.avisosToque(d, m20, { resultado: 'Vazia' }, sessao.data).join(' '), /perda/);
  const r = M.aplicarToque(d, sessao, [
    { matrizId: 'm1', resultado: 'Cheia', dg: 32 }, { matrizId: 'm2', resultado: 'Vazia' }, { matrizId: 'm20', resultado: 'Vazia' },
    { matrizId: 'm3', resultado: 'Descarte', motivo: 'Idade' }, { matrizId: 'm4', resultado: 'Vazia', apta: 'Sim' },
  ]);
  assert.strictEqual(r.aplicados.length, 5); assert.strictEqual(r.rejeitados.length, 0);
  d = r.estado;
  const st = (id) => d.matrizes.find((x) => x.id === id).status;
  assert.deepStrictEqual(['m1', 'm2', 'm20', 'm3'].map(st), ['Cheia', 'Vazia', 'Vazia', 'Descarte']);
  assert.ok(r.eventosParaGravar.some((x) => x.tipo === 'manejo' && x.evento.etapa === 'Toque' && x.evento.presentes.split(',').length === 5));
  assert.ok(r.eventosParaGravar.some((x) => x.tipo === 'descarte'));
  const r2 = M.aplicarToque(d, sessao, [{ matrizId: 'm1', resultado: 'Vazia' }]);
  assert.strictEqual(r2.aplicados.length, 0); assert.match(r2.rejeitados[0].motivo, /já tem toque/);
});

t('resumo do toque: taxa de prenhez por protocolo e sêmen, aptas e ausentes', () => {
  const r = M.resumoToque(d, 'tq1');
  assert.strictEqual(r.total, 5); assert.strictEqual(r.cheias, 1); assert.strictEqual(r.vazias, 2); assert.strictEqual(r.descartes, 1); assert.strictEqual(r.aptas, 1);
  assert.strictEqual(r.geral.pct, 33);
  assert.strictEqual(r.porProtocolo.find((g) => g.chave === 'IATF Nov/26').cheias, 1);
  assert.strictEqual(r.porSemen[0].chave, 'Full Metal');
  assert.strictEqual(r.ausentes.length, 25);
  assert.deepStrictEqual(r.aptasIds, ['m4']); assert.deepStrictEqual(r.vaziasIds.sort(), ['m2', 'm20']);
  const rel = M.relatorioToque(d, 'tq1');
  assert.strictEqual(rel.resumo[1].valor, '33% (1 de 3)');
});

t('vacina: vaca cheia tem reforço da Lepto aos 6 meses de prenhez; atrasado avisa', () => {
  const m1 = d.matrizes.find((x) => x.id === 'm1');
  const s = M.situacaoVacinaVaca(d, m1, '2027-01-10');
  assert.strictEqual(s.inicial, '2026-11-03');
  assert.strictEqual(s.reforco.concepcao, '2026-11-13'); assert.strictEqual(s.reforco.prazo, '2027-05-13');
  assert.match(s.texto, /Reforço Lepto em 13\/05\/27/);
  const s2 = M.situacaoVacinaVaca(d, m1, '2027-05-20');
  assert.strictEqual(s2.reforco.atrasoDias, 7); assert.strictEqual(s2.nivel, 'atrasada');
  // vaca cheia sem registro nenhum pede confirmação
  const m25 = d.matrizes.find((x) => x.id === 'm25');
  assert.match(M.situacaoVacinaVaca(d, m25, '2026-12-20').texto, /Sem vacina reprodutiva/);
  const conf = M.manejoConfirmacaoVacina(['m25'], '2026-04-01');
  const d2 = { ...d, eventos: [...d.eventos, conf] };
  assert.doesNotMatch(M.situacaoVacinaVaca(d2, m25, '2026-12-20').texto, /Sem vacina/);
  // reforço aplicado fecha a pendência
  const ref = M.aplicarManejo(d, { data: '2027-05-15', aplicacoes: [{ tipo: 'Reforço Lepto' }], presentes: ['m1'], etapa: 'Vacinação' });
  assert.match(M.situacaoVacinaVaca(ref.estado, m1, '2027-05-20').texto, /Lepto em dia/);
});

t('pendências: brucelose das bezerras de 3 a 8 meses e periódicas do calendário', () => {
  const cfg = { calendarioVacinas: JSON.stringify([...M.CALENDARIO_PADRAO, { id: 'clos', nome: 'Clostridioses', tipo: 'periodo', publico: 'matrizes', intervaloMeses: 12, ativo: true }]) };
  const p = M.pendenciasVacinas(d, cfg, '2026-09-15');
  const bruc = p.filter((x) => x.regra.id === 'brucelose');
  assert.deepStrictEqual(bruc.map((x) => x.brinco).sort(), ['6003', '6006', '6009']);
  assert.ok(bruc.every((x) => x.tipo === 'Bezerra'));
  assert.ok(p.some((x) => x.regra.id === 'clos' && x.situacao === 'Nunca registrada'));
  const vac = M.aplicarManejo(d, { data: '2026-09-10', aplicacoes: [{ tipo: 'Brucelose' }], presentes: ['c:n3'], etapa: 'Vacinação' });
  assert.ok(!M.pendenciasVacinas(vac.estado, cfg, '2026-09-15').some((x) => x.regra.id === 'brucelose' && x.brinco === '6003'));
  const tarde = M.pendenciasVacinas(d, cfg, '2027-01-10').filter((x) => x.regra.id === 'brucelose' && x.brinco === '6003')[0];
  assert.match(tarde.situacao, /RB51/);
});

t('touros: validação, estoque com ajuste, andrológico vencido', () => {
  assert.deepStrictEqual(M.validarTouro({ nome: '' }), ['Falta o nome.', 'Escolha se é sêmen ou touro vivo.']);
  const s = M.prepararTouro({ nome: 'Sêmen X', tipo: 'Sêmen', doses: 20, ajusteDoses: -2 });
  assert.strictEqual(M.estoqueSemen(s, []).restantes, 18);
  assert.ok(M.andrologicoVencido({ tipo: 'Touro vivo', andrologicoData: '2025-01-01' }, '2026-10-19'));
  assert.ok(!M.andrologicoVencido({ tipo: 'Touro vivo', andrologicoData: '2026-09-01' }, '2026-10-19'));
});

t('todos os relatórios montam (dono e funcionário) e o funcionário não vê R$', () => {
  const venda = L.aplicarVenda(d, { data: '2026-12-01', comprador: 'Zé', valorKg: '12', itens: [{ brinco: '6501', tipoAnimal: 'Bezerro', peso: 200 }] });
  const dv = venda.estado || d;
  M.RELATORIOS_APP.forEach((r) => {
    const dono = M.montarRelatorioApp(r.id, dv, 2026, HOJE, { dono: true });
    const func = M.montarRelatorioApp(r.id, dv, 2026, HOJE, { dono: false });
    assert.ok(dono.titulo && Array.isArray(dono.secoes), r.id);
    const tudo = JSON.stringify(func.resumo) + JSON.stringify(func.secoes.map((s) => s.colunas));
    assert.ok(!/R\$|Receita|Valor/.test(tudo), `${r.id} mostra valor ao funcionário`);
  });
  const vd = M.montarRelatorioApp('vendas', dv, 2026, HOJE, { dono: true });
  assert.ok(JSON.stringify(vd).includes('Receita'));
});

t('pendentes da fila: protocolos e touros reaparecem', () => {
  const pr = M.protocoloParaPlanilha(prot);
  const r = M.aplicarPendentesTudo(base(), [{ payload: { action: 'upsertProtocolos', protocolos: [pr] } }, { payload: { action: 'upsertTouros', touros: [{ id: 't1', nome: 'Faraó 2', tipo: 'Touro vivo' }] } }]);
  assert.deepStrictEqual(r.protocolos[0].animais, ['m1', 'm2', 'm3', 'm5']);
  assert.strictEqual(r.touros.find((x) => x.id === 't1').nome, 'Faraó 2');
});

console.log(`regras do app 10: ${ok} testes passaram`);
