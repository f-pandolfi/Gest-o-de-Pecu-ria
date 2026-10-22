// manejo.js (app 10): protocolos de IATF e de monta, manejos de curral, toque geral, vacinas e touros.
// Só regras (sem tela). As telas ficam em telas/Manejo*.jsx, telas/Toque.jsx e telas/Touros.jsx.
import {
  addDias, diasEntre, todayISO, formatarDataBR, ultimoPartoDe, previsaoPartoInfo, noPlantel, aplicarLancamento, jaExiste,
  novoId, acharMatrizPorBrinco, listarCrias, nomeTouroEvento, PERIODO_GESTACAO_DIAS, mapaBrincos, addMeses, idadeMesesDias, anoDe, chavePesagem, ehSemBrinco,
} from './logica.js';

// ---------------------------------------------------------------- listas
export const TIPOS_APLICACAO = ['Vacina reprodutiva', 'Reforço Lepto', 'Vermífugo', 'Fortificante', 'Estimulante', 'Brucelose', 'Hormônio', 'Pour-on', 'Brinco mosquicida', 'Carrapaticida', 'Outra'];
export const RESULTADOS_TOQUE = ['Cheia', 'Vazia', 'Descarte'];
export const MOTIVOS_DESCARTE = ['Vazia repetida', 'Idade', 'Problema de úbere', 'Problema de casco', 'Baixa produção', 'Doença', 'Outro'];
export const TIPOS_TOURO = ['Sêmen', 'Touro vivo'];
export const TIPOS_SEMEN = ['Convencional', 'Sexado fêmea', 'Sexado macho'];
export const ORIGENS_TOURO = ['Comprado', 'Nascido na fazenda', 'Emprestado'];
export const DIAS_MIN_POS_PARTO_PADRAO = 35;
export const DIAS_REPASSE_DEPOIS_IA = 17;
export const DIAS_MONTA_PADRAO = 90;

// Modelos de manejo da IATF (o dono ajusta dias, descrição e medicamentos na hora de criar o protocolo)
export const MODELOS_IATF = {
  '3 manejos': [
    { id: 'D0', dias: 0, descricao: 'Colocar o implante de progesterona e aplicar o estradiol', medicamentos: 'Implante, benzoato de estradiol' },
    { id: 'D8', dias: 8, descricao: 'Retirar o implante e aplicar os hormônios', medicamentos: 'eCG, prostaglandina, cipionato de estradiol' },
    { id: 'D10', dias: 10, descricao: 'Inseminação', medicamentos: '', ia: true },
  ],
  '4 manejos': [
    { id: 'D0', dias: 0, descricao: 'Colocar o implante de progesterona e aplicar o estradiol', medicamentos: 'Implante, benzoato de estradiol' },
    { id: 'D7', dias: 7, descricao: 'Aplicar prostaglandina', medicamentos: 'Prostaglandina' },
    { id: 'D9', dias: 9, descricao: 'Retirar o implante e aplicar os hormônios', medicamentos: 'eCG, cipionato de estradiol' },
    { id: 'D11', dias: 11, descricao: 'Inseminação', medicamentos: '', ia: true },
  ],
};
export const MANEJO_ENTRADA_MONTA = { id: 'ENTRADA', dias: 0, descricao: 'Entrada no lote dos touros', medicamentos: 'Vacina reprodutiva, estimulante' };

// Calendário de vacinas padrão (o dono muda na tela Vacinas; fica guardado na aba Config da planilha)
export const CALENDARIO_PADRAO = [
  { id: 'reprodutiva', nome: 'Vacina reprodutiva', tipo: 'ciclo', publico: 'matrizes', ativo: true },
  { id: 'lepto', nome: 'Reforço Lepto', tipo: 'prenhez', meses: 6, publico: 'cheias', ativo: true },
  { id: 'brucelose', nome: 'Brucelose', tipo: 'idade', publico: 'bezerras', idadeMin: 3, idadeMax: 8, unica: true, ativo: true },
];

// ---------------------------------------------------------------- utilidades
const lista = (v) => (Array.isArray(v) ? v.map(String) : String(v ?? '').split(',').map((x) => x.trim()).filter(Boolean));
const json = (v, padrao) => { if (Array.isArray(v) || (v && typeof v === 'object')) return v; try { const r = JSON.parse(v); return r ?? padrao; } catch (e) { return padrao; } };
const num = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isNaN(n) ? null : n; };
const ordemBrinco = (a, b) => String(a).localeCompare(String(b), 'pt-BR', { numeric: true });

// ---------------------------------------------------------------- touros e sêmen
export function normalizarTouro(t) {
  const tipo = t.tipo || (t.doses || t.custoDose || t.partida ? 'Sêmen' : '');
  return { ...t, tipo, situacao: t.situacao || 'Ativo' };
}
export function estoqueSemen(t, eventos) {
  const usadas = eventos.filter((e) => e.tipo === 'iatf' && e.touroId === t.id).length;
  const compradas = parseInt(t.doses, 10) || 0;
  const ajuste = parseInt(t.ajusteDoses, 10) || 0;
  return { compradas, usadas, ajuste, restantes: compradas + ajuste - usadas };
}
export function andrologicoVencido(t, hoje) {
  if (t.tipo !== 'Touro vivo') return false;
  if (!t.andrologicoData) return true;
  return diasEntre(t.andrologicoData, hoje || todayISO()) > 365;
}
export const semensDisponiveis = (estado) => estado.touros.filter((t) => t.tipo !== 'Touro vivo' && t.situacao !== 'Inativo');
export const tourosVivos = (estado) => estado.touros.filter((t) => t.tipo === 'Touro vivo' && t.situacao !== 'Inativo');
export const nomeTouro = (estado, id) => { const t = estado.touros.find((x) => x.id === id); return t ? t.nome : ''; };

export function validarTouro(t) {
  const erros = [];
  if (!String(t.nome || '').trim()) erros.push('Falta o nome.');
  if (!t.tipo) erros.push('Escolha se é sêmen ou touro vivo.');
  return erros;
}
const CAMPOS_NUMERO_TOURO = ['doses', 'ajusteDoses', 'custoDose', 'valorCompra', 'pesoAtual', 'circEscrotal'];
export function prepararTouro(t, existente) {
  const agora = new Date().toISOString();
  const out = { ...(existente || {}), ...t, id: (existente && existente.id) || t.id || novoId(), createdAt: (existente && existente.createdAt) || agora, atualizadoEm: agora };
  CAMPOS_NUMERO_TOURO.forEach((k) => { if (out[k] !== undefined && out[k] !== '') { const n = num(out[k]); out[k] = n === null ? '' : n; } });
  out.nome = String(out.nome || '').trim();
  return out;
}

// ---------------------------------------------------------------- protocolos
export function normalizarProtocolo(p) {
  return {
    ...p,
    tipo: p.tipo || 'IATF', status: p.status || 'Ativo',
    dataInicio: String(p.dataInicio || '').slice(0, 10), dataFim: String(p.dataFim || '').slice(0, 10),
    manejos: json(p.manejos, []), animais: lista(p.animais), touros: lista(p.touros),
  };
}
export function protocoloParaPlanilha(p) {
  return { ...p, manejos: JSON.stringify(p.manejos || []), animais: (p.animais || []).join(','), touros: (p.touros || []).join(',') };
}
export const manejoIA = (p) => (p.manejos || []).find((m) => m.ia) || null;
export const dataDoManejo = (p, m) => (p.dataInicio ? addDias(p.dataInicio, parseInt(m.dias, 10) || 0) : '');
export const dataIA = (p) => { const m = manejoIA(p); return m ? dataDoManejo(p, m) : ''; };
export function fimDaMonta(p) { return p.dataFim || (p.dataInicio ? addDias(p.dataInicio, DIAS_MONTA_PADRAO) : ''); }

export function manejosFeitos(estado, protocoloId) {
  return estado.eventos.filter((e) => e.tipo === 'manejo' && e.protocoloId === protocoloId);
}

