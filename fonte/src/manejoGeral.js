// manejoGeral.js (app 10.6): manejo geral do curral com conferência do lote.
// Pour-on no lombo, brinco mosquicida, vermífugo, carrapaticida, vacina ou só conferência: data, lote, o que foi feito,
// e a relação de animais do lote (começa DESMARCADA; marca quem passou). Animal que não é do lote entra mesmo assim,
// com uma observação. Mudar o lote desse animal só acontece quando o PROPRIETÁRIO confirma.
// 10.5: o brinco digitado é procurado em TUDO (matrizes, novilhas, crias, touros) e mostra a situação do animal na hora
// (cheia, vazia, previsão de parto, último parto, cria ao pé). Brinco que não existe entra do mesmo jeito, anotado como
// "não está no banco de dados nem em nenhum lote". Lote novo (sem animais ainda) também grava.
// 10.6: observação por brinco. Cada brinco (do lote, de fora ou sem cadastro) pode levar uma observação, gravada junto no manejo
// (dentro da coluna foraDoLote: nota, e notaOk quando o proprietário efetiva). Animal do lote com observação entra com doLote: true
// e não conta como "de fora". O proprietário vê a lista em "Observações para efetivar" e marca como efetivada.
// 10.7: o proprietário edita (editarManejoGeral, usa atualizarCampos) e exclui (excluirManejoGeral, ação excluirEventos do
// script v14, que guarda a cópia da linha na aba Excluidos) manejos gerais já gravados.
// Só regras (sem tela). A tela fica em telas/ManejoGeral.jsx.
import {
  todayISO, formatarDataBR, novoId, listarCrias, padronizarLote, mesmoLote, lotesExistentes, diasEntre,
  previsaoPartoInfo, ultimoPartoDe, numeroCriaUltimoParto, rotuloSituacao,
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
// A coluna foraDoLote guarda os animais de fora do lote e também os animais do lote que ganharam observação (doLote: true)
export const foraDoLoteDe = (e) => json(e && e.foraDoLote, []);
// Chave da observação de um brinco: o id do animal ou, sem cadastro, "b:<brinco>"
export const chaveNota = (x) => (x && x.animal) || `b:${String((x && x.brinco) ?? '').trim()}`;

// Lotes para escolher: os que existem no rebanho (com quantos animais)
export const lotesParaManejo = (estado) => lotesExistentes(estado.matrizes);

// Crias ao pé (mamando) cujas mães estão no lote
function criasAoPe(estado, lote, hoje) {
  const maes = new Map(estado.matrizes.filter((m) => ativa(m) && mesmoLote(m.lote, lote)).map((m) => [m.id, m]));
  return listarCrias(estado, hoje).filter((c) => c.ativa && c.situacao === 'mamando' && maes.has(c.matrizId));
}
export const temCriasAoPe = (estado, lote, hoje) => !!lote && criasAoPe(estado, lote, hoje).length > 0;

// ---------------------------------------------------------------- situação do animal (cheia, vazia, previsão de parto)
export const OBS_SEM_CADASTRO = 'Não está no banco de dados nem em nenhum lote';
const nDias = (n) => `${n} ${Math.abs(n) === 1 ? 'dia' : 'dias'}`;
const maiusc1 = (t) => t.charAt(0).toUpperCase() + t.slice(1);
// Brinco tem número e também letra e barra ("E5", "219/1413"): a comparação não liga para maiúscula e minúscula
const normBrinco = (x) => String(x ?? '').trim().toLowerCase();
const mesmoNumeroBrinco = (a, b) => {
  const x = normBrinco(a); const y = normBrinco(b);
  if (!x || !y) return false;
  return x === y || (/^\d+$/.test(x) && /^\d+$/.test(y) && Number(x) === Number(y));
};

// Índice para a busca (monta uma vez por mudança nos dados): crias com a mãe, crias mamando por mãe
export function indiceBusca(estado, hoje) {
  const crias = listarCrias(estado, hoje || todayISO());
  const mamandoPorMae = new Map();
  crias.filter((c) => c.situacao === 'mamando' && c.matrizId).forEach((c) => {
    if (!mamandoPorMae.has(c.matrizId)) mamandoPorMae.set(c.matrizId, []);
    mamandoPorMae.get(c.matrizId).push(c);
  });
  return { crias, mamandoPorMae };
}

// Situação de uma matriz no dia do manejo.
// Volta { texto (frase completa), curto (linha da lista), nivel: 'good'|'soon'|'late'|'mut', previsao, dias, ultimoParto, diasDesdeParto }
export function situacaoMatriz(estado, m, hoje, indice) {
  hoje = hoje || todayISO();
  const st = String(m.status || '');
  const ult = ultimoPartoDe(m.id, estado.eventos);
  const base = { status: st, previsao: '', dias: null, ultimoParto: ult, diasDesdeParto: ult ? diasEntre(ult, hoje) : null };
  const cria = indice && (indice.mamandoPorMae.get(m.id) || [])[0];
  const comCria = cria ? ` · cria ${cria.brinco || 's/ nº'}` : '';
  const recria = m.destino && m.status !== 'Vendida' && m.status !== 'Morta' ? ` (recria: ${m.destino === 'Matriz' ? 'virar matriz' : m.destino.toLowerCase()})` : '';
  if (st === 'Vendida' || st === 'Morta') {
    const t = st === 'Morta' ? 'MORTA' : 'VENDIDA';
    return { ...base, texto: `${t} (consta assim no cadastro)`, curto: t.toLowerCase(), nivel: 'late' };
  }
  if (st === 'Cheia') {
    const info = previsaoPartoInfo(m.id, estado.eventos);
    if (info && info.data) {
      const dias = diasEntre(hoje, info.data);
      const dt = formatarDataBR(info.data);
      const r = { ...base, previsao: info.data, dias };
      if (dias < 0) return { ...r, texto: `Cheia${recria}, parto previsto para ${dt}: já passou há ${nDias(-dias)}`, curto: `cheia · parto atrasado ${-dias} d (${dt})${comCria}`, nivel: 'late' };
      if (dias === 0) return { ...r, texto: `Cheia${recria}, parto previsto para HOJE (${dt})`, curto: `cheia · parto previsto hoje${comCria}`, nivel: 'late' };
      return { ...r, texto: `Cheia${recria}, parto previsto para ${dt} (em ${nDias(dias)})`, curto: `cheia · parto ${dt} (em ${dias} d)${comCria}`, nivel: dias <= 15 ? 'soon' : 'good' };
    }
    if (info && info.origem === 'toque-sem-dg') return { ...base, texto: `Cheia${recria}: toque de ${formatarDataBR(info.base)} sem os dias de gestação, então não tem data de parto`, curto: `cheia · sem data de parto${comCria}`, nivel: 'soon' };
    return { ...base, texto: `Cheia${recria}, sem previsão de parto (nenhum toque nem IATF depois do último parto)`, curto: `cheia · sem previsão de parto${comCria}`, nivel: 'soon' };
  }
  if (st === 'Vazia') {
    if (ult) return { ...base, texto: `Vazia${recria}, último parto em ${formatarDataBR(ult)} (há ${nDias(base.diasDesdeParto)})`, curto: `vazia · últ. parto ${formatarDataBR(ult)}${comCria}`, nivel: 'mut' };
    return { ...base, texto: `Vazia${recria}, sem parto lançado`, curto: `vazia · sem parto lançado${comCria}`, nivel: 'mut' };
  }
  if (st === 'Descarte') return { ...base, texto: 'Descarte', curto: 'descarte', nivel: 'late' };
  return { ...base, texto: maiusc1(st || 'Sem situação no cadastro') + recria, curto: (st || 'sem situação').toLowerCase(), nivel: 'mut' };
}

// Relação de animais do lote. Matriz: id da matriz; cria: "c:<id do nascimento>" (o mesmo das vacinas); touro: "t:<id>".
export function animaisDoLote(estado, lote, opcoes) {
  const op = opcoes || {};
  if (!lote) return [];
  const hoje = op.hoje || todayISO();
  const indice = op.indice || indiceBusca(estado, hoje);
  const matrizes = estado.matrizes.filter((m) => ativa(m) && mesmoLote(m.lote, lote)).map((m) => {
    const s = situacaoMatriz(estado, m, hoje, indice);
    return { id: m.id, brinco: String(m.brinco), tipo: 'matriz', linha1: m.categoria || 'Matriz', linha2: [s.curto, m.raca].filter(Boolean).join(' · '), nivel: s.nivel };
  });
  const touros = (estado.touros || []).filter((t) => t.tipo === 'Touro vivo' && t.situacao !== 'Inativo' && String(t.brinco || '').trim() && mesmoLote(t.lote, lote)).map((t) => ({
    id: `t:${t.id}`, brinco: String(t.brinco).trim(), tipo: 'touro', linha1: 'Touro', linha2: [t.nome, t.raca].filter(Boolean).join(' · '), nivel: 'mut',
  }));
  const crias = op.incluirCrias ? criasAoPe(estado, lote, hoje).map((c) => ({
    id: `c:${c.id}`, brinco: c.brinco || 's/ nº', tipo: 'cria', linha1: c.sexo === 'Fêmea' ? 'Bezerra ao pé' : 'Bezerro ao pé', linha2: `mãe ${c.maeBrinco || '?'}`, nivel: 'mut',
  })) : [];
  const todos = [...matrizes, ...touros, ...crias];
  // edição de manejo antigo: quem foi anotado naquele dia continua na lista, mesmo que hoje já não seja do lote
  if (op.extras && op.extras.length) {
    const tem = new Set(todos.map((x) => x.id));
    const nomes = nomesDosAnimais(estado);
    op.extras.filter((id) => !tem.has(id)).forEach((id) => {
      const n = nomes.get(id); if (!n) return;
      todos.push({ id, brinco: n.brinco, tipo: id.startsWith('c:') ? 'cria' : id.startsWith('t:') ? 'touro' : 'matriz', linha1: n.tipo, linha2: 'anotado neste manejo (hoje não está na lista do lote)', nivel: 'mut' });
    });
  }
  return todos.sort((a, b) => ordemBrinco(a.brinco, b.brinco));
}

// ---------------------------------------------------------------- busca do brinco (matrizes, novilhas, crias, touros)
// Uma "ficha" por animal que tem aquele brinco. Cada ficha já diz como ele se encaixa no lote do manejo:
//   naLista = está na relação do lote (é só marcar); obs = o que anotar quando entra de fora; mudar = 'pendente' quando dá para trocar o lote.
// op: { indice (de indiceBusca), esperados: Set com os ids da relação do lote }
export function buscarAnimais(estado, lote, brinco, hoje, op) {
  const b = String(brinco ?? '').trim();
  if (!b) return [];
  hoje = hoje || todayISO();
  const o = op || {};
  const indice = o.indice || indiceBusca(estado, hoje);
  const naRel = (id) => !!(o.esperados && o.esperados.has(id));
  const acha = (porBrinco) => {
    const exatos = porBrinco((x) => normBrinco(x) === normBrinco(b));
    return exatos.length || !/^\d+$/.test(b) ? exatos : porBrinco((x) => mesmoNumeroBrinco(x, b));
  };
  const loteDe = (l) => padronizarLote(l, estado.matrizes);
  const fichas = [];

  acha((ok) => estado.matrizes.filter((m) => ok(m.brinco))).forEach((m) => {
    const sit = situacaoMatriz(estado, m, hoje, indice);
    const atual = loteDe(m.lote);
    const ult = sit.ultimoParto ? `Último parto: ${formatarDataBR(sit.ultimoParto)}${numeroCriaUltimoParto(m.id, estado.eventos) ? ` (cria ${numeroCriaUltimoParto(m.id, estado.eventos)})` : ''}` : '';
    const cria = (indice.mamandoPorMae.get(m.id) || [])[0];
    const linhas = [
      ult && m.status === 'Cheia' ? ult : '',
      cria ? `Cria ao pé: ${cria.brinco || 's/ nº'} (${cria.sexo === 'Fêmea' ? 'fêmea' : 'macho'}, nasceu em ${formatarDataBR(cria.nascData)})` : '',
      m.raca ? `Raça ${m.raca}` : '',
    ].filter(Boolean);
    const f = { chave: `m:${m.id}`, animal: m.id, brinco: String(m.brinco), tipo: 'matriz', titulo: m.categoria || 'Matriz', ativo: ativa(m), situacao: sit, loteAtual: atual, linhas, naLista: naRel(m.id), obs: '', mudar: '' };
    if (!ativa(m)) f.obs = `Consta como ${m.status === 'Morta' ? 'MORTA' : 'VENDIDA'} no cadastro`;
    else if (!f.naLista) {
      if (mesmoLote(m.lote, lote)) { f.naLista = true; } // do lote, mas fora da relação (não deveria acontecer)
      else { f.obs = `Não é do lote ${lote} (${atual ? `está em ${atual}` : 'sem lote no cadastro'})`; f.mudar = 'pendente'; }
    }
    fichas.push(f);
  });

  acha((ok) => indice.crias.filter((c) => c.brinco && ok(c.brinco) && !c.novilha)).forEach((c) => {
    const mae = estado.matrizes.find((m) => m.id === c.matrizId);
    const loteMae = mae ? loteDe(mae.lote) : '';
    const rot = rotuloSituacao(c);
    const sit = { texto: `${rot}${c.nascData ? `, nasceu em ${formatarDataBR(c.nascData)}` : ''}`, curto: rot.toLowerCase(), nivel: c.ativa ? 'good' : 'late', status: rot };
    const linhas = [
      `Mãe: ${c.maeBrinco || '?'}${loteMae ? ` (lote ${loteMae})` : ''}${c.orfa ? ' · órfã (a mãe morreu)' : ''}`,
      c.pesoAtual ? `Último peso: ${String(c.pesoAtual).replace('.', ',')} kg em ${formatarDataBR(c.pesoData)}` : '',
    ].filter(Boolean);
    const f = { chave: `c:${c.id}`, animal: `c:${c.id}`, brinco: c.brinco, tipo: 'cria', titulo: c.sexo === 'Fêmea' ? 'Bezerra' : 'Bezerro', ativo: c.ativa, situacao: sit, loteAtual: loteMae, linhas, naLista: naRel(`c:${c.id}`), obs: '', mudar: '' };
    if (!c.ativa) f.obs = `Consta como ${c.situacao === 'morto' ? (c.sexo === 'Fêmea' ? 'MORTA' : 'MORTO') : (c.sexo === 'Fêmea' ? 'VENDIDA' : 'VENDIDO')} no cadastro`;
    else if (!f.naLista) {
      if (c.situacao === 'mamando' && mae && mesmoLote(mae.lote, lote)) f.obs = `Cria ao pé deste lote (mãe ${c.maeBrinco || '?'})`;
      else if (c.situacao === 'mamando') f.obs = `Cria de outro lote (mãe ${c.maeBrinco || '?'}${loteMae ? ` em ${loteMae}` : ''})`;
      else f.obs = `${rot} (cria da mãe ${c.maeBrinco || '?'}), sem lote no cadastro`;
    }
    fichas.push(f);
  });

  acha((ok) => (estado.touros || []).filter((t) => t.tipo === 'Touro vivo' && ok(t.brinco))).forEach((t) => {
    const inativo = t.situacao === 'Inativo';
    const atual = loteDe(t.lote);
    const sit = { texto: inativo ? 'Touro inativo' : 'Touro vivo', curto: 'touro', nivel: inativo ? 'late' : 'mut', status: 'Touro' };
    const f = { chave: `t:${t.id}`, animal: `t:${t.id}`, brinco: String(t.brinco).trim(), tipo: 'touro', titulo: `Touro ${t.nome || ''}`.trim(), ativo: !inativo, situacao: sit, loteAtual: atual, linhas: [t.raca ? `Raça ${t.raca}` : ''].filter(Boolean), naLista: naRel(`t:${t.id}`), obs: '', mudar: '' };
    if (inativo) f.obs = 'Touro marcado como inativo no cadastro';
    else if (!f.naLista) f.obs = mesmoLote(t.lote, lote) ? `Touro do lote ${lote}` : `Touro de outro lote (${atual ? `está em ${atual}` : 'sem lote no cadastro'})`;
    fichas.push(f);
  });

  // ativos primeiro, depois os que constam como vendidos/mortos
  return fichas.sort((a, z) => Number(z.ativo) - Number(a.ativo));
}

// Brinco que não existe em lugar nenhum: entra do mesmo jeito, anotado como "sem cadastro"
export function fichaSemCadastro(brinco) {
  const b = String(brinco ?? '').trim();
  return { chave: `x:${b}`, animal: '', brinco: b, tipo: '', titulo: 'Sem cadastro', ativo: true, situacao: { texto: 'Sem cadastro', curto: 'sem cadastro', nivel: 'late', status: 'Sem cadastro' }, loteAtual: '', linhas: [], naLista: false, obs: OBS_SEM_CADASTRO, mudar: '', semCadastro: true };
}

// Ficha -> item da lista "de fora" (é isso que vai gravado no manejo)
export function itemFora(ficha) {
  const x = { animal: ficha.animal || '', brinco: ficha.brinco, tipo: ficha.tipo || '', loteAtual: ficha.loteAtual || '', obs: ficha.obs || '', mudar: ficha.mudar || '' };
  if (ficha.semCadastro) x.semCadastro = true;
  else if (ficha.situacao && ficha.situacao.texto) x.sit = ficha.situacao.texto;
  return x;
}

// Brinco digitado que não está na relação do lote: entra com a observação do porquê (primeiro animal achado).
// Volta { animal, brinco, tipo, loteAtual, obs, mudar, sit? } — mudar = 'pendente' quando dá para trocar o lote da matriz.
export function animalForaDoLote(estado, lote, brinco, hoje) {
  const b = String(brinco ?? '').trim();
  if (!b) return null;
  const f = buscarAnimais(estado, lote, b, hoje || todayISO())[0];
  if (!f) return itemFora(fichaSemCadastro(b));
  const x = itemFora(f);
  if (f.naLista) { x.doLote = true; x.obs = ''; x.mudar = ''; }
  return x;
}

// Os brincos que o usuário incluiu na mão (incluidos: [{ brinco, animal }]) viram itens "de fora" já conferidos com o lote
// de agora. Se o lote mudou e o animal já é dele, ele deixa de ser "de fora" e passa a contar como marcado.
// Volta { fora: [itens], marcadosExtra: [ids], fichas: [ficha por inclusão] }
export function resolverInclusoes(estado, lote, incluidos, hoje, op) {
  const o = op || {};
  const indice = o.indice || indiceBusca(estado, hoje);
  const fora = []; const marcadosExtra = []; const fichas = [];
  (incluidos || []).forEach((inc) => {
    const b = String(inc.brinco ?? '').trim();
    if (!b) return;
    if (inc.fixo) { // item que já estava gravado no manejo (edição): fica como está, com a decisão de lote que já tinha
      fora.push({ ...inc.fixo, manter: true });
      if (inc.fixo.animal && o.esperados && o.esperados.has(inc.fixo.animal)) marcadosExtra.push(inc.fixo.animal);
      return;
    }
    const f = inc.animal ? buscarAnimais(estado, lote, b, hoje, { indice, esperados: o.esperados }).find((x) => x.animal === inc.animal) : null;
    const ficha = f || fichaSemCadastro(b);
    fichas.push(ficha);
    if (ficha.naLista && ficha.animal) { marcadosExtra.push(ficha.animal); return; }
    fora.push(itemFora(ficha));
  });
  return { fora, marcadosExtra, fichas };
}

// Grava o manejo geral.
// form: { data, lote, descricao, responsavel, aplicacoes, esperados: [id], marcados: [id], fora: [itens de animalForaDoLote],
//         observacoes, incluirCrias, dono (proprietário gravando), aprovar: [id de matriz] (só quando dono),
//         notas: { [id do animal ou "b:<brinco>"]: observação daquele brinco } }
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
  const notas = form.notas || {};
  const anterior = form.anterior || []; // edição: itens que já estavam gravados (para manter a data de efetivação da observação)
  const efetivadaAntes = (chave, nota) => { const p = anterior.find((a) => a.nota && a.notaOk && chaveNota(a) === chave); return p && p.nota === nota ? p.notaOk : ''; };
  const aprovadasAgora = new Set(); // só as mudanças de lote decididas nesta gravação mexem no lote da matriz
  const foraFinal = fora.map((f) => {
    let x;
    if (f.manter) { const { manter, nota: _n, notaOk: _o, ...resto } = f; x = resto; } // edição: o que já estava gravado fica como estava
    else {
      x = { animal: f.animal || '', brinco: String(f.brinco), tipo: f.tipo || '', loteAtual: f.loteAtual || '', obs: f.obs || '', mudar: f.mudar || '' };
      if (f.sit) x.sit = String(f.sit); // situação do animal no dia do manejo (cheia, vazia, previsão de parto...)
      if (f.semCadastro || !f.animal) { x.semCadastro = true; if (!x.obs) x.obs = OBS_SEM_CADASTRO; }
    }
    const chave = chaveNota(x);
    const nota = String(notas[chave] || '').trim();
    if (nota) { x.nota = nota; const ok = efetivadaAntes(chave, nota); if (ok) x.notaOk = ok; }
    if (x.mudar === 'pendente' && form.dono) {
      if (f.manter && !aprovar.has(x.animal)) return x; // pedido antigo que o proprietário não decidiu agora continua pendente
      x.mudar = aprovar.has(x.animal) ? 'aprovada' : 'recusada';
      x.decididoEm = now.slice(0, 10);
      if (x.mudar === 'aprovada') aprovadasAgora.add(x.animal);
    }
    return x;
  });
  // animal do lote que ganhou observação (passou ou não): entra na lista com doLote: true (não conta como "de fora")
  const nomes = nomesDosAnimais(estado);
  const hojeRef = op.hoje || todayISO();
  const jaNaLista = new Set(foraFinal.map((f) => f.animal).filter(Boolean)); // a observação desses já está no próprio item "de fora"
  const comNota = esperados.filter((id) => !jaNaLista.has(id) && String(notas[id] || '').trim()).map((id) => {
    const n = nomes.get(id) || { brinco: '?' };
    const m = estado.matrizes.find((x) => x.id === id);
    const x = { animal: id, brinco: String(n.brinco), tipo: id.startsWith('c:') ? 'cria' : id.startsWith('t:') ? 'touro' : 'matriz', loteAtual: lote, obs: '', mudar: '', doLote: true };
    if (m) x.sit = situacaoMatriz(estado, m, hojeRef).texto;
    x.nota = String(notas[id]).trim();
    const ok = efetivadaAntes(id, x.nota); if (ok) x.notaOk = ok;
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
    lote, foraDoLote: JSON.stringify([...foraFinal, ...comNota]),
  };
  const matrizesAlteradas = foraFinal.filter((f) => f.mudar === 'aprovada' && aprovadasAgora.has(f.animal))
    .map((f) => estado.matrizes.find((m) => m.id === f.animal)).filter(Boolean)
    .map((m) => ({ ...m, lote }));
  const porId = new Map(matrizesAlteradas.map((m) => [m.id, m]));
  return {
    estado: { ...estado, eventos: [...estado.eventos, manejo], matrizes: estado.matrizes.map((m) => porId.get(m.id) || m) },
    eventosNovos: [manejo], matrizesAlteradas, erros: [],
  };
}

// ---------------------------------------------------------------- editar e excluir manejo já gravado (só o proprietário)
// Estado do formulário a partir de um manejo gravado. Os brincos de fora entram como "fixos": ficam como foram gravados
// (inclusive a decisão sobre mudar de lote) até o proprietário tirar. lote vem como foi gravado; a tela acerta o seletor.
export function formDoManejo(estado, e) {
  const anterior = foraDoLoteDe(e);
  const notas = {};
  anterior.forEach((f) => { if (f.nota) notas[chaveNota(f)] = f.nota; });
  return {
    editId: e.id, data: String(e.data || '').slice(0, 10), lote: e.lote || '', descricao: e.descricao || '', responsavel: e.responsavel || '',
    aplicacoes: json(e.aplicacoes, []), incluirCrias: String(e.manejoRef || '').includes('crias ao pé'),
    marcados: lista(e.presentes), incluidos: anterior.filter((f) => !f.doLote).map((f) => ({ brinco: String(f.brinco), animal: f.animal || '', fixo: f })),
    aprovar: [], notas, obs: e.observacoes || '',
  };
}
// Ids de animais anotados no manejo (presentes e ausentes que não são os "de fora"): a lista da edição precisa deles
export const idsDoManejo = (e) => {
  const deFora = new Set(foraDoLoteDe(e).filter((f) => !f.doLote && f.animal).map((f) => f.animal));
  return [...new Set([...lista(e && e.presentes), ...lista(e && e.ausentes)])].filter((id) => !deFora.has(id));
};

const canon = (v) => (Array.isArray(v) ? `[${v.map(canon).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${k}:${canon(v[k])}`).join(',')}}` : JSON.stringify(v ?? ''));
const CAMPOS_MANEJO = ['data', 'lote', 'descricao', 'responsavel', 'aplicacoes', 'presentes', 'ausentes', 'observacoes', 'manejoRef', 'foraDoLote'];
const mesmoCampo = (k, a, b) => {
  if (k === 'presentes' || k === 'ausentes') return lista(a).sort().join(',') === lista(b).sort().join(',');
  if (k === 'aplicacoes' || k === 'foraDoLote') return canon(json(a, [])) === canon(json(b, []));
  if (k === 'data') return String(a || '').slice(0, 10) === String(b || '').slice(0, 10);
  return String(a ?? '') === String(b ?? '');
};

// Grava as alterações de um manejo geral (mesmo form do aplicarManejoGeral).
// opcoes.dono (proprietário): muda tudo (data, lote, manejo, produtos, quem passou, brincos de fora, observações) e decide mudança de lote.
// Sem dono (funcionário): só ACRESCENTA: marca mais animais, inclui mais brincos (de fora e sem cadastro) e escreve ou corrige
// observações. O resto fica como estava gravado e nada do que já foi gravado sai.
// Volta { erros } ou { erros: [], estado, evento, mudancas: { eventos: [{tipo:'manejo', id, campos}], matrizes }, mudou: [campos] }
export function editarManejoGeral(estado, id, form, opcoes) {
  const e = estado.eventos.find((x) => x.id === id && ehManejoGeral(x));
  if (!e) return { erros: ['Não achei esse manejo.'] };
  const dono = !!(opcoes && opcoes.dono);
  const sem = { ...estado, eventos: estado.eventos.filter((x) => x.id !== id) };
  const gravados = foraDoLoteDe(e);
  let f2 = { ...form, dono, anterior: gravados };
  if (!dono) {
    const mesmo = (a, b) => String(a.brinco) === String(b.brinco) && (a.animal || '') === (b.animal || '');
    const esperados = new Set(form.esperados || []);
    const forasGravados = gravados.filter((f) => !f.doLote).map((f) => ({ ...f, manter: true }));
    f2 = {
      ...f2, data: e.data, lote: e.lote, descricao: e.descricao, responsavel: e.responsavel, aplicacoes: json(e.aplicacoes, []), observacoes: e.observacoes || '',
      incluirCrias: String(e.manejoRef || '').includes('crias ao pé'), aprovar: [],
      marcados: [...new Set([...(form.marcados || []), ...lista(e.presentes).filter((x) => esperados.has(x))])],
      fora: [...forasGravados, ...(form.fora || []).filter((x) => !x.manter && !forasGravados.some((g) => mesmo(g, x)))],
    };
  }
  const r = aplicarManejoGeral(sem, f2, { ...(opcoes || {}), id });
  if (r.erros && r.erros.length) return { erros: r.erros };
  const novo = { ...e, ...r.eventosNovos[0], id: e.id, createdAt: e.createdAt, tipo: 'manejo', etapa: ETAPA_GERAL, protocoloId: e.protocoloId || '' };
  if (!dono) novo.lote = e.lote; // o nome do lote não é refeito por quem só acrescenta
  const mudou = CAMPOS_MANEJO.filter((k) => !mesmoCampo(k, novo[k], e[k]));
  if (!mudou.length && !r.matrizesAlteradas.length) return { erros: ['Nada foi alterado.'] };
  const campos = {}; mudou.forEach((k) => { campos[k] = novo[k]; });
  const porId = new Map(r.matrizesAlteradas.map((m) => [m.id, m]));
  return {
    erros: [], evento: novo, mudou,
    estado: { ...estado, eventos: estado.eventos.map((x) => (x.id === id ? novo : x)), matrizes: estado.matrizes.map((m) => porId.get(m.id) || m) },
    mudancas: { eventos: mudou.length ? [{ tipo: 'manejo', id, campos }] : [], matrizes: r.matrizesAlteradas, excluir: [] },
  };
}

// O que acontece se este manejo for excluído (para o aviso antes de confirmar)
export function resumoExclusao(estado, id) {
  const e = estado.eventos.find((x) => x.id === id && ehManejoGeral(x));
  if (!e) return null;
  const itens = foraDoLoteDe(e);
  return {
    data: e.data, lote: e.lote || '', descricao: e.descricao || '', responsavel: e.responsavel || '',
    animais: idsDoManejo(e).length + itens.filter((f) => !f.doLote && !f.animal).length,
    aprovadas: itens.filter((f) => f.mudar === 'aprovada').length,
    pendentes: itens.filter((f) => f.mudar === 'pendente').length,
    notasPendentes: itens.filter((f) => f.nota && !f.notaOk).length,
  };
}

// Exclui o manejo (some da lista e da planilha; o script v14 guarda uma cópia na aba Excluidos). Só o proprietário.
// Mudança de lote que já foi confirmada NÃO volta: a matriz continua no lote novo.
export function excluirManejoGeral(estado, id) {
  const resumo = resumoExclusao(estado, id);
  if (!resumo) return { erro: 'Não achei esse manejo.' };
  return {
    resumo,
    estado: { ...estado, eventos: estado.eventos.filter((x) => x.id !== id) },
    mudancas: { eventos: [], matrizes: [], excluir: [{ tipo: 'manejo', id }] },
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
  const todos = foraDoLoteDe(e);
  const fora = todos.filter((f) => !f.doLote);
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
    semCadastro: fora.filter(semCad).sort((a, b) => ordemBrinco(a.brinco, b.brinco)),
    notas: todos.map((f, idx) => ({ ...f, idx })).filter((f) => f.nota).sort((a, b) => ordemBrinco(a.brinco, b.brinco)),
  };
}

// Observações por brinco que o proprietário ainda vai efetivar (cadastrar, mudar de lote, corrigir...)
export function pendenciasNotas(estado) {
  const out = [];
  estado.eventos.filter(ehManejoGeral).forEach((e) => {
    foraDoLoteDe(e).forEach((f, idx) => {
      if (!f.nota || f.notaOk) return;
      out.push({ manejoId: e.id, idx, data: e.data, lote: e.lote || '', descricao: e.descricao || '', responsavel: e.responsavel || '', animal: f.animal || '', brinco: f.brinco, tipo: f.tipo || '', sit: f.sit || '', obs: f.obs || '', semCadastro: !f.doLote && semCad(f), nota: f.nota });
    });
  });
  return out.sort((a, b) => (b.data || '').localeCompare(a.data || '') || ordemBrinco(a.brinco, b.brinco));
}

// Proprietário marca observações como efetivadas (ou desfaz). decisoes: [{ manejoId, idx, feito }]
// Volta { mudancas: { eventos: [{tipo:'manejo', id, campos:{foraDoLote}}], matrizes: [] }, n } (mesmo formato de decidirLote)
export function efetivarNotas(estado, decisoes, opcoes) {
  const hoje = ((opcoes && opcoes.now) || new Date().toISOString()).slice(0, 10);
  const porManejo = new Map();
  (decisoes || []).forEach((d) => { if (!porManejo.has(d.manejoId)) porManejo.set(d.manejoId, new Map()); porManejo.get(d.manejoId).set(d.idx, !!d.feito); });
  const eventos = []; let n = 0;
  porManejo.forEach((dec, manejoId) => {
    const e = estado.eventos.find((x) => x.id === manejoId && ehManejoGeral(x));
    if (!e) return;
    const lista = foraDoLoteDe(e).map((f, idx) => {
      if (!f.nota || !dec.has(idx)) return f;
      n++;
      const { notaOk, ...resto } = f;
      return dec.get(idx) ? { ...resto, notaOk: hoje } : resto;
    });
    eventos.push({ tipo: 'manejo', id: e.id, campos: { foraDoLote: JSON.stringify(lista) } });
  });
  return { mudancas: { eventos, matrizes: [] }, n };
}

function nomesDosAnimais(estado) {
  const mapa = new Map(estado.matrizes.map((m) => [m.id, { brinco: String(m.brinco), tipo: m.categoria || 'Matriz' }]));
  estado.eventos.filter((e) => e.tipo === 'nascimento').forEach((n) => {
    mapa.set(`c:${n.id}`, { brinco: String(n.brincoBezerro ?? '').trim() || 's/ nº', tipo: n.sexo === 'Fêmea' ? 'Bezerra' : 'Bezerro' });
  });
  (estado.touros || []).forEach((t) => { mapa.set(`t:${t.id}`, { brinco: String(t.brinco ?? '').trim() || '?', tipo: 'Touro' }); });
  return mapa;
}

// Sem cadastro = brinco que não está no banco (os manejos antigos guardavam isso como animal vazio)
export const semCad = (f) => !!f.semCadastro || !f.animal;
const NOME_TIPO = { matriz: 'Matriz', cria: 'Cria', touro: 'Touro', '': 'Sem cadastro' };
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
      { rotulo: 'De outro lote', valor: c.fora.length - c.semCadastro.length },
      { rotulo: 'Sem cadastro', valor: c.semCadastro.length },
      ...(c.notas.length ? [{ rotulo: 'Observações', valor: c.notas.length }] : []),
    ],
    secoes: [
      { titulo: 'Faltando (não passaram no curral)', colunas: [{ k: 'brinco', label: 'Brinco', mono: true }, { k: 'tipo', label: 'Animal' }], linhas: c.faltando },
      {
        titulo: 'De outro lote (passaram no curral)',
        colunas: [{ k: 'brinco', label: 'Brinco', mono: true }, { k: 'animalSit', label: 'Animal e situação' }, { k: 'obs', label: 'Observação' }, { k: 'sit', label: 'Lote' }],
        linhas: c.fora.filter((f) => !semCad(f)).map((f) => ({ ...f, animalSit: [NOME_TIPO[f.tipo] || '', f.sit].filter(Boolean).join(' · '), sit: textoMudar(f) })),
      },
      { titulo: 'Sem cadastro (não estão no banco de dados nem em nenhum lote)', colunas: [{ k: 'brinco', label: 'Brinco', mono: true }, { k: 'obs', label: 'Observação' }], linhas: c.semCadastro },
      {
        titulo: 'Observações por brinco',
        colunas: [{ k: 'brinco', label: 'Brinco', mono: true }, { k: 'nota', label: 'Observação', quebra: true }, { k: 'animalSit', label: 'Animal e situação', quebra: true }, { k: 'efet', label: 'Efetivada' }],
        linhas: c.notas.map((f) => ({ ...f, animalSit: f.semCadastro || !f.animal ? 'Sem cadastro' : [NOME_TIPO[f.tipo] || '', f.sit].filter(Boolean).join(' · '), efet: f.notaOk ? `sim, ${formatarDataBR(f.notaOk)}` : 'pendente' })),
      },
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
