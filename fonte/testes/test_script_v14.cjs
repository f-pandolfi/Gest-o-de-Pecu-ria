// Script v14 no simulador: lê a planilha da v13 sem perder nada e exclui manejo geral guardando cópia na aba Excluidos.
const assert = require('assert');
const path = require('path');
const { carregarScript } = require('./simulador.cjs');
const { dadosExemplo } = require('./dados_exemplo.cjs');
let ok = 0;
const t = (nome, fn) => { fn(); ok++; console.log('  ok', nome); };

const v13 = carregarScript(path.join(__dirname, '..', 'Code_v13.gs'));
v13.post({ action: 'syncAll', ...dadosExemplo(), forcar: true });
const fora = [{ animal: 'm25', brinco: '3025', loteAtual: 'Leiteiras', obs: 'Não é do lote Paridas (está em Leiteiras)', mudar: 'pendente' }];
v13.post({ action: 'appendEventos', itens: [
  { tipo: 'manejo', evento: { id: 'mj1', data: '2026-10-01', etapa: 'D0', descricao: 'Protocolo', presentes: 'm20,m21', ausentes: '' } },
  { tipo: 'manejo', evento: { id: 'g1', data: '2026-10-20', etapa: 'Geral', descricao: 'Brinco mosquicida', presentes: 'm20,m25', ausentes: 'm21', lote: 'Paridas', foraDoLote: JSON.stringify(fora) } },
  { tipo: 'manejo', evento: { id: 'g2', data: '2026-10-21', etapa: 'Geral', descricao: 'Vermífugo', presentes: 'm20', ausentes: '', lote: 'Paridas', foraDoLote: '[]' } },
  { tipo: 'manejo', evento: { id: 'g3', data: '2026-10-22', etapa: 'Geral', descricao: 'Pour-on', presentes: 'm21', ausentes: '', lote: 'Leiteiras', foraDoLote: '[]' } },
] });
const antes = v13.get();
const v14 = carregarScript(path.join(__dirname, '..', 'Code_v14.gs'), { ss: v13.ss, abas: v13.abas });

t('v14 responde versão 14 e lê a planilha da v13 inteira', () => {
  const g = v14.get();
  assert.strictEqual(g.versao, 14);
  assert.strictEqual(g.matrizes.length, antes.matrizes.length);
  assert.strictEqual(g.eventos.length, antes.eventos.length);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(g.eventos)), JSON.parse(JSON.stringify(antes.eventos)));
});

t('editar manejo geral continua com atualizarCampos (todas as colunas editáveis)', () => {
  const r = v14.post({ action: 'atualizarCampos', tipo: 'manejo', itens: [{ id: 'g2', campos: { descricao: 'Vermífugo e pour-on', lote: 'Paridas', presentes: 'm20,m21', ausentes: '', observacoes: 'corrigido', aplicacoes: '[{"tipo":"Vermífugo"}]', foraDoLote: '[]', responsavel: 'João', data: '2026-10-22', manejoRef: 'com crias ao pé' } }] });
  assert.strictEqual(r.alterados, 1);
  const e = v14.get().eventos.find((x) => x.id === 'g2');
  assert.strictEqual(e.descricao, 'Vermífugo e pour-on'); assert.strictEqual(e.presentes, 'm20,m21'); assert.strictEqual(e.observacoes, 'corrigido');
  assert.strictEqual(e.responsavel, 'João'); assert.strictEqual(e.manejoRef, 'com crias ao pé'); assert.strictEqual(e.id, 'g2'); assert.strictEqual(e.etapa, 'Geral');
});

