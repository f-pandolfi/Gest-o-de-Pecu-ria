// Exportação para Excel (planilha completa do ano e cada relatório).
import * as XLSX from 'xlsx';
import {
  ABAS_EXCEL, linhasPlanilha, calcularKPIs, buildResumoRows, filtrarPorAno, rotuloAno,
} from './logica.js';

const nomeAba = (s) => String(s).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Aba';
const semAcento = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9_-]+/g, '_');

export function exportarExcel({ matrizes, touros, eventos }, ano, hoje) {
  const evs = filtrarPorAno(eventos, ano);
  const wb = XLSX.utils.book_new();
  const kpis = calcularKPIs(matrizes, evs);
  const resumo = [['Relatório Fazenda Ibiraçu', ''], ['Gerado em', hoje], ...buildResumoRows(kpis, ano)];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumo), 'Resumo');
  ABAS_EXCEL.forEach(([nome, tipo]) => {
    const linhas = linhasPlanilha(tipo, { matrizes, touros, eventos: evs, todosEventos: eventos });
    XLSX.utils.book_append_sheet(wb, linhas.length ? XLSX.utils.json_to_sheet(linhas) : XLSX.utils.aoa_to_sheet([['Sem registros']]), nomeAba(nome));
  });
  const arquivo = `Fazenda_Ibiracu_${ano === 'todos' ? 'todos_os_anos' : ano}_${hoje}.xlsx`;
  XLSX.writeFile(wb, arquivo);
  return arquivo;
}

export function exportarRelatorioExcel(rel, ano, hoje) {
  const wb = XLSX.utils.book_new();
  const topo = [[rel.titulo, ''], ['Gerado em', hoje], ['Ano de gestão', rotuloAno(ano)], ['', ''], ...rel.resumo.map((r) => [r.rotulo, r.valor])];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(topo), 'Resumo');
  const usados = new Set(['Resumo']);
  rel.secoes.forEach((s) => {
    let nome = nomeAba(s.titulo); let n = 2;
    while (usados.has(nome)) { nome = nomeAba(`${s.titulo} ${n++}`); }
    usados.add(nome);
    const aoa = [s.colunas.map((c) => c.label), ...s.linhas.map((l) => s.colunas.map((c) => (l[c.k] === undefined ? '' : l[c.k])))];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), nome);
  });
  const arquivo = `${semAcento(rel.titulo)}_${hoje}.xlsx`;
  XLSX.writeFile(wb, arquivo);
  return arquivo;
}
