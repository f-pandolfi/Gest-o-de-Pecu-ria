// v11.3: Inventário do rebanho. Compara, animal por animal, o que está no sistema com o que passou no curral na rodada
// (os manejos de conferência). Base: conferencia.js (rodadas, avistamentos). Só regras (sem tela).
// Resultado de cada animal:
//   brinco  = o brinco aparece num registro da rodada (manejo, toque, IATF, pesagem, desmama, parto)
//   mae     = bezerro mamando que não foi anotado, mas a mãe passou no curral na rodada (cria ao pé)
//   nao     = não apareceu em nada da rodada
// Lote: "no sistema" é o do cadastro (bezerro mamando = o da mãe); "conferido" é o lote do último manejo da rodada em que passou.
import { analisarConferencia } from './conferencia.js';
import { mesmoLote, padronizarLote, previsaoPartoInfo, idadeMesesDias, formatarDataBR } from './logica.js';
import { racaDoHistorico } from './ficha.js';

export const CATS_INV = [
  { id: 'mamando', nome: 'Mamando' }, { id: 'desmamado', nome: 'Desmamados' }, { id: 'novilha', nome: 'Novilhas' },
  { id: 'vaca', nome: 'Vacas' }, { id: 'touro', nome: 'Touros' }, { id: 'boi', nome: 'Bois' },
];
export const RESULTADOS = { brinco: 'Conferido', mae: 'Conferido pela mãe', nao: 'Não conferido' };
const ordemBrinco = (a, b) => String(a).localeCompare(String(b), 'pt-BR', { numeric: true });
const semAoPe = (l) => String(l || '').replace(' (ao pé)', '');
const meses = (nasc, hoje) => { const x = nasc ? idadeMesesDias(nasc, hoje) : null; return x ? x.meses : null; };

function categoriaInv(l) {
  if (l.cria) {
    if (l.status === 'Mamando') return 'mamando';
    if (l.status === 'Desmamado') return 'desmamado';
    return l.cat === 'novilhas' ? 'novilha' : l.cat === 'bois' ? 'boi' : 'desmamado'; // "a confirmar" que passou
  }
  if (l.cat === 'novilhas') return 'novilha';
  if (l.cat === 'vacas') return 'vaca';
  if (l.cat === 'touros') return 'touro';
  return 'boi';
}

// Pesagens: último peso por chave de animal
function ultimosPesos(ix) {
  const out = new Map();
  (ix.dados.eventos || []).forEach((e) => {
    if (e.tipo !== 'pesagem' || e.anulada || !(Number(e.peso) > 0)) return;
    const k = e.criaId ? `c:${e.criaId}` : e.matrizId ? `m:${e.matrizId}` : '';
    if (!k) return;
    const a = out.get(k);
    if (!a || String(e.data) > a.data) out.set(k, { data: String(e.data).slice(0, 10), peso: Number(e.peso) });
  });
  return out;
}

