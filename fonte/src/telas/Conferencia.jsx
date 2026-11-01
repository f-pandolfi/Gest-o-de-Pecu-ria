// v11.2: Rebanho > Conferência. Cruza os brincos anotados nos manejos (e toques, pesagens, partos) com o rebanho ativo.
// Rodada 1 desde 30/10/26; cada toque geral abre uma rodada nova. No fim, quem não passou no curral é avaliado para sair do rebanho.
import React, { useMemo, useState } from 'react';
import { Search, FileDown, Loader2, CheckCircle2 } from 'lucide-react';
import { baixarPDF } from '../pdfloader.js';
import { formatarDataBR } from '../logica.js';
import { useFicha } from './Ficha.jsx';
import { analisarConferencia, resumoConferencia, CATEGORIAS_CONF, confirmarNaFazenda } from '../conferencia.js';

const br = (d) => (d ? formatarDataBR(d) : '');
const ordemB = (a, b) => String(a.brinco).localeCompare(String(b.brinco), 'pt-BR', { numeric: true });
const nomeCat = (id) => (CATEGORIAS_CONF.find((c) => c.id === id) || {}).nome || '';
const pct = (x) => `${Math.round(x * 100)}%`;

// Proprietário: crias "a confirmar" que passaram no curral viram Novilha no cadastro (todas marcadas, escolhe o lote)
function ConfirmarNaFazenda({ ix, lista, onConfirmar }) {
  const femeas = lista.filter((s) => s.sexo === 'Fêmea');
  const [marc, setMarc] = useState(() => new Set(femeas.map((s) => s.id)));
  const loteSug = (femeas.find((s) => s.lote) || {}).lote || 'NOVILHAS';
  const [lote, setLote] = useState(loteSug);
  const [msg, setMsg] = useState('');
  const lotes = [...new Set(ix.dados.matrizes.map((m) => m.lote).filter(Boolean).concat(lista.map((s) => s.lote).filter(Boolean)))].sort();
  if (!femeas.length) return null;
  const alt = (id) => setMarc((m) => { const n = new Set(m); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  function confirmar() {
    const r = confirmarNaFazenda(ix, [...marc], lote);
    if (r.matrizes.length) onConfirmar(r.matrizes);
    setMsg(`${r.matrizes.length} novilha(s) confirmada(s) no lote ${lote}.${r.pulados.length ? ` Ficaram de fora: ${r.pulados.map((p) => `${p.brinco} (${p.motivo})`).join(', ')}.` : ''}`);
  }
  return (
    <div className="fx-card" style={{ marginTop: 10, background: 'var(--s2)' }} data-testid="confirmar-fazenda">
      <p className="sub" style={{ marginTop: 0 }}><b>Confirmar na fazenda:</b> as marcadas viram <b>Novilha</b> no cadastro, ligadas ao nascimento (mãe, data e raça do histórico). Desmarque quem não quiser.</p>
      <div className="fx-chips">
        {femeas.map((s) => (
          <label key={s.id} className={`fx-cp${marc.has(s.id) ? ' on' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={marc.has(s.id)} onChange={() => alt(s.id)} aria-label={`Confirmar ${s.brinco}`} />{s.brinco}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <label className="sub" style={{ margin: 0 }}>Lote <input className="fx-cp" style={{ minWidth: 140 }} list="conf-lotes" value={lote} onChange={(e) => setLote(e.target.value)} aria-label="Lote das novilhas confirmadas" /></label>
        <datalist id="conf-lotes">{lotes.map((x) => <option key={x} value={x} />)}</datalist>
        <button className="btn sm" onClick={confirmar} disabled={!marc.size || !lote.trim()} data-testid="confirmar-fazenda-sim"><CheckCircle2 size={16} /> Confirmar {marc.size} na fazenda</button>
      </div>
      {msg && <p className="sub" style={{ color: 'var(--green)' }} data-testid="confirmar-fazenda-msg">{msg}</p>}
    </div>
  );
}

export default function Conferencia({ hoje, ownerMode, onConfirmarNovilhas }) {
  const { ix, abrir } = useFicha();
  const an = useMemo(() => (ix ? analisarConferencia(ix) : null), [ix]);
  const [iR, setIR] = useState(null);
  const [filtro, setFiltro] = useState('faltam');
  const [cat, setCat] = useState('');
  const [lote, setLote] = useState('');
  const [busca, setBusca] = useState('');
  const [gerando, setGerando] = useState('');
  if (!an) return null;
  const ir = iR ?? an.atual;
  const rod = an.rodadas[ir];
  const r = resumoConferencia(an, ir);
  const duas = an.rodadas.length > 1;
  const passou = (l) => !!l.rodadas[ir];
  const lotes = [...new Set(an.linhas.map((l) => l.lote.replace(' (ao pé)', '')).filter(Boolean))].sort();
  const q = busca.trim();

  let lista = an.linhas.filter((l) => (
    filtro === 'faltam' ? !passou(l) : filtro === 'passaram' ? passou(l) : filtro === 'suspeitas' ? !passou(l) && l.motivos.length : filtro === 'todas' ? l.faltouTodas : true
  ));
  if (cat) lista = lista.filter((l) => l.cat === cat);
  if (lote) lista = lista.filter((l) => l.lote.replace(' (ao pé)', '') === lote);
  if (q) lista = lista.filter((l) => l.brinco.startsWith(q) || (l.mae && String(l.mae).startsWith(q)));
  lista = lista.slice().sort((a, b) => {
    if (filtro !== 'passaram') { const s = (b.motivos.length > 0) - (a.motivos.length > 0); if (s) return s; }
    return CATEGORIAS_CONF.findIndex((c) => c.id === a.cat) - CATEGORIAS_CONF.findIndex((c) => c.id === b.cat) || a.lote.localeCompare(b.lote) || ordemB(a, b);
  });

  const nomeFiltro = { faltam: 'Ainda não passaram no curral', passaram: 'Já passaram no curral', suspeitas: 'Suspeitas: faltaram e estão muito tempo sem parir', todas: 'Faltaram em todas as rodadas', '': 'Rebanho ativo' }[filtro];
  const periodo = `${rod.nome}: desde ${br(rod.inicio)}${rod.fim ? ` até ${br(rod.fim)}` : ''}`;
  const linhaPDF = (l) => ({
    brinco: l.brinco, animal: [l.rot, l.mae ? `mãe ${l.mae}` : '', l.status].filter(Boolean).join('\n'), lote: l.lote,
    visto: l.rodadas[ir] ? `${br(l.rodadas[ir].data)}\n${l.rodadas[ir].fonte}` : l.ultimo ? `antes: ${br(l.ultimo.data)}\n${l.ultimo.fonte}` : 'nunca registrado',
    semParir: l.mesesSemParir ?? '', atencao: l.motivos.join('; '), conferido: '',
  });
  const COLS_PDF = [
    { k: 'brinco', label: 'Brinco' }, { k: 'animal', label: 'Animal' }, { k: 'lote', label: 'Lote' }, { k: 'visto', label: 'Visto no curral' },
    { k: 'semParir', label: 'Meses sem parir', align: 'right' }, { k: 'atencao', label: 'Atenção' }, { k: 'conferido', label: 'Achou? (anotar)' },
  ];
  const resumoPDF = [
    { rotulo: 'Rebanho ativo', valor: r.total }, { rotulo: 'Passaram no curral', valor: `${r.passaram} (${pct(r.pct)})` },
    { rotulo: 'Ainda não passaram', valor: r.faltam }, { rotulo: 'Suspeitas', valor: r.suspeitas },
  ];
  async function gerarPDF(tipo) {
    setGerando(tipo);
    try {
      if (tipo === 'lista') {
        await baixarPDF({ titulo: `Conferência do rebanho · ${nomeFiltro}`, subtitulo: `Fazenda Ibiraçu · ${periodo} · ${lista.length} animal(is)${cat ? ` · ${nomeCat(cat)}` : ''}${lote ? ` · lote ${lote}` : ''}`, resumo: resumoPDF, secoes: [{ titulo: nomeFiltro, colunas: COLS_PDF, linhas: lista.map(linhaPDF) }] }, { paisagem: true, arquivo: `conferencia-${filtro || 'todos'}-${hoje}.pdf` });
      } else {
        // Para levar ao curral: quem falta, separado por lote
        const faltam = an.linhas.filter((l) => !passou(l));
        const porLote = [...new Set(faltam.map((l) => l.lote.replace(' (ao pé)', '') || 'Sem lote'))].sort();
        await baixarPDF({
          titulo: 'Conferência do rebanho: quem falta passar no curral', subtitulo: `Fazenda Ibiraçu · ${periodo} · gerado em ${br(hoje)}`, resumo: resumoPDF,
          secoes: [
            ...porLote.map((lt) => ({ titulo: `Lote ${lt}`, colunas: COLS_PDF, linhas: faltam.filter((l) => (l.lote.replace(' (ao pé)', '') || 'Sem lote') === lt).sort((a, b) => (b.motivos.length > 0) - (a.motivos.length > 0) || ordemB(a, b)).map(linhaPDF) })),
            ...(an.semCadastro.length ? [{ titulo: 'Brincos anotados que não estão no cadastro', colunas: [{ k: 'brinco', label: 'Brinco' }, { k: 'data', label: 'Data' }, { k: 'manejo', label: 'Manejo' }, { k: 'lote', label: 'Lote' }, { k: 'nota', label: 'Observação' }], linhas: an.semCadastro.map((s) => ({ ...s, data: br(s.data) })) }] : []),
            ...(an.fora.length ? [{ titulo: 'Passaram no curral mas estão como fora do rebanho', colunas: [{ k: 'brinco', label: 'Brinco' }, { k: 'rot', label: 'Animal' }, { k: 'situacao', label: 'No sistema' }, { k: 'data', label: 'Visto em' }], linhas: an.fora.map((s) => ({ ...s, data: br(s.data) })) }] : []),
          ],
        }, { paisagem: true, arquivo: `conferencia-faltam-${hoje}.pdf` });
      }
    } catch (e) { console.error(e); }
    setGerando('');
  }
  const Chip = ({ on, onClick, children, testid }) => <button className={`fx-cp${on ? ' on' : ''}`} aria-pressed={on} onClick={onClick} data-testid={testid}>{children}</button>;

  return (
    <div data-testid="conferencia">
      <p className="sub pd-lead" style={{ marginTop: 14 }}>
        Os brincos anotados nos manejos são a chamada do rebanho. <b>{periodo}</b>: <b>{r.passaram}</b> de <b>{r.total}</b> animais ativos já passaram no curral ({pct(r.pct)}).
        {' '}Conta qualquer manejo, toque, IATF, pesagem, desmama e parto. {rod.fim ? '' : 'Cada toque geral abre uma rodada nova.'}
      </p>

      {duas && (
        <div className="fx-chips">
          {an.rodadas.map((x, i) => <Chip key={x.n} on={ir === i} onClick={() => setIR(i)} testid={`rodada-${x.n}`}>{x.nome} · {br(x.inicio)}</Chip>)}
        </div>
      )}

      <div className="fx-resumo">
        <button className="fx-kpi" onClick={() => setFiltro('')}><small>Rebanho ativo</small><b>{r.total}</b></button>
        <button className="fx-kpi" onClick={() => setFiltro('passaram')}><small>Passaram no curral</small><b style={{ color: 'var(--green)' }}>{r.passaram}</b><i>{pct(r.pct)}</i></button>
        <button className="fx-kpi" onClick={() => setFiltro('faltam')} data-testid="kpi-faltam"><small>Ainda não passaram</small><b style={{ color: 'var(--amber)' }}>{r.faltam}</b></button>
        <button className="fx-kpi" onClick={() => setFiltro('suspeitas')} data-testid="kpi-suspeitas"><small>Suspeitas (faltam e sem parir)</small><b style={{ color: 'var(--late)' }}>{r.suspeitas}</b></button>
        {duas && <button className="fx-kpi" onClick={() => setFiltro('todas')}><small>Faltaram em todas as rodadas</small><b style={{ color: 'var(--late)' }}>{r.faltouTodas}</b></button>}
        {r.anotacoes > 0 && <a className="fx-kpi" href="#conf-anotacoes" style={{ textDecoration: 'none' }}><small>Anotações a conferir</small><b style={{ color: 'var(--amber)' }}>{r.anotacoes}</b></a>}
      </div>

      <section className="fx-card" style={{ marginBottom: 14 }}>
        <h3>Quem já passou, por categoria</h3>
        <div className="pd-barras">
          {r.porCat.map((c) => (
            <button key={c.id} className="pd-barra" onClick={() => setCat(cat === c.id ? '' : c.id)} aria-label={`${c.nome}: ${c.passaram} de ${c.total}`}>
              <span className="nome">{c.nome}</span>
              <span className="trilho"><span style={{ width: `${(c.passaram / Math.max(1, c.total)) * 100}%`, background: 'var(--green)' }} /></span>
              <b style={{ width: 'auto', whiteSpace: 'nowrap' }}>{c.passaram}/{c.total}</b>
            </button>
          ))}
        </div>
      </section>

      <div className="fx-chips">
        <Chip on={filtro === 'faltam'} onClick={() => setFiltro('faltam')} testid="f-faltam">Não passaram<b>{r.faltam}</b></Chip>
        <Chip on={filtro === 'suspeitas'} onClick={() => setFiltro('suspeitas')} testid="f-suspeitas">Suspeitas<b>{r.suspeitas}</b></Chip>
        <Chip on={filtro === 'passaram'} onClick={() => setFiltro('passaram')} testid="f-passaram">Passaram<b>{r.passaram}</b></Chip>
        {duas && <Chip on={filtro === 'todas'} onClick={() => setFiltro('todas')}>Faltaram em todas<b>{r.faltouTodas}</b></Chip>}
        <Chip on={filtro === ''} onClick={() => setFiltro('')}>Todos<b>{r.total}</b></Chip>
      </div>
      <div className="fx-chips">
        <Chip on={!cat} onClick={() => setCat('')}>Todas as categorias</Chip>
        {r.porCat.map((c) => <Chip key={c.id} on={cat === c.id} onClick={() => setCat(c.id)}>{c.nome}</Chip>)}
        {lotes.length > 1 && (
          <select className="fx-cp" value={lote} onChange={(e) => setLote(e.target.value)} aria-label="Filtrar por lote" data-testid="conf-lote">
            <option value="">Todos os lotes</option>{lotes.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        )}
      </div>
      <div className="pd-pdf">
        <button className="btn sm" onClick={() => gerarPDF('lista')} disabled={!!gerando} data-testid="conf-pdf-lista">{gerando === 'lista' ? <Loader2 size={16} className="spin" /> : <FileDown size={16} />} PDF desta lista</button>
        <button className="btn sm quiet" onClick={() => gerarPDF('curral')} disabled={!!gerando} data-testid="conf-pdf-curral">{gerando === 'curral' ? <Loader2 size={16} className="spin" /> : <FileDown size={16} />} PDF para o curral (quem falta, por lote)</button>
      </div>
      <label className="search fx-search">
        <Search />
        <input placeholder="Buscar brinco (ou da mãe)" aria-label="Buscar brinco na conferência" inputMode="numeric" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </label>

      <div className="pd-tabela-box">
        <table className="pd-tabela" data-testid="tabela-conferencia">
          <thead><tr><th>Brinco</th><th>Animal</th><th>Lote</th><th>Visto no curral</th><th className="num">Meses sem parir</th><th>Atenção</th></tr></thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan={6} className="mut">Nenhum animal com esse filtro.</td></tr>}
            {lista.map((l) => {
              const v = l.rodadas[ir];
              return (
                <tr key={l.k} onClick={() => abrir(l.k)} data-testid={`conf-${l.brinco}`}>
                  <td className="br">{l.brinco}<small>{l.status}</small></td>
                  <td>{l.rot}{l.mae ? <small>mãe {l.mae}</small> : null}</td>
                  <td>{l.lote || <span className="mut">sem lote</span>}</td>
                  <td>{v ? <><span style={{ color: 'var(--green)' }}>{br(v.data)}</span><small>{v.fonte}</small></>
                    : l.ultimo ? <><span className="mut">antes: {br(l.ultimo.data)}</span><small>{l.ultimo.fonte}</small></> : <span className="mut">nunca registrado</span>}</td>
                  <td className="num">{l.mesesSemParir ?? ''}</td>
                  <td className="acao">{l.motivos.length ? <span className="late">{l.motivos.join('; ')}</span> : l.confirmada ? 'Estava a confirmar: está na fazenda' : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(an.semCadastro.length > 0 || an.fora.length > 0 || an.confirmadas.length > 0) && (
        <section className="fx-card" id="conf-anotacoes" style={{ marginTop: 14 }} data-testid="conf-anotacoes">
          <h3>Anotações a conferir</h3>
          {an.semCadastro.length > 0 && <>
            <p className="sub">Brincos anotados nos manejos que <b>não estão no cadastro</b> ({an.semCadastro.length}). Cadastre ou corrija o número.</p>
            <div className="fx-chips">{an.semCadastro.map((s, i) => <span key={i} className="fx-pill p-amber" title={`${br(s.data)} · ${s.manejo}${s.nota ? ` · ${s.nota}` : ''}`}>{s.brinco}{s.repetido ? ' (nº repetido)' : ''}</span>)}</div>
          </>}
          {an.fora.length > 0 && <>
            <p className="sub">Passaram no curral mas no sistema <b>estão fora do rebanho</b> ({an.fora.length}). Confira se a baixa está certa.</p>
            {an.fora.map((s) => <button key={s.k} className="fx-li" onClick={() => abrir(s.k)}><span className="fx-bb">{s.brinco}<small>{s.rot}</small></span><span className="fx-two"><b>{s.situacao}</b><span>visto em {br(s.data)} · {s.manejo}</span></span></button>)}
          </>}
          {an.confirmadas.length > 0 && <>
            <p className="sub">Crias do histórico que estavam <b>a confirmar</b> e passaram no curral ({an.confirmadas.length}): estão na fazenda e já contam na conferência. Falta acertar a situação delas no cadastro.</p>
            <div className="fx-chips">{an.confirmadas.map((s) => <button key={s.k} className="fx-pill p-green" style={{ border: 'none', cursor: 'pointer' }} onClick={() => abrir(s.k)} title={`${s.rot} · visto em ${br(s.data)}`}>{s.brinco}</button>)}</div>
            {ownerMode && onConfirmarNovilhas ? <ConfirmarNaFazenda key={an.confirmadas.map((s) => s.id).join()} ix={ix} lista={an.confirmadas} onConfirmar={onConfirmarNovilhas} />
              : <p className="sub">O proprietário confirma essas novilhas aqui mesmo, com a senha.</p>}
          </>}
        </section>
      )}

      <details className="pd-defs">
        <summary>Como a conferência funciona</summary>
        <ul>
          <li><b>Passou no curral</b>: o brinco aparece em qualquer registro da rodada: manejo (geral, indução, protocolo), toque, IATF, pesagem, desmama, ou parto (a mãe pariu, a cria nasceu).</li>
          <li><b>Rodadas</b>: a primeira começa em {br(an.inicio)}. Cada toque geral (10 matrizes ou mais no mesmo toque) abre a rodada seguinte. Manejos lançados com data retroativa entram na rodada da data deles.</li>
          <li><b>Suspeitas</b>: não passaram e já pesavam contra na Produtividade (nunca pariu, vazia há muito tempo, novilha passada da idade, mais de 6 meses sem emprenhar ou previsão vencida).</li>
          <li><b>Rebanho ativo</b>: matrizes que não estão vendidas ou mortas (descarte inclui), crias na fazenda, bois na fazenda e touros vivos. {an.aConfirmar > 0 ? `${an.aConfirmar} crias do histórico continuam "a confirmar" e só entram quando passarem no curral.` : ''}</li>
          <li>Brinco anotado como "sem cadastro" que depois foi cadastrado passa a contar sozinho.</li>
        </ul>
      </details>
    </div>
  );
}
