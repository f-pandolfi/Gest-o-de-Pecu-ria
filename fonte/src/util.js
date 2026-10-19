// Pequenas funções de apoio às telas.
import { TIPOS_EVENTO, formatarDataBR, mapaBrincos, nomeTouroEvento } from './logica.js';

export const ROTULO_CURTO = {
  cadastro: 'Nova matriz', touro: 'Touro / sêmen', iatf: 'IATF', diagnostico: 'Toque', nascimento: 'Nascimento',
  desmama: 'Desmama', recria: 'Recria', pesagem: 'Peso', venda: 'Venda', vendaitem: 'Animal vendido', insumo: 'Insumo', descarte: 'Descarte', morte: 'Morte', manejo: 'Manejo',
};

export const rotuloEvento = (tipo) => (TIPOS_EVENTO.find((t) => t.id === tipo) || {}).label || tipo;

// Ordem das abas em "Lançar" (nascimento primeiro: é o que mais se lança no dia a dia)
// (a venda por peso e as pesagens ficam na tela Crias)
export const ORDEM_LANCAR = ['nascimento', 'morte', 'desmama', 'descarte', 'insumo', 'iatf', 'diagnostico', 'recria', 'cadastro'];

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
  } else if (e.tipo === 'pesagem') {
    if (e.brinco) partes.push(`animal ${e.brinco}`);
    if (e.peso) partes.push(`${fmtKg(e.peso)}`);
  } else if (e.tipo === 'vendaitem') {
    if (e.brinco) partes.push(`animal ${e.brinco}`);
    if (e.tipoAnimal) partes.push(e.tipoAnimal);
    if (e.peso) partes.push(`${fmtKg(e.peso)}`);
  } else if (e.tipo === 'venda') {
    if (e.animais) partes.push(e.animais);
    if (e.valorTotal) partes.push(fmtBRL(parseFloat(e.valorTotal)));
  } else if (e.tipo === 'morte') {
    if (e.tipoAnimal) partes.push(e.brinco ? `${e.tipoAnimal.toLowerCase()} ${e.brinco}` : `${e.tipoAnimal.toLowerCase()} sem número`);
    if (e.causa) partes.push(e.causa.toLowerCase());
    if (String(e.anulada ?? '').trim().toLowerCase() === 'sim') partes.push('anulada');
  } else if (e.tipo === 'manejo') {
    if (e.etapa) partes.push(e.etapa);
    const n = String(e.presentes || '').split(',').filter(Boolean).length;
    if (n) partes.push(`${n} animal(is)`);
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
// 245 -> "245 kg", 245.5 -> "245,5 kg", vazio -> "—"
export const fmtKg = (n) => {
  const x = Number(n);
  if (n === null || n === undefined || n === '' || isNaN(x)) return '—';
  return `${(Math.round(x * 10) / 10).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`;
};
export const fmtNum = (n, casas) => (n === null || n === undefined || isNaN(n) ? '—' : Number(n).toLocaleString('pt-BR', { maximumFractionDigits: casas === undefined ? 1 : casas, minimumFractionDigits: 0 }));
// 199 -> "199 dias"; 400 -> "13,2 meses"
export const fmtIdade = (dias) => (dias === null || dias === undefined ? '—' : dias < 60 ? `${dias} dias` : `${fmtNum(dias / 30.4, 1)} meses`);
export const fmtGmd = (g) => (g === null || g === undefined ? '—' : `${fmtNum(g, 2)} kg/dia`);
