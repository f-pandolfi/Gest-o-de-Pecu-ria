// v11.4: o dono altera a situação de uma cria (nascimento), mesmo vendida, morta ou do histórico.
// Exemplo: a 3558 consta como vendida no histórico, mas é touro da fazenda: vira "Touro vivo" no cadastro de touros e a cria
// fica marcada "virou touro". A marca vai nas observações do nascimento (logica.marcarSituacaoDono) e vale sobre o histórico,
// a venda e a morte lançadas. Volta o plano: { mudancas: { eventos, matrizes }, touros, resumo } ou { erro }.
import { marcarSituacaoDono, idNovilha, padronizarLote } from './logica.js';
import { racaDoHistorico, CATEGORIAS_BOI } from './ficha.js';

export const ESCOLHAS_SITUACAO = [
  { id: 'mamando', nome: 'Na fazenda, mamando', sit: 'MAMANDO' },
  { id: 'desmamado', nome: 'Na fazenda, desmamado(a)', sit: 'NA FAZENDA' },
  { id: 'novilha', nome: 'Virou novilha (entra nas matrizes)', soFemea: true },
  { id: 'touro', nome: 'Virou touro da fazenda', sit: 'TOURO', soMacho: true },
  { id: 'boi', nome: 'Virou boi / garrote / rufião', sit: 'BOI', soMacho: true },
  { id: 'vendido', nome: 'Vendido(a)', sit: 'VENDIDO', data: true },
  { id: 'morto', nome: 'Morto(a)', sit: 'MORTO', data: true },
  { id: 'confirmar', nome: 'A confirmar', sit: 'A CONFIRMAR' },
];

export function planoSituacaoCria(ix, nascId, escolha, op) {
  const o = op || {};
  const c = ix.criaPorId.get(nascId);
  if (!c) return { erro: 'Cria não encontrada.' };
  const e = ESCOLHAS_SITUACAO.find((x) => x.id === escolha);
  if (!e) return { erro: 'Escolha a nova situação.' };
  if (e.soFemea && c.sexo !== 'Fêmea') return { erro: 'Só fêmea vira novilha.' };
  if (e.soMacho && c.sexo === 'Fêmea') return { erro: 'Fêmea não vira touro ou boi.' };
  if (e.data && !o.data) return { erro: 'Informe a data.' };
  if (c.novilha && escolha !== 'novilha') return { erro: `Esta cria já está no cadastro de matrizes (brinco ${c.novilha.brinco}). Altere pelo cadastro da matriz.` };
  const d = ix.dados;
  const hoje = o.hoje || ix.hoje;
  const now = o.agora || new Date().toISOString();
  const brinco = String(c.brinco || '').trim();
  const out = { mudancas: { eventos: [], matrizes: [] }, touros: [], resumo: '' };
  const lote = String(o.lote || '').trim();

  if (escolha === 'novilha') {
    if (c.novilha) return { erro: 'Já é novilha no cadastro.' };
    if (!brinco) return { erro: 'A cria não tem brinco.' };
    if (d.matrizes.some((m) => String(m.brinco).trim() === brinco && m.status !== 'Vendida' && m.status !== 'Morta')) return { erro: `Já existe matriz ativa com o brinco ${brinco}.` };
    out.mudancas.matrizes.push({
      id: idNovilha(nascId), brinco: /^\d+$/.test(brinco) ? Number(brinco) : brinco, categoria: 'Novilha', raca: racaDoHistorico(c.nasc) || '',
      lote: padronizarLote(lote || 'NOVILHAS', d.matrizes), dataNascimento: c.nascData || '', partosAnteriores: 0, status: 'Vazia', destino: '', dataBaixa: '', motivoBaixa: '', createdAt: now,
    });
    // tira a marca do dono, se houver (a novilha do cadastro passa a mandar)
    if (c.situacaoDono) out.mudancas.eventos.push({ tipo: 'nascimento', id: nascId, campos: { observacoes: String(c.nasc.observacoes || '').replace(/\s*(·\s*)?\[situa[çc][ãa]o definida pelo dono:[^\]]*\]/gi, '').trim() } });
    out.resumo = `${brinco} virou novilha no lote ${out.mudancas.matrizes[0].lote}.`;
    return out;
  }

  out.mudancas.eventos.push({ tipo: 'nascimento', id: nascId, campos: { observacoes: marcarSituacaoDono(c.nasc.observacoes, e.sit, e.data ? o.data : '', hoje) } });
  if (escolha === 'touro' || escolha === 'boi') {
    const ja = (d.touros || []).find((t) => String(t.brinco || '').trim() === brinco && brinco);
    if (!ja) {
      const cat = escolha === 'boi' ? (CATEGORIAS_BOI.includes(o.categoria) ? o.categoria : 'Boi') : '';
      out.touros.push({
        id: `${escolha === 'touro' ? 'tou' : 'boi'}-cria-${nascId}`, tipo: escolha === 'touro' ? 'Touro vivo' : 'Boi', nome: escolha === 'touro' ? `Touro ${brinco || 's/ nº'}` : `${cat} ${brinco || 's/ nº'}`,
        brinco, raca: racaDoHistorico(c.nasc) || '', dataNascimento: c.nascData || '', lote, origem: 'Nascido na fazenda', situacao: '',
        mae: c.maeBrinco || '', observacoes: `Cria ${brinco} nascida em ${c.nascData}${c.maeBrinco ? `, mãe ${c.maeBrinco}` : ''}`, createdAt: now,
      });
    }
    out.resumo = `${brinco} ${escolha === 'touro' ? 'virou touro da fazenda' : 'virou boi'}${ja ? ' (já estava no cadastro de touros e bois)' : ', cadastrado em Rebanho'}.`;
  } else {
    out.resumo = `${brinco || 'Cria'}: situação alterada para "${e.nome}".`;
  }
  return out;
}
