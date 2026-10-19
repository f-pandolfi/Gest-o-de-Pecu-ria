// Gera o PDF de qualquer relatório do app (v9.5). Arquivo separado (pdf.js), carregado só quando alguém pede um PDF.
// Relatório: { titulo, subtitulo?, resumo: [{ rotulo, valor }], secoes: [{ titulo, nota?, colunas: [{ k, label, align? }], linhas: [obj] }] }
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const VERDE = [44, 74, 59];
const AMBAR = [176, 112, 40];
const CINZA = [95, 105, 98];

// As fontes padrão do PDF só têm o alfabeto latino: troca o que não existe nelas
function limpar(v) {
  if (v === null || v === undefined || v === '') return '—';
  return String(v)
    .replace(/→/g, '->').replace(/←/g, '<-').replace(/≥/g, '>=').replace(/≤/g, '<=')
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/[^\u0000-ÿ–—•…€]/g, '');
}

function nomeArquivo(titulo) {
  const base = String(titulo || 'relatorio').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  return `${base || 'relatorio'}.pdf`;
}

function agoraTxt() {
  const d = new Date(); const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)} às ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Monta o PDF e devolve o documento (jsPDF). opcoes: { paisagem?, rodape? }
export function montarPDF(rel, opcoes) {
  const op = opcoes || {};
  const largas = (rel.secoes || []).some((s) => (s.colunas || []).length > 6);
  const doc = new jsPDF({ orientation: op.paisagem || largas ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const M = 12;
  let y = M;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...AMBAR);
  doc.text('FAZENDA IBIRAÇU · GESTÃO DA PECUÁRIA', M, y + 3);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(...CINZA);
  doc.text(limpar(`Gerado em ${agoraTxt()}`), W - M, y + 3, { align: 'right' });
  y += 10;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(20, 30, 24);
  doc.text(limpar(rel.titulo), M, y);
  y += 2;
  if (rel.subtitulo) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...CINZA);
    y += 5; doc.text(limpar(rel.subtitulo), M, y);
  }
  doc.setDrawColor(...VERDE); doc.setLineWidth(0.6); doc.line(M, y + 3, W - M, y + 3);
  y += 7;

  if (rel.resumo && rel.resumo.length) {
    const pares = [];
    for (let i = 0; i < rel.resumo.length; i += 2) {
      const a = rel.resumo[i]; const b = rel.resumo[i + 1];
      pares.push([limpar(a.rotulo), limpar(a.valor), b ? limpar(b.rotulo) : '', b ? limpar(b.valor) : '']);
    }
    autoTable(doc, {
      startY: y, body: pares, theme: 'plain', margin: { left: M, right: M },
      styles: { fontSize: 9, cellPadding: { top: 1.2, bottom: 1.2, left: 2, right: 2 }, textColor: [30, 38, 33] },
      columnStyles: { 0: { textColor: CINZA }, 1: { fontStyle: 'bold' }, 2: { textColor: CINZA }, 3: { fontStyle: 'bold' } },
    });
    y = doc.lastAutoTable.finalY + 5;
  }

  (rel.secoes || []).forEach((s) => {
    if (y > doc.internal.pageSize.getHeight() - 30) { doc.addPage(); y = M; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(...VERDE);
    doc.text(limpar(`${s.titulo}  (${s.linhas.length})`), M, y + 4);
    y += 6;
    if (s.nota) {
      doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(...CINZA);
      const linhasNota = doc.splitTextToSize(limpar(s.nota), W - 2 * M);
      doc.text(linhasNota, M, y + 3);
      y += 3.6 * linhasNota.length + 1.5;
    }
    const cols = s.colunas || [];
    const corpo = s.linhas.length ? s.linhas.map((l) => cols.map((c) => limpar(l[c.k]))) : [[{ content: 'Nada para mostrar neste período.', colSpan: Math.max(cols.length, 1) }]];
    const estilos = {};
    cols.forEach((c, i) => { if (c.align === 'right') estilos[i] = { halign: 'right' }; });
    autoTable(doc, {
      startY: y + 1, head: [cols.map((c) => limpar(c.label))], body: corpo, margin: { left: M, right: M },
      theme: 'striped', columnStyles: estilos,
      headStyles: { fillColor: VERDE, textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8.5, cellPadding: 1.6, overflow: 'linebreak', textColor: [25, 32, 28] },
      alternateRowStyles: { fillColor: [241, 244, 239] },
      didParseCell: (d) => {
        if (d.section !== 'body') return;
        const primeira = String(d.row.raw && d.row.raw[0] ? d.row.raw[0] : '');
        const texto = String(d.cell.raw || '');
        if (primeira === 'Total') { d.cell.styles.fontStyle = 'bold'; d.cell.styles.textColor = AMBAR; }
        if (/\d+x NESTA DATA/.test(texto)) { d.cell.styles.fontStyle = 'bold'; d.cell.styles.textColor = [170, 60, 30]; }
      },
    });
    y = doc.lastAutoTable.finalY + 7;
  });

  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...CINZA);
    const H = doc.internal.pageSize.getHeight();
    doc.text(limpar(op.rodape || 'Fazenda Ibiraçu'), M, H - 6);
    doc.text(`Página ${i} de ${n}`, W - M, H - 6, { align: 'right' });
  }
  return doc;
}

// Gera e baixa o PDF. Devolve o nome do arquivo.
export function gerarPDF(rel, opcoes) {
  const doc = montarPDF(rel, opcoes);
  const nome = (opcoes && opcoes.arquivo) || nomeArquivo(rel.titulo);
  doc.save(nome);
  if (typeof window !== 'undefined') window.__ultimoPDF = { nome, paginas: doc.getNumberOfPages(), bytes: doc.output('arraybuffer').byteLength };
  return nome;
}
