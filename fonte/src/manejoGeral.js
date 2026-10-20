// manejoGeral.js (app 10.3): manejo geral do curral com conferência do lote.
// Pour-on no lombo, brinco mosquicida, vermífugo, carrapaticida, vacina ou só conferência: data, lote, o que foi feito,
// e a relação de animais do lote (começa DESMARCADA; marca quem passou). Animal que não é do lote entra mesmo assim,
// com uma observação. Mudar o lote desse animal só acontece quando o PROPRIETÁRIO confirma.
// Só regras (sem tela). A tela fica em telas/ManejoGeral.jsx.
import {
  todayISO, formatarDataBR, novoId, listarCrias, acharMatrizPorBrinco, padronizarLote, mesmoLote, lotesExistentes, diasEntre,
} from './logica.js';

export const ETAPA_GERAL = 'Geral';
// Botões rápidos do "Manejo": o texto vai para a descrição e, quando é produto, vira aplicação na ficha do animal
export const MANEJOS_RAPIDOS = [
  { rotulo: 'Pour-on no lombo', aplicacao: 'Pour-on' },
  { rotulo: 'Brinco mosquicida', aplicacao: 'Brinco mosquicida' },
  { rotulo: 'Vermífugo', aplicacao: 'Vermífugo' },
  { rotulo: 'Carrapaticida', aplicacao: 'Carrapaticida' },
  { rotulo: 'Vacina', aplicacao: '' },
  { rotulo: 'Conferência', aplicacao: '' },
];

const json = (v, padrao) => { if (Array.isArray(v)) return v; try { const x = JSON.parse(v || ''); return x ?? padrao; } catch (e) { return padrao; } };
const lista = (v) => String(v || '').split(',').map((x) => x.trim()).filter(Boolean);
const ordemBrinco = (a, b) => String(a).localeCompare(String(b), 'pt-BR', { numeric: true });
const ativa = (m) => m.status !== 'Vendida' && m.status !== 'Morta';
export const ehManejoGeral = (e) => e && e.tipo === 'manejo' && e.etapa === ETAPA_GERAL;
export const foraDoLoteDe = (e) => json(e && e.foraDoLote, []);

// Lotes para escolher: os que existem no rebanho (com quantos animais)
export const lotesParaManejo = (estado) => lotesExistentes(estado.matrizes);

// Crias ao pé (mamando) cujas mães estão no lote
function criasAoPe(estado, lote, hoje) {
  const maes = new Map(estado.matrizes.filter((m) => ativa(m) && mesmoLote(m.lote, lote)).map((m) => [m.id, m]));
  return listarCrias(estado, hoje).filter((c) => c.ativa && c.situacao === 'mamando' && maes.has(c.matrizId));
}
export const temCriasAoPe = (estado, lote, hoje) => !!lote && criasAoPe(estado, lote, hoje).length > 0;

// Relação de animais do lote. Matriz: id da matriz; cria: "c:<id do nascimento>" (o mesmo das vacinas).
export function animaisDoLote(estado, lote, opcoes) {
  const op = opcoes || {};
  if (!lote) return [];
  const hoje = op.hoje || todayISO();
  const matrizes = estado.matrizes.filter((m) => ativa(m) && mesmoLote(m.lote, lote)).map((m) => ({
    id: m.id, brinco: String(m.brinco), tipo: 'matriz', linha1: m.categoria || 'Matriz', linha2: [String(m.status || '').toLowerCase(), m.raca].filter(Boolean).join(' · '),
  }));
  const crias = op.incluirCrias ? criasAoPe(estado, lote, hoje).map((c) => ({
    id: `c:${c.id}`, brinco: c.brinco || 's/ nº', tipo: 'cria', linha1: c.sexo === 'Fêmea' ? 'Bezerra ao pé' : 'Bezerro ao pé', linha2: `mãe ${c.maeBrinco || '?'}`,
  })) : [];
  return [...matrizes, ...crias].sort((a, b) => ordemBrinco(a.brinco, b.brinco));
}

