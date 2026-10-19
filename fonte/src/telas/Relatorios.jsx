// Tela "Relatórios" (só proprietário): os 5 relatórios combinados + a planilha de dados do ano.
import React, { useMemo, useState } from 'react';
import { Printer, Download, FileDown, Loader2 } from 'lucide-react';
import { baixarPDF } from '../pdfloader.js';
import {
  RELATORIOS, montarRelatorio, ABAS_EXCEL, linhasPlanilha, filtrarPorAno, rotuloAno,
} from '../logica.js';
import { IndexTabs, Kpis, SecaoRelatorio, TabelaLinhas } from '../ui.jsx';

const NOMES_CURTOS = { previsao: 'Parto', nascimentos: 'Nascimentos', melhores: 'Melhores vacas', iatf: 'IATF', situacao: 'Situação', crias: 'Crias', vendas: 'Vendas', mortes: 'Mortes' };

export default function Relatorios({ anoSel, dados, ano, hoje, onExcel, onExcelRelatorio }) {
  const [aba, setAba] = useState('previsao');
  const [tipoPlan, setTipoPlan] = useState('matrizes');
  const [gerando, setGerando] = useState(false);
  const [erroPdf, setErroPdf] = useState('');
  async function pdf() {
    if (!rel || gerando) return;
    setGerando(true); setErroPdf('');
    try { await baixarPDF({ ...rel, subtitulo: def && !def.porAno ? 'Situação de hoje' : `Ano de gestão: ${rotuloAno(ano)}` }); } catch (e) { console.error(e); setErroPdf('Não consegui gerar o PDF agora. Tente de novo com internet.'); }
    setGerando(false);
  }

  const abas = [...RELATORIOS.map((r) => ({ id: r.id, label: NOMES_CURTOS[r.id] || r.titulo })), { id: 'planilha', label: 'Planilha' }];
  const def = RELATORIOS.find((r) => r.id === aba);
  const rel = useMemo(() => (def ? montarRelatorio(aba, dados, ano, hoje) : null), [aba, dados, ano, hoje]); // eslint-disable-line react-hooks/exhaustive-deps
  const evsAno = useMemo(() => filtrarPorAno(dados.eventos, ano), [dados.eventos, ano]);
  const linhasPlan = useMemo(
    () => (aba === 'planilha' ? linhasPlanilha(tipoPlan, { matrizes: dados.matrizes, touros: dados.touros, eventos: evsAno, todosEventos: dados.eventos }) : []),
    [aba, tipoPlan, dados, evsAno],
  );

  return (
    <div className="wrap">
      <div className="head">
        <div><small>Proprietário · {rotuloAno(ano)}</small><h1>{aba === 'planilha' ? 'Planilha' : 'Relatórios'}</h1></div>
        <div className="acts noprint">
          {anoSel}
          {def && <button className="btn sm" onClick={pdf} disabled={gerando}>{gerando ? <Loader2 size={16} className="spin" /> : <FileDown size={16} />} PDF</button>}
          {def && <button className="btn quiet sm" onClick={() => window.print()}><Printer size={16} /> Imprimir</button>}
          {def && <button className="btn ghost sm" onClick={() => onExcelRelatorio(rel)}><Download size={16} /> Excel deste relatório</button>}
          {aba === 'planilha' && <button className="btn ghost sm" onClick={onExcel}><Download size={16} /> Excel completo de {rotuloAno(ano)}</button>}
        </div>
      </div>

      {erroPdf && <p className="late" role="alert">{erroPdf}</p>}
      <IndexTabs tabs={abas} value={aba} onChange={setAba} rotulo="Relatórios" />
      <div className="sheet pad">
        {def && rel && (
          <>
            <h2 className="h2" style={{ marginTop: 0 }}>{rel.titulo}</h2>
            {!def.porAno && (
              <p className="sub">Este relatório mostra a situação de hoje e não muda com o ano escolhido.</p>
            )}
            <Kpis itens={rel.resumo.map((r) => ({ rotulo: r.rotulo, valor: r.valor }))} />
            {rel.secoes.map((s) => <SecaoRelatorio key={s.titulo} secao={s} />)}
          </>
        )}

        {aba === 'planilha' && (
          <>
            <p className="sub">Os dados brutos de cada aba, como estão na planilha. Os lançamentos mostram só {rotuloAno(ano)}; matrizes e touros aparecem inteiros.</p>
            <div className="seg" style={{ flexWrap: 'wrap', marginBottom: 14 }} role="group" aria-label="Aba da planilha">
              {ABAS_EXCEL.map(([nome, tipo]) => (
                <button key={tipo} aria-pressed={tipoPlan === tipo} onClick={() => setTipoPlan(tipo)} style={{ flex: '0 0 auto', minHeight: 40, fontSize: 13 }}>{nome}</button>
              ))}
            </div>
            <TabelaLinhas rows={linhasPlan} />
          </>
        )}
      </div>
    </div>
  );
}
