// Testes da Conferência do rebanho (v11.2): rodadas, quem passou no curral, suspeitas e anotações.
import assert from 'assert';
import { indiceRebanho } from '../src/ficha.js';
import { analisarConferencia, resumoConferencia, rodadasConferencia, vistoNoCurral } from '../src/conferencia.js';

let ok = 0;
const t = (nome, fn) => { fn(); ok++; console.log('  ok', nome); };
const M = (id, brinco, extra) => ({ id, brinco, categoria: 'Vaca', status: 'Vazia', lote: 'Paridas', ...extra });
const base = () => ({
  matrizes: [
    M('m1', '3001'), M('m2', '3002'), M('m3', '3003'), M('m4', '3004', { status: 'Vendida' }), M('n1', '5001', { categoria: 'Novilha', lote: 'NOVILHAS' }),
    M('m5', '3005', { lote: 'Leiteiras' }),
  ],
  touros: [{ id: 'b1', tipo: 'Boi', brinco: '901', nome: 'Boi 901' }, { id: 's1', tipo: 'Sêmen', nome: 'EMBAIXADOR' }, { id: 'tv', tipo: 'Touro vivo', brinco: '777', nome: 'Bravo' }],
  eventos: [
    { id: 'p1', tipo: 'nascimento', data: '2026-03-01', matrizId: 'm1', sexo: 'Macho', brincoBezerro: '6001', resultadoParto: 'Vivo' },
    { id: 'p2', tipo: 'nascimento', data: '2026-10-31', matrizId: 'm5', sexo: 'Fêmea', brincoBezerro: '6002', resultadoParto: 'Vivo' },
    { id: 'h1', tipo: 'nascimento', data: '2024-05-01', matrizId: 'm2', sexo: 'Fêmea', brincoBezerro: '4033', resultadoParto: 'Vivo', observacoes: 'Histórico (planilha REBANHO 2026) · situação: A CONFIRMAR' },
    { id: 'h2', tipo: 'nascimento', data: '2024-06-01', matrizId: 'm2', sexo: 'Macho', brincoBezerro: '4040', resultadoParto: 'Vivo', observacoes: 'Histórico (planilha REBANHO 2026) · situação: A CONFIRMAR' },
    { id: 'mj1', tipo: 'manejo', etapa: 'Geral', data: '2026-10-30', lote: 'Solteiras', descricao: 'Vermífugo', presentes: 'm1,m4,t:b1', ausentes: 'm2',
      foraDoLote: JSON.stringify([{ animal: '', brinco: '4033', semCadastro: true }, { animal: '', brinco: '9999', semCadastro: true, nota: 'brinco novo' }, { animal: '', brinco: '5001' }]) },
    { id: 'mj0', tipo: 'manejo', etapa: 'Geral', data: '2026-09-01', lote: 'Paridas', descricao: 'Antigo', presentes: 'm3' },
  ],
  config: {},
});

t('Rodada 1 começa em 30/10/26; toque geral abre a rodada 2 (toque pequeno não)', () => {
  const d = base();
  assert.equal(rodadasConferencia(d).length, 1);
  for (let i = 0; i < 3; i++) d.eventos.push({ id: `pq${i}`, tipo: 'diagnostico', data: '2026-11-10', matrizId: 'm1', toqueId: 'tq0', resultado: 'Vazia' });
  assert.equal(rodadasConferencia(d).length, 1, 'toque com 3 matrizes não abre rodada');
  for (let i = 0; i < 12; i++) d.eventos.push({ id: `dg${i}`, tipo: 'diagnostico', data: '2026-12-05', matrizId: i === 0 ? 'm2' : 'm3', toqueId: 'tq1', resultado: 'Vazia' });
  const r = rodadasConferencia(d);
  assert.equal(r.length, 2); assert.equal(r[0].fim, '2026-12-05'); assert.equal(r[1].inicio, '2026-12-05');
});