// Manejos planejados com a data e se já foram feitos
export function agendaProtocolo(estado, p, hoje) {
  hoje = hoje || todayISO();
  const feitos = manejosFeitos(estado, p.id);
  return (p.manejos || []).map((m) => {
    const data = dataDoManejo(p, m);
    const feitosDele = feitos.filter((f) => f.manejoRef === m.id);
    const presentes = new Set(feitosDele.flatMap((f) => lista(f.presentes)));
    return { ...m, data, feito: feitosDele.length > 0, feitos: feitosDele, presentes: presentes.size, atrasado: !feitosDele.length && data && data < hoje, hoje: data === hoje };
  });
}
export function proximoManejo(estado, p, hoje) {
  return agendaProtocolo(estado, p, hoje).find((m) => !m.feito) || null;
}

export function validarProtocolo(estado, p) {
  const erros = []; const avisos = [];
  if (!String(p.nome || '').trim()) erros.push('Dê um nome ao protocolo.');
  if (!p.dataInicio) erros.push(p.tipo === 'Monta' ? 'Falta a data de entrada na monta.' : 'Falta a data do D0.');
  if (!(p.animais || []).length) erros.push('Coloque pelo menos um animal.');
  if (p.tipo === 'IATF' && !manejoIA(p)) erros.push('Marque qual manejo é a inseminação.');
  if (p.tipo === 'Monta' && !(p.touros || []).length) avisos.push('Nenhum touro escolhido para o lote.');
  const dias = (p.manejos || []).map((m) => parseInt(m.dias, 10));
  if (dias.some((d) => isNaN(d) || d < 0)) erros.push('Os dias dos manejos precisam ser números (0, 7, 9...).');
  if (new Set((p.manejos || []).map((m) => m.id)).size !== (p.manejos || []).length) erros.push('Dois manejos com o mesmo nome (ex.: D0).');
  return { erros, avisos };
}
export function prepararProtocolo(p, existente) {
  const agora = new Date().toISOString();
  return {
    ...(existente || {}), ...p,
    id: (existente && existente.id) || p.id || novoId(),
    dataFim: p.tipo === 'Monta' ? (p.dataFim || (p.dataInicio ? addDias(p.dataInicio, DIAS_MONTA_PADRAO) : '')) : (p.dataFim || ''),
    custoTotal: p.custoTotal === '' || p.custoTotal === undefined ? '' : (num(p.custoTotal) ?? ''),
    createdAt: (existente && existente.createdAt) || agora, atualizadoEm: agora,
  };
}

// Repasse: depois da IA, os animais vão para a monta com touros vivos (padrão: 17 dias depois da IA, por 90 dias)
export function montaDeRepasse(estado, p, opcoes) {
  const op = opcoes || {};
  const ia = dataIA(p) || p.dataInicio;
  const entrada = op.dataEntrada || addDias(ia, DIAS_REPASSE_DEPOIS_IA);
  const vivas = new Set(estado.matrizes.filter((m) => m.status !== 'Morta' && m.status !== 'Vendida' && m.status !== 'Descarte').map((m) => m.id));
  return {
    tipo: 'Monta', nome: `Repasse de ${p.nome}`, dataInicio: entrada, dataFim: addDias(entrada, op.dias || DIAS_MONTA_PADRAO), status: 'Ativo',
    touros: op.touros || [], animais: (p.animais || []).filter((id) => vivas.has(id)), origemId: p.id,
    manejos: [{ ...MANEJO_ENTRADA_MONTA, medicamentos: '' , descricao: 'Entrada no lote dos touros (repasse)' }], semenPadrao: '', tecnico: '', custoTotal: '', custoObs: '', observacoes: '',
  };
}

// Protocolos onde o animal está (o mais recente primeiro)
export function protocolosDoAnimal(estado, matrizId) {
  return (estado.protocolos || []).filter((p) => (p.animais || []).includes(matrizId)).sort((a, b) => (b.dataInicio || '').localeCompare(a.dataInicio || ''));
}

// ---------------------------------------------------------------- informações da vaca (protocolo e toque)
export function partosDe(m, eventos) {
  return eventos.filter((e) => e.tipo === 'nascimento' && e.matrizId === m.id).length + (parseInt(m.partosAnteriores, 10) || 0);
}
export function ultimoServico(estado, matrizId, ate) {
  const iatfs = estado.eventos.filter((e) => e.tipo === 'iatf' && e.matrizId === matrizId && e.data && (!ate || e.data <= ate)).sort((a, b) => b.data.localeCompare(a.data));
  const montas = protocolosDoAnimal(estado, matrizId).filter((p) => p.tipo === 'Monta' && p.dataInicio && (!ate || p.dataInicio <= ate));
  const iatf = iatfs[0] || null; const monta = montas[0] || null;
  const descIatf = iatf ? `IATF ${formatarDataBR(iatf.data)}${nomeTouroEvento(iatf, estado.touros) ? ` · ${nomeTouroEvento(iatf, estado.touros)}` : ''}` : '';
  const touros = monta ? (monta.touros || []).map((id) => nomeTouro(estado, id)).filter(Boolean) : [];
  const descMonta = monta ? `Monta ${formatarDataBR(monta.dataInicio)} a ${formatarDataBR(fimDaMonta(monta))}${touros.length ? ` · ${touros.join(' ou ')}` : ''}` : '';
  let texto = '';
  if (iatf && monta) texto = monta.dataInicio > iatf.data ? `${descIatf}; depois ${descMonta}` : descIatf;
  else texto = descIatf || descMonta;
  return { iatf, monta, texto };
}

export function infoVaca(estado, m, hoje) {
  hoje = hoje || todayISO();
  const ev = estado.eventos;
  const parto = ultimoPartoDe(m.id, ev);
  const diags = ev.filter((e) => e.tipo === 'diagnostico' && e.matrizId === m.id && e.data).sort((a, b) => b.data.localeCompare(a.data));
  const serv = ultimoServico(estado, m.id);
  return {
    matriz: m, brinco: m.brinco, categoria: m.categoria || '', lote: m.lote || '', status: m.status,
    crias: partosDe(m, ev), ultimoParto: parto, diasParida: parto ? diasEntre(parto, hoje) : null,
    ultimoServico: serv, ultimoToque: diags[0] || null,
    vacina: situacaoVacinaVaca(estado, m, hoje),
    idade: m.dataNascimento ? idadeMesesDias(m.dataNascimento, hoje) : null,
  };
}

// Avisos para colocar a vaca num protocolo
export function avisosParaProtocolo(estado, info, cfg, outroProtocoloAtivo) {
  const min = parseInt((cfg || {}).diasMinPosParto, 10) || DIAS_MIN_POS_PARTO_PADRAO;
  const a = [];
  if (info.status === 'Cheia') a.push('Está CHEIA');
  if (info.status === 'Descarte') a.push('Marcada para descarte');
  if (info.diasParida !== null && info.diasParida < min) a.push(`Parida há só ${info.diasParida} dias`);
  if (outroProtocoloAtivo) a.push(`Já está em ${outroProtocoloAtivo.nome}`);
  return a;
}