// Brinco digitado que não está na relação do lote: entra com a observação do porquê.
// Volta { animal, brinco, tipo, loteAtual, obs, mudar } — mudar = 'pendente' quando dá para trocar o lote da matriz.
export function animalForaDoLote(estado, lote, brinco, hoje) {
  const b = String(brinco ?? '').trim();
  if (!b) return null;
  const r = acharMatrizPorBrinco(estado.matrizes, b);
  if (r.matriz) {
    const m = r.matriz;
    const atual = padronizarLote(m.lote, estado.matrizes);
    if (!ativa(m)) {
      return { animal: m.id, brinco: String(m.brinco), tipo: 'matriz', loteAtual: atual, obs: `Consta como ${m.status === 'Morta' ? 'MORTA' : 'VENDIDA'} no cadastro`, mudar: '' };
    }
    if (mesmoLote(m.lote, lote)) return { animal: m.id, brinco: String(m.brinco), tipo: 'matriz', loteAtual: atual, obs: '', mudar: '', doLote: true };
    return {
      animal: m.id, brinco: String(m.brinco), tipo: 'matriz', loteAtual: atual,
      obs: `Não é do lote ${lote} (${atual ? `está em ${atual}` : 'sem lote no cadastro'})`, mudar: 'pendente',
    };
  }
  const c = listarCrias(estado, hoje || todayISO()).find((x) => x.ativa && x.brinco && (x.brinco === b || (/^\d+$/.test(b) && /^\d+$/.test(x.brinco) && Number(x.brinco) === Number(b))));
  if (c) {
    const mae = estado.matrizes.find((m) => m.id === c.matrizId);
    const loteMae = mae ? padronizarLote(mae.lote, estado.matrizes) : '';
    if (mae && mesmoLote(mae.lote, lote)) return { animal: `c:${c.id}`, brinco: c.brinco, tipo: 'cria', loteAtual: loteMae, obs: `Cria ao pé deste lote (mãe ${c.maeBrinco || '?'})`, mudar: '' };
    return {
      animal: `c:${c.id}`, brinco: c.brinco, tipo: 'cria', loteAtual: loteMae,
      obs: `Cria de outro lote (mãe ${c.maeBrinco || '?'}${loteMae ? ` em ${loteMae}` : ''})`, mudar: '',
    };
  }
  return { animal: '', brinco: b, tipo: '', loteAtual: '', obs: 'Brinco não cadastrado', mudar: '' };
}

// Grava o manejo geral.
// form: { data, lote, descricao, responsavel, aplicacoes, esperados: [id], marcados: [id], fora: [itens de animalForaDoLote],
//         observacoes, incluirCrias, dono (proprietário gravando), aprovar: [id de matriz] (só quando dono) }
// Funcionário: a mudança de lote fica "pendente" para o proprietário confirmar. Proprietário: confirma na hora as marcadas.
export function aplicarManejoGeral(estado, form, opcoes) {
  const op = opcoes || {};
  const now = op.now || new Date().toISOString();
  const lote = padronizarLote(form.lote, estado.matrizes);
  const erros = [];
  if (!form.data) erros.push('Falta a data.');
  if (!lote) erros.push('Escolha ou digite o lote.');
  if (!String(form.descricao || '').trim()) erros.push('Escreva o manejo (o que está sendo feito).');
  const esperados = [...new Set(form.esperados || [])];
  const marcados = [...new Set(form.marcados || [])].filter((id) => esperados.includes(id));
  const fora = (form.fora || []).filter((f) => f && f.brinco);
  if (!marcados.length && !fora.length) erros.push('Marque pelo menos um animal que passou no curral.');
  if (erros.length) return { erros };

  const aprovar = new Set(form.dono ? form.aprovar || [] : []);
  const foraFinal = fora.map((f) => {
    const x = { animal: f.animal || '', brinco: String(f.brinco), tipo: f.tipo || '', loteAtual: f.loteAtual || '', obs: f.obs || '', mudar: f.mudar || '' };
    if (x.mudar === 'pendente' && form.dono) {
      x.mudar = aprovar.has(x.animal) ? 'aprovada' : 'recusada';
      x.decididoEm = now.slice(0, 10);
    }
    return x;
  });
  const presentes = [...new Set([...marcados, ...foraFinal.map((f) => f.animal).filter(Boolean)])];
  const ausentes = esperados.filter((id) => !marcados.includes(id));
  const id = op.id || novoId();
  const manejo = {
    id, tipo: 'manejo', data: form.data, protocoloId: '', etapa: ETAPA_GERAL, manejoRef: form.incluirCrias ? 'com crias ao pé' : '',
    responsavel: String(form.responsavel || '').trim(), descricao: String(form.descricao).trim(),
    aplicacoes: JSON.stringify((form.aplicacoes || []).filter((a) => a && a.tipo)),
    presentes: presentes.join(','), ausentes: ausentes.join(','), observacoes: String(form.observacoes || '').trim(), createdAt: now,
    lote, foraDoLote: JSON.stringify(foraFinal),
  };
  const matrizesAlteradas = foraFinal.filter((f) => f.mudar === 'aprovada')
    .map((f) => estado.matrizes.find((m) => m.id === f.animal)).filter(Boolean)
    .map((m) => ({ ...m, lote }));
  const porId = new Map(matrizesAlteradas.map((m) => [m.id, m]));
  return {
    estado: { ...estado, eventos: [...estado.eventos, manejo], matrizes: estado.matrizes.map((m) => porId.get(m.id) || m) },
    eventosNovos: [manejo], matrizesAlteradas, erros: [],
  };
}

