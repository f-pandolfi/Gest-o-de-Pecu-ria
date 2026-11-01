// v11: ficha do animal, busca geral, rebanho com todos os animais, bois, indução de novilhas e cadastros.
// Só regras (sem tela). Um animal é identificado por uma chave: "m:<id da matriz>", "c:<id do nascimento>" ou "t:<id do touro/boi>".
import {
  listarCrias, partosPorMatriz, previsaoPartoInfo, idadeMesesDias, infoAnimalVenda, noPlantel, situacaoHistorica,
  nomeTouroEvento, CAUSAS_MORTE, TIPOS_ANIMAL_VENDA, lotesExistentes, diasEntre, configCompleta,
} from './logica.js';

const mesmoNum = (a, b) => {
  const x = String(a ?? '').trim(); const y = String(b ?? '').trim();
  return !!x && !!y && (x === y || (/^\d+$/.test(x) && /^\d+$/.test(y) && Number(x) === Number(y)));
};
const lista = (v) => { try { const x = typeof v === 'string' ? JSON.parse(v) : v; return Array.isArray(x) ? x : []; } catch (e) { return []; } };
const ids = (v) => String(v || '').split(',').map((x) => x.trim()).filter(Boolean);

// ---------------------------------------------------------------- bois (ficam na aba Touros da planilha com tipo "Boi")
export const TIPO_BOI = 'Boi';
export const ehBoi = (t) => !!t && String(t.tipo || '').toLowerCase() === 'boi';
export const tourosReprodutores = (dados) => (dados.touros || []).filter((t) => !ehBoi(t));
export const boisDe = (dados) => (dados.touros || []).filter(ehBoi);
export const boiAtivo = (t) => !t.dataSaida && !/vendid|mort/i.test(String(t.situacao || ''));
export const CATEGORIAS_BOI = ['Boi', 'Garrote', 'Rufião', 'Outro'];

// ---------------------------------------------------------------- indução de novilhas (manejo com etapa "Indução · ...")
export const ETAPAS_INDUCAO = ['D0 · Implante', 'D12 · Retirada', 'Avaliação'];
export const PREFIXO_INDUCAO = 'Indução';
export const ehInducao = (e) => !!e && e.tipo === 'manejo' && /^\s*indu[çc][ãa]o/i.test(String(e.etapa || ''));
export const etapaDaInducao = (e) => String(e.etapa || '').replace(/^\s*indu[çc][ãa]o\s*[·:-]?\s*/i, '') || 'Indução';
// Todas as etapas de indução de uma novilha (mais recente primeiro). Na avaliação: presentes = ciclando, ausentes = não ciclando.
export function inducoesDe(dados, matrizId) {
  return (dados.eventos || []).filter((e) => ehInducao(e) && (ids(e.presentes).includes(matrizId) || ids(e.ausentes).includes(matrizId)))
    .map((e) => {
      const etapa = etapaDaInducao(e);
      const aval = /avalia/i.test(etapa);
      const res = aval ? (ids(e.presentes).includes(matrizId) ? 'Ciclando' : 'Não ciclou') : '';
      return { id: e.id, data: e.data, etapa, produtos: lista(e.aplicacoes).map((a) => a.produto || a.tipo).filter(Boolean), res, responsavel: e.responsavel || '' };
    })
    .sort((a, b) => b.data.localeCompare(a.data));
}

// ---------------------------------------------------------------- índice (calculado uma vez por versão dos dados)
export function indiceRebanho(dados, hoje) {
  const crias = listarCrias(dados, hoje);
  const criaPorId = new Map(crias.map((c) => [c.id, c]));
  const partos = partosPorMatriz(dados.eventos);
  const matPorId = new Map(dados.matrizes.map((m) => [m.id, m]));
  const criaDaMatriz = new Map();
  crias.forEach((c) => { if (c.novilha) criaDaMatriz.set(c.novilha.id, c); });
  const pesos = new Map();
  const ultimoPeso = (brinco) => {
    const k = String(brinco);
    if (!pesos.has(k)) {
      const pts = (infoAnimalVenda(dados, brinco, hoje, crias).pontos || []).filter((p) => p.peso > 0 && p.fonte !== 'Nascimento');
      pesos.set(k, pts.length ? pts[pts.length - 1] : null);
    }
    return pesos.get(k);
  };
  return { dados, hoje, crias, criaPorId, partos, matPorId, criaDaMatriz, ultimoPeso };
}
export const chaveDaCria = (c) => (c.novilha ? `m:${c.novilha.id}` : `c:${c.id}`);