// ---------------------------------------------------------------- manejo de curral (protocolo, vacinação avulsa)
// form: { protocolo?, manejo? ({id, ia, descricao}), data, responsavel, descricao, aplicacoes: [{tipo, produto, dose}],
//         presentes: [id], semen: {matrizId: touroId}, semenPadrao, observacoes }
// Na inseminação, cada animal presente ganha um lançamento de IATF (usado pela previsão de parto e pelo pai da cria).
export function aplicarManejo(estado, form, opcoes) {
  const op = opcoes || {};
  const now = op.now || new Date().toISOString();
  const p = form.protocolo || null; const m = form.manejo || null;
  const presentes = [...new Set(form.presentes || [])];
  const erros = [];
  if (!form.data) erros.push('Falta a data.');
  if (!presentes.length) erros.push('Marque pelo menos um animal presente.');
  if (m && m.ia && form.responsavel === undefined) { /* técnico é opcional */ }
  if (erros.length) return { erros };
  const ausentes = p ? (p.animais || []).filter((id) => !presentes.includes(id)) : [];
  const idManejo = op.id || novoId();
  const manejo = {
    id: idManejo, tipo: 'manejo', data: form.data, protocoloId: p ? p.id : (form.protocoloId || ''),
    etapa: form.etapa || (m ? m.id : 'Vacinação'), manejoRef: m ? m.id : (form.manejoRef || ''), responsavel: form.responsavel || '',
    descricao: form.descricao || (m ? m.descricao : ''), aplicacoes: JSON.stringify((form.aplicacoes || []).filter((x) => x && x.tipo)),
    presentes: presentes.join(','), ausentes: ausentes.join(','), observacoes: form.observacoes || '', createdAt: now,
  };
  const eventosNovos = [manejo];
  if (p && m && m.ia) {
    presentes.forEach((matrizId, i) => {
      const parto = ultimoPartoDe(matrizId, estado.eventos);
      const anteriores = estado.eventos.filter((e) => e.tipo === 'iatf' && e.matrizId === matrizId && (!parto || e.data > parto) && e.data < form.data).length;
      eventosNovos.push({
        id: `${idManejo}-ia${i}`, tipo: 'iatf', data: form.data, matrizId, tipoServico: 'IATF',
        numeroServico: anteriores === 0 ? '1ª' : anteriores === 1 ? '2ª' : '3ª ou mais', dataInicioProtocolo: p.dataInicio,
        touroId: (form.semen && form.semen[matrizId]) || form.semenPadrao || p.semenPadrao || '', touroOutro: '',
        tecnico: form.responsavel || p.tecnico || '', custo: '', observacoes: '', protocoloId: p.id, manejoRef: m.id, createdAt: now,
      });
    });
  }
  return { estado: { ...estado, eventos: [...estado.eventos, ...eventosNovos] }, eventosNovos, erros: [] };
}

// Brinco digitado no curral: está no protocolo?
export function acharNoProtocolo(estado, p, brinco) {
  const r = acharMatrizPorBrinco(estado.matrizes, brinco);
  if (!r.matriz) return { erro: `Não achei a vaca ${String(brinco).trim()}. Confira o número.` };
  if (p && !(p.animais || []).includes(r.matriz.id)) return { matriz: r.matriz, fora: true, erro: `A vaca ${r.matriz.brinco} não está no protocolo ${p.nome}. Verifique.` };
  return { matriz: r.matriz };
}

// ---------------------------------------------------------------- toque geral
// Entram todas as matrizes do plantel e as novilhas (inclusive as da recria, para avaliar se estão aptas)
export function elegiveisToque(estado) {
  return estado.matrizes
    .filter((m) => m.status !== 'Vendida' && m.status !== 'Morta' && (noPlantel(m) || m.categoria === 'Novilha'))
    .sort((a, b) => ordemBrinco(a.brinco, b.brinco));
}
export const ehNovilha = (m) => m.categoria === 'Novilha' && partosDe(m, []) === 0;

// Concepção estimada pelo toque: data do toque menos os dias de gestação
export function concepcaoPeloToque(data, dg) {
  const n = parseInt(dg, 10);
  if (!data || isNaN(n)) return '';
  return addDias(data, -n);
}

// De onde veio a prenhez (para o toque e para o pai da cria): IATF perto da concepção ou período da monta
export function origemDaPrenhez(estado, matrizId, concepcao) {
  if (!concepcao) return null;
  const iatfs = estado.eventos.filter((e) => e.tipo === 'iatf' && e.matrizId === matrizId && e.data && Math.abs(diasEntre(e.data, concepcao)) <= 12);
  if (iatfs.length) {
    iatfs.sort((a, b) => Math.abs(diasEntre(a.data, concepcao)) - Math.abs(diasEntre(b.data, concepcao)));
    const e = iatfs[0];
    const nome = nomeTouroEvento(e, estado.touros);
    if (!/repasse|monta/i.test(e.tipoServico || '')) return { origem: 'IATF', data: e.data, iatf: e, pai: nome, rotulo: `IATF de ${formatarDataBR(e.data)}${nome ? ` · ${nome}` : ''}` };
  }
  const montas = protocolosDoAnimal(estado, matrizId).filter((p) => p.tipo === 'Monta' && p.dataInicio && concepcao >= addDias(p.dataInicio, -5) && concepcao <= addDias(fimDaMonta(p), 5));
  if (montas.length) {
    const p = montas[0];
    const touros = (p.touros || []).map((id) => nomeTouro(estado, id)).filter(Boolean);
    return { origem: 'Monta', protocolo: p, pai: touros.length ? `Monta: ${touros.join(' ou ')}` : 'Monta natural', rotulo: `Monta (${p.nome})${touros.length ? ` · ${touros.join(' ou ')}` : ''}` };
  }
  return null;
}

export function previsaoPeloToque(data, dg) {
  const c = concepcaoPeloToque(data, dg);
  return c ? addDias(c, PERIODO_GESTACAO_DIAS) : '';
}

// Avisos na linha do toque (não impedem gravar)
export function avisosToque(estado, m, marca, data, cfg) {
  const a = [];
  const parto = ultimoPartoDe(m.id, estado.eventos);
  const min = parseInt((cfg || {}).diasMinPosParto, 10) || DIAS_MIN_POS_PARTO_PADRAO;
  if (marca && marca.resultado === 'Cheia') {
    const c = concepcaoPeloToque(data, marca.dg);
    if (marca.dg === '' || marca.dg === undefined || marca.dg === null) a.push('Falta o número de dias de prenhez.');
    else if (parseInt(marca.dg, 10) > 290) a.push('Mais de 290 dias de prenhez: confira.');
    else if (c && parto && c <= parto) a.push(`Os dias de prenhez não batem com o parto de ${formatarDataBR(parto)}. Confira.`);
    else if (c && !origemDaPrenhez(estado, m.id, c)) a.push('A prenhez não bate com nenhuma IATF nem monta registrada.');
  }
  if (marca && marca.resultado === 'Vazia' && m.status === 'Cheia') a.push('Estava CHEIA e agora deu vazia: perda?');
  if (parto && diasEntre(parto, data) < min && (!marca || marca.resultado !== 'Cheia')) a.push(`Parida há só ${diasEntre(parto, data)} dias.`);
  return a;
}

// Grava as marcações do toque: um diagnóstico por vaca (as regras de sempre mudam status) e um manejo com o cabeçalho.
// sessao: { id, data, veterinario, metodo, aplicacoes, observacoes }; marcas: [{ matrizId, resultado, dg, motivo, apta, observacoes }]
export function aplicarToque(estado, sessao, marcas, opcoes) {
  const op = opcoes || {};
  const now = op.now || new Date().toISOString();
  let atual = estado;
  const eventosParaGravar = []; const matrizesMap = new Map(); const aplicados = []; const rejeitados = [];
  marcas.forEach((mk, i) => {
    const m = atual.matrizes.find((x) => x.id === mk.matrizId);
    if (!m) { rejeitados.push({ marca: mk, motivo: 'vaca não encontrada' }); return; }
    const resultado = mk.resultado === 'Cheia' ? 'Prenhe' : mk.resultado;
    const form = {
      matrizId: m.id, data: sessao.data, resultado, metodo: sessao.metodo || 'Toque retal', dg: mk.resultado === 'Cheia' ? (mk.dg ?? '') : '',
      veterinario: sessao.veterinario || '', motivo: mk.resultado === 'Descarte' ? (mk.motivo || 'Descarte no toque') : '',
      toqueId: sessao.id, apta: mk.apta || '', observacoes: mk.observacoes || '',
    };
    if (jaExiste('diagnostico', form, atual)) { rejeitados.push({ marca: mk, motivo: `a vaca ${m.brinco} já tem toque em ${formatarDataBR(sessao.data)}` }); return; }
    const r = aplicarLancamento(atual, 'diagnostico', form, { id: `${sessao.id}-${m.id}`, now });
    atual = r.estado;
    r.eventosNovos.forEach((e) => eventosParaGravar.push({ tipo: e.tipo, evento: e }));
    r.matrizesAlteradas.forEach((x) => matrizesMap.set(x.id, x));
    // novilha avaliada como apta passa para o plantel (destino Matriz) e pode entrar no próximo protocolo
    if (mk.apta === 'Sim' && m.categoria === 'Novilha' && m.destino && m.destino !== 'Matriz') {
      const nova = { ...(matrizesMap.get(m.id) || atual.matrizes.find((x) => x.id === m.id)), destino: 'Matriz' };
      atual = { ...atual, matrizes: atual.matrizes.map((x) => (x.id === m.id ? nova : x)) };
      matrizesMap.set(m.id, nova);
    }
    aplicados.push({ marca: mk, matriz: m, indice: i });
  });
  if (aplicados.length) {
    const manejo = {
      id: `${sessao.id}-mj-${now.replace(/\D/g, '').slice(-9)}`, tipo: 'manejo', data: sessao.data, protocoloId: '', etapa: 'Toque', manejoRef: sessao.id,
      responsavel: sessao.veterinario || '', descricao: `Toque (${sessao.metodo || 'Toque retal'})`, aplicacoes: JSON.stringify((sessao.aplicacoes || []).filter((x) => x && x.tipo)),
      presentes: aplicados.map((x) => x.matriz.id).join(','), ausentes: '', observacoes: sessao.observacoes || '', createdAt: now,
    };
    atual = { ...atual, eventos: [...atual.eventos, manejo] };
    eventosParaGravar.push({ tipo: 'manejo', evento: manejo });
  }
  return { estado: atual, eventosParaGravar, matrizesParaGravar: [...matrizesMap.values()], tourosParaGravar: [], aplicados, rejeitados };
}