// Mudanças de lote esperando o proprietário confirmar (de manejos feitos por funcionário)
export function pendenciasLote(estado) {
  const out = [];
  estado.eventos.filter(ehManejoGeral).forEach((e) => {
    foraDoLoteDe(e).forEach((f, i) => {
      if (f.mudar !== 'pendente') return;
      const m = estado.matrizes.find((x) => x.id === f.animal);
      if (!m || !ativa(m)) return;
      out.push({ manejoId: e.id, data: e.data, descricao: e.descricao, responsavel: e.responsavel, para: e.lote, idx: i, animal: f.animal, brinco: f.brinco, de: padronizarLote(m.lote, estado.matrizes), jaEsta: mesmoLote(m.lote, e.lote) });
    });
  });
  return out.sort((a, b) => (b.data || '').localeCompare(a.data || '') || ordemBrinco(a.brinco, b.brinco));
}

// Proprietário confirma ou recusa. decisoes: [{ manejoId, animal, aprovar }]
// Volta { mudancas: { eventos: [{tipo:'manejo', id, campos:{foraDoLote}}], matrizes: [...] }, aprovadas, recusadas }
// (mesmo formato das correções: o app grava com atualizarCampos e upsertMatrizes).
export function decidirLote(estado, decisoes, opcoes) {
  const hoje = ((opcoes && opcoes.now) || new Date().toISOString()).slice(0, 10);
  const porManejo = new Map();
  (decisoes || []).forEach((d) => { if (!porManejo.has(d.manejoId)) porManejo.set(d.manejoId, new Map()); porManejo.get(d.manejoId).set(d.animal, !!d.aprovar); });
  const eventos = []; const matrizes = new Map(); let aprovadas = 0; let recusadas = 0;
  porManejo.forEach((dec, manejoId) => {
    const e = estado.eventos.find((x) => x.id === manejoId);
    if (!e) return;
    const fora = foraDoLoteDe(e).map((f) => {
      if (f.mudar !== 'pendente' || !dec.has(f.animal)) return f;
      const ok = dec.get(f.animal);
      if (ok) {
        const m = matrizes.get(f.animal) || estado.matrizes.find((x) => x.id === f.animal);
        if (m) matrizes.set(m.id, { ...m, lote: e.lote });
        aprovadas++;
      } else recusadas++;
      return { ...f, mudar: ok ? 'aprovada' : 'recusada', decididoEm: hoje };
    });
    eventos.push({ tipo: 'manejo', id: e.id, campos: { foraDoLote: JSON.stringify(fora) } });
  });
  return { mudancas: { eventos, matrizes: [...matrizes.values()] }, aprovadas, recusadas };
}

// Manejos gerais feitos (mais recentes primeiro), com a conferência resumida
export function listarManejosGerais(estado, ano) {
  return estado.eventos.filter(ehManejoGeral).filter((e) => !ano || String(e.data || '').slice(0, 4) === String(ano))
    .map((e) => conferencia(estado, e))
    .sort((a, b) => (b.data || '').localeCompare(a.data || '') || (b.manejo.createdAt || '').localeCompare(a.manejo.createdAt || ''));
}

// Conferência de um manejo: quem passou, quem faltou e quem veio de fora
export function conferencia(estado, e) {
  const fora = foraDoLoteDe(e);
  const idsFora = new Set(fora.map((f) => f.animal).filter(Boolean));
  const presentes = lista(e.presentes);
  const conferidos = presentes.filter((id) => !idsFora.has(id));
  const ausentes = lista(e.ausentes);
  const nomes = nomesDosAnimais(estado);
  const nome = (id) => nomes.get(id) || { brinco: '?', tipo: '' };
  return {
    id: e.id, data: e.data, lote: e.lote || '', descricao: e.descricao || '', responsavel: e.responsavel || '', manejo: e,
    aplicacoes: json(e.aplicacoes, []), observacoes: e.observacoes || '',
    esperados: conferidos.length + ausentes.length, conferidos: conferidos.map((id) => ({ id, ...nome(id) })).sort((a, b) => ordemBrinco(a.brinco, b.brinco)),
    faltando: ausentes.map((id) => ({ id, ...nome(id) })).sort((a, b) => ordemBrinco(a.brinco, b.brinco)),
    fora: fora.slice().sort((a, b) => ordemBrinco(a.brinco, b.brinco)),
  };
}