t('excluirEventos apaga só manejo geral pelo id e guarda a cópia na aba Excluidos', () => {
  const linhasAntes = v14.linhas('Manejos');
  const r = v14.post({ action: 'excluirEventos', tipo: 'manejo', ids: ['g1', 'mj1', 'nao-existe'] });
  assert.strictEqual(r.ok, true); assert.strictEqual(r.excluidos, 1); assert.strictEqual(r.recusados, 1); assert.strictEqual(r.naoAchados, 1);
  const g = v14.get();
  assert.deepStrictEqual(g.eventos.filter((e) => e.tipo === 'manejo').map((e) => e.id).sort(), ['g2', 'g3', 'mj1']);
  assert.strictEqual(v14.linhas('Manejos'), linhasAntes - 1);
  // as outras linhas continuam inteiras e na mesma ordem
  const mj1 = g.eventos.find((e) => e.id === 'mj1'); assert.strictEqual(mj1.etapa, 'D0'); assert.strictEqual(mj1.presentes, 'm20,m21');
  const g3 = g.eventos.find((e) => e.id === 'g3'); assert.strictEqual(g3.lote, 'Leiteiras'); assert.strictEqual(g3.descricao, 'Pour-on');
  // cópia de segurança
  const ex = v14.ss.getSheetByName('Excluidos'); assert.ok(ex, 'criou a aba Excluidos');
  assert.deepStrictEqual(ex.getRange(1, 1, 1, 4).getValues()[0], ['excluidoEm', 'tipo', 'id', 'linha']);
  const linha = ex.getRange(2, 1, 1, 4).getValues()[0];
  assert.strictEqual(linha[1], 'manejo'); assert.strictEqual(linha[2], 'g1');
  const copia = JSON.parse(linha[3]);
  assert.strictEqual(copia.descricao, 'Brinco mosquicida'); assert.strictEqual(copia.lote, 'Paridas'); assert.strictEqual(JSON.parse(copia.foraDoLote)[0].mudar, 'pendente');
  assert.strictEqual(v14.linhas('Excluidos'), 1);
});

t('excluir de novo, id repetido ou lista vazia não apaga nada a mais; segunda exclusão acumula na aba Excluidos', () => {
  assert.strictEqual(v14.post({ action: 'excluirEventos', tipo: 'manejo', ids: ['g1'] }).excluidos, 0);
  assert.strictEqual(v14.post({ action: 'excluirEventos', tipo: 'manejo', ids: [] }).excluidos, 0);
  const r = v14.post({ action: 'excluirEventos', tipo: 'manejo', ids: ['g3', 'g3'] });
  assert.strictEqual(r.excluidos, 1);
  assert.deepStrictEqual(v14.get().eventos.filter((e) => e.tipo === 'manejo').map((e) => e.id).sort(), ['g2', 'mj1']);
  assert.strictEqual(v14.linhas('Excluidos'), 2);
  assert.strictEqual(v14.ss.getSheetByName('Excluidos').getRange(3, 3, 1, 1).getValues()[0][0], 'g3');
});

t('outros tipos de evento não podem ser excluídos; o resto da planilha fica igual', () => {
  const nasc = antes.eventos.find((e) => e.tipo === 'nascimento');
  const r = v14.post({ action: 'excluirEventos', tipo: 'nascimento', ids: [nasc.id] });
  assert.ok(r.error, 'recusou'); assert.ok(v14.get().eventos.some((e) => e.id === nasc.id));
  const g = v14.get();
  assert.strictEqual(g.eventos.filter((e) => e.tipo !== 'manejo').length, antes.eventos.filter((e) => e.tipo !== 'manejo').length);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(g.matrizes)), JSON.parse(JSON.stringify(antes.matrizes)));
});

t('depois de excluir, dá para lançar manejo novo (a aba continua certa) e reenviar não duplica', () => {
  v14.post({ action: 'appendEventos', itens: [{ tipo: 'manejo', evento: { id: 'g9', data: '2026-10-30', etapa: 'Geral', descricao: 'Novo', lote: 'Paridas', presentes: 'm20' } }] });
  v14.post({ action: 'appendEventos', itens: [{ tipo: 'manejo', evento: { id: 'g9', data: '2026-10-30', etapa: 'Geral', descricao: 'Novo', lote: 'Paridas' } }] });
  assert.deepStrictEqual(v14.get().eventos.filter((e) => e.tipo === 'manejo').map((e) => e.id).sort(), ['g2', 'g9', 'mj1']);
});

console.log(`script v14: ${ok} ok`);
