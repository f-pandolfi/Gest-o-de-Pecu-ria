// Pesagem e manejos de 10/10/2026 (folha "Bezerros 10.10.2026"), montados com as regras do app sobre os dados reais
// já com o histórico importado. Nada é gravado aqui: gera import/pesagem_1010.json e import/manejos_1010.json.
import fs from 'fs';
const R = '/home/claude/gest-o-de-pecu-ria/fonte/src/';
const L = await import(R + 'logica.js'); const M = await import(R + 'manejo.js'); const P = await import(R + 'pesagemConferencia.js');
const S = '/tmp/claude-0/-home-claude/4f53c2e6-6a68-5889-8da9-bf6cc363c86f/scratchpad/';
const bruto = JSON.parse(fs.readFileSync(S + 'planilha/getall.json'));
const hist = JSON.parse(fs.readFileSync(S + 'import/historico.json'));
const NOW = '2026-10-22T15:00:00.000Z'; const DATA = '2026-10-10'; const HOJE = '2026-10-22';
let est = M.normalizarTudo({ ...bruto, eventos: [...bruto.eventos, ...hist] });
const folha = {
  6501: 196, 6502: 213, 6503: 221, 6504: 213, 6505: 201, 6506: 221, 6507: 217, 6508: 230, 6509: 177, 6510: 247, 6511: 205, 6512: 204, 6513: 159,
  6514: 193, 6515: 196, 6516: 186, 6518: 171, 6520: 209, 6522: 180, 6523: 165, 6524: 145, 6525: 159, 6526: 159, 6527: 148, 6528: 138, 6530: 93,
  6532: 67, 6533: 92, 6534: 112, 6535: 66, 6536: 76, 6537: 97, 6538: 89, 6541: 80, 6543: 100, 6544: 79, 6545: 69,
  4626: 308, 5546: 224, 5562: 255, 5578: 228, 5576: 148,
};
const obsFolha = { 4626: 'aleijado', 5546: 'preto', 5562: 'preto', 5578: 'preto' };
const itens = Object.entries(folha).map(([b, kg]) => ({ tipo: 'pesagem', brincoCria: b, data: DATA, peso: kg, obs: obsFolha[b] || '' }));
const lote = L.aplicarLote(est, itens, { hoje: HOJE, now: NOW });
console.log('aceitos', lote.aplicados.length, 'rejeitados', lote.rejeitados.map((r) => [r.item.brincoCria, r.motivo]));
// ids fixos (se a internet cair no meio e reenviar, a planilha ignora o repetido)
const pesagens = lote.eventosParaGravar.map((x, i) => ({ ...x.evento, id: `p1010-${x.evento.brinco}`, observacoes: [obsFolha[x.evento.brinco], 'folha Bezerros 10.10.2026'].filter(Boolean).join(' · '), createdAt: NOW }));
const sb = [
  ['141', 'branco'], ['113', 'peso retocado na folha'], ['110', 'preto'],
  ['195', 'anotado como 6515 (segunda linha da folha)'], ['201', 'anotado como 5517 (peso bate com 6517)'], ['101', 'anotado como 5521 (peso bate com 6521, órfão)'],
].map(([kg, sinal], i) => P.pesagemSemBrinco(DATA, kg, sinal, { id: `p1010-sb${i + 1}`, now: NOW }).evento);
const todas = [...pesagens, ...sb];
est = { ...lote.estado, eventos: [...lote.estado.eventos.filter((e) => !(e.tipo === 'pesagem' && e.data === DATA)), ...todas] };
// conferência como o app vai mostrar
const conf = P.conferenciaPesagem(est, DATA, HOJE);
console.log('sem brinco', conf.semBrinco.map((x) => `${x.peso} ${x.sinal}`));
console.log('ficaram sem peso (machos)', conf.naoPesados.map((n) => `${n.brinco} ${n.idade}`));
// checagem de ganho de peso de cada um
const crias = L.listarCrias(est, HOJE);
const linhas = pesagens.map((e) => { const c = crias.find((x) => x.id === e.criaId); const d = L.diasEntre(c.nascData, DATA); return [e.brinco, e.peso, c.nascData, d, ((e.peso - 30) / d).toFixed(2), c.situacao]; });
console.log('ganho (kg/dia desde 30 kg ao nascer):'); linhas.forEach((l) => console.log('  ', l.join(' | ')));
// pesagens de 19/10 que não fecham com 10/10
const p19 = est.eventos.filter((e) => e.tipo === 'pesagem' && e.data === '2026-10-19').map((e) => { const a = todas.find((x) => x.criaId === e.criaId); return `${e.brinco}: ${e.peso} kg em 19/10 (10/10: ${a ? a.peso + ' kg' : 'sem peso'})`; });
console.log('pesagens de 19/10:', p19);
// manejos
const ids2026 = pesagens.filter((e) => e.criaId).map((e) => e.criaId);
const criasIds = ids2026.map((id) => `c:${id}`);
const maes = [...new Set(ids2026.map((id) => est.eventos.find((x) => x.id === id)).filter((n) => n && n.data >= '2026-01-01').map((n) => n.matrizId).filter(Boolean))];
const semMae = ids2026.map((id) => est.eventos.find((x) => x.id === id)).filter((n) => n && n.data >= '2026-01-01' && !n.matrizId).map((n) => n.brincoBezerro);
console.log('bezerros 2026 pesados sem mãe no app:', semMae);
const mk = (id, desc, aps, presentes, obs) => ({ id, tipo: 'manejo', data: DATA, protocoloId: '', etapa: 'Geral', manejoRef: '', responsavel: '', descricao: desc, aplicacoes: JSON.stringify(aps), presentes: presentes.join(','), ausentes: '', observacoes: obs, createdAt: NOW, lote: 'Paridas', foraDoLote: '[]' });
const manejos = [
  mk('mj1010-bezerros', 'Banho CB30 + BovFort nos bezerros (pesagem)', [{ tipo: 'Carrapaticida', produto: 'CB30' }, { tipo: 'Outra', produto: 'BovFort' }], criasIds, 'Lote todo, mães e crias. Lançado da folha "Bezerros 10.10.2026"; os sem brinco não entram na lista.'),
  mk('mj1010-maes', 'Vermífugo nas mães', [{ tipo: 'Vermífugo', produto: '' }], maes, 'Lote todo, mães e crias. Mães dos bezerros pesados em 10/10/2026.'),
];
const brincos = L.mapaBrincos(est.matrizes);
console.log('manejo bezerros:', criasIds.length, '| manejo mães:', maes.length, maes.map((m) => brincos[m]).join(', '));
fs.writeFileSync(S + 'import/pesagem_1010.json', JSON.stringify(todas, null, 1));
fs.writeFileSync(S + 'import/manejos_1010.json', JSON.stringify(manejos, null, 1));