// Categoria de uma cria pela idade e situação
export function categoriaCria(c) {
  const f = c.sexo === 'Fêmea';
  if (c.situacao === 'mamando') return f ? 'Bezerra' : 'Bezerro';
  if ((c.idadeDias ?? 0) < 365) return f ? 'Bezerra desmamada' : 'Bezerro desmamado';
  return f ? 'Novilha' : 'Garrote';
}
export const racaDoHistorico = (n) => { const m = /ra[çc]a\s+([A-Za-zÀ-ú]+)/i.exec((n && n.observacoes) || ''); return m ? m[1] : ''; };

// ---------------------------------------------------------------- busca geral
// Brinco exato primeiro (pode haver mais de um animal: número repetido); sem exato, os que começam com o texto.
export function buscarAnimais(ix, q) {
  q = String(q || '').trim();
  if (!q) return [];
  const ql = q.toLowerCase();
  const out = [];
  ix.dados.matrizes.forEach((m) => { if (mesmoNum(m.brinco, q)) out.push({ k: `m:${m.id}`, exato: true }); });
  ix.crias.forEach((c) => { if (!c.novilha && mesmoNum(c.brinco, q)) out.push({ k: `c:${c.id}`, exato: true }); });
  (ix.dados.touros || []).forEach((t) => { if (mesmoNum(t.brinco, q) || String(t.nome || '').toLowerCase().includes(ql)) out.push({ k: `t:${t.id}`, exato: true }); });
  if (out.length) return out;
  ix.dados.matrizes.forEach((m) => { if (String(m.brinco).startsWith(q)) out.push({ k: `m:${m.id}` }); });
  ix.crias.forEach((c) => { if (!c.novilha && c.brinco && String(c.brinco).startsWith(q)) out.push({ k: `c:${c.id}` }); });
  return out.slice(0, 30);
}

const anosTxt = (d, hoje) => { const x = d && idadeMesesDias(d, hoje); return x ? (x.meses >= 24 ? `${Math.floor(x.meses / 12)} anos` : x.texto) : ''; };
export const idadeTexto = (d, hoje) => { const x = d && idadeMesesDias(d, hoje); return x ? x.texto : ''; };
export const idadeCurta = anosTxt;