t('Quem passou: manejo, parto, nascimento; sem cadastro achado pelo brinco; vendida e semen fora', () => {
  const d = base(); const ix = indiceRebanho(d, '2026-11-01'); const an = analisarConferencia(ix);
  const L = (b) => an.linhas.find((l) => l.brinco === b);
  assert.ok(L('3001').rodadas[0], 'manejo conta'); assert.equal(L('3001').rodadas[0].fonte, 'Vermífugo');
  assert.ok(!L('3002').rodadas[0], 'ausente no manejo não conta');
  assert.ok(!L('3003').rodadas[0], 'manejo antes de 30/10 não conta na rodada'); assert.equal(L('3003').ultimo.data, '2026-09-01');
  assert.equal(L('3005').rodadas[0].fonte, 'Pariu'); assert.equal(L('6002').rodadas[0].fonte, 'Nasceu');
  assert.ok(L('5001').rodadas[0], 'brinco anotado sem cadastro mas que está cadastrado conta');
  assert.ok(L('901').rodadas[0], 'boi'); assert.ok(L('777') && !L('777').rodadas[0], 'touro vivo entra, semen não');
  assert.ok(!L('3004'), 'vendida não está no rebanho ativo');
  assert.ok(!an.linhas.some((l) => l.brinco === 'EMBAIXADOR'));
  assert.deepEqual(an.semCadastro.map((s) => s.brinco), ['9999']);
  assert.deepEqual(an.fora.map((s) => s.brinco), ['3004']);
  assert.deepEqual(an.confirmadas.map((s) => s.brinco), ['4033'], 'cria a confirmar que passou');
  assert.ok(L('4033') && L('4033').confirmada, 'entra na conferência'); assert.ok(!L('4040'), 'a confirmar que não passou fica de fora');
  assert.equal(an.aConfirmar, 1);
});

t('Suspeitas: faltou e pesa contra na produtividade', () => {
  const d = base(); const ix = indiceRebanho(d, '2026-11-01'); const an = analisarConferencia(ix);
  const L = (b) => an.linhas.find((l) => l.brinco === b);
  assert.ok(L('3002').suspeita, 'último parto em 2024 e faltou'); assert.match(L('3002').motivos[0], /mais de 2 anos/);
  assert.ok(!L('3001').suspeita, 'passou: não é suspeita');
  const r = resumoConferencia(an);
  assert.equal(r.total, an.linhas.length); assert.equal(r.passaram + r.faltam, r.total);
  assert.ok(r.porCat.find((c) => c.id === 'vacas').total >= 4);
});

t('Duas rodadas: faltou em todas e retroativo cai na rodada da data', () => {
  const d = base();
  for (let i = 0; i < 12; i++) d.eventos.push({ id: `dg${i}`, tipo: 'diagnostico', data: '2026-12-05', matrizId: i < 6 ? 'm1' : 'm5', toqueId: 'tq1', resultado: 'Vazia' });
  d.eventos.push({ id: 'retro', tipo: 'manejo', etapa: 'Geral', data: '2026-11-15', lote: 'Leiteiras', descricao: 'Vacina', presentes: 'm3', createdAt: '2026-12-20' });
  const ix = indiceRebanho(d, '2026-12-10'); const an = analisarConferencia(ix);
  const L = (b) => an.linhas.find((l) => l.brinco === b);
  assert.equal(an.atual, 1);
  assert.ok(L('3003').rodadas[0] && !L('3003').rodadas[1], 'retroativo de 15/11 vale na rodada 1');
  assert.ok(L('3002').faltouTodas); assert.ok(!L('3001').faltouTodas);
  assert.equal(resumoConferencia(an, 0).passaram > 0, true);
  const v = vistoNoCurral(ix, 'm:m1'); assert.ok(v.naRodada && v.rodada.n === 2);
  assert.equal(vistoNoCurral(ix, 'm:m2').naRodada, null);
});

console.log(`${ok} testes de conferência ok`);
