// v11.2: Conferência do rebanho. Os brincos anotados nos manejos servem de chamada: quem passou no curral está na fazenda.
// Rodada 1 começa em 01/10/26 e pega os manejos de outubro (10/10, 24/10, 30/10: touros retirados), inclusive os lançados depois com data retroativa. Cada toque geral depois disso abre uma rodada nova.
// Conta como "visto": qualquer manejo (geral, indução, protocolo), toque, IATF, pesagem, desmama e parto (a mãe pariu, a cria nasceu).
// No fim da rodada, quem não apareceu em nada vira suspeito (pode ter morrido, sumido ou saído sem lançar).
// Só regras (sem tela). Chaves de animal iguais às da ficha: "m:<matriz>", "c:<nascimento>", "t:<touro/boi>".
import { formatarDataBR, idNovilha, padronizarLote } from './logica.js';
import { analisarMatrizes } from './produtividade.js';
import { ehBoi, boiAtivo, categoriaCria, racaDoHistorico } from './ficha.js';

export const INICIO_CONFERENCIA = '2026-10-01';
const MIN_TOQUE_GERAL = 10; // diagnósticos num mesmo toque para ele contar como toque geral (abre rodada)
const DIAS_MIN_RODADA = 30; // duas rodadas não começam com menos de 30 dias de diferença

const lista = (v) => { try { const x = typeof v === 'string' ? JSON.parse(v) : v; return Array.isArray(x) ? x : []; } catch (e) { return []; } };
const ids = (v) => String(v || '').split(',').map((x) => x.trim()).filter(Boolean);
const dia = (d) => String(d || '').slice(0, 10);
const num = (b) => { const s = String(b ?? '').trim(); return /^\d+$/.test(s) ? String(Number(s)) : s.toLowerCase(); };
const diasEntre = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const ordemBrinco = (a, b) => String(a).localeCompare(String(b), 'pt-BR', { numeric: true });

export const CATEGORIAS_CONF = [
  { id: 'vacas', nome: 'Vacas' }, { id: 'novilhas', nome: 'Novilhas' }, { id: 'bezerros', nome: 'Bezerros(as)' },
  { id: 'bois', nome: 'Bois e garrotes' }, { id: 'touros', nome: 'Touros' },
];
// Grupos da Produtividade que pesam contra a vaca que faltou
const GRUPOS_SUSPEITOS = { nunca: 'nunca pariu', improdutiva: 'vazia há mais de 2 anos', atrasada: 'vazia há 13 a 24 meses', novilhaVelha: 'novilha com 30 meses ou mais sem parir' };

// Rodadas: a primeira no início da conferência e uma nova a cada toque geral (agrupado pelo toqueId)
export function rodadasConferencia(dados, inicio = INICIO_CONFERENCIA) {
  const toques = new Map();
  (dados.eventos || []).forEach((e) => {
    if (e.tipo !== 'diagnostico' || e.anulada || dia(e.data) <= inicio) return;
    const k = e.toqueId || `d:${dia(e.data)}`;
    const t = toques.get(k) || { data: dia(e.data), n: 0 };
    t.n++; if (dia(e.data) < t.data) t.data = dia(e.data);
    toques.set(k, t);
  });
  const inicios = [{ data: inicio, origem: 'início da conferência' }];
  [...toques.values()].filter((t) => t.n >= MIN_TOQUE_GERAL).sort((a, b) => a.data.localeCompare(b.data)).forEach((t) => {
    if (diasEntre(inicios[inicios.length - 1].data, t.data) >= DIAS_MIN_RODADA) inicios.push({ data: t.data, origem: `toque geral (${t.n} matrizes)` });
  });
  return inicios.map((r, i) => ({ n: i + 1, nome: `Rodada ${i + 1}`, inicio: r.data, fim: inicios[i + 1] ? inicios[i + 1].data : '', origem: r.origem }));
}
const naRodada = (d, r) => d >= r.inicio && (!r.fim || d < r.fim);

