// Testes do Inventário (v11.3): conferido pelo brinco, pela mãe, lote do sistema x lote conferido, dois lotes, pendência de lote.
import assert from 'assert';
import { indiceRebanho } from '../src/ficha.js';
import { analisarInventario, resumoInventario, lotesInventario } from '../src/inventario.js';

let ok = 0;
const t = (nome, fn) => { fn(); ok++; console.log('  ok', nome); };
const M = (id, brinco, extra) => ({ id, brinco, categoria: 'Vaca', status: 'Vazia', lote: 'Paridas', raca: 'Nelore', ...extra });
const dados = () => ({
  matrizes: [M('m1', '3001'), M('m2', '3002'), M('m3', '3003', { lote: 'Leiteiras' }), M('n1', '5001', { categoria: 'Novilha', lote: 'NOVILHAS', dataNascimento: '2024-11-01' })],
  touros: [],
  eventos: [
    { id: 'p1', tipo: 'nascimento', data: '2026-04-01', matrizId: 'm1', sexo: 'Macho', brincoBezerro: '6001', resultadoParto: 'Vivo' },
    { id: 'p2', tipo: 'nascimento', data: '2026-04-05', matrizId: 'm2', sexo: 'Fêmea', brincoBezerro: '6002', resultadoParto: 'Vivo' },
    { id: 'p3', tipo: 'nascimento', data: '2026-05-05', matrizId: 'm3', sexo: 'Fêmea', brincoBezerro: '6003', resultadoParto: 'Vivo' },
    { id: 'pz', tipo: 'pesagem', data: '2026-10-10', criaId: 'p2', peso: 150 },
    { id: 'mA', tipo: 'manejo', etapa: 'Geral', data: '2026-10-10', lote: 'Maternidade', descricao: 'Vermífugo', presentes: 'm1,m2,c:p2,n1',
      foraDoLote: JSON.stringify([{ animal: 'm1', brinco: '3001', mudar: 'pendente', tipo: 'matriz' }, { animal: 'm2', brinco: '3002', mudar: 'pendente', nota: 'olho machucado' }, { animal: 'n1', brinco: '5001', mudar: 'pendente' }]) },
    { id: 'mB', tipo: 'manejo', etapa: 'Geral', data: '2026-10-24', lote: 'Solteiras', descricao: 'Pour-on', presentes: 'n1' },
  ],
  config: {},
});

t('Resultado: pelo brinco, bezerro pela mãe, não conferido', () => {
  const ix = indiceRebanho(dados(), '2026-11-05'); const inv = analisarInventario(ix);
  const L = (b) => inv.animais.find((l) => l.brinco === b);
  assert.equal(L('3001').resultado, 'brinco'); assert.equal(L('3003').resultado, 'nao');
  assert.equal(L('6002').resultado, 'brinco', 'bezerro anotado');
  assert.equal(L('6001').resultado, 'mae', 'bezerro ao pé: mãe passou'); assert.equal(L('6001').loteConferido, 'Maternidade');
  assert.equal(L('6003').resultado, 'nao', 'mãe não passou');
  assert.equal(L('6002').peso.peso, 150); assert.equal(L('6002').mae, '3002'); assert.equal(L('6002').cat, 'mamando');
  assert.equal(L('3001').criaAoPe.brinco, '6001'); assert.equal(L('5001').idadeMeses, 24);
});

t('Lote: sistema x conferido, dois lotes (último vale), observação e pendência', () => {
  const ix = indiceRebanho(dados(), '2026-11-05'); const inv = analisarInventario(ix);
  const L = (b) => inv.animais.find((l) => l.brinco === b);
  assert.equal(L('3001').loteSistema, 'Paridas'); assert.equal(L('3001').loteConferido, 'Maternidade'); assert.ok(L('3001').loteDif);
  assert.deepEqual(L('3001').pendencia, { manejoId: 'mA', animal: 'm1' });
  assert.deepEqual(L('3002').notas, ['olho machucado']);
  assert.equal(L('5001').loteConferido, 'Solteiras', 'manejo mais recente'); assert.ok(L('5001').duplo);
  assert.equal(L('6002').loteSistema, 'Paridas', 'bezerro mamando: lote da mãe');
  assert.ok(!L('3003').loteDif, 'não conferido não tem lote diferente');
  assert.ok(!L('6002').loteDif, 'bezerro mamando acompanha a mãe');
});

t('Resumo e lotes', () => {
  const ix = indiceRebanho(dados(), '2026-11-05'); const inv = analisarInventario(ix);
  const r = resumoInventario(inv);
  assert.equal(r.total, 7); assert.equal(r.brinco, 4); assert.equal(r.mae, 1); assert.equal(r.nao, 2); assert.equal(r.vivos, 5);
  assert.equal(r.duplos, 1);
  assert.equal(r.porCat.find((c) => c.id === 'mamando').total, 3);
  const Lt = lotesInventario(inv);
  const mat = Lt.conferidos.find((x) => x.lote === 'Maternidade'); assert.equal(mat.n, 4); assert.equal(mat.de.Paridas, 2); assert.equal(mat.aoPe, 2); assert.equal(mat.igual, 0);
  assert.equal(Lt.sistema.find((x) => x.lote === 'Leiteiras').nao, 2);
});

console.log(`${ok} testes de inventário ok`);