// Uma linha de lista (Rebanho, busca, Diagnóstico): { brinco, rot, titulo, cor, linha, pill: { t, cor } }
export function resumoAnimal(ix, k, fmt) {
  const t = k[0]; const id = k.slice(2); const br = fmt;
  if (t === 'm') {
    const m = ix.matPorId.get(id);
    if (!m) return null;
    const p = ix.partos.get(id) || [];
    if (m.categoria === 'Novilha') {
      const inds = inducoesDe(ix.dados, m.id); const ind = inds[inds.length - 1]; const u = ix.ultimoPeso(m.brinco); const cria = ix.criaDaMatriz.get(m.id);
      const nasc = m.dataNascimento || (cria && cria.nascData);
      return {
        brinco: m.brinco, rot: 'Novilha', titulo: ind ? `Induzida em ${br(ind.data)}` : 'Não induzida', cor: ind ? 'green' : 'amber',
        linha: [u ? `${u.peso} kg em ${br(u.data)}` : 'sem peso', nasc ? anosTxt(nasc, ix.hoje) : '', m.lote].filter(Boolean).join(' · '),
        pill: { t: m.status, cor: corStatus(m.status) },
      };
    }
    const prev = m.status === 'Cheia' ? previsaoPartoInfo(m.id, ix.dados.eventos) : null;
    const ult = p[0] ? `Últ. cria ${p[0].brincoBezerro || 's/ nº'} · ${br(p[0].data)}` : 'Sem parto registrado';
    const atras = prev && prev.data && prev.data < ix.hoje;
    return {
      brinco: m.brinco, rot: m.categoria || 'Matriz', titulo: prev && prev.data ? `Previsão ${br(prev.data)}` : ult, cor: prev && prev.data ? (atras ? 'late' : 'green') : '',
      linha: [prev && prev.data ? ult : '', `${p.length} parto${p.length === 1 ? '' : 's'}`, m.lote].filter(Boolean).join(' · '),
      pill: { t: m.status, cor: corStatus(m.status) },
    };
  }
  if (t === 'c') {
    const c = ix.criaPorId.get(id);
    if (!c) return null;
    const pesoOk = c.pesoAtual && c.pesoData && c.pesoData !== c.nascData;
    return {
      brinco: c.brinco || 's/ nº', rot: categoriaCria(c), titulo: pesoOk ? `${c.pesoAtual} kg em ${br(c.pesoData)}` : 'Ainda não pesado', cor: pesoOk ? 'green' : '',
      linha: `${idadeTexto(c.nascData, ix.hoje) || `nasc. ${br(c.nascData)}`} · mãe ${c.maeBrinco || '?'}`,
      pill: { t: rotuloSit(c), cor: corSituacao(c.situacao) },
    };
  }
  const tt = (ix.dados.touros || []).find((x) => x.id === id);
  if (!tt) return null;
  if (ehBoi(tt)) {
    const u = ultimoPesoBoi(ix.dados, tt);
    return {
      brinco: tt.brinco || '—', rot: tt.lote ? 'Boi' : 'Boi', titulo: u ? `${u.peso} kg em ${br(u.data)}` : (tt.pesoAtual ? `${tt.pesoAtual} kg (entrada)` : 'Sem peso'), cor: u ? 'green' : '',
      linha: [tt.nome && tt.nome !== tt.brinco ? tt.nome : '', tt.raca, tt.origem, tt.lote].filter(Boolean).join(' · ') || 'Boi',
      pill: { t: boiAtivo(tt) ? 'Na fazenda' : 'Saiu', cor: boiAtivo(tt) ? 'green' : 'gray' },
    };
  }
  return {
    brinco: tt.brinco || '♂', rot: 'Touro', titulo: tt.nome, cor: '',
    linha: [tt.tipo || 'Touro / sêmen', tt.raca].filter(Boolean).join(' · '),
    pill: { t: tt.tipo === 'Touro vivo' ? 'Touro vivo' : 'Sêmen', cor: 'blue' },
  };
}
export const corStatus = (s) => ({ Cheia: 'green', Vazia: 'amber', Descarte: 'late', Vendida: 'gray', Morta: 'gray' }[s] || 'gray');
export const corSituacao = (s) => ({ mamando: 'blue', desmamado: 'green', novilha: 'green', matriz: 'green', vendido: 'gray', morto: 'late', confirmar: 'amber' }[s] || 'gray');
export function rotuloSit(c) {
  const f = c.sexo === 'Fêmea';
  return { mamando: 'Mamando', desmamado: f ? 'Desmamada' : 'Desmamado', novilha: 'Novilha', matriz: 'Virou matriz', vendido: f ? 'Vendida' : 'Vendido', morto: f ? 'Morta' : 'Morto', confirmar: 'A confirmar' }[c.situacao] || c.situacao;
}

// Pesagens de um boi (eventos "pesagem" com o brinco e sem cria/matriz ligada)
export function pesagensBoi(dados, t) {
  if (!t.brinco) return [];
  return (dados.eventos || []).filter((e) => e.tipo === 'pesagem' && !e.criaId && !e.matrizId && mesmoNum(e.brinco, t.brinco) && Number(e.peso) > 0)
    .map((e) => ({ data: e.data, peso: Number(e.peso), fonte: 'Pesagem' })).sort((a, b) => a.data.localeCompare(b.data));
}
export function ultimoPesoBoi(dados, t) { const p = pesagensBoi(dados, t); return p.length ? p[p.length - 1] : null; }

