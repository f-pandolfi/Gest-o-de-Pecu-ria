// Regras novas da 9.5: idade em meses e dias, ficha rápida, pesagem 2x, relatório do dia, fila sem internet.
import assert from 'assert';
import { createRequire } from 'module';
import * as L from '../src/logica.js';
const require = createRequire(import.meta.url);
const { dadosExemplo } = require('./dados_exemplo.cjs');

let ok = 0;
const t = (nome, fn) => { fn(); ok++; console.log('  ok', nome); };
const base = () => L.normalizarDados({ ...dadosExemplo(), config: {} });

t('idade em meses e dias pelo calendário', () => {
  assert.deepStrictEqual(L.idadeMesesDias('2026-03-12', '2026-10-24').texto, '7 meses e 12 dias');
  assert.strictEqual(L.idadeMesesDias('2026-03-12', '2026-04-12').texto, '1 mês');
  assert.strictEqual(L.idadeMesesDias('2026-03-12', '2026-03-13').texto, '1 dia');
  assert.strictEqual(L.idadeMesesDias('2026-01-31', '2026-02-28').texto, '28 dias');
  assert.strictEqual(L.idadeMesesDias('2026-01-31', '2026-03-01').meses, 1);
  assert.strictEqual(L.idadeMesesDias('2026-10-10', '2026-10-01'), null);
  assert.strictEqual(L.idadeMesesDias('2026-03-12', '2026-10-24').totalDias, 226);
});

t('meses e dias digitados viram dias (com e sem nascimento)', () => {
  assert.strictEqual(L.diasDeMesesDias('2026-03-12', 7, 12), 226);
  assert.strictEqual(L.diasDeMesesDias('', 7, 12), 222);
  assert.strictEqual(L.diasDeMesesDias('2026-03-12', '', '5'), 5);
  assert.strictEqual(L.addMeses('2026-01-31', 1), '2026-02-28');
});

t('ficha rápida da cria: idade, nascimento, mãe, já pesado', () => {
  const d = base();
  const f = L.fichaAnimal(d, '6501', '2026-10-19');
  assert.ok(f.achado); assert.strictEqual(f.sexo, 'Macho');
  assert.strictEqual(f.nascData, '2026-03-12'); assert.strictEqual(f.maeBrinco, '3005');
  assert.strictEqual(f.idade.texto, '7 meses e 7 dias');
  assert.ok(f.jaPesado); assert.strictEqual(f.ultimoPeso.peso, 196);
  assert.strictEqual(f.mesmaData.length, 0);
  const g = L.fichaAnimal(d, '6003', '2026-10-19');
  assert.ok(g.achado); assert.strictEqual(g.sexo, 'Fêmea'); assert.strictEqual(g.jaPesado, false); assert.strictEqual(g.ultimoPeso, null);
  const h = L.fichaAnimal(d, '9999', '2026-10-19');
  assert.strictEqual(h.achado, false);
});

t('ficha mostra a pesagem já gravada na mesma data', () => {
  const f = L.fichaAnimal(base(), '6501', '2026-10-10');
  assert.strictEqual(f.mesmaData.length, 1); assert.strictEqual(f.mesmaData[0].peso, 196);
  assert.strictEqual(f.pesoAnterior.peso, 150);
});

t('lote recusa pesagem repetida na mesma data, aceita com "lançar mesmo assim" e marca 2x', () => {
  const d = base();
  const r1 = L.aplicarLote(d, [{ tipo: 'pesagem', brincoCria: '6501', data: '2026-10-10', peso: 199 }]);
  assert.strictEqual(r1.aplicados.length, 0); assert.match(r1.rejeitados[0].motivo, /já existe/);
  const r2 = L.aplicarLote(d, [{ tipo: 'pesagem', brincoCria: '6501', data: '2026-10-10', peso: 199, forcar: true }]);
  assert.strictEqual(r2.aplicados.length, 1);
  const c = L.listarCrias(r2.estado, '2026-10-19').find((x) => x.brinco === '6501');
  const doDia = c.pontos.filter((p) => p.data === '2026-10-10');
  assert.strictEqual(doDia.length, 2); assert.ok(doDia.every((p) => p.vezes === 2));
  const rel = L.relatorioPesagemDia(r2.estado, '2026-10-10', '2026-10-19');
  const linhas = rel.secoes[0].linhas.filter((l) => l.brinco === '6501');
  assert.strictEqual(linhas.length, 2);
  assert.deepStrictEqual(linhas.map((l) => l.peso).sort(), [196, 199]);
  assert.ok(linhas.every((l) => /2x/.test(l.obs)));
  assert.strictEqual(rel.resumo.find((x) => x.rotulo === 'Pesados 2x nesta data').valor, '6501');
});