// Toques já feitos (agrupados pelo toqueId dos diagnósticos)
export function listarToques(estado) {
  const mapa = new Map();
  estado.eventos.filter((e) => e.tipo === 'diagnostico' && e.toqueId).forEach((e) => {
    if (!mapa.has(e.toqueId)) mapa.set(e.toqueId, { id: e.toqueId, data: e.data, veterinario: e.veterinario || '', diags: [] });
    mapa.get(e.toqueId).diags.push(e);
  });
  return [...mapa.values()].sort((a, b) => (b.data || '').localeCompare(a.data || ''));
}

// Resumo do toque: cheias, vazias, descartes, aptas, ausentes e taxa de prenhez por grupo
export function resumoToque(estado, toqueId) {
  const diags = estado.eventos.filter((e) => e.tipo === 'diagnostico' && e.toqueId === toqueId);
  const data = diags[0] ? diags[0].data : '';
  const brincos = mapaBrincos(estado.matrizes);
  const matPorId = new Map(estado.matrizes.map((m) => [m.id, m]));
  const linhas = diags.map((d) => {
    const m = matPorId.get(d.matrizId) || {};
    const novilhaAval = d.apta === 'Sim' || d.apta === 'Não';
    const c = d.resultado === 'Prenhe' ? concepcaoPeloToque(d.data, d.dg) : '';
    const ori = c ? origemDaPrenhez(estado, d.matrizId, c) : null;
    const serv = ultimoServico(estado, d.matrizId, d.data);
    let grupoProt = 'Sem protocolo';
    if (ori && ori.origem === 'IATF') { const p = (estado.protocolos || []).find((x) => x.id === ori.iatf.protocoloId); grupoProt = p ? p.nome : `IATF de ${formatarDataBR(ori.iatf.data)}`; }
    else if (ori && ori.origem === 'Monta') grupoProt = ori.protocolo.nome;
    else if (serv.iatf && serv.iatf.protocoloId) { const p = (estado.protocolos || []).find((x) => x.id === serv.iatf.protocoloId); grupoProt = p ? p.nome : grupoProt; }
    else if (serv.monta) grupoProt = serv.monta.nome;
    else if (serv.iatf) grupoProt = `IATF de ${formatarDataBR(serv.iatf.data)}`;
    return {
      d, m, brinco: brincos[d.matrizId] || '?', categoria: m.categoria || '', lote: m.lote || '', novilhaAval,
      resultado: d.resultado === 'Prenhe' ? 'Cheia' : d.resultado, dg: d.dg, previsao: d.resultado === 'Prenhe' ? previsaoPeloToque(d.data, d.dg) : '',
      origem: ori ? ori.rotulo : '', grupoProt, semen: ori && ori.origem === 'IATF' ? (ori.pai || 'sem nome') : '', monta: ori && ori.origem === 'Monta' ? ori.pai : '',
    };
  });
  const avaliadasPrenhez = linhas.filter((l) => !(l.novilhaAval && l.resultado !== 'Cheia'));
  const taxa = (ls) => { const ch = ls.filter((l) => l.resultado === 'Cheia').length; const tot = ls.filter((l) => l.resultado === 'Cheia' || l.resultado === 'Vazia').length; return { cheias: ch, total: tot, pct: tot ? Math.round((ch / tot) * 100) : null }; };
  const agrupar = (chaveFn, ls) => { const mp = new Map(); ls.forEach((l) => { const k = chaveFn(l) || 'Não informado'; if (!mp.has(k)) mp.set(k, []); mp.get(k).push(l); }); return [...mp.entries()].map(([k, v]) => ({ chave: k, ...taxa(v) })).sort((a, b) => b.total - a.total); };
  const elegiveis = elegiveisToque(estado).filter((m) => !(m.dataBaixa && m.dataBaixa < data));
  const avaliados = new Set(diags.map((d) => d.matrizId));
  return {
    data, total: linhas.length, linhas,
    cheias: linhas.filter((l) => l.resultado === 'Cheia').length,
    vazias: linhas.filter((l) => l.resultado === 'Vazia' && !l.novilhaAval).length,
    descartes: linhas.filter((l) => l.resultado === 'Descarte').length,
    aptas: linhas.filter((l) => l.d.apta === 'Sim').length, naoAptas: linhas.filter((l) => l.d.apta === 'Não').length,
    geral: taxa(avaliadasPrenhez),
    porProtocolo: agrupar((l) => l.grupoProt, avaliadasPrenhez), porSemen: agrupar((l) => l.semen, avaliadasPrenhez.filter((l) => l.semen)),
    porMonta: agrupar((l) => l.monta, avaliadasPrenhez.filter((l) => l.monta)),
    porLote: agrupar((l) => l.lote, avaliadasPrenhez), porCategoria: agrupar((l) => l.categoria, avaliadasPrenhez),
    ausentes: elegiveis.filter((m) => !avaliados.has(m.id)),
    vaziasIds: linhas.filter((l) => l.resultado === 'Vazia' && !l.novilhaAval).map((l) => l.d.matrizId),
    aptasIds: linhas.filter((l) => l.d.apta === 'Sim').map((l) => l.d.matrizId),
  };
}

// ---------------------------------------------------------------- vacinas
export function calendarioVacinas(cfg) {
  const salvo = json((cfg || {}).calendarioVacinas, null);
  if (!Array.isArray(salvo) || !salvo.length) return CALENDARIO_PADRAO.map((r) => ({ ...r }));
  const ids = new Set(salvo.map((r) => r.id));
  return [...salvo, ...CALENDARIO_PADRAO.filter((r) => !ids.has(r.id))];
}

// Todas as aplicações (vacinas, vermífugo...) por animal, tiradas dos manejos. Animal = id da matriz ou "c:<id do nascimento>".
export function aplicacoesPorAnimal(estado) {
  const mapa = new Map();
  estado.eventos.filter((e) => e.tipo === 'manejo').forEach((e) => {
    const aps = json(e.aplicacoes, []);
    if (!aps.length) return;
    lista(e.presentes).forEach((id) => {
      if (!mapa.has(id)) mapa.set(id, []);
      aps.forEach((a) => mapa.get(id).push({ data: e.data, tipo: a.tipo, produto: a.produto || '', manejoId: e.id, etapa: e.etapa }));
    });
  });
  mapa.forEach((l) => l.sort((a, b) => (a.data || '').localeCompare(b.data || '')));
  return mapa;
}

