// Testes da situação definida pelo dono (v11.4): cria vendida no histórico que é touro da fazenda, volta para a fazenda, novilha.
import assert from 'assert';
import { indiceRebanho } from '../src/ficha.js';
import { listarCrias } from '../src/logica.js';
import { planoSituacaoCria } from '../src/situacao.js';
import { analisarInventario } from '../src/inventario.js';

let ok = 0;
const t = (nome, fn) => { fn(); ok++; console.log('  ok', nome); };
const aplicar = (d, p) => {
  const ev = new Map(p.mudancas.eventos.map((x) => [x.id, x.campos]));
  return { ...d, eventos: d.eventos.map((e) => (ev.has(e.id) ? { ...e, ...ev.get(e.id) } : e)), matrizes: [...d.matrizes.filter((m) => !p.mudancas.matrizes.some((x) => x.id === m.id)), ...p.mudancas.matrizes], touros: [...d.touros, ...(p.touros || [])] };
};
const base = () => ({
  matrizes: [{ id: 'm1', brinco: '3001', categoria: 'Vaca', status: 'Vazia', lote: 'Paridas' }],
  touros: [],
  eventos: [
    { id: 'h58', tipo: 'nascimento', data: '2023-08-27', resultadoParto: 'Vivo', sexo: 'Macho', brincoBezerro: 3558, observacoes: 'Histórico (planilha REBANHO 2026) · situação: VENDIDO · raça Nelore · mãe 4002 (fora do cadastro)' },
    { id: 'h40', tipo: 'nascimento', data: '2024-05-01', resultadoParto: 'Vivo', sexo: 'Fêmea', brincoBezerro: 4040, observacoes: 'Histórico (planilha REBANHO 2026) · situação: VENDIDO · raça Nelore' },
    { id: 'n1', tipo: 'nascimento', data: '2026-04-01', matrizId: 'm1', resultadoParto: 'Vivo', sexo: 'Macho', brincoBezerro: 6001 },
    { id: 'mj', tipo: 'manejo', etapa: 'Geral', data: '2026-10-30', lote: 'Touro', descricao: 'Vermífugo', presentes: 'c:h58' },
  ],
  config: {},
});

t('3558 vendido no histórico vira touro da fazenda e conta no inventário como touro', () => {
  let d = base(); const ix = indiceRebanho(d, '2026-11-05');
  assert.equal(ix.criaPorId.get('h58').situacao, 'vendido');
  const p = planoSituacaoCria(ix, 'h58', 'touro', { lote: 'Touro' });
  assert.ok(!p.erro, p.erro); assert.equal(p.touros[0].tipo, 'Touro vivo'); assert.equal(p.touros[0].brinco, '3558'); assert.equal(p.touros[0].raca, 'Nelore');
  d = aplicar(d, p);
  const c = listarCrias(d, '2026-11-05').find((x) => x.id === 'h58');
  assert.equal(c.situacao, 'touro'); assert.ok(!c.ativa);
  const inv = analisarInventario(indiceRebanho(d, '2026-11-05'));
  const l = inv.animais.find((x) => x.brinco === '3558');
  assert.ok(l && l.cat === 'touro' && l.resultado === 'brinco', JSON.stringify(l && l.cat));
  assert.ok(!inv.fora.some((x) => x.brinco === '3558'), 'não aparece mais como vendido que passou');
});

t('Volta para a fazenda, vendido com data, morto e novilha', () => {
  let d = base(); let ix = indiceRebanho(d, '2026-11-05');
  assert.equal(planoSituacaoCria(ix, 'h58', 'vendido', {}).erro, 'Informe a data.');
  assert.ok(planoSituacaoCria(ix, 'h40', 'touro', {}).erro);
  d = aplicar(d, planoSituacaoCria(ix, 'n1', 'vendido', { data: '2026-10-20' }));
  let c = listarCrias(d, '2026-11-05').find((x) => x.id === 'n1'); assert.equal(c.situacao, 'vendido'); assert.equal(c.vendaData, '2026-10-20');
  ix = indiceRebanho(d, '2026-11-05');
  d = aplicar(d, planoSituacaoCria(ix, 'n1', 'mamando', {}));
  c = listarCrias(d, '2026-11-05').find((x) => x.id === 'n1'); assert.equal(c.situacao, 'mamando'); assert.equal(c.vendaData, '');
  ix = indiceRebanho(d, '2026-11-05');
  const p = planoSituacaoCria(ix, 'h40', 'novilha', { lote: 'novilhas' });
  assert.equal(p.mudancas.matrizes[0].id, 'cria-h40'); assert.equal(p.mudancas.matrizes[0].categoria, 'Novilha');
  d = aplicar(d, p);
  c = listarCrias(d, '2026-11-05').find((x) => x.id === 'h40'); assert.equal(c.situacao, 'novilha');
});

console.log(`${ok} testes de situação ok`);