export function analisarInventario(ix, opcoes) {
  const an = analisarConferencia(ix, opcoes);
  const hoje = ix.hoje;
  const i = (opcoes && opcoes.rodada != null) ? opcoes.rodada : an.atual;
  const rod = an.rodadas[i];
  const naRod = (d) => d >= rod.inicio && (!rod.fim || d < rod.fim);
  const pesos = ultimosPesos(ix);
  const porK = new Map(an.linhas.map((l) => [l.k, l]));
  // cria mamando ao pé de cada matriz (a mais nova)
  const aoPe = new Map();
  ix.crias.forEach((c) => {
    if (c.novilha || c.situacao !== 'mamando' || !c.matrizId) return;
    const k = `m:${c.matrizId}`; const a = aoPe.get(k);
    if (!a || String(c.nascData) > String(a.nascData)) aoPe.set(k, c);
  });

  // Avistamentos da rodada escolhida, por animal (o analisarConferencia guarda só o primeiro; aqui queremos todos os manejos)
  const out = an.linhas.map((l) => {
    const cat = categoriaInv(l);
    const m = l.matriz; const c = l.cria;
    const vRod = (an.vistos.get(l.k) || []).filter((v) => naRod(v.data));
    const vMan = vRod.filter((v) => v.manejo);
    const lotesConf = [...new Set(vMan.map((v) => v.lote).filter(Boolean))];
    let resultado = vRod.length ? 'brinco' : 'nao';
    let viaMae = null;
    if (resultado === 'nao' && cat === 'mamando' && c && c.matrizId) {
      const mae = porK.get(`m:${c.matrizId}`);
      const vMae = mae ? (an.vistos.get(mae.k) || []).filter((v) => naRod(v.data) && v.manejo) : [];
      if (vMae.length) { resultado = 'mae'; viaMae = vMae[0]; }
    }
    const conf = vMan[0] || viaMae || vRod[0] || null; // o mais recente (as listas vêm do mais novo para o mais velho)
    const loteSistema = semAoPe(l.lote);
    const loteConferido = (vMan[0] && vMan[0].lote) || (viaMae && viaMae.lote) || '';
    const nasc = m ? (m.dataNascimento || (ix.criaDaMatriz.get(m.id) || {}).nascData || '') : c ? (c.nascData || '') : '';
    const prev = m && m.status === 'Cheia' ? previsaoPartoInfo(m.id, ix.dados.eventos) : null;
    const partos = m ? (ix.partos.get(m.id) || []) : [];
    const cAoPe = m ? aoPe.get(l.k) : null;
    const peso = c && c.pesoAtual && c.pesoData && c.pesoData !== c.nascData ? { peso: c.pesoAtual, data: c.pesoData } : (pesos.get(l.k) || (m && ix.ultimoPeso ? ix.ultimoPeso(m.brinco) : null) || null);
    const notas = vMan.map((v) => v.nota).filter(Boolean);
    const pend = vMan.find((v) => v.mudar === 'pendente');
    return {
      k: l.k, brinco: l.brinco, cat, catNome: (CATS_INV.find((x) => x.id === cat) || {}).nome, rot: l.rot, status: l.status,
      sexo: c ? (c.sexo === 'Fêmea' ? 'F' : 'M') : m ? 'F' : 'M',
      raca: m ? (m.raca || '') : c ? (racaDoHistorico(c.nasc) || (c.nasc && c.nasc.raca) || '') : '',
      nasc, idadeMeses: meses(nasc, hoje),
      mae: c ? (c.maeBrinco || '') : '', maeK: c && c.matrizId ? `m:${c.matrizId}` : '',
      criaAoPe: cAoPe ? { brinco: cAoPe.brinco || 's/ nº', k: `c:${cAoPe.id}`, nasc: cAoPe.nascData } : null,
      previsao: prev && prev.data ? prev.data : '', nPartos: partos.length, ultimoParto: partos[0] ? partos[0].data : '',
      peso: peso && peso.peso ? peso : null,
      loteSistema, loteConferido, lotesConf,
      // bezerro mamando acompanha a mãe: a divergência de lote fica só na mãe
      loteDif: !!(cat !== 'mamando' && loteConferido && !mesmoLote(loteSistema, loteConferido)),
      semLote: !loteSistema,
      duplo: lotesConf.length > 1,
      resultado, conf, notas, motivos: l.motivos, suspeita: resultado === 'nao' && l.motivos.length > 0,
      ultimoAntes: !vRod.length && l.ultimo ? l.ultimo : null, confirmada: !!l.confirmada, faltouTodas: an.rodadas.length > 1 && l.faltouTodas,
      pendencia: pend && m ? { manejoId: pend.id, animal: m.id } : null,
      novilhaQuePariu: !!(m && m.categoria === 'Novilha' && partos.length > 0),
    };
  });

  out.sort((a, b) => CATS_INV.findIndex((x) => x.id === a.cat) - CATS_INV.findIndex((x) => x.id === b.cat) || ordemBrinco(a.brinco, b.brinco));
  return { ...an, rodada: rod, iRodada: i, animais: out };
}