// Concepção da prenhez atual (vaca cheia): pelo último toque com dias de gestação; sem isso, pela IATF
export function concepcaoAtual(estado, m) {
  if (m.status !== 'Cheia') return '';
  const prev = previsaoPartoInfo(m.id, estado.eventos);
  if (!prev || !prev.data) return '';
  return addDias(prev.data, -PERIODO_GESTACAO_DIAS);
}

// Vacina reprodutiva e reforço da Lepto de uma vaca
// inicial: tomou a vacina reprodutiva neste ciclo (depois do último parto; sem parto, nos últimos 12 meses)?
// reforço: vaca cheia toma o reforço da Lepto aos 6 meses de prenhez (concepção + 6 meses)
export function situacaoVacinaVaca(estado, m, hoje, cache) {
  hoje = hoje || todayISO();
  const aps = (cache || aplicacoesPorAnimal(estado)).get(m.id) || [];
  const parto = ultimoPartoDe(m.id, estado.eventos);
  const desde = parto || addDias(hoje, -365);
  const reprod = aps.filter((a) => a.tipo === 'Vacina reprodutiva' && a.data >= desde);
  const out = { inicial: reprod.length ? reprod[reprod.length - 1].data : '', reforco: null, pendente: false, texto: '' };
  if (m.status === 'Cheia') {
    const c = concepcaoAtual(estado, m);
    if (c) {
      const prazo = addMeses(c, 6);
      const feito = aps.filter((a) => a.tipo === 'Reforço Lepto' && a.data >= c).pop();
      const dias = diasEntre(hoje, prazo);
      out.reforco = { concepcao: c, prazo, feito: feito ? feito.data : '', atrasoDias: !feito && dias < 0 ? -dias : 0, faltam: !feito && dias >= 0 ? dias : null };
    }
  }
  const partes = [];
  if (!out.inicial && m.status !== 'Descarte') { partes.push('Sem vacina reprodutiva registrada'); out.pendente = true; }
  if (out.reforco) {
    if (out.reforco.feito) partes.push(`Lepto em dia (reforço ${formatarDataBR(out.reforco.feito)})`);
    else if (out.reforco.atrasoDias) { partes.push(`Reforço Lepto ATRASADO há ${out.reforco.atrasoDias} dias`); out.pendente = true; }
    else { partes.push(`Reforço Lepto em ${formatarDataBR(out.reforco.prazo)}`); if (out.reforco.faltam <= 30) out.pendente = true; }
  } else if (out.inicial) partes.push(`Vacina reprodutiva em ${formatarDataBR(out.inicial)}`);
  out.texto = partes.join(' · ');
  out.nivel = out.reforco && out.reforco.atrasoDias ? 'atrasada' : out.pendente ? 'pendente' : 'ok';
  return out;
}

// Pendências do calendário de vacinas (tela Vacinas e relatório)
export function pendenciasVacinas(estado, cfg, hoje) {
  hoje = hoje || todayISO();
  const cal = calendarioVacinas(cfg).filter((r) => r.ativo !== false);
  const cache = aplicacoesPorAnimal(estado);
  const out = [];
  const matrizes = estado.matrizes.filter((m) => m.status !== 'Vendida' && m.status !== 'Morta');
  const plantel = matrizes.filter(noPlantel);
  cal.forEach((r) => {
    if (r.id === 'reprodutiva') {
      plantel.forEach((m) => {
        const s = situacaoVacinaVaca(estado, m, hoje, cache);
        if (!s.inicial && m.status !== 'Descarte') out.push({ regra: r, animalId: m.id, brinco: m.brinco, tipo: m.categoria, situacao: 'Sem registro neste ciclo', nivel: 'pendente', confirmar: true, status: m.status });
      });
    } else if (r.id === 'lepto') {
      plantel.filter((m) => m.status === 'Cheia').forEach((m) => {
        const s = situacaoVacinaVaca(estado, m, hoje, cache);
        if (!s.reforco || s.reforco.feito) return;
        const faltam = s.reforco.faltam;
        if (s.reforco.atrasoDias) out.push({ regra: r, animalId: m.id, brinco: m.brinco, tipo: m.categoria, prazo: s.reforco.prazo, situacao: `Atrasado há ${s.reforco.atrasoDias} dias`, nivel: 'atrasada', status: m.status });
        else out.push({ regra: r, animalId: m.id, brinco: m.brinco, tipo: m.categoria, prazo: s.reforco.prazo, situacao: faltam <= 30 ? `Vence em ${faltam} dias` : `Em ${formatarDataBR(s.reforco.prazo)}`, nivel: faltam <= 30 ? 'pendente' : 'futura', status: m.status });
      });
    } else if (r.tipo === 'idade') {
      const min = num(r.idadeMin) ?? 3; const max = num(r.idadeMax) ?? 8;
      // crias do histórico (nascidas antes do app) ficam de fora: as vacinas daquela época não estão registradas
      listarCrias(estado, hoje).filter((c) => c.ativa && !c.historico && (r.publico !== 'bezerras' || c.sexo === 'Fêmea') && c.nascData).forEach((c) => {
        const id = c.novilha ? c.novilha.id : `c:${c.id}`;
        const feitas = [...(cache.get(id) || []), ...(cache.get(`c:${c.id}`) || [])].filter((a) => a.tipo === r.nome || (r.id === 'brucelose' && a.tipo === 'Brucelose'));
        if (feitas.length && r.unica !== false) return;
        const ini = addMeses(c.nascData, min); const fim = addMeses(c.nascData, max);
        if (hoje < addDias(ini, -15)) return;
        const situacao = hoje > fim ? `Passou dos ${max} meses sem vacinar${r.id === 'brucelose' ? ' (usar RB51)' : ''}` : hoje < ini ? `Faz ${min} meses em ${formatarDataBR(ini)}` : `Vacinar até ${formatarDataBR(fim)}`;
        out.push({ regra: r, animalId: id, brinco: c.brinco, tipo: c.sexo === 'Fêmea' ? 'Bezerra' : 'Bezerro', prazo: fim, situacao, nivel: hoje > fim ? 'atrasada' : hoje < ini ? 'futura' : 'pendente', mae: c.maeBrinco });
      });
    } else if (r.tipo === 'periodo') {
      const meses = num(r.intervaloMeses) || 12;
      const alvo = r.publico === 'cheias' ? plantel.filter((m) => m.status === 'Cheia') : r.publico === 'matrizes' ? plantel : matrizes;
      alvo.forEach((m) => {
        const ult = (cache.get(m.id) || []).filter((a) => a.tipo === r.nome).pop();
        const prazo = ult ? addMeses(ult.data, meses) : '';
        if (ult && diasEntre(hoje, prazo) > 30) return;
        out.push({ regra: r, animalId: m.id, brinco: m.brinco, tipo: m.categoria, prazo, situacao: !ult ? 'Nunca registrada' : prazo < hoje ? `Venceu em ${formatarDataBR(prazo)}` : `Vence em ${formatarDataBR(prazo)}`, nivel: !ult || prazo < hoje ? 'atrasada' : 'pendente', status: m.status });
      });
    }
  });
  const peso = { atrasada: 0, pendente: 1, futura: 2 };
  return out.sort((a, b) => (peso[a.nivel] - peso[b.nivel]) || ordemBrinco(a.brinco, b.brinco));
}

// Confirmação "Foi vacinada?" de uma vaca sem registro: grava um manejo com a vacina na data informada
export function manejoConfirmacaoVacina(matrizIds, data, tipo, opcoes) {
  const now = (opcoes && opcoes.now) || new Date().toISOString();
  return {
    id: `vac-${novoId()}`, tipo: 'manejo', data, protocoloId: '', etapa: 'Confirmação de vacina', manejoRef: '', responsavel: '',
    descricao: 'Vacina já aplicada, confirmada no app', aplicacoes: JSON.stringify([{ tipo: tipo || 'Vacina reprodutiva' }]),
    presentes: matrizIds.join(','), ausentes: '', observacoes: '', createdAt: now,
  };
}