// ---------------------------------------------------------------- eventos ligados a um animal (inclui manejos em que ele estava)
export function eventosDoAnimal(dados, idsAnimal, brinco) {
  const set = new Set(idsAnimal.filter(Boolean));
  return (dados.eventos || []).filter((e) => set.has(e.matrizId) || set.has(e.criaId)
    || (e.tipo === 'manejo' && (ids(e.presentes).some((x) => set.has(x)) || ids(e.ausentes).some((x) => set.has(x))
      || lista(e.foraDoLote).some((f) => set.has(f.animal) || (brinco && mesmoNum(f.brinco, brinco))))));
}
export function manejosDoAnimal(dados, idsAnimal, brinco) {
  const set = new Set(idsAnimal);
  return eventosDoAnimal(dados, idsAnimal, brinco).filter((e) => e.tipo === 'manejo').sort((a, b) => b.data.localeCompare(a.data))
    .map((e) => {
      const nota = lista(e.foraDoLote).find((f) => set.has(f.animal) || (brinco && mesmoNum(f.brinco, brinco)));
      return {
        id: e.id, data: e.data, titulo: ehInducao(e) ? `Indução · ${etapaDaInducao(e)}` : (e.descricao || e.etapa || 'Manejo'),
        aplic: lista(e.aplicacoes).map((a) => [a.tipo, a.produto].filter(Boolean).join(': ')).join(' · '), lote: e.lote || '', nota: (nota && nota.nota) || '',
      };
    });
}

// ---------------------------------------------------------------- ficha da matriz (reprodução e alertas)
export function reproducaoDaMatriz(ix, m) {
  const ps = ix.partos.get(m.id) || [];
  const evs = (ix.dados.eventos || []).filter((e) => e.matrizId === m.id);
  const diags = evs.filter((e) => e.tipo === 'diagnostico').sort((a, b) => b.data.localeCompare(a.data));
  const iatfs = evs.filter((e) => e.tipo === 'iatf').sort((a, b) => b.data.localeCompare(a.data));
  const prev = m.status === 'Cheia' ? previsaoPartoInfo(m.id, ix.dados.eventos) : null;
  const inter = []; for (let i = 0; i < ps.length - 1; i++) inter.push(diasEntre(ps[i + 1].data, ps[i].data));
  const ipp = inter.length ? Math.round(inter.reduce((a, b) => a + b, 0) / inter.length) : null;
  const cria = ix.criaDaMatriz.get(m.id);
  const nasc = m.dataNascimento || (cria && cria.nascData) || '';
  const alertas = [];
  const vivo = m.status !== 'Vendida' && m.status !== 'Morta';
  if (vivo && m.status === 'Vazia' && ps[0]) { const d = diasEntre(ps[0].data, ix.hoje); if (d > 6 * 30.44) alertas.push({ t: `Mais de 6 meses sem emprenhar: vazia há ${Math.round(d / 30.44)} meses (${d} dias) desde o último parto`, ruim: true }); else if (d > 120) alertas.push({ t: `Vazia há ${d} dias desde o último parto` }); }
  if (vivo && prev && prev.data) { const d = diasEntre(ix.hoje, prev.data); if (d >= 0 && d <= 30) alertas.push({ t: `Parto previsto em ${d} dia(s)` }); if (d < 0) alertas.push({ t: `Previsão de parto passou há ${-d} dias: conferir se pariu`, ruim: true }); }
  const inds = inducoesDe(ix.dados, m.id);
  if (vivo && m.categoria === 'Novilha' && !inds.length) {
    const u = ix.ultimoPeso(m.brinco); const corte = configCompleta(ix.dados.config).pesoMatriz;
    alertas.push({ t: u && u.peso >= corte ? `Não induzida e já com ${u.peso} kg: pronta para indução` : 'Novilha ainda não induzida' });
  }
  if (!nasc) alertas.push({ t: 'Data de nascimento não informada' });
  return { ps, diags, iatfs, prev, ipp, cria, nasc, alertas, inds, touroIatf: iatfs[0] ? nomeTouroEvento(iatfs[0], ix.dados.touros) : '' };
}

