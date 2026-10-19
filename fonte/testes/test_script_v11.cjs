// Testa o script da planilha v11 no simulador: reenvio do mesmo lançamento não duplica linha.
const assert = require('assert');
const path = require('path');
const { carregarScript } = require('./simulador.cjs');
const { dadosExemplo } = require('./dados_exemplo.cjs');

let ok = 0;
const t = (nome, fn) => { fn(); ok++; console.log('  ok', nome); };

function semear(gs) {
  const d = dadosExemplo();
  const r = gs.post({ action: 'syncAll', ...d, forcar: true });
  assert.ok(r.ok, JSON.stringify(r));
}

const v10 = carregarScript(path.join(__dirname, '..', 'Code_v10.gs'));
const v11 = carregarScript(path.join(__dirname, '..', 'Code_v11.gs'));
semear(v10); semear(v11);
const ev = { id: 'x1', tipo: 'pesagem', data: '2026-10-19', criaId: 'n3', matrizId: '', brinco: '6003', peso: 180, observacoes: '', createdAt: '2026-10-19T12:00:00.000Z' };

t('v11 responde versão 11 e lê o rebanho de exemplo', () => {
  const g = v11.get();
  assert.strictEqual(g.versao, 11);
  assert.strictEqual(g.matrizes.length, 30);
  assert.strictEqual(g.eventos.filter((e) => e.tipo === 'pesagem').length, 4);
});

t('v10 (antigo) duplicava o reenvio', () => {
  v10.post({ action: 'appendEvento', tipo: 'pesagem', evento: ev });
  v10.post({ action: 'appendEvento', tipo: 'pesagem', evento: ev });
  assert.strictEqual(v10.get().eventos.filter((e) => e.id === 'x1').length, 2);
});

t('v11: appendEvento repetido grava uma vez só', () => {
  const r1 = v11.post({ action: 'appendEvento', tipo: 'pesagem', evento: ev });
  const r2 = v11.post({ action: 'appendEvento', tipo: 'pesagem', evento: ev });
  assert.strictEqual(r1.ignorados, 0); assert.strictEqual(r2.ignorados, 1);
  assert.strictEqual(v11.get().eventos.filter((e) => e.id === 'x1').length, 1);
  assert.strictEqual(v11.linhas('Pesagens'), 5);
});

t('v11: appendEventos reenviado pela metade grava só o que falta', () => {
  const itens = [1, 2, 3].map((n) => ({ tipo: 'pesagem', evento: { ...ev, id: `L${n}`, peso: 180 + n } }));
  const r1 = v11.post({ action: 'appendEventos', itens: itens.slice(0, 2) });
  assert.strictEqual(r1.gravados, 2);
  const r2 = v11.post({ action: 'appendEventos', itens: [...itens, { tipo: 'morte', evento: { id: 'mo1', data: '2026-10-19', tipoAnimal: 'Cria', criaId: 'n6', brinco: '6506', causa: 'Doença' } }] });
  assert.strictEqual(r2.gravados, 2); assert.strictEqual(r2.ignorados, 2);
  const g = v11.get();
  ['L1', 'L2', 'L3', 'mo1'].forEach((id) => assert.strictEqual(g.eventos.filter((e) => e.id === id).length, 1, id));
});

t('v11: mesmo id repetido dentro do mesmo envio entra uma vez', () => {
  const r = v11.post({ action: 'appendEventos', itens: [{ tipo: 'pesagem', evento: { ...ev, id: 'R1' } }, { tipo: 'pesagem', evento: { ...ev, id: 'R1' } }] });
  assert.strictEqual(r.gravados, 1); assert.strictEqual(r.ignorados, 1);
});

t('v11: pesagem 2x de verdade (ids diferentes, mesma data) entra duas vezes', () => {
  v11.post({ action: 'appendEventos', itens: [{ tipo: 'pesagem', evento: { ...ev, id: 'D1', peso: 200 } }, { tipo: 'pesagem', evento: { ...ev, id: 'D2', peso: 203 } }] });
  const g = v11.get();
  assert.strictEqual(g.eventos.filter((e) => e.id === 'D1' || e.id === 'D2').length, 2);
});

t('v11: touro reenviado não duplica', () => {
  const touro = { id: 'tx', nome: 'Novo', raca: 'Nelore' };
  v11.post({ action: 'appendTouro', touro }); v11.post({ action: 'appendTouro', touro });
  assert.strictEqual(v11.get().touros.filter((x) => x.id === 'tx').length, 1);
});

t('v11: upsert de matriz e correção continuam iguais', () => {
  const m = { ...v11.get().matrizes[0], status: 'Cheia' };
  v11.post({ action: 'upsertMatrizes', matrizes: [m] }); v11.post({ action: 'upsertMatrizes', matrizes: [m] });
  const g = v11.get();
  assert.strictEqual(g.matrizes.length, 30);
  assert.strictEqual(g.matrizes.find((x) => x.id === m.id).status, 'Cheia');
  const r = v11.post({ action: 'atualizarCampos', tipo: 'pesagem', itens: [{ id: 'x1', campos: { peso: 181 } }] });
  assert.strictEqual(r.alterados, 1);
  assert.strictEqual(v11.get().eventos.find((e) => e.id === 'x1').peso, 181);
});

t('v11: datas continuam datas (dd/mm/aa na planilha)', () => {
  const sh = v11.ss.getSheetByName('Pesagens');
  const v = sh.getRange(2, 2).getValues()[0][0];
  assert.ok(v instanceof Date);
  assert.strictEqual(v11.get().eventos.find((e) => e.id === 'x1').data, '2026-10-19');
});

t('v11: syncAll com menos linhas continua recusado (trava contra encolher)', () => {
  const r = v11.post({ action: 'syncAll', matrizes: [], touros: [], eventos: [] });
  assert.ok(r.error);
});

console.log(`script v11: ${ok} testes passaram`);