// ---------------------------------------------------------------- pai provável (nascimento): IATF ou touros da monta
export function paiProvavel(estado, nasc) {
  if (!nasc || !nasc.matrizId || !nasc.data) return null;
  const c = addDias(nasc.data, -PERIODO_GESTACAO_DIAS);
  // a gestação varia: procura a IATF entre 250 e 320 dias antes do parto; senão, monta cujo período cobre a concepção (±20 dias)
  const iatfs = estado.eventos.filter((e) => e.tipo === 'iatf' && e.matrizId === nasc.matrizId && e.data && !/repasse|monta/i.test(e.tipoServico || ''))
    .filter((e) => { const d = diasEntre(e.data, nasc.data); return d >= 250 && d <= 320; });
  if (iatfs.length) return null; // a regra antiga (origemDaCria) já resolve IATF
  const montas = protocolosDoAnimal(estado, nasc.matrizId).filter((p) => p.tipo === 'Monta' && p.dataInicio && c >= addDias(p.dataInicio, -20) && c <= addDias(fimDaMonta(p), 20));
  if (!montas.length) return null;
  const p = montas[0];
  const touros = (p.touros || []).map((id) => nomeTouro(estado, id)).filter(Boolean);
  return { origem: 'Monta', pai: touros.length ? touros.join(' ou ') : 'Monta natural', rotulo: touros.length ? `Monta · ${touros.join(' ou ')}` : `Monta (${p.nome})`, protocolo: p };
}

// ---------------------------------------------------------------- relatórios novos
const colsRel = (pares) => pares.map(([k, label, extra]) => ({ k, label, ...(extra || {}) }));

export function relatorioVacasPorStatus(estado, status, hoje) {
  hoje = hoje || todayISO();
  const cache = aplicacoesPorAnimal(estado);
  const vacas = estado.matrizes.filter(noPlantel).filter((m) => !status || m.status === status).sort((a, b) => ordemBrinco(a.brinco, b.brinco));
  const linhas = vacas.map((m) => {
    const i = infoVaca(estado, m, hoje);
    const prev = m.status === 'Cheia' ? previsaoPartoInfo(m.id, estado.eventos) : null;
    const vac = situacaoVacinaVaca(estado, m, hoje, cache);
    return {
      brinco: m.brinco, categoria: m.categoria || '', lote: m.lote || '', status: m.status, crias: i.crias,
      ultimoParto: i.ultimoParto ? formatarDataBR(i.ultimoParto) : '—', diasParida: i.diasParida ?? '—',
      servico: i.ultimoServico.texto || '—', toque: i.ultimoToque ? `${formatarDataBR(i.ultimoToque.data)} ${i.ultimoToque.resultado}${i.ultimoToque.dg ? ` (${i.ultimoToque.dg} d)` : ''}` : '—',
      previsao: prev && prev.data ? formatarDataBR(prev.data) : '—', vacina: vac.texto || '—',
    };
  });
  const titulo = status === 'Cheia' ? 'Matrizes prenhas (cheias)' : status === 'Vazia' ? 'Matrizes vazias' : 'Situação das matrizes';
  const base = [['brinco', 'Brinco', { mono: true }], ['categoria', 'Categoria'], ['lote', 'Lote'], ['crias', 'Crias', { align: 'right', mono: true }], ['ultimoParto', 'Último parto', { mono: true }]];
  const colunas = status === 'Cheia'
    ? colsRel([...base, ['toque', 'Toque'], ['previsao', 'Previsão de parto', { mono: true }], ['servico', 'Serviço'], ['vacina', 'Vacina']])
    : status === 'Vazia'
      ? colsRel([...base, ['diasParida', 'Dias parida', { align: 'right', mono: true }], ['servico', 'Último serviço'], ['toque', 'Último toque'], ['vacina', 'Vacina']])
      : colsRel([...base.slice(0, 3), ['status', 'Situação'], ...base.slice(3), ['toque', 'Último toque'], ['previsao', 'Previsão', { mono: true }]]);
  return {
    titulo,
    resumo: [
      { rotulo: 'Matrizes', valor: linhas.length },
      ...(status ? [] : [{ rotulo: 'Cheias', valor: vacas.filter((m) => m.status === 'Cheia').length }, { rotulo: 'Vazias', valor: vacas.filter((m) => m.status === 'Vazia').length }, { rotulo: 'Descarte', valor: vacas.filter((m) => m.status === 'Descarte').length }]),
      { rotulo: 'Vacina pendente', valor: vacas.filter((m) => situacaoVacinaVaca(estado, m, hoje, cache).pendente).length },
    ],
    secoes: [{ titulo: 'Vaca por vaca (ordem de brinco)', colunas, linhas }],
  };
}

export function relatorioCriasPorSexo(estado, ano, hoje) {
  hoje = hoje || todayISO();
  const crias = listarCrias(estado, hoje).filter((c) => ano === 'todos' || anoDe(c.nascData) === ano);
  const linhaDe = (c) => ({
    brinco: c.brinco || '—', nasc: c.nascData ? formatarDataBR(c.nascData) : '—', mes: c.nascData ? c.nascData.slice(5, 7) + '/' + c.nascData.slice(2, 4) : '—',
    idade: c.nascData ? (idadeMesesDias(c.nascData, hoje) || {}).texto || '—' : '—', mae: c.maeBrinco || '—', pai: (paiProvavel(estado, c.nasc) || {}).rotulo || c.origem.rotulo || '—',
    peso: c.pesoAtual ? `${c.pesoAtual} kg` : '—', pesoData: c.pesoData ? formatarDataBR(c.pesoData) : '—', situacao: c.situacao,
  });
  const cols = colsRel([['brinco', 'Brinco', { mono: true }], ['nasc', 'Nascimento', { mono: true }], ['idade', 'Idade'], ['mae', 'Mãe', { mono: true }], ['pai', 'Origem / pai'], ['peso', 'Último peso', { align: 'right', mono: true }], ['pesoData', 'Pesado em', { mono: true }], ['situacao', 'Situação']]);
  const por = (sx) => crias.filter((c) => c.sexo === sx).sort((a, b) => ordemBrinco(a.brinco, b.brinco)).map(linhaDe);
  const f = por('Fêmea'); const m = por('Macho');
  return {
    titulo: `Crias por sexo · ${ano === 'todos' ? 'todos os anos' : ano}`,
    resumo: [{ rotulo: 'Crias', valor: crias.length }, { rotulo: 'Fêmeas', valor: f.length }, { rotulo: 'Machos', valor: m.length }, { rotulo: 'Ainda no rebanho', valor: crias.filter((c) => c.ativa).length }],
    secoes: [{ titulo: 'Fêmeas (ordem numérica)', colunas: cols, linhas: f }, { titulo: 'Machos (ordem numérica)', colunas: cols, linhas: m }],
  };
}

export function relatorioDescartes(estado, ano) {
  const brincos = mapaBrincos(estado.matrizes);
  const desc = estado.eventos.filter((e) => e.tipo === 'descarte' && (ano === 'todos' || anoDe(e.data) === ano)).sort((a, b) => (a.data || '').localeCompare(b.data || ''));
  const marcadas = estado.matrizes.filter((m) => m.status === 'Descarte').sort((a, b) => ordemBrinco(a.brinco, b.brinco));
  return {
    titulo: `Descartes · ${ano === 'todos' ? 'todos os anos' : ano}`,
    resumo: [{ rotulo: 'Descartes lançados', valor: desc.length }, { rotulo: 'Vacas marcadas para descarte hoje', valor: marcadas.length }],
    secoes: [
      { titulo: 'Vacas marcadas para descarte (ainda na fazenda)', colunas: colsRel([['brinco', 'Brinco', { mono: true }], ['categoria', 'Categoria'], ['lote', 'Lote'], ['crias', 'Crias', { align: 'right' }]]), linhas: marcadas.map((m) => ({ brinco: m.brinco, categoria: m.categoria || '', lote: m.lote || '', crias: partosDe(m, estado.eventos) })) },
      { titulo: 'Lançamentos de descarte', colunas: colsRel([['data', 'Data', { mono: true }], ['brinco', 'Vaca', { mono: true }], ['motivo', 'Motivo']]), linhas: desc.map((e) => ({ data: formatarDataBR(e.data), brinco: brincos[e.matrizId] || '?', motivo: e.motivo || '—' })) },
    ],
  };
}