// Rebanho que precisa ser conferido (ativo): matrizes no plantel (inclui descarte, que ainda está na fazenda), crias na fazenda,
// bois na fazenda e touros vivos sem saída. Crias "a confirmar" (histórico) ficam à parte: não entram na conta, mas aparecem se passarem.
export function rebanhoAtivo(ix) {
  const d = ix.dados;
  const out = [];
  d.matrizes.filter((m) => m.status !== 'Vendida' && m.status !== 'Morta').forEach((m) => out.push({
    k: `m:${m.id}`, brinco: String(m.brinco), cat: m.categoria === 'Novilha' ? 'novilhas' : 'vacas', rot: m.categoria || 'Matriz', lote: m.lote || '', status: m.status, matriz: m,
  }));
  ix.crias.filter((c) => !c.novilha && (c.situacao === 'mamando' || c.situacao === 'desmamado')).forEach((c) => {
    const mae = ix.matPorId.get(c.matrizId);
    out.push({ k: `c:${c.id}`, brinco: c.brinco ? String(c.brinco) : 's/ nº', cat: 'bezerros', rot: categoriaCria(c), lote: c.situacao === 'mamando' && mae && mae.lote ? `${mae.lote} (ao pé)` : '', status: c.situacao === 'mamando' ? 'Mamando' : 'Desmamado', cria: c, mae: c.maeBrinco || '' });
  });
  (d.touros || []).forEach((t) => {
    if (ehBoi(t)) { if (boiAtivo(t)) out.push({ k: `t:${t.id}`, brinco: String(t.brinco || '—'), cat: 'bois', rot: 'Boi', lote: t.lote || '', status: 'Na fazenda' }); return; }
    if (t.tipo === 'Touro vivo' && !t.dataSaida && !/vendid|mort/i.test(String(t.situacao || ''))) out.push({ k: `t:${t.id}`, brinco: String(t.brinco || t.nome || '♂'), cat: 'touros', rot: 'Touro', lote: t.lote || '', status: 'Touro vivo', nome: t.nome || '' });
  });
  return out;
}

