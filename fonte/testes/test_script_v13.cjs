// Script v13 no simulador: migra a planilha v12 sem perder nada e guarda lote e foraDoLote do manejo geral.
const assert = require('assert');
const path = require('path');
const { carregarScript } = require('./simulador.cjs');
const { dadosExemplo } = require('./dados_exemplo.cjs');
let ok = 0;
const t = (nome, fn) => { fn(); ok++; console.log('  ok', nome); };

const v12 = carregarScript(path.join(__dirname, '..', 'Code_v12.gs'));
v12.post({ action: 'syncAll', ...dadosExemplo(), forcar: true });
v12.post({ action: 'appendEvento', tipo: 'manejo', evento: { id: 'mj1', data: '2026-10-01', etapa: 'D0', descricao: 'Protocolo', aplicacoes: '[{"tipo":"Vermífugo"}]', presentes: 'm20,m21', ausentes: '' } });
const antes = v12.get();
const v13 = carregarScript(path.join(__dirname, '..', 'Code_v13.gs'), { ss: v12.ss, abas: v12.abas });

t('v13 responde versão 13 e lê a planilha da v12 inteira', () => {
  const r = v13.post({ action: 'repararPlanilha' });
  assert.ok(r.ok, JSON.stringify(r));
  const g = v13.get();
  assert.strictEqual(g.versao, 13);
  assert.strictEqual(g.matrizes.length, antes.matrizes.length);
  assert.strictEqual(g.eventos.length, antes.eventos.length);
  const mj = g.eventos.find((e) => e.id === 'mj1');
  assert.strictEqual(mj.presentes, 'm20,m21'); assert.strictEqual(mj.etapa, 'D0');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(g.matrizes)), JSON.parse(JSON.stringify(antes.matrizes)));
});

t('Manejos: colunas antigas no mesmo lugar e lote, foraDoLote no fim', () => {
  const cab = v13.ss.getSheetByName('Manejos').getRange(1, 1, 1, 14).getValues()[0];
  assert.deepStrictEqual(cab.slice(0, 12), ['id', 'data', 'protocoloId', 'etapa', 'manejoRef', 'responsavel', 'descricao', 'aplicacoes', 'presentes', 'ausentes', 'observacoes', 'createdAt']);
  assert.deepStrictEqual(cab.slice(12, 14), ['lote', 'foraDoLote']);
});

t('manejo geral grava lote e foraDoLote; confirmar mudança de lote atualiza o pedido e a matriz', () => {
  const fora = [{ animal: 'm25', brinco: '3025', loteAtual: 'Leiteiras', obs: 'Não é do lote Paridas (está em Leiteiras)', mudar: 'pendente' }];
  v13.post({ action: 'appendEventos', itens: [{ tipo: 'manejo', evento: { id: 'g1', data: '2026-10-20', etapa: 'Geral', descricao: 'Brinco mosquicida', presentes: 'm20,m25', ausentes: 'm21', lote: 'Paridas', foraDoLote: JSON.stringify(fora) } }] });
  let g = v13.get(); let e = g.eventos.find((x) => x.id === 'g1');
  assert.strictEqual(e.lote, 'Paridas'); assert.strictEqual(JSON.parse(e.foraDoLote)[0].mudar, 'pendente');
  fora[0].mudar = 'aprovada';
  v13.post({ action: 'atualizarCampos', tipo: 'manejo', itens: [{ id: 'g1', campos: { foraDoLote: JSON.stringify(fora) } }] });
  const m25 = g.matrizes.find((m) => m.id === 'm25');
  v13.post({ action: 'upsertMatriz', matriz: { ...m25, lote: 'Paridas' } });
  g = v13.get(); e = g.eventos.find((x) => x.id === 'g1');
  assert.strictEqual(JSON.parse(e.foraDoLote)[0].mudar, 'aprovada');
  assert.strictEqual(g.matrizes.find((m) => m.id === 'm25').lote, 'Paridas');
  // reenviar o mesmo manejo (internet caiu) não duplica
  v13.post({ action: 'appendEventos', itens: [{ tipo: 'manejo', evento: { id: 'g1', data: '2026-10-20', etapa: 'Geral', lote: 'Paridas' } }] });
  assert.strictEqual(v13.get().eventos.filter((x) => x.id === 'g1').length, 1);
});

console.log(`script v13: ${ok} ok`);