export const situacaoHistoricaDe = situacaoHistorica;
export const plantel = (dados) => dados.matrizes.filter(noPlantel);

// ---------------------------------------------------------------- cadastros (listas do app, só o proprietário altera)
// Guardados na aba Config da planilha, chave "cadastros" (JSON): { chave: [{ v: 'texto', ativo: true }] }.
// Os valores de fábrica continuam valendo; o proprietário acrescenta e desativa (o que já foi usado não é apagado).
export const LISTAS_CADASTRO = [
  { id: 'unidades', titulo: 'Unidades', desc: 'Usadas no Insumo.', padrao: ['kg', 'L', 'un', 'dose'] },
  { id: 'produtos', titulo: 'Produtos', desc: 'Insumo, aplicações do manejo e indução.', padrao: ['Sal Mineral', 'Medicamento', 'Vacina', 'Implante de progesterona', 'Cipionato de estradiol', 'Benzoato de estradiol', 'eCG', 'Outro'] },
  { id: 'aplicacoes', titulo: 'Vacinas e aplicações', desc: 'Tipos de aplicação no manejo (protocolo, geral, vacinas).', padrao: ['Vacina reprodutiva', 'Reforço Lepto', 'Vermífugo', 'Fortificante', 'Estimulante', 'Brucelose', 'Hormônio', 'Pour-on', 'Brinco mosquicida', 'Carrapaticida', 'Outra'] },
  { id: 'causasMorte', titulo: 'Causas de morte', desc: 'Lista da aba Morte.', padrao: CAUSAS_MORTE },
  { id: 'motivosDescarte', titulo: 'Motivos de descarte', desc: 'Toque e descarte.', padrao: ['Vazia repetida', 'Idade', 'Problema de úbere', 'Problema de casco', 'Baixa produção', 'Doença', 'Outro'] },
  { id: 'lotes', titulo: 'Lotes e pastos', desc: 'Sugestões de lote (cadastro, manejo, bois).', padrao: [] },
  { id: 'racas', titulo: 'Raças', desc: 'Matrizes, nascimentos e bois.', padrao: ['Nelore', 'Sindi', 'Aberdeen', 'Gir', 'Cruzado'] },
  { id: 'pelagens', titulo: 'Pelagens', desc: 'Nascimento.', padrao: ['Branca', 'Vermelha', 'Preta', 'Malhada', 'Chumbada'] },
  { id: 'pessoas', titulo: 'Pessoas', desc: 'Veterinários, técnicos de IA e funcionários (responsável).', padrao: [] },
  { id: 'compradores', titulo: 'Compradores', desc: 'Vendas.', padrao: [] },
  { id: 'tiposVenda', titulo: 'Tipos de animal na venda', desc: 'Venda por peso.', padrao: TIPOS_ANIMAL_VENDA },
];
export function lerCadastros(config) {
  const v = config && config.cadastros;
  if (!v) return {};
  try { const o = typeof v === 'string' ? JSON.parse(v) : v; return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; }
}
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
// Lista completa de uma chave: [{ v, ativo, padrao, usado }]. "usados" = valores achados nos lançamentos (entram como ativos).
export function itensCadastro(dados, id, usados) {
  const def = LISTAS_CADASTRO.find((l) => l.id === id) || { padrao: [] };
  const salvo = lerCadastros(dados.config)[id] || [];
  const out = [];
  const add = (v, extra) => {
    const t = String(v || '').trim(); if (!t) return;
    const i = out.findIndex((x) => norm(x.v) === norm(t));
    if (i < 0) out.push({ v: t, ativo: true, ...extra }); else Object.assign(out[i], extra, { v: out[i].v });
  };
  def.padrao.forEach((v) => add(v, { padrao: true }));
  (usados || []).forEach((v) => add(v, { usado: true }));
  salvo.forEach((x) => add(x.v, { ativo: x.ativo !== false, salvo: true }));
  return out;
}
// Só os ativos (para os campos de escolha). Sempre mantém o valor atual do formulário, mesmo desativado.
export function opcoesCadastro(dados, id, atual) {
  const l = itensCadastro(dados, id, valoresUsados(dados, id)).filter((x) => x.ativo).map((x) => x.v);
  if (atual && !l.some((x) => norm(x) === norm(atual))) l.push(atual);
  return l;
}
export function valoresUsados(dados, id) {
  const s = new Set();
  const ev = dados.eventos || [];
  if (id === 'produtos') { ev.forEach((e) => { if (e.tipo === 'insumo' && e.produto) s.add(e.produto); if (e.tipo === 'manejo') lista(e.aplicacoes).forEach((a) => a.produto && s.add(a.produto)); }); }
  if (id === 'aplicacoes') ev.forEach((e) => { if (e.tipo === 'manejo') lista(e.aplicacoes).forEach((a) => a.tipo && s.add(a.tipo)); });
  if (id === 'unidades') ev.forEach((e) => { if (e.tipo === 'insumo' && e.unidade) s.add(e.unidade); });
  if (id === 'causasMorte') ev.forEach((e) => { if (e.tipo === 'morte' && e.causa) s.add(e.causa); });
  if (id === 'lotes') lotesExistentes(dados.matrizes).forEach((x) => s.add(x.lote));
  if (id === 'racas') { dados.matrizes.forEach((m) => m.raca && s.add(m.raca)); }
  if (id === 'pelagens') ev.forEach((e) => { if (e.tipo === 'nascimento' && e.pelagem) s.add(e.pelagem); });
  if (id === 'pessoas') ev.forEach((e) => ['veterinario', 'tecnico', 'responsavel'].forEach((k) => { if (e[k]) s.add(String(e[k]).trim()); }));
  if (id === 'compradores') ev.forEach((e) => { if (e.tipo === 'venda' && e.comprador) s.add(e.comprador); });
  return [...s];
}
// Monta o que vai para a planilha depois de uma mudança: só o que não é de fábrica ou foi desativado
export function cadastrosParaSalvar(dados, id, itens) {
  const atual = lerCadastros(dados.config);
  const novo = { ...atual, [id]: itens.filter((x) => !x.padrao || x.ativo === false).map((x) => ({ v: x.v, ativo: x.ativo !== false })) };
  return JSON.stringify(novo);
}

export { plantel as plantelDe };

// Os campos das telas leem as listas daqui (o app avisa a cada mudança dos dados)
let DADOS_CADASTRO = null;
export function definirDadosCadastro(dados) { DADOS_CADASTRO = dados; }
export function opcoesAtuais(id, atual, padrao) {
  if (!DADOS_CADASTRO) { const l = [...(padrao || (LISTAS_CADASTRO.find((x) => x.id === id) || { padrao: [] }).padrao)]; if (atual && !l.includes(atual)) l.push(atual); return l; }
  return opcoesCadastro(DADOS_CADASTRO, id, atual);
}
export function categoriaBoi(t) { const w = String((t && t.nome) || '').split(' ')[0]; return CATEGORIAS_BOI.includes(w) ? w : 'Boi'; }
export const _testes = { mesmoNum, ids, lista };
export const ehAtiva = (c) => c.situacao !== 'vendido' && c.situacao !== 'morto';
export const naFazenda = (c) => !c.novilha && (c.situacao === 'mamando' || c.situacao === 'desmamado');
export const hojeIdade = idadeMesesDias;
export { previsaoPartoInfo, situacaoHistorica, nomeTouroEvento, infoAnimalVenda };
