// Pequenas funções de apoio às telas.
import { TIPOS_EVENTO, formatarDataBR, mapaBrincos, nomeTouroEvento } from './logica.js';

export const ROTULO_CURTO = {
  cadastro: 'Nova matriz', touro: 'Touro / sêmen', iatf: 'IATF', diagnostico: 'Toque', nascimento: 'Nascimento',
  desmama: 'Desmama', recria: 'Recria', venda: 'Venda', insumo: 'Insumo', descarte: 'Descarte',
};

export const rotuloEvento = (tipo) => (TIPOS_EVENTO.find((t) => t.id === tipo) || {}).label || tipo;

// Ordem das abas em "Lançar" (nascimento primeiro: é o que mais se lança no dia a dia)
export const ORDEM_LANCAR = ['nascimento', 'iatf', 'diagnostico', 'desmama', 'recria', 'descarte', 'insumo', 'venda', 'cadastro', 'touro'];

// Texto curto de um evento, para listas ("Nascimento · mãe 3012 · cria 6001")
export function descreverEvento(e, dados) {
  const brincos = mapaBrincos(dados.matrizes);
  const mae = e.matrizId ? brincos[e.matrizId] || '?' : '';
  const partes = [];
  if (e.tipo === 'nascimento') {
    if (mae) partes.push(`mãe ${mae}`);
    if (e.brincoBezerro) partes.push(`cria ${e.brincoBezerro}`);
    if (e.sexo) partes.push(e.sexo === 'Macho' ? 'macho' : 'fêmea');
    if (e.resultadoParto === 'Natimorto') partes.push('natimorto');
  } else if (e.tipo === 'diagnostico') {
    if (mae) partes.push(`vaca ${mae}`);
    if (e.resultado) partes.push(e.resultado.toLowerCase());
    if (e.dg) partes.push(`DG ${e.dg}`);
  } else if (e.tipo === 'iatf') {
    if (mae) partes.push(`vaca ${mae}`);
    const t = nomeTouroEvento(e, dados.touros);
    if (t) partes.push(t);
  } else if (e.tipo === 'desmama') {
    if (e.brincoBezerro) partes.push(`cria ${e.brincoBezerro}`);
    if (e.pesoDesmama) partes.push(`${e.pesoDesmama} kg`);
  } else if (e.tipo === 'venda') {
    if (e.animais) partes.push(e.animais);
    if (e.valorTotal) partes.push(`R$ ${e.valorTotal}`);
  } else if (e.tipo === 'insumo') {
    if (e.produto) partes.push(e.produto);
    if (e.quantidade) partes.push(`${e.quantidade} ${e.unidade || ''}`.trim());
  } else if (mae) {
    partes.push(`vaca ${mae}`);
  }
  return [rotuloEvento(e.tipo), ...partes].join(' · ');
}

export const fmtBRL = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const fmtData = formatarDataBR;