export function relatorioPesagens(estado, ano, hoje) {
  const pes = estado.eventos.filter((e) => e.tipo === 'pesagem' && (ano === 'todos' || anoDe(e.data) === ano));
  const porData = new Map();
  pes.forEach((e) => { if (!porData.has(e.data)) porData.set(e.data, []); porData.get(e.data).push(e); });
  const linhas = [...porData.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([d, l]) => {
    const pesos = l.map((e) => parseFloat(e.peso)).filter((x) => x > 0);
    const chaves = l.map(chavePesagem);
    const sb = l.filter(ehSemBrinco).length;
    const dup = chaves.filter((k, i) => chaves.indexOf(k) !== i).length;
    return { data: formatarDataBR(d), qtd: l.length, total: `${pesos.reduce((s, x) => s + x, 0)} kg`, media: pesos.length ? `${(pesos.reduce((s, x) => s + x, 0) / pesos.length).toFixed(1).replace('.', ',')} kg` : '—', dup: [dup ? `${dup} pesado(s) 2x` : '', sb ? `${sb} sem brinco` : ''].filter(Boolean).join(' · ') };
  });
  return {
    titulo: `Pesagens · ${ano === 'todos' ? 'todos os anos' : ano}`,
    resumo: [{ rotulo: 'Dias de pesagem', valor: linhas.length }, { rotulo: 'Pesagens', valor: pes.length }],
    secoes: [{ titulo: 'Por dia (para o PDF de um dia, use a tela Pesar)', colunas: colsRel([['data', 'Data', { mono: true }], ['qtd', 'Animais', { align: 'right' }], ['total', 'Peso total', { align: 'right', mono: true }], ['media', 'Média', { align: 'right', mono: true }], ['dup', 'Atenção']]), linhas }],
  };
}

export function relatorioVacinas(estado, cfg, hoje) {
  const pend = pendenciasVacinas(estado, cfg, hoje).filter((p) => p.nivel !== 'futura');
  const futuras = pendenciasVacinas(estado, cfg, hoje).filter((p) => p.nivel === 'futura');
  const cols = colsRel([['vacina', 'Vacina'], ['brinco', 'Animal', { mono: true }], ['tipo', 'Tipo'], ['situacao', 'Situação'], ['prazo', 'Prazo', { mono: true }]]);
  const lin = (p) => ({ vacina: p.regra.nome, brinco: p.brinco, tipo: p.tipo || '', situacao: p.situacao, prazo: p.prazo ? formatarDataBR(p.prazo) : '—' });
  return {
    titulo: 'Vacinas pendentes',
    resumo: [{ rotulo: 'Pendentes agora', valor: pend.length }, { rotulo: 'Atrasadas', valor: pend.filter((p) => p.nivel === 'atrasada').length }, { rotulo: 'Próximas (mais de 30 dias)', valor: futuras.length }],
    secoes: [{ titulo: 'Para vacinar agora', colunas: cols, linhas: pend.map(lin) }, { titulo: 'Próximas', colunas: cols, linhas: futuras.map(lin) }],
  };
}

export function relatorioToque(estado, toqueId) {
  const r = resumoToque(estado, toqueId);
  const tx = (t) => (t.pct === null ? '—' : `${t.pct}% (${t.cheias} de ${t.total})`);
  const grupo = (titulo, ls) => ({ titulo, colunas: colsRel([['chave', 'Grupo'], ['cheias', 'Cheias', { align: 'right' }], ['total', 'Avaliadas', { align: 'right' }], ['taxa', 'Prenhez', { align: 'right' }]]), linhas: ls.map((g) => ({ ...g, taxa: tx(g) })) });
  return {
    titulo: `Toque de ${formatarDataBR(r.data)}`,
    resumo: [
      { rotulo: 'Avaliadas', valor: r.total }, { rotulo: 'Taxa de prenhez', valor: tx(r.geral) }, { rotulo: 'Cheias', valor: r.cheias }, { rotulo: 'Vazias', valor: r.vazias },
      { rotulo: 'Descarte', valor: r.descartes }, { rotulo: 'Novilhas aptas', valor: r.aptas }, { rotulo: 'Novilhas não aptas', valor: r.naoAptas }, { rotulo: 'Não passaram no toque', valor: r.ausentes.length },
    ],
    secoes: [
      grupo('Por protocolo (IATF ou monta)', r.porProtocolo), grupo('Por sêmen', r.porSemen), grupo('Por touro da monta', r.porMonta), grupo('Por lote', r.porLote), grupo('Por categoria', r.porCategoria),
      {
        titulo: 'Vaca por vaca',
        colunas: colsRel([['brinco', 'Brinco', { mono: true }], ['categoria', 'Categoria'], ['lote', 'Lote'], ['resultado', 'Resultado'], ['dg', 'Dias', { align: 'right' }], ['previsao', 'Previsão', { mono: true }], ['origem', 'Origem'], ['obs', 'Obs.']]),
        linhas: r.linhas.slice().sort((a, b) => ordemBrinco(a.brinco, b.brinco)).map((l) => ({ brinco: l.brinco, categoria: l.categoria, lote: l.lote, resultado: l.novilhaAval && l.resultado !== 'Cheia' ? (l.d.apta === 'Sim' ? 'Apta' : 'Não apta') : l.resultado, dg: l.dg || '', previsao: l.previsao ? formatarDataBR(l.previsao) : '', origem: l.origem, obs: [l.d.motivo, l.d.observacoes].filter(Boolean).join(' · ') })),
      },
      { titulo: 'Não passaram no toque', colunas: colsRel([['brinco', 'Brinco', { mono: true }], ['categoria', 'Categoria'], ['lote', 'Lote'], ['status', 'Situação']]), linhas: r.ausentes.map((m) => ({ brinco: m.brinco, categoria: m.categoria || '', lote: m.lote || '', status: m.status })) },
    ],
  };
}

export function relatorioProtocolo(estado, p, hoje) {
  const ag = agendaProtocolo(estado, p, hoje);
  const brincos = mapaBrincos(estado.matrizes);
  const presentesPor = new Map();
  ag.forEach((m) => m.feitos.forEach((f) => lista(f.presentes).forEach((id) => { if (!presentesPor.has(id)) presentesPor.set(id, new Set()); presentesPor.get(id).add(m.id); })));
  const iaPor = new Map(estado.eventos.filter((e) => e.tipo === 'iatf' && e.protocoloId === p.id).map((e) => [e.matrizId, e]));
  const touros = (p.touros || []).map((id) => nomeTouro(estado, id)).filter(Boolean);
  return {
    titulo: `${p.tipo === 'Monta' ? 'Monta' : 'Protocolo IATF'}: ${p.nome}`,
    subtitulo: p.tipo === 'Monta' ? `De ${formatarDataBR(p.dataInicio)} a ${formatarDataBR(fimDaMonta(p))}${touros.length ? ` · touros: ${touros.join(', ')}` : ''}` : `D0 em ${formatarDataBR(p.dataInicio)} · IA em ${formatarDataBR(dataIA(p))}${p.semenPadrao ? ` · sêmen: ${nomeTouro(estado, p.semenPadrao)}` : ''}`,
    resumo: [{ rotulo: 'Animais', valor: (p.animais || []).length }, { rotulo: 'Manejos feitos', valor: `${ag.filter((m) => m.feito).length} de ${ag.length}` }, { rotulo: 'Inseminadas', valor: iaPor.size }],
    secoes: [
      { titulo: 'Manejos', colunas: colsRel([['id', 'Dia'], ['data', 'Data', { mono: true }], ['descricao', 'O que fazer'], ['medicamentos', 'Medicamentos'], ['feito', 'Feito']]), linhas: ag.map((m) => ({ id: m.id, data: formatarDataBR(m.data), descricao: m.descricao, medicamentos: m.medicamentos || '', feito: m.feito ? `sim (${m.presentes} animais)` : m.atrasado ? 'ATRASADO' : 'não' })) },
      { titulo: 'Animais', colunas: colsRel([['brinco', 'Brinco', { mono: true }], ['manejos', 'Passou em'], ['semen', 'Sêmen']]), linhas: (p.animais || []).map((id) => ({ brinco: brincos[id] || '?', manejos: [...(presentesPor.get(id) || [])].join(', ') || '—', semen: iaPor.has(id) ? nomeTouroEvento(iaPor.get(id), estado.touros) || '—' : '—' })).sort((a, b) => ordemBrinco(a.brinco, b.brinco)) },
    ],
  };
}

