// Rebanho de mentira (parecido com o da fazenda) para os testes automáticos. Nada aqui é dado real.
function dadosExemplo() {
  const matrizes = []; const eventos = []; const touros = [
    { id: 't1', nome: 'Faraó', raca: 'Nelore', fornecedor: '', anoAquisicao: 2025, doses: 0, custoDose: 0, observacoes: '', createdAt: '2026-01-01T10:00:00.000Z' },
    { id: 't2', nome: 'Full Metal', raca: 'Aberdeen', fornecedor: '', anoAquisicao: 2025, doses: 0, custoDose: 0, observacoes: '', createdAt: '2026-01-01T10:00:00.000Z' },
  ];
  for (let i = 1; i <= 30; i++) {
    matrizes.push({ id: `m${i}`, brinco: String(3000 + i), categoria: i <= 4 ? 'Novilha' : 'Multípara', raca: 'Nelore', lote: i % 2 ? 'Paridas' : 'Solteiras', dataNascimento: '', partosAnteriores: 2, status: i <= 18 ? 'Vazia' : 'Cheia', createdAt: '2026-01-02T10:00:00.000Z', destino: '', dataBaixa: '', motivoBaixa: '' });
  }
  // nascimentos: machos 6501.. (vacas 3005..3016), fêmeas 6001.. (vacas 3017..3018 já paridas antes)
  const datas = ['2026-03-12', '2026-03-20', '2026-04-02', '2026-04-12', '2026-04-25', '2026-05-03', '2026-05-15', '2026-05-28', '2026-06-04', '2026-06-18', '2026-06-25', '2026-07-02'];
  datas.forEach((d, k) => {
    eventos.push({ id: `n${k + 1}`, tipo: 'nascimento', data: d, matrizId: `m${5 + k}`, resultadoParto: 'Vivo', sexo: k % 3 === 2 ? 'Fêmea' : 'Macho', pesoNascer: '', brincoBezerro: k % 3 === 2 ? String(6001 + k) : String(6501 + k), pelagem: 'BRANCA', touroId: '', touroOutro: '', tipoParto: 'Normal', observacoes: '', createdAt: `${d}T12:00:00.000Z` });
  });
  // pesagem de 10/10 de alguns machos
  [['n1', '6501', 196], ['n2', '6502', 213], ['n4', '6504', 213]].forEach(([cid, b, p], k) => {
    eventos.push({ id: `p${k + 1}`, tipo: 'pesagem', data: '2026-10-10', criaId: cid, matrizId: '', brinco: b, peso: p, observacoes: '', createdAt: '2026-10-10T13:00:00.000Z' });
  });
  eventos.push({ id: 'p9', tipo: 'pesagem', data: '2026-08-20', criaId: 'n1', matrizId: '', brinco: '6501', peso: 150, observacoes: '', createdAt: '2026-08-20T13:00:00.000Z' });
  for (let i = 19; i <= 30; i++) eventos.push({ id: `d${i}`, tipo: 'diagnostico', data: '2026-05-09', matrizId: `m${i}`, resultado: 'Prenhe', metodo: 'Toque retal', dg: 120, veterinario: '', custo: '', motivo: '', createdAt: '2026-05-09T12:00:00.000Z' });
  return { matrizes, touros, eventos };
}
module.exports = { dadosExemplo };