// Toda vez que um animal foi visto: Map(chave -> [{ data, fonte, id }]) + anotações que não batem com o cadastro
export function avistamentos(ix, desde) {
  const d = ix.dados;
  const vistos = new Map();
  // extra (só manejo): lote do manejo, observação anotada no brinco e pedido de mudança de lote
  const add = (k, data, fonte, id, extra) => { if (!k || !data) return; if (!vistos.has(k)) vistos.set(k, []); vistos.get(k).push({ data, fonte, id, ...(extra || {}) }); };
  const chave = (cru) => {
    const s = String(cru || '').trim(); if (!s) return '';
    if (s.startsWith('t:')) return s;
    if (s.startsWith('c:')) {
      const c = ix.criaPorId.get(s.slice(2));
      if (c && c.novilha) return `m:${c.novilha.id}`;
      if (c && (c.situacao === 'touro' || c.situacao === 'boi')) { const t = touroDaCria(c); if (t) return `t:${t.id}`; } // virou touro/boi: conta no cadastro de touros e bois
      return s;
    }
    return `m:${s}`;
  };
  const touroDaCria = (c) => (d.touros || []).find((t) => c.brinco && String(t.brinco || '').trim() === String(c.brinco).trim());
  const criaK = (id) => (id ? chave(`c:${id}`) : '');
  // brinco -> chaves de animais (para brinco anotado sem cadastro que foi cadastrado depois)
  const porBrinco = new Map();
  const addB = (b, k) => { const n = num(b); if (!n) return; if (!porBrinco.has(n)) porBrinco.set(n, []); porBrinco.get(n).push(k); };
  d.matrizes.forEach((m) => addB(m.brinco, `m:${m.id}`));
  ix.crias.forEach((c) => { if (!c.novilha && c.brinco && c.situacao !== 'touro' && c.situacao !== 'boi') addB(c.brinco, `c:${c.id}`); });
  (d.touros || []).forEach((t) => addB(t.brinco, `t:${t.id}`));

  const semCadastro = [];
  (d.eventos || []).forEach((e) => {
    if (e.anulada) return;
    const data = dia(e.data);
    if (e.tipo === 'manejo') {
      const nome = e.descricao || e.etapa || 'Manejo';
      const fl = lista(e.foraDoLote);
      const porAnimal = new Map(fl.filter((f) => f.animal).map((f) => [f.animal, f]));
      ids(e.presentes).forEach((x) => { const f = porAnimal.get(x); add(chave(x), data, nome, e.id, { manejo: true, lote: e.lote || '', nota: (f && f.nota) || '', mudar: (f && f.mudar) || '', animalCru: x }); });
      fl.forEach((f) => {
        if (f.animal) return; // com cadastro: já está em presentes
        const achados = porBrinco.get(num(f.brinco)) || [];
        if (achados.length === 1) add(achados[0], data, `${nome} (anotado sem cadastro)`, e.id, { manejo: true, lote: e.lote || '', nota: f.nota || '', semCadastro: true });
        else if (!desde || data >= desde) semCadastro.push({ brinco: String(f.brinco ?? '').trim(), data, manejo: nome, lote: e.lote || '', nota: f.nota || f.obs || '', manejoId: e.id, repetido: achados.length > 1 });
      });
    } else if (e.tipo === 'diagnostico') add(chave(e.matrizId), data, `Toque (${e.resultado || 'diagnóstico'})`, e.id);
    else if (e.tipo === 'iatf') add(chave(e.matrizId), data, e.tipoServico || 'IATF', e.id);
    else if (e.tipo === 'pesagem') { if (e.criaId) add(criaK(e.criaId), data, 'Pesagem', e.id); else if (e.matrizId) add(chave(e.matrizId), data, 'Pesagem', e.id); }
    else if (e.tipo === 'desmama') add(criaK(e.criaId), data, 'Desmama', e.id);
    else if (e.tipo === 'nascimento') {
      add(chave(e.matrizId), data, 'Pariu', e.id);
      if (e.resultadoParto !== 'Natimorto') add(criaK(e.id), data, 'Nasceu', e.id);
    }
  });
  vistos.forEach((l) => l.sort((a, b) => b.data.localeCompare(a.data)));
  return { vistos, semCadastro };
}