export function relatorioTouros(estado, hoje, comValores) {
  const ts = estado.touros.slice().sort((a, b) => String(a.nome).localeCompare(String(b.nome), 'pt-BR'));
  const sem = ts.filter((t) => t.tipo !== 'Touro vivo').map((t) => { const e = estoqueSemen(t, estado.eventos); return { nome: t.nome, raca: t.raca || '', central: t.fornecedor || '', partida: t.partida || '', tipoSemen: t.tipoSemen || '', doses: e.compradas, usadas: e.usadas, restantes: e.restantes, custo: comValores && t.custoDose ? `R$ ${t.custoDose}` : '' }; });
  const vivos = ts.filter((t) => t.tipo === 'Touro vivo').map((t) => ({ nome: t.nome, brinco: t.brinco || '', raca: t.raca || '', idade: t.dataNascimento ? (idadeMesesDias(t.dataNascimento, hoje) || {}).texto : '—', origem: t.origem || '', andro: t.andrologicoData ? `${formatarDataBR(t.andrologicoData)} ${t.andrologicoResultado || ''}${andrologicoVencido(t, hoje) ? ' (vencido)' : ''}` : 'sem exame', lote: t.lote || '', situacao: t.situacao || 'Ativo' }));
  const colsS = [['nome', 'Sêmen'], ['raca', 'Raça'], ['central', 'Central'], ['partida', 'Partida'], ['tipoSemen', 'Tipo'], ['doses', 'Doses', { align: 'right' }], ['usadas', 'Usadas', { align: 'right' }], ['restantes', 'Restam', { align: 'right' }]];
  if (comValores) colsS.push(['custo', 'Custo/dose', { align: 'right' }]);
  return {
    titulo: 'Touros e sêmen',
    resumo: [{ rotulo: 'Sêmens', valor: sem.length }, { rotulo: 'Touros vivos', valor: vivos.length }, { rotulo: 'Exame andrológico vencido', valor: ts.filter((t) => andrologicoVencido(t, hoje)).length }],
    secoes: [{ titulo: 'Sêmen', colunas: colsRel(colsS), linhas: sem }, { titulo: 'Touros vivos', colunas: colsRel([['nome', 'Touro'], ['brinco', 'Brinco', { mono: true }], ['raca', 'Raça'], ['idade', 'Idade'], ['origem', 'Origem'], ['andro', 'Andrológico'], ['lote', 'Lote'], ['situacao', 'Situação']]), linhas: vivos }],
  };
}

// ---------------------------------------------------------------- dados completos e relatórios do app
import { normalizarDados, aplicarPendentes, montarRelatorio, relatorioMortes, relatorioVendas, relatorioCrias } from './logica.js';
import { relatorioManejosGerais } from './manejoGeral.js';

export function normalizarTudo(data) {
  const d = normalizarDados(data);
  return { ...d, touros: (d.touros || []).map(normalizarTouro), protocolos: (data.protocolos || []).map(normalizarProtocolo) };
}
export function aplicarPendentesTudo(dados, itens) {
  const r = aplicarPendentes(dados, itens);
  return { ...r, touros: (r.touros || []).map(normalizarTouro), protocolos: (r.protocolos || []).map(normalizarProtocolo) };
}

// Relatórios: quem vê (todos = funcionário e dono; dono = só com a senha). Funcionário nunca vê valores em R$.
export const RELATORIOS_APP = [
  { id: 'crias-sexo', titulo: 'Crias por sexo', curto: 'Crias', porAno: true, todos: true },
  { id: 'vazias', titulo: 'Matrizes vazias', curto: 'Vazias', porAno: false, todos: true },
  { id: 'prenhas', titulo: 'Matrizes prenhas', curto: 'Prenhas', porAno: false, todos: true },
  { id: 'situacao2', titulo: 'Situação das matrizes', curto: 'Situação', porAno: false, todos: true },
  { id: 'previsao', titulo: 'Previsão de parto', curto: 'Parto', porAno: false, todos: true },
  { id: 'toque', titulo: 'Último toque', curto: 'Toque', porAno: false, todos: true },
  { id: 'iatf', titulo: 'IATF', curto: 'IATF', porAno: true, todos: true },
  { id: 'vacinas', titulo: 'Vacinas pendentes', curto: 'Vacinas', porAno: false, todos: true },
  { id: 'pesagens', titulo: 'Pesagens', curto: 'Pesagens', porAno: true, todos: true },
  { id: 'crias', titulo: 'Crias e pesos', curto: 'Pesos', porAno: true, todos: true },
  { id: 'descartes', titulo: 'Descartes', curto: 'Descartes', porAno: true, todos: true },
  { id: 'mortes', titulo: 'Mortalidade', curto: 'Mortes', porAno: true, todos: true },
  { id: 'vendas', titulo: 'Vendas por peso', curto: 'Vendas', porAno: true, todos: true },
  { id: 'touros', titulo: 'Touros e sêmen', curto: 'Touros', porAno: false, todos: true },
  { id: 'manejos', titulo: 'Manejos gerais', curto: 'Manejos', porAno: true, todos: true },
  { id: 'nascimentos', titulo: 'Nascimentos por sexo', curto: 'Nascimentos', porAno: true, todos: false },
  { id: 'melhores', titulo: 'Melhores vacas em prenhez', curto: 'Melhores vacas', porAno: true, todos: false },
];

const ehValor = (txt) => /R\$|valor|receita|custo|pre[cç]o|r\$\/kg/i.test(String(txt || ''));
export function semValores(rel) {
  return {
    ...rel,
    resumo: (rel.resumo || []).filter((r) => !ehValor(r.rotulo)),
    secoes: (rel.secoes || []).map((s) => ({ ...s, colunas: s.colunas.filter((c) => !ehValor(c.label) && c.k !== 'vkg' && c.k !== 'total' && c.k !== 'valor') })),
  };
}

export function montarRelatorioApp(id, dados, ano, hoje, opcoes) {
  const dono = !!(opcoes && opcoes.dono);
  let rel;
  if (id === 'crias-sexo') rel = relatorioCriasPorSexo(dados, ano, hoje);
  else if (id === 'vazias') rel = relatorioVacasPorStatus(dados, 'Vazia', hoje);
  else if (id === 'prenhas') rel = relatorioVacasPorStatus(dados, 'Cheia', hoje);
  else if (id === 'situacao2') rel = relatorioVacasPorStatus(dados, '', hoje);
  else if (id === 'toque') {
    const t = listarToques(dados)[0];
    rel = t ? relatorioToque(dados, t.id) : { titulo: 'Último toque', resumo: [{ rotulo: 'Toques feitos no app', valor: 0 }], secoes: [] };
  } else if (id === 'vacinas') rel = relatorioVacinas(dados, dados.config, hoje);
  else if (id === 'pesagens') rel = relatorioPesagens(dados, ano, hoje);
  else if (id === 'descartes') rel = relatorioDescartes(dados, ano);
  else if (id === 'touros') rel = relatorioTouros(dados, hoje, dono);
  else if (id === 'manejos') rel = relatorioManejosGerais(dados, ano);
  else if (id === 'mortes') rel = relatorioMortes(dados, ano);
  else if (id === 'vendas') rel = relatorioVendas(dados, ano);
  else if (id === 'crias') rel = relatorioCrias(dados, dados.config, ano, hoje);
  else rel = montarRelatorio(id, dados, ano, hoje);
  return dono ? rel : semValores(rel);
}
