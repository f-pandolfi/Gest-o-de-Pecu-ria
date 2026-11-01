// Script v15 no simulador: lê a planilha da v14 sem perder nada e grava a chave "cadastros" na aba Config.
const assert = require('assert');
const path = require('path');
const { carregarScript } = require('./simulador.cjs');
const { dadosExemplo } = require('./dados_exemplo.cjs');
const v14 = carregarScript(path.join(__dirname, '..', 'Code_v14.gs'));
v14.post({ action: 'syncAll', ...dadosExemplo(), forcar: true });
v14.post({ action: 'setConfig', config: { pesoMatriz: 300 } });
const antes = v14.get();
const r14 = v14.post({ action: 'setConfig', config: { cadastros: '{"x":1}' } });
assert.strictEqual(r14.gravadas, 0, 'v14 ignora cadastros');
const v15 = carregarScript(path.join(__dirname, '..', 'Code_v15.gs'), { ss: v14.ss, abas: v14.abas });
const d1 = v15.get();
assert.strictEqual(d1.versao, 15);
assert.deepStrictEqual(d1.matrizes, antes.matrizes); assert.deepStrictEqual(d1.eventos, antes.eventos); assert.deepStrictEqual(d1.touros, antes.touros);
const json = JSON.stringify({ causasMorte: [{ v: 'Afogamento', ativo: true }, { v: 'Raio', ativo: false }] });
const r = v15.post({ action: 'setConfig', config: { cadastros: json } });
assert.strictEqual(r.gravadas, 1);
const d2 = v15.get();
assert.strictEqual(d2.config.cadastros, json); assert.strictEqual(String(d2.config.pesoMatriz), '300');
// boi na aba Touros e indução nos Manejos já funcionam com as ações de antes
v15.post({ action: 'upsertTouros', touros: [{ id: 'boi-1', nome: 'Boi 701', tipo: 'Boi', brinco: '701', lote: 'Engorda', pesoAtual: 410, dataCompra: '2026-11-01' }] });
v15.post({ action: 'appendEventos', itens: [{ tipo: 'manejo', evento: { id: 'ind-1', data: '2026-11-01', etapa: 'Indução · D0 · Implante', descricao: 'Indução', presentes: 'm20,m21', ausentes: '', aplicacoes: '[]' } }] });
const d3 = v15.get();
assert.ok(d3.touros.some((t) => t.id === 'boi-1' && t.tipo === 'Boi' && String(t.brinco) === '701'));
assert.ok(d3.eventos.some((e) => e.id === 'ind-1' && e.etapa === 'Indução · D0 · Implante'));
console.log('script v15: ok');