// Análise completa: uma linha por animal ativo + anotações a conferir
export function analisarConferencia(ix, opcoes) {
  const op = opcoes || {};
  const hoje = ix.hoje;
  const rodadas = rodadasConferencia(ix.dados, op.inicio);
  const inicio = rodadas[0].inicio;
  const { vistos, semCadastro } = avistamentos(ix, inicio);
  const prod = new Map(analisarMatrizes(ix.dados, hoje, ix.criaDaMatriz).map((l) => [`m:${l.id}`, l]));
  const ativos = rebanhoAtivo(ix);
  // Crias do histórico "a confirmar" que passaram no curral: estão na fazenda, entram na conferência
  const confirmadas = [];
  ix.crias.forEach((c) => {
    if (c.novilha || c.situacao !== 'confirmar') return;
    const v = (vistos.get(`c:${c.id}`) || []).filter((x) => x.data >= inicio);
    if (!v.length) return;
    const rot = categoriaCria(c);
    const a = { k: `c:${c.id}`, brinco: c.brinco ? String(c.brinco) : 's/ nº', cat: rot === 'Novilha' ? 'novilhas' : rot === 'Garrote' ? 'bois' : 'bezerros', rot, lote: '', status: 'A confirmar', cria: c, mae: c.maeBrinco || '', confirmada: true };
    ativos.push(a);
    const ev = (ix.dados.eventos || []).find((e) => e.id === v[0].id);
    confirmadas.push({ k: a.k, id: c.id, brinco: a.brinco, rot, sexo: c.sexo || '', data: v[0].data, manejo: v[0].fonte, lote: (ev && ev.lote) || '', mae: a.mae, nasc: c.nascData || '' });
  });
  const aConfirmar = ix.crias.filter((c) => !c.novilha && c.situacao === 'confirmar').length - confirmadas.length;
  const ativosK = new Set(ativos.map((a) => a.k));

  const linhas = ativos.map((a) => {
    const vs = vistos.get(a.k) || [];
    const porRodada = rodadas.map((r) => vs.filter((v) => naRodada(v.data, r)));
    const p = prod.get(a.k);
    const motivos = [];
    if (p && GRUPOS_SUSPEITOS[p.grupo]) motivos.push(GRUPOS_SUSPEITOS[p.grupo]);
    else if (p && p.semEmprenhar) motivos.push(`${p.mesesSemParir} meses sem emprenhar`);
    if (p && p.previsaoVencida) motivos.push(`previsão de parto venceu há ${p.previsaoVencida} dias`);
    return {
      ...a, ultimo: vs[0] || null, diasSemVer: vs[0] ? diasEntre(vs[0].data, hoje) : null,
      rodadas: porRodada.map((l) => (l.length ? l[0] : null)), vezes: vs.filter((v) => v.data >= inicio).length,
      mesesSemParir: p ? p.mesesSemParir : null, nPartos: p ? p.nPartos : null, grupoProd: p ? p.grupo : '', motivos,
    };
  });
  const atual = rodadas.length - 1;
  linhas.forEach((l) => {
    l.faltou = !l.rodadas[atual];
    l.faltouTodas = l.rodadas.every((x) => !x);
    l.suspeita = l.faltou && l.motivos.length > 0;
  });

  // Anotado no manejo, mas no sistema já saiu (vendido, morto) ou é cria "a confirmar" do histórico
  const fora = [];
  const vistoDepois = (k) => (vistos.get(k) || []).filter((v) => v.data >= inicio && v.fonte !== 'Pariu' && v.fonte !== 'Nasceu');
  ix.dados.matrizes.forEach((m) => {
    const k = `m:${m.id}`; if (ativosK.has(k)) return;
    const v = vistoDepois(k); if (v.length) fora.push({ k, brinco: String(m.brinco), rot: m.categoria || 'Matriz', situacao: m.status === 'Morta' ? 'Está como morta' : 'Está como vendida', data: v[0].data, manejo: v[0].fonte, lote: v[0].lote || '' });
  });
  ix.crias.forEach((c) => {
    const k = `c:${c.id}`; if (c.novilha || ativosK.has(k) || c.situacao === 'touro' || c.situacao === 'boi') return;
    const v = vistoDepois(k); if (!v.length) return;
    fora.push({ k, brinco: c.brinco ? String(c.brinco) : 's/ nº', rot: categoriaCria(c), situacao: c.situacao === 'morto' ? 'Está como morta' : 'Está como vendida', data: v[0].data, manejo: v[0].fonte, lote: v[0].lote || '' });
  });
  (ix.dados.touros || []).forEach((t) => {
    const k = `t:${t.id}`; if (ativosK.has(k)) return;
    const v = vistoDepois(k); if (v.length) fora.push({ k, brinco: String(t.brinco || t.nome || ''), rot: ehBoi(t) ? 'Boi' : 'Touro', situacao: 'Está como saído do rebanho', data: v[0].data, manejo: v[0].fonte, lote: v[0].lote || '' });
  });

  return { rodadas, atual, inicio, linhas, vistos, aConfirmar, confirmadas: confirmadas.sort((a, b) => ordemBrinco(a.brinco, b.brinco)), semCadastro: semCadastro.sort((a, b) => b.data.localeCompare(a.data) || ordemBrinco(a.brinco, b.brinco)), fora: fora.sort((a, b) => ordemBrinco(a.brinco, b.brinco)) };
}