function nomesDosAnimais(estado) {
  const mapa = new Map(estado.matrizes.map((m) => [m.id, { brinco: String(m.brinco), tipo: m.categoria || 'Matriz' }]));
  estado.eventos.filter((e) => e.tipo === 'nascimento').forEach((n) => {
    mapa.set(`c:${n.id}`, { brinco: String(n.brincoBezerro ?? '').trim() || 's/ nº', tipo: n.sexo === 'Fêmea' ? 'Bezerra' : 'Bezerro' });
  });
  return mapa;
}

const textoMudar = (f) => (f.mudar === 'pendente' ? 'mudar de lote: esperando o proprietário' : f.mudar === 'aprovada' ? 'lote trocado (confirmado)' : f.mudar === 'recusada' ? 'continua no lote dela' : '');

// Relatório (PDF) da conferência de um manejo
export function relatorioConferencia(estado, manejoId) {
  const e = estado.eventos.find((x) => x.id === manejoId);
  if (!e) return { titulo: 'Manejo', resumo: [], secoes: [] };
  const c = conferencia(estado, e);
  const aps = c.aplicacoes.map((a) => [a.tipo, a.produto].filter(Boolean).join(' ')).join(', ');
  return {
    titulo: `Manejo ${formatarDataBR(c.data)} · lote ${c.lote}`,
    subtitulo: [c.descricao, aps ? `Produtos: ${aps}` : '', c.responsavel ? `Responsável: ${c.responsavel}` : '', c.manejo.manejoRef, c.observacoes ? `Obs.: ${c.observacoes}` : ''].filter(Boolean).join(' · '),
    resumo: [
      { rotulo: 'Esperados no lote', valor: c.esperados },
      { rotulo: 'Conferidos', valor: c.conferidos.length },
      { rotulo: 'Faltando', valor: c.faltando.length },
      { rotulo: 'De outro lote ou sem cadastro', valor: c.fora.length },
    ],
    secoes: [
      { titulo: 'Faltando (não passaram no curral)', colunas: [{ k: 'brinco', label: 'Brinco', mono: true }, { k: 'tipo', label: 'Animal' }], linhas: c.faltando },
      { titulo: 'De outro lote ou sem cadastro', colunas: [{ k: 'brinco', label: 'Brinco', mono: true }, { k: 'obs', label: 'Observação' }, { k: 'sit', label: 'Lote' }], linhas: c.fora.map((f) => ({ ...f, sit: textoMudar(f) })) },
      { titulo: 'Conferidos', colunas: [{ k: 'brinco', label: 'Brinco', mono: true }, { k: 'tipo', label: 'Animal' }], linhas: c.conferidos },
    ],
  };
}

// Relatório do ano: todos os manejos gerais
export function relatorioManejosGerais(estado, ano) {
  const l = listarManejosGerais(estado, ano);
  return {
    titulo: `Manejos gerais ${ano || ''}`.trim(),
    resumo: [
      { rotulo: 'Manejos', valor: l.length },
      { rotulo: 'Animais conferidos', valor: l.reduce((s, c) => s + c.conferidos.length, 0) },
      { rotulo: 'Faltas', valor: l.reduce((s, c) => s + c.faltando.length, 0) },
      { rotulo: 'De outro lote', valor: l.reduce((s, c) => s + c.fora.length, 0) },
    ],
    secoes: [{
      titulo: 'Manejos',
      colunas: [{ k: 'data', label: 'Data', mono: true }, { k: 'lote', label: 'Lote' }, { k: 'descricao', label: 'Manejo' }, { k: 'esp', label: 'Esperados', align: 'right', mono: true },
        { k: 'conf', label: 'Conferidos', align: 'right', mono: true }, { k: 'falt', label: 'Faltando', align: 'right', mono: true }, { k: 'faltam', label: 'Quem faltou' }, { k: 'fora', label: 'De fora', align: 'right', mono: true }],
      linhas: l.map((c) => ({
        data: formatarDataBR(c.data), lote: c.lote, descricao: c.descricao, esp: c.esperados, conf: c.conferidos.length, falt: c.faltando.length,
        faltam: c.faltando.map((x) => x.brinco).join(', '), fora: c.fora.length,
      })),
    }],
  };
}

// Animais que faltaram em mais de um manejo seguido do mesmo lote (atenção: pode ter sumido)
export function faltasRepetidas(estado, lote) {
  const l = listarManejosGerais(estado).filter((c) => mesmoLote(c.lote, lote)).slice(0, 3);
  if (l.length < 2) return [];
  const [a, b] = l;
  const emB = new Set(b.faltando.map((x) => x.id));
  return a.faltando.filter((x) => emB.has(x.id));
}

export const idadeDoManejo = (c, hoje) => (c.data ? diasEntre(c.data, hoje || todayISO()) : null);