t('relatório do dia: total, média, idade, mãe, ganho', () => {
  const rel = L.relatorioPesagemDia(base(), '2026-10-10', '2026-10-19');
  assert.strictEqual(rel.titulo, 'Pesagem de 10/10/26');
  assert.strictEqual(rel.resumo[0].valor, 3);
  assert.strictEqual(rel.resumo[2].valor, '622 kg');
  const l = rel.secoes[0].linhas.find((x) => x.brinco === '6501');
  assert.strictEqual(l.mae, '3005'); assert.strictEqual(l.idade, '6 meses e 28 dias');
  assert.match(l.anterior, /150 kg em 20\/08\/26/); assert.strictEqual(l.ganho, '0,90 kg/dia');
  assert.strictEqual(rel.resumo.find((x) => x.rotulo === 'Pesados 2x nesta data').valor, 'nenhum');
  assert.strictEqual(L.relatorioPesagemDia(base(), '2026-01-01', '2026-10-19').secoes[0].linhas.length, 0);
});

t('pendentes da fila reaparecem sobre os dados lidos da planilha (sem duplicar)', () => {
  const d = base();
  const ev = { id: 'z1', tipo: 'pesagem', data: '2026-10-19', criaId: 'n3', brinco: '6003', peso: 120 };
  const m = { ...d.matrizes[0], status: 'Cheia' };
  const fila = [
    { payload: { action: 'appendEvento', tipo: 'pesagem', evento: ev } },
    { payload: { action: 'appendEventos', itens: [{ tipo: 'pesagem', evento: ev }, { tipo: 'morte', evento: { id: 'z2', data: '2026-10-19', brinco: '6506', criaId: 'n6', causa: 'Doença' } }] } },
    { payload: { action: 'upsertMatrizes', matrizes: [m] } },
    { payload: { action: 'setConfig', config: { metaPesoMacho: 250 } } },
    { payload: { action: 'atualizarCampos', tipo: 'pesagem', itens: [{ id: 'p1', campos: { peso: 197 } }] } },
    { payload: { action: 'appendTouro', touro: { id: 'tz', nome: 'Z' } } },
  ];
  const r = L.aplicarPendentes(d, fila);
  assert.strictEqual(r.eventos.filter((e) => e.id === 'z1').length, 1);
  assert.strictEqual(r.eventos.find((e) => e.id === 'z2').tipo, 'morte');
  assert.strictEqual(r.matrizes.find((x) => x.id === m.id).status, 'Cheia');
  assert.strictEqual(r.config.metaPesoMacho, 250);
  assert.strictEqual(r.eventos.find((e) => e.id === 'p1').peso, 197);
  assert.strictEqual(r.touros.length, 3);
  assert.strictEqual(L.aplicarPendentes(r, fila).eventos.length, r.eventos.length); // aplicar de novo não muda nada
});

t('desmama grava a idade calculada em dias', () => {
  const d = base();
  const r = L.aplicarLancamento(d, 'desmama', { brincoBezerro: '6003', data: '2026-10-19', pesoDesmama: 180, idadeDias: L.diasDeMesesDias('2026-04-02', 6, 17) });
  assert.strictEqual(r.eventosNovos[0].idadeDias, 200);
  assert.strictEqual(r.matrizesAlteradas[0].categoria, 'Novilha'); // fêmea vai para as novilhas
  const r2 = L.aplicarLancamento(d, 'desmama', { brincoBezerro: '6003', data: '2026-10-19', pesoDesmama: 180 });
  assert.strictEqual(r2.eventosNovos[0].idadeDias, L.diasEntre('2026-04-02', '2026-10-19'));
});

console.log(`regras 9.5: ${ok} testes passaram`);