// Números do inventário: por categoria e total
export function resumoInventario(inv) {
  const conta = (ls) => ({
    total: ls.filter((l) => !l.confirmada).length, aConfirmar: ls.filter((l) => l.confirmada).length,
    brinco: ls.filter((l) => l.resultado === 'brinco').length, mae: ls.filter((l) => l.resultado === 'mae').length,
    nao: ls.filter((l) => l.resultado === 'nao').length, loteDif: ls.filter((l) => l.loteDif).length,
  });
  const porCat = CATS_INV.map((c) => ({ ...c, ...conta(inv.animais.filter((l) => l.cat === c.id)) })).filter((c) => c.total + c.aConfirmar > 0);
  const tot = conta(inv.animais);
  return {
    ...tot, porCat, vivos: tot.brinco + tot.mae, semCadastro: inv.semCadastro.length, fora: inv.fora.length,
    duplos: inv.animais.filter((l) => l.duplo).length, suspeitas: inv.animais.filter((l) => l.suspeita).length,
    pendLote: inv.animais.filter((l) => l.pendencia && l.loteDif).length,
    novilhasQuePariram: inv.animais.filter((l) => l.novilhaQuePariu).length,
  };
}

// Lotes: para cada lote conferido, quantos passaram e quantos estão com outro lote no sistema;
// para cada lote do sistema, quantos ficaram sem conferir
export function lotesInventario(inv) {
  const conf = new Map();
  inv.animais.forEach((l) => {
    if (!l.loteConferido) return;
    const k = padronizarLote(l.loteConferido, []);
    if (!conf.has(k)) conf.set(k, { lote: l.loteConferido, n: 0, igual: 0, dif: 0, porCat: {}, de: {}, semCad: 0, fora: 0 });
    const x = conf.get(k); x.n++;
    if (l.cat === 'mamando') x.aoPe = (x.aoPe || 0) + 1; // bezerro acompanha a mãe: não entra na comparação de lote
    else if (l.loteDif) { x.dif++; const de = l.loteSistema || '(sem lote)'; x.de[de] = (x.de[de] || 0) + 1; } else x.igual++;
    x.porCat[l.catNome] = (x.porCat[l.catNome] || 0) + 1;
  });
  // anotados sem cadastro e baixados que passaram também contam no lote em que foram anotados (ex.: lote Touro)
  const extra = (lt, campo) => {
    if (!lt) return; const k = padronizarLote(lt, []);
    if (!conf.has(k)) conf.set(k, { lote: lt, n: 0, igual: 0, dif: 0, porCat: {}, de: {}, semCad: 0, fora: 0 });
    conf.get(k)[campo]++;
  };
  inv.semCadastro.forEach((x) => extra(x.lote, 'semCad'));
  inv.fora.forEach((x) => extra(x.lote, 'fora'));
  const sis = new Map();
  inv.animais.forEach((l) => {
    if (l.confirmada) return;
    const lt = l.loteSistema || '(sem lote)';
    if (!sis.has(lt)) sis.set(lt, { lote: lt, n: 0, conferidos: 0, nao: 0 });
    const x = sis.get(lt); x.n++;
    if (l.resultado === 'nao') x.nao++; else x.conferidos++;
  });
  return {
    conferidos: [...conf.values()].sort((a, b) => (b.n + b.semCad + b.fora) - (a.n + a.semCad + a.fora)),
    sistema: [...sis.values()].sort((a, b) => b.n - a.n),
  };
}

export const textoConf = (l) => (l.conf ? `${formatarDataBR(l.conf.data)} · ${l.resultado === 'mae' ? `pela mãe ${l.mae}` : l.conf.fonte}` : '');
