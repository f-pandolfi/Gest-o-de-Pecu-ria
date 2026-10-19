// Tela "Relatórios": funcionário e dono. Todos baixam em PDF; o dono também vê valores, Excel e a Planilha.
import React, { useMemo, useState } from 'react';
import { Printer, Download, FileDown, Loader2 } from 'lucide-react';
import { ABAS_EXCEL, linhasPlanilha, filtrarPorAno, rotuloAno } from '../logica.js';
import { RELATORIOS_APP, montarRelatorioApp } from '../manejo.js';
import { IndexTabs, Kpis, SecaoRelatorio, TabelaLinhas } from '../ui.jsx';
import { baixarPDF } from '../pdfloader.js';

export default function Relatorios({ anoSel, dados, ano, hoje, ownerMode, onExcel, onExcelRelatorio }) {
  const lista = RELATORIOS_APP.filter((r) => ownerMode || r.todos);
  const [aba, setAba] = useState(lista[0].id);
  const [tipoPlan, setTipoPlan] = useState('matrizes');
  const [gerando, setGerando] = useState(false);
  const [erroPdf, setErroPdf] = useState('');

  const abas = [...lista.map((r) => ({ id: r.id, label: r.curto })), ...(ownerMode ? [{ id: 'planilha', label: 'Planilha' }] : [])];
  const def = lista.find((r) => r.id === aba) || (aba === 'planilha' ? null : lista[0]);
  const rel = useMemo(() => (def ? montarRelatorioApp(def.id, dados, ano, hoje, { dono: ownerMode }) : null), [def && def.id, dados, ano, hoje, ownerMode]); // eslint-disable-line react-hooks/exhaustive-deps
  const evsAno = useMemo(() => filtrarPorAno(dados.eventos, ano), [dados.eventos, ano]);
  const linhasPlan = useMemo(
    () => (aba === 'planilha' && ownerMode ? linhasPlanilha(tipoPlan, { matrizes: dados.matrizes, touros: dados.touros, eventos: evsAno, todosEventos: dados.eventos }) : []),
    [aba, tipoPlan, dados, evsAno, ownerMode],
  );

  async function pdf() {
    if (!rel || gerando) return;
    setGerando(true); setErroPdf('');
    try { await baixarPDF({ ...rel, subtitulo: rel.subtitulo || (def.porAno ? `Ano de gestão: ${rotuloAno(ano)}` : 'Situação de hoje') }); } catch (e) { console.error(e); setErroPdf('Não consegui gerar o PDF agora. Abra o app uma vez com internet e tente de novo.'); }
    setGerando(false);
  }

  return (
    <div className="wrap">
      <div className="head">
        <div><small>{ownerMode ? 'Proprietário' : 'Funcionário'} · {rotuloAno(ano)}</small><h1>{aba === 'planilha' ? 'Planilha' : 'Relatórios'}</h1></div>
        <div className="acts noprint">
          {anoSel}
          {def && <button className="btn sm" onClick={pdf} disabled={gerando}>{gerando ? <Loader2 size={16} className="spin" /> : <FileDown size={16} />} PDF</button>}
          {def && <button className="btn quiet sm" onClick={() => window.print()}><Printer size={16} /> Imprimir</button>}
          {def && ownerMode && <button className="btn ghost sm" onClick={() => onExcelRelatorio(rel)}><Download size={16} /> Excel</button>}
          {aba === 'planilha' && ownerMode && <button className="btn ghost sm" onClick={onExcel}><Download size={16} /> Excel completo de {rotuloAno(ano)}</button>}
        </div>
      </div>
      {erroPdf && <p className="late" role="alert">{erroPdf}</p>}

      <IndexTabs tabs={abas} value={aba} onChange={setAba} rotulo="Relatórios" />
      <div className="sheet pad">
        {def && rel && (
          <>
            <h2 className="h2" style={{ marginTop: 0 }}>{rel.titulo}</h2>
            {rel.subtitulo && <p className="sub">{rel.subtitulo}</p>}
            {!def.porAno && <p className="sub">Este relatório mostra a situação de hoje e não muda com o ano escolhido.</p>}
            <Kpis itens={rel.resumo.map((r) => ({ rotulo: r.rotulo, valor: r.valor }))} />
            {rel.secoes.map((s) => <SecaoRelatorio key={s.titulo} secao={s} />)}
          </>
        )}

        {aba === 'planilha' && ownerMode && (
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
