// App 10.4: nascimentos do histórico (situação de origem, ligação com matriz, número repetido) e pesagem sem brinco.
import assert from 'assert';
import { createRequire } from 'module';
import * as L from '../src/logica.js';
import * as M from '../src/manejo.js';
import * as P from '../src/pesagemConferencia.js';
const require = createRequire(import.meta.url);
const { dadosExemplo } = require('./dados_exemplo.cjs');
let ok = 0;
const t = (nome, fn) => { fn(); ok++; console.log('  ok', nome); };
const HOJE = '2026-10-22';
const base = () => M.normalizarTudo({ ...dadosExemplo(), protocolos: [], config: {} });
const H = (cria, data, sexo, sit, extra) => ({ id: `hist-${cria}-${data.replace(/-/g, '')}`, tipo: 'nascimento', data, matrizId: '', resultadoParto: 'Vivo', sexo, pesoNascer: '', brincoBezerro: cria, pelagem: '', touroId: '', touroOutro: '', tipoParto: '', observacoes: `Histórico (planilha REBANHO 2026) · situação: ${sit} · raça NELORE${extra || ''}`, createdAt: 'x' });

let d = base();
const m5 = d.matrizes.find((m) => m.brinco === '3005');
const hist = [
  H('3005', '2023-01-02', 'Fêmea', 'MATRIZ'), // a matriz 3005 do cadastro é esta cria
  H('3551', '2023-08-01', 'Macho', 'VENDIDO em 03/06/2024'),
  H('4001', '2024-01-01', 'Fêmea', 'A CONFIRMAR', ' · mãe 1032 (fora do cadastro)'),
  H('4626', '2024-03-16', 'Macho', 'NA FAZENDA', ' · pesado em 10/10/2026'),
  H('4610', '2024-02-01', 'Macho', 'MORTO'),
  H('3010', '2023-02-01', 'Fêmea', 'A CONFIRMAR', ' · mesmo número da vaca 3010 do cadastro (outro animal)'),
  { ...H('3520', '2023-05-05', 'Macho', 'VENDIDO'), matrizId: m5.id },
];
d = { ...d, eventos: [...d.eventos, ...hist] };

t('situação de origem do histórico é lida da observação', () => {
  assert.deepStrictEqual(L.situacaoHistorica(hist[1]), { sit: 'VENDIDO', data: '2024-06-03', maeFora: '' });
  assert.strictEqual(L.situacaoHistorica(hist[2]).maeFora, '1032');
  assert.strictEqual(L.situacaoHistorica(d.eventos.find((e) => e.tipo === 'nascimento' && !L.ehHistorico(e))), null);
});

t('listarCrias: vendido, morto, na fazenda (desmamado), a confirmar, e a cria que virou a matriz 3005', () => {
  const c = Object.fromEntries(L.listarCrias(d, HOJE).filter((x) => x.historico).map((x) => [x.brinco, x]));
  assert.strictEqual(c['3551'].situacao, 'vendido'); assert.strictEqual(c['3551'].vendaData, '2024-06-03'); assert.ok(!c['3551'].ativa);
  assert.strictEqual(c['4610'].situacao, 'morto');
  assert.strictEqual(c['4626'].situacao, 'desmamado'); assert.ok(c['4626'].ativa);
  assert.strictEqual(c['4001'].situacao, 'confirmar'); assert.strictEqual(c['4001'].maeBrinco, '1032'); assert.ok(c['4001'].maeFora);
  assert.strictEqual(L.rotuloSituacao(c['4001']), 'Situação a confirmar');
  assert.ok(['novilha', 'matriz'].includes(c['3005'].situacao)); assert.strictEqual(c['3005'].novilha.id, m5.id);
});

t('digitar o brinco de uma matriz continua achando a MATRIZ (cria ligada e número repetido)', () => {
  const a = L.acharAnimal(d, '3005'); assert.strictEqual(a.tipo, 'matriz'); assert.strictEqual(a.matriz.id, m5.id); assert.strictEqual(a.nasc.id, hist[0].id);
  const b = L.acharAnimal(d, '3010'); assert.strictEqual(b.tipo, 'matriz'); assert.strictEqual(b.matriz.brinco, '3010'); assert.strictEqual(b.nasc, null);
  const c = L.acharAnimal(d, '4626'); assert.strictEqual(c.tipo, 'cria');
  // pesar a matriz 3005 grava a pesagem na matriz (e na cria ligada)
  const r = L.aplicarLancamento(d, 'pesagem', { brinco: '3005', data: HOJE, peso: 380 });
  assert.strictEqual(r.eventosNovos[0].matrizId, m5.id);
});

t('partos antigos contam para a vaca (último parto e lista de partos)', () => {
  assert.ok(d.eventos.filter((e) => e.tipo === 'nascimento' && e.matrizId === m5.id).some((e) => e.id === hist[6].id));
});

t('vacinas por idade ignoram as crias do histórico (nada de brucelose atrasada falsa)', () => {
  const antes = M.pendenciasVacinas(base(), {}, HOJE).filter((p) => p.regra.id === 'brucelose').length;
  const depois = M.pendenciasVacinas(d, {}, HOJE).filter((p) => p.regra.id === 'brucelose').length;
  assert.strictEqual(depois, antes);
});