// Números de uma rodada, no total e por categoria
export function resumoConferencia(an, iRodada) {
  const i = iRodada ?? an.atual;
  const passou = (l) => !!l.rodadas[i];
  const total = an.linhas.length;
  const passaram = an.linhas.filter(passou).length;
  return {
    total, passaram, faltam: total - passaram, pct: total ? passaram / total : 0,
    suspeitas: an.linhas.filter((l) => !passou(l) && l.motivos.length).length,
    faltouTodas: an.rodadas.length > 1 ? an.linhas.filter((l) => l.faltouTodas).length : null,
    anotacoes: an.semCadastro.length + an.fora.length + an.confirmadas.length,
    porCat: CATEGORIAS_CONF.map((c) => {
      const ls = an.linhas.filter((l) => l.cat === c.id);
      return { ...c, total: ls.length, passaram: ls.filter(passou).length };
    }).filter((c) => c.total > 0),
  };
}

// Texto do último avistamento
export const textoVisto = (v) => (v ? `${formatarDataBR(v.data)} · ${v.fonte}` : '');

// Para a ficha: última vez que o animal passou no curral e se já passou na rodada atual (calculado uma vez por índice)
const cacheVistos = new WeakMap();
export function vistoNoCurral(ix, k) {
  let c = cacheVistos.get(ix);
  if (!c) { const rods = rodadasConferencia(ix.dados); c = { vistos: avistamentos(ix).vistos, rod: rods[rods.length - 1] }; cacheVistos.set(ix, c); }
  const l = c.vistos.get(k) || [];
  return { ultimo: l[0] || null, naRodada: l.find((x) => naRodada(x.data, c.rod)) || null, rodada: c.rod };
}

// "Confirmar na fazenda": cria do histórico "a confirmar" (fêmea) que passou no curral vira Novilha no cadastro, ligada ao
// nascimento dela (id cria-<nascimento>, como na desmama), com mãe, data de nascimento e raça do histórico.
// Machos não viram matriz (cadastrar como boi/garrote). Brinco que já é de outra matriz ativa fica de fora.
// Volta { matrizes: [novas], pulados: [{ brinco, motivo }] }
export function confirmarNaFazenda(ix, idsNasc, lote, agora) {
  const d = ix.dados;
  const now = agora || new Date().toISOString();
  const out = { matrizes: [], pulados: [] };
  const loteOk = padronizarLote(String(lote || '').trim(), d.matrizes);
  (idsNasc || []).forEach((id) => {
    const c = ix.criaPorId.get(id);
    if (!c) return;
    const brinco = String(c.brinco || '').trim();
    if (c.novilha || c.situacao !== 'confirmar') { out.pulados.push({ brinco, motivo: 'já confirmada' }); return; }
    if (c.sexo !== 'Fêmea') { out.pulados.push({ brinco, motivo: 'macho: cadastre em Rebanho > Bois' }); return; }
    if (!brinco) { out.pulados.push({ brinco: 's/ nº', motivo: 'sem número' }); return; }
    if (d.matrizes.some((m) => m.id === idNovilha(id) || (String(m.brinco).trim() === brinco && m.status !== 'Vendida' && m.status !== 'Morta'))) { out.pulados.push({ brinco, motivo: 'já existe matriz com esse brinco' }); return; }
    out.matrizes.push({
      id: idNovilha(id), brinco: /^\d+$/.test(brinco) ? Number(brinco) : brinco, categoria: 'Novilha', raca: racaDoHistorico(c.nasc) || '', lote: loteOk,
      dataNascimento: c.nascData || '', partosAnteriores: 0, status: 'Vazia', destino: '', dataBaixa: '', motivoBaixa: '', createdAt: now,
    });
  });
  return out;
}
