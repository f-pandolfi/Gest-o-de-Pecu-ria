// pesagemConferencia.js (app 10.4): animal sem brinco na pesagem e conferência do dia.
// - Animal que perdeu o brinco é pesado assim mesmo ("SEM BRINCO", com um sinal: cor, marca).
// - Peso repetido no mesmo número (ex.: 6515 duas vezes) pode virar "outro animal" (sem brinco, anotado como 6515).
// - Conferência da data: quem ficou SEM PESO x os SEM BRINCO com peso. Tocar num sem brinco e escolher um dos que
//   ficaram sem peso liga aquele peso ao animal (dá baixa nas duas listas). Grava com atualizarCampos (já existia).
import {
  novoId, numPeso, listarCrias, ehSemBrinco, sinalSemBrinco, MARCA_SEM_BRINCO, formatarDataBR, idadeMesesDias,
} from './logica.js';

const ordemBrinco = (a, b) => String(a).localeCompare(String(b), 'pt-BR', { numeric: true });

// Pesagem de um animal sem brinco (evento pronto para gravar)
export function pesagemSemBrinco(data, peso, sinal, opcoes) {
  const op = opcoes || {};
  const p = numPeso(peso);
  if (!data) return { erro: 'Escolha a data da pesagem.' };
  if (isNaN(p) || p <= 0) return { erro: 'Digite o peso do animal sem brinco.' };
  const s = String(sinal || '').trim();
  return {
    evento: {
      id: op.id || novoId(), tipo: 'pesagem', data, criaId: '', matrizId: '', brinco: '', peso: p,
      observacoes: `${MARCA_SEM_BRINCO}${s ? `: ${s}` : ''}`, createdAt: op.now || new Date().toISOString(),
    },
  };
}

// Pesagens de uma data agrupadas por animal (para achar quem foi pesado 2x)
function pesagensDoDia(estado, data) {
  return estado.eventos.filter((e) => e.tipo === 'pesagem' && e.data === data);
}

// Conferência da pesagem de uma data.
// sexo: 'Macho' | 'Fêmea' | '' (todos). Sem informar, usa o sexo dos animais pesados nesse dia (se forem todos de um sexo).
// Devolve { semBrinco: [...], naoPesados: [...], repetidos: [...], pesados, sexo, sexosDoDia }
export function conferenciaPesagem(estado, data, hoje, opcoes) {
  const op = opcoes || {};
  const pes = pesagensDoDia(estado, data);
  const crias = listarCrias(estado, hoje);
  const porId = new Map(crias.map((c) => [c.id, c]));
  const pesadosIds = new Set(pes.filter((e) => e.criaId).map((e) => e.criaId));
  const pesadosMatriz = new Set(pes.filter((e) => e.matrizId).map((e) => e.matrizId));
  const sexosDoDia = [...new Set(pes.map((e) => (porId.get(e.criaId) || {}).sexo).filter(Boolean))];
  const sexo = op.sexo !== undefined ? op.sexo : sexosDoDia.length === 1 ? sexosDoDia[0] : '';
  const semBrinco = pes.filter(ehSemBrinco).map((e) => ({ id: e.id, peso: numPeso(e.peso), sinal: sinalSemBrinco(e), evento: e }))
    .sort((a, b) => b.peso - a.peso);
  // quem deveria ter sido pesado: crias no rebanho (mamando ou desmamadas), nascidas até a data, sem peso nessa data
  const naoPesados = crias
    .filter((c) => (c.situacao === 'mamando' || c.situacao === 'desmamado') && c.nascData && c.nascData <= data)
    .filter((c) => !pesadosIds.has(c.id) && !(c.novilha && pesadosMatriz.has(c.novilha.id)))
    .filter((c) => !sexo || c.sexo === sexo)
    .map((c) => ({
      criaId: c.id, brinco: c.brinco || 's/ nº', sexo: c.sexo, maeBrinco: c.maeBrinco || '', nascData: c.nascData,
      idade: (idadeMesesDias(c.nascData, data) || {}).texto || '', ultimoPeso: c.pesoAtual, ultimoPesoData: c.pesoData,
    }))
    .sort((a, b) => ordemBrinco(a.brinco, b.brinco));
  // mesmo animal pesado mais de uma vez nessa data
  const grupos = new Map();
  pes.filter((e) => !ehSemBrinco(e) && (e.criaId || e.matrizId)).forEach((e) => {
    const k = e.criaId || e.matrizId;
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k).push(e);
  });
  const repetidos = [...grupos.values()].filter((l) => l.length > 1)
    .map((l) => ({ brinco: String(l[0].brinco || ''), pesagens: l.map((e) => ({ id: e.id, peso: numPeso(e.peso), createdAt: e.createdAt || '' })) }))
    .sort((a, b) => ordemBrinco(a.brinco, b.brinco));
  return { semBrinco, naoPesados, repetidos, pesados: pes.length, sexo, sexosDoDia };
}

// Liga a pesagem SEM BRINCO a uma cria que ficou sem peso. Volta { mudancas } no formato das correções.
export function identificarSemBrinco(estado, pesagemId, criaId, opcoes) {
  const op = opcoes || {};
  const e = estado.eventos.find((x) => x.id === pesagemId && x.tipo === 'pesagem');
  if (!e || !ehSemBrinco(e)) return { erro: 'Essa pesagem não é de animal sem brinco (ou já foi identificada).' };
  const nasc = estado.eventos.find((x) => x.id === criaId && x.tipo === 'nascimento');
  if (!nasc) return { erro: 'Não achei esse animal.' };
  const ja = estado.eventos.some((x) => x.tipo === 'pesagem' && x.data === e.data && x.criaId === criaId);
  if (ja) return { erro: `O ${nasc.brincoBezerro || 'animal'} já tem peso em ${formatarDataBR(e.data)}.` };
  const sinal = sinalSemBrinco(e);
  const hoje = (op.now || new Date().toISOString()).slice(0, 10);
  const campos = {
    criaId, brinco: String(nasc.brincoBezerro ?? '').trim(),
    observacoes: `Identificado em ${formatarDataBR(hoje)} (pesado sem brinco${sinal ? `: ${sinal}` : ''})`,
  };
  return { mudancas: { eventos: [{ tipo: 'pesagem', id: e.id, campos }], matrizes: [] }, brinco: campos.brinco, peso: numPeso(e.peso) };
}

// Um dos pesos repetidos no mesmo número é de OUTRO animal: vira "sem brinco" (anotado como <número>)
export function virarSemBrinco(estado, pesagemId) {
  const e = estado.eventos.find((x) => x.id === pesagemId && x.tipo === 'pesagem');
  if (!e) return { erro: 'Não achei essa pesagem.' };
  if (ehSemBrinco(e)) return { erro: 'Essa pesagem já está como sem brinco.' };
  const b = String(e.brinco || '').trim();
  const campos = { criaId: '', matrizId: '', brinco: '', observacoes: `${MARCA_SEM_BRINCO}: anotado como ${b || '?'}` };
  return { mudancas: { eventos: [{ tipo: 'pesagem', id: e.id, campos }], matrizes: [] }, brinco: b, peso: numPeso(e.peso) };
}