// ---------------------------------------------------------------- pesagem sem brinco
const DATA = '2026-10-15';
let e2 = base();
const machos = L.listarCrias(e2, HOJE).filter((c) => c.sexo === 'Macho' && c.situacao === 'mamando' && c.nascData <= DATA);
t('pesagem do dia com dois sem brinco e um número pesado 2x', () => {
  const lote = L.aplicarLote(e2, [
    { tipo: 'pesagem', brincoCria: machos[0].brinco, data: DATA, peso: 200 },
    { tipo: 'pesagem', brincoCria: machos[1].brinco, data: DATA, peso: 210 },
    { tipo: 'pesagem', brincoCria: machos[1].brinco, data: DATA, peso: 195, forcar: true },
  ], { hoje: HOJE });
  assert.strictEqual(lote.aplicados.length, 3);
  const sb1 = P.pesagemSemBrinco(DATA, '141', 'branco', { id: 'sb1' }).evento;
  const sb2 = P.pesagemSemBrinco(DATA, 113, '', { id: 'sb2' }).evento;
  assert.ok(L.ehSemBrinco(sb1) && sb1.observacoes === 'SEM BRINCO: branco' && sb2.observacoes === 'SEM BRINCO');
  assert.ok(P.pesagemSemBrinco(DATA, '', 'x').erro);
  e2 = { ...lote.estado, eventos: [...lote.estado.eventos, sb1, sb2] };
});

t('conferência: sem brinco x não pesados (só machos, como no dia), e o repetido', () => {
  const c = P.conferenciaPesagem(e2, DATA, HOJE);
  assert.strictEqual(c.sexo, 'Macho');
  assert.deepStrictEqual(c.semBrinco.map((x) => [x.peso, x.sinal]), [[141, 'branco'], [113, '']]);
  assert.strictEqual(c.naoPesados.length, machos.length - 2);
  assert.ok(c.naoPesados.every((n) => n.sexo === 'Macho'));
  assert.strictEqual(c.repetidos.length, 1); assert.strictEqual(c.repetidos[0].brinco, machos[1].brinco);
  const todos = P.conferenciaPesagem(e2, DATA, HOJE, { sexo: '' });
  assert.ok(todos.naoPesados.length > c.naoPesados.length);
});

t('ligar o sem brinco a um não pesado dá baixa nas duas listas e a cria ganha o peso', () => {
  const alvo = machos[2];
  const r = P.identificarSemBrinco(e2, 'sb1', alvo.id, { now: '2026-10-22T10:00:00Z' });
  assert.deepStrictEqual(r.mudancas.eventos[0].campos, { criaId: alvo.id, brinco: alvo.brinco, observacoes: 'Identificado em 22/10/26 (pesado sem brinco: branco)' });
  assert.deepStrictEqual(L.postsDeMudancas(r.mudancas).map((x) => x.action), ['atualizarCampos']);
  e2 = L.aplicarMudancasNoEstado(e2, r.mudancas);
  const c = P.conferenciaPesagem(e2, DATA, HOJE);
  assert.strictEqual(c.semBrinco.length, 1); assert.ok(!c.naoPesados.some((n) => n.criaId === alvo.id));
  assert.strictEqual(L.listarCrias(e2, HOJE).find((x) => x.id === alvo.id).pesoAtual, 141);
  assert.ok(P.identificarSemBrinco(e2, 'sb1', alvo.id).erro, 'não identifica de novo');
});

t('um dos pesos repetidos vira "outro animal" (sem brinco, anotado como o número)', () => {
  const g = P.conferenciaPesagem(e2, DATA, HOJE).repetidos[0];
  const r = P.virarSemBrinco(e2, g.pesagens[1].id);
  assert.strictEqual(r.mudancas.eventos[0].campos.observacoes, `SEM BRINCO: anotado como ${g.brinco}`);
  e2 = L.aplicarMudancasNoEstado(e2, r.mudancas);
  const c = P.conferenciaPesagem(e2, DATA, HOJE);
  assert.strictEqual(c.repetidos.length, 0); assert.strictEqual(c.semBrinco.length, 2);
  assert.ok(c.semBrinco.some((x) => x.sinal === `anotado como ${g.brinco}`));
});

t('relatórios: o dia mostra os sem brinco (SB) sem juntar como 2x; o resumo do ano conta à parte', () => {
  const rel = L.relatorioPesagemDia(e2, DATA, HOJE);
  const sb = rel.secoes[0].linhas.filter((l) => l.brinco === 'SB');
  assert.strictEqual(sb.length, 2); assert.ok(sb.every((l) => /^Sem brinco/.test(l.obs) && !/2x/.test(l.obs)));
  assert.strictEqual(rel.resumo.find((r) => r.rotulo === 'Sem brinco').valor, 2);
  assert.strictEqual(rel.resumo.find((r) => r.rotulo === 'Pesados 2x nesta data').valor, 'nenhum');
  const ano = M.montarRelatorioApp('pesagens', e2, 2026, HOJE, { dono: true });
  assert.strictEqual(ano.secoes[0].linhas[0].dup, '2 sem brinco');
});

console.log(`histórico e pesagem sem brinco: ${ok} ok`);
