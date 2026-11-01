// v11.1: Produtividade das matrizes. Meta: um bezerro por vaca por ano.
// Calcula, para cada matriz do plantel, partos, intervalo entre partos, meses sem parir, previsão e a situação (grupo),
// com o que fazer. Também os números do plantel e o alerta de "mais de 6 meses sem emprenhar".
import { partosPorMatriz, previsaoPartoInfo, diasEntre, idadeMesesDias } from './logica.js';

export const MESES_SEM_EMPRENHAR = 6; // alerta: vazia com o último parto há mais de 6 meses
const DIAS_EM_DIA = 395; // pariu nos últimos 13 meses (um por ano, com um mês de folga)
const DIAS_2_ANOS = 730;
const IDADE_NOVILHA_COBRADA = 30; // meses

export const GRUPOS_PROD = [
  { id: 'nunca', nome: 'Vaca que nunca pariu', cor: 'bad' },
  { id: 'improdutiva', nome: 'Vazia há mais de 2 anos', cor: 'bad' },
  { id: 'atrasada', nome: 'Vazia há 13 a 24 meses', cor: 'warn' },
  { id: 'prenhe', nome: 'Prenhe, mas atrasada', cor: 'warn' },
  { id: 'novilhaVelha', nome: 'Novilha passada da idade', cor: 'warn' },
  { id: 'emdia', nome: 'Em dia', cor: 'ok' },
  { id: 'novilha', nome: 'Novilha jovem', cor: 'mut' },
  { id: 'descarte', nome: 'Marcada para descarte', cor: 'mut' },
];
const meses = (d) => (d === null || d === undefined ? null : Math.round(d / 30.44));

// Uma linha por matriz do plantel (sem vendidas e mortas)
export function analisarMatrizes(dados, hoje, criaDaMatriz) {
  const P = partosPorMatriz(dados.eventos);
  const diagsPor = new Map();
  dados.eventos.forEach((e) => { if (e.tipo === 'diagnostico' && e.matrizId) { if (!diagsPor.has(e.matrizId)) diagsPor.set(e.matrizId, []); diagsPor.get(e.matrizId).push(e); } });
  return dados.matrizes.filter((m) => m.status !== 'Vendida' && m.status !== 'Morta').map((m) => {
    const ps = (P.get(m.id) || []).slice().sort((a, b) => b.data.localeCompare(a.data)); // mais recente primeiro
    const cria = criaDaMatriz ? criaDaMatriz.get(m.id) : null;
    const nasc = m.dataNascimento || (cria && cria.nascData) || '';
    const idade = nasc ? idadeMesesDias(nasc, hoje) : null;
    const idadeMeses = idade ? idade.meses : null;
    const ult = ps[0] ? ps[0].data : '';
    const desde = ult ? diasEntre(ult, hoje) : null;
    const inter = []; for (let i = 0; i < ps.length - 1; i++) inter.push(diasEntre(ps[i + 1].data, ps[i].data));
    const iep = inter.length ? inter.reduce((a, b) => a + b, 0) / inter.length : null;
    const p12 = ps.filter((e) => diasEntre(e.data, hoje) <= 365).length;
    const prevInfo = m.status === 'Cheia' ? previsaoPartoInfo(m.id, dados.eventos) : null;
    const prev = prevInfo && prevInfo.data ? prevInfo.data : '';
    const vencida = prev && prev < hoje ? diasEntre(prev, hoje) : 0;
    const toque = (diagsPor.get(m.id) || []).sort((a, b) => b.data.localeCompare(a.data))[0] || null;
    const nov = m.categoria === 'Novilha';
    let g; let acao;
    if (m.status === 'Descarte') { g = 'descarte'; acao = 'Já marcada para descarte'; }
    else if (nov && !ps.length) {
      if (idadeMeses !== null && idadeMeses >= IDADE_NOVILHA_COBRADA) { g = 'novilhaVelha'; acao = 'Mais de 30 meses sem parir: avaliar no toque, induzir ou vender'; }
      else { g = 'novilha'; acao = 'Ainda não é cobrada: acompanhar peso e indução'; }
    } else if (desde !== null && desde <= DIAS_EM_DIA) { g = 'emdia'; acao = m.status === 'Cheia' ? 'Prenhe e em dia' : 'Pariu no último ano: confirmar prenhez no próximo toque'; }
    else if (m.status === 'Cheia') { g = 'prenhe'; acao = prev ? (vencida ? `Previsão passou há ${vencida} dias: pariu sem lançar ou perdeu a cria?` : 'Vai parir, mas com intervalo longo') : 'Cheia sem previsão: conferir no toque'; }
    else if (desde !== null && desde <= DIAS_2_ANOS) { g = 'atrasada'; acao = 'Prioridade no toque: se continuar vazia, entra para descarte'; }
    else if (desde !== null) { g = 'improdutiva'; acao = 'Candidata a descarte: confirmar no toque'; }
    else { g = 'nunca'; acao = 'Candidata a descarte: nenhum parto registrado'; }
    const semEmprenhar = m.status === 'Vazia' && desde !== null && desde > MESES_SEM_EMPRENHAR * 30.44;
    return {
      m, id: m.id, brinco: String(m.brinco), grupo: g, ordem: GRUPOS_PROD.findIndex((x) => x.id === g), categoria: m.categoria, status: m.status, lote: m.lote || '',
      idadeMeses, partos: ps, nPartos: ps.length, antes: parseInt(m.partosAnteriores, 10) || 0, ultimoParto: ult, diasSemParir: desde, mesesSemParir: meses(desde),
      iepMeses: iep ? Math.round((iep / 30.44) * 10) / 10 : null, partos12m: p12, previsao: prev, previsaoVencida: vencida,
      toque: toque ? { data: toque.data, resultado: toque.resultado } : null, semEmprenhar, acao,
    };
  });
}

export function resumoProdutividade(linhas) {
  const vacas = linhas.filter((l) => l.grupo !== 'novilha' && l.grupo !== 'novilhaVelha');
  const pariram = vacas.filter((l) => l.partos12m > 0).length;
  const ieps = linhas.map((l) => l.iepMeses).filter((x) => x > 0);
  const por = (ids) => linhas.filter((l) => ids.includes(l.grupo)).length;
  return {
    vacas: vacas.length, pariram12m: pariram, pct12m: vacas.length ? pariram / vacas.length : 0,
    iepMedio: ieps.length ? Math.round((ieps.reduce((a, b) => a + b, 0) / ieps.length) * 10) / 10 : null,
    iepAcima15: ieps.filter((x) => x > 15).length, comIep: ieps.length,
    descarte: por(['nunca', 'improdutiva']), prioridade: por(['atrasada', 'novilhaVelha']),
    previsaoVencida: linhas.filter((l) => l.previsaoVencida > 0).length,
    semEmprenhar: linhas.filter((l) => l.semEmprenhar).length,
    porGrupo: GRUPOS_PROD.map((g) => ({ ...g, n: linhas.filter((l) => l.grupo === g.id).length })),
  };
}

// Para a ficha e o Diagnóstico: meses desde o parto de uma vaca vazia, se passou de 6 meses
export function alertaSemEmprenhar(m, ultimoParto, hoje) {
  if (!m || m.status !== 'Vazia' || !ultimoParto) return null;
  const d = diasEntre(ultimoParto, hoje);
  return d > MESES_SEM_EMPRENHAR * 30.44 ? { dias: d, meses: Math.round(d / 30.44) } : null;
}
