// v11.3: Inventário (menu lateral). Animal por animal: o que está no sistema x o que passou no curral na rodada de conferência.
// Abas: Resumo (por categoria), Animais (lista completa com nascimento, mãe/cria, lote do sistema x lote conferido, data),
// Lotes (lote conferido x lote do sistema) e Divergências (o que acertar: lote, sem cadastro, baixados que passaram, a confirmar).
import React, { useMemo, useState } from 'react';
import { Search, FileDown, Loader2, CheckCircle2 } from 'lucide-react';
import { baixarPDF } from '../pdfloader.js';
import { formatarDataBR } from '../logica.js';
import { IndexTabs } from '../ui.jsx';
import { useFicha } from './Ficha.jsx';
import { confirmarNaFazenda } from '../conferencia.js';
import { analisarInventario, resumoInventario, lotesInventario, CATS_INV, RESULTADOS } from '../inventario.js';

const br = (d) => (d ? formatarDataBR(d) : '');
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '—');
const ordemB = (a, b) => String(a.brinco).localeCompare(String(b.brinco), 'pt-BR', { numeric: true });
const COR_RES = { brinco: 'var(--green)', mae: 'var(--blue, #6aa5d8)', nao: 'var(--amber)' };

// textos de cada coluna (tela e PDF usam os mesmos)
const txtCat = (l) => [l.rot, l.sexo === 'F' ? 'fêmea' : 'macho', l.raca].filter(Boolean).join(' · ');
const txtNasc = (l) => (l.nasc ? `${br(l.nasc)}${l.idadeMeses !== null ? ` · ${l.idadeMeses} m` : ''}` : '');
const txtFam = (l) => (l.mae ? `mãe ${l.mae}` : l.criaAoPe ? `cria ao pé ${l.criaAoPe.brinco}` : '');
const txtSit = (l) => {
  if (l.cat === 'vaca' || l.cat === 'novilha') {
    const p = l.previsao ? `previsão ${br(l.previsao)}` : l.ultimoParto ? `últ. parto ${br(l.ultimoParto)}` : 'sem parto';
    return [l.status, p, l.cat === 'novilha' && l.peso ? `${l.peso.peso} kg` : ''].filter(Boolean).join(' · ');
  }
  return [l.status, l.peso ? `${l.peso.peso} kg em ${br(l.peso.data)}` : ''].filter(Boolean).join(' · ');
};
const txtConf = (l) => (l.resultado === 'brinco' && l.conf ? `${br(l.conf.data)} · ${l.conf.fonte}` : l.resultado === 'mae' && l.conf ? `${br(l.conf.data)} · pela mãe ${l.mae}` : l.ultimoAntes ? `não · antes ${br(l.ultimoAntes.data)}` : 'não');

// Proprietário: crias "a confirmar" que passaram no curral viram Novilha no cadastro
function ConfirmarNaFazenda({ ix, lista, onConfirmar }) {
  const femeas = lista.filter((s) => s.sexo === 'Fêmea');
  const [marc, setMarc] = useState(() => new Set(femeas.map((s) => s.id)));
  const [lote, setLote] = useState((femeas.find((s) => s.lote) || {}).lote || 'NOVILHAS');
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
      <p className="sub" style={{ marginTop: 0 }}>As marcadas viram <b>Novilha</b> no cadastro, ligadas ao nascimento (mãe, data e raça do histórico).</p>
      <div className="fx-chips">
        {femeas.map((s) => (
          <label key={s.id} className={`fx-cp${marc.has(s.id) ? ' on' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={marc.has(s.id)} onChange={() => alt(s.id)} aria-label={`Confirmar ${s.brinco}`} />{s.brinco}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <label className="sub" style={{ margin: 0 }}>Lote <input className="fx-cp" style={{ minWidth: 140 }} list="inv-lotes" value={lote} onChange={(e) => setLote(e.target.value)} aria-label="Lote das novilhas confirmadas" /></label>
        <datalist id="inv-lotes">{lotes.map((x) => <option key={x} value={x} />)}</datalist>
        <button className="btn sm" onClick={confirmar} disabled={!marc.size || !lote.trim()} data-testid="confirmar-fazenda-sim"><CheckCircle2 size={16} /> Confirmar {marc.size} na fazenda</button>
      </div>
      {msg && <p className="sub" style={{ color: 'var(--green)' }} data-testid="confirmar-fazenda-msg">{msg}</p>}
    </div>
  );
}

// Proprietário: aplica no cadastro o lote em que o animal passou no curral (usa as mudanças de lote pendentes dos manejos)
function AplicarLotes({ lista, onDecidir }) {
  const comPend = lista.filter((l) => l.pendencia);
  const [marc, setMarc] = useState(() => new Set(comPend.map((l) => l.k)));
  const [msg, setMsg] = useState('');
  if (!comPend.length) return null;
  const todos = marc.size === comPend.length;
  function aplicar(sim) {
    const dec = comPend.filter((l) => marc.has(l.k)).map((l) => ({ ...l.pendencia, aprovar: sim }));
    setMsg(onDecidir(dec) || '');
  }
  return (
    <div className="fx-card" style={{ marginTop: 10, background: 'var(--s2)' }} data-testid="aplicar-lotes">
      <p className="sub" style={{ marginTop: 0 }}>{comPend.length} matriz(es) têm a mudança de lote esperando você nos manejos. Marcadas: <b>{marc.size}</b>.
        {' '}<button className="link" onClick={() => setMarc(todos ? new Set() : new Set(comPend.map((l) => l.k)))}>{todos ? 'desmarcar todas' : 'marcar todas'}</button></p>
      <div className="fx-chips" style={{ maxHeight: 180, overflow: 'auto' }}>
        {comPend.map((l) => (
          <label key={l.k} className={`fx-cp${marc.has(l.k) ? ' on' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} title={`${l.loteSistema || 'sem lote'} → ${l.loteConferido}`}>
            <input type="checkbox" checked={marc.has(l.k)} aria-label={`Aplicar lote em ${l.brinco}`} onChange={() => setMarc((m) => { const n = new Set(m); if (n.has(l.k)) n.delete(l.k); else n.add(l.k); return n; })} />{l.brinco}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn sm" disabled={!marc.size} onClick={() => aplicar(true)} data-testid="aplicar-lotes-sim"><CheckCircle2 size={16} /> Mudar {marc.size} para o lote conferido</button>
        <button className="btn sm quiet" disabled={!marc.size} onClick={() => aplicar(false)}>Manter no lote atual</button>
      </div>
      {msg && <p className="sub" style={{ color: 'var(--green)' }} data-testid="aplicar-lotes-msg">{msg}</p>}
    </div>
  );
}

export default function Inventario({ hoje, ownerMode, onDecidirLote, onConfirmarNovilhas }) {
  const { ix, abrir } = useFicha();
  const [iR, setIR] = useState(null);
  const inv = useMemo(() => (ix ? analisarInventario(ix, { rodada: iR }) : null), [ix, iR]);
  const [aba, setAba] = useState('resumo');
  const [res, setRes] = useState('');
  const [cat, setCat] = useState('');
  const [lote, setLote] = useState('');
  const [tipoLote, setTipoLote] = useState('sistema');
  const [extra, setExtra] = useState('');
  const [busca, setBusca] = useState('');
  const [gerando, setGerando] = useState('');
  if (!inv) return null;
  const r = resumoInventario(inv);
  const L = lotesInventario(inv);
  const rod = inv.rodada;
  const periodo = `${rod.nome}: desde ${br(rod.inicio)}${rod.fim ? ` até ${br(rod.fim)}` : ''}`;
  const divTotal = r.loteDif + r.duplos + r.semCadastro + r.fora + inv.confirmadas.length + r.novilhasQuePariram;
  const verAnimais = (o) => { setRes(o.res ?? ''); setCat(o.cat ?? ''); setExtra(o.extra ?? ''); setLote(''); setBusca(''); setAba('animais'); };

  // ------- lista filtrada (aba Animais)
  const q = busca.trim();
  const lotesOpc = [...new Set(inv.animais.map((l) => (tipoLote === 'sistema' ? l.loteSistema : l.loteConferido)).filter(Boolean))].sort();
  let lista = inv.animais;
  if (res) lista = lista.filter((l) => l.resultado === res);
  if (cat) lista = lista.filter((l) => l.cat === cat);
  if (lote) lista = lista.filter((l) => (tipoLote === 'sistema' ? l.loteSistema : l.loteConferido) === lote);
  if (extra === 'loteDif') lista = lista.filter((l) => l.loteDif);
  if (extra === 'suspeita') lista = lista.filter((l) => l.suspeita);
  if (extra === 'duplo') lista = lista.filter((l) => l.duplo);
  if (extra === 'todas') lista = lista.filter((l) => l.faltouTodas);
  if (extra === 'obs') lista = lista.filter((l) => l.notas.length);
  if (q) lista = lista.filter((l) => l.brinco.startsWith(q) || String(l.mae).startsWith(q) || (l.criaAoPe && String(l.criaAoPe.brinco).startsWith(q)));
  const nomeLista = [res ? RESULTADOS[res] : 'Todos os animais', cat ? (CATS_INV.find((c) => c.id === cat) || {}).nome : '', lote ? `lote ${tipoLote === 'sistema' ? 'no sistema' : 'conferido'} ${lote}` : '',
    { loteDif: 'lote diferente', suspeita: 'suspeitas', duplo: 'passou em dois lotes', todas: 'faltaram em todas as rodadas', obs: 'com observação' }[extra] || ''].filter(Boolean).join(' · ');

  // ------- PDF
  const COLS = [
    { k: 'brinco', label: 'Brinco' }, { k: 'cat', label: 'Categoria' }, { k: 'ls', label: 'Lote no sistema' }, { k: 'lc', label: 'Lote conferido' }, { k: 'conf', label: 'Conferido' },
    { k: 'nasc', label: 'Nascimento' }, { k: 'fam', label: 'Mãe / cria' }, { k: 'sit', label: 'Situação' }, { k: 'obs', label: 'Obs.' },
  ];
  const linhaPDF = (l) => ({ brinco: l.brinco, cat: txtCat(l), nasc: txtNasc(l), fam: txtFam(l), sit: txtSit(l), ls: l.loteSistema || '—', lc: l.loteConferido ? `${l.loteConferido}${l.loteDif ? ' (≠)' : ''}` : '—', conf: txtConf(l), obs: [...l.notas, ...l.motivos].join('; ') });
  const resumoPDF = [
    { rotulo: 'No sistema', valor: r.total }, { rotulo: 'Conferidos vivos', valor: `${r.vivos} (${pct(r.vivos, r.total)})` },
    { rotulo: 'Pelo brinco / pela mãe', valor: `${r.brinco} / ${r.mae}` }, { rotulo: 'Não conferidos', valor: r.nao },
  ];
  async function pdf(tipo) {
    setGerando(tipo);
    try {
      if (tipo === 'lista') {
        await baixarPDF({ titulo: `Inventário · ${nomeLista}`, subtitulo: `Fazenda Ibiraçu · ${periodo} · ${lista.length} animal(is) · gerado em ${br(hoje)}`, resumo: resumoPDF, secoes: [{ titulo: nomeLista, colunas: COLS, linhas: lista.map(linhaPDF) }] }, { paisagem: true, arquivo: `inventario-lista-${hoje}.pdf` });
      } else if (tipo === 'completo') {
        await baixarPDF({
          titulo: 'Inventário do rebanho', subtitulo: `Fazenda Ibiraçu · ${periodo} · gerado em ${br(hoje)}`, resumo: resumoPDF,
          secoes: [
            { titulo: 'Resumo por categoria', colunas: [{ k: 'n', label: 'Categoria' }, { k: 't', label: 'No sistema', align: 'right' }, { k: 'b', label: 'Pelo brinco', align: 'right' }, { k: 'm', label: 'Pela mãe', align: 'right' }, { k: 'x', label: 'Não conferidos', align: 'right' }, { k: 'p', label: '% conferido', align: 'right' }, { k: 'd', label: 'Lote diferente', align: 'right' }],
              linhas: [...r.porCat.map((c) => ({ n: `${c.nome}${c.aConfirmar ? ` (+${c.aConfirmar} a confirmar)` : ''}`, t: c.total, b: c.brinco, m: c.mae, x: c.nao, p: pct(c.brinco + c.mae, c.total + c.aConfirmar), d: c.loteDif })), { n: 'Total', t: r.total, b: r.brinco, m: r.mae, x: r.nao, p: pct(r.vivos, r.total + r.aConfirmar), d: r.loteDif }] },
            ...CATS_INV.map((c) => ({ c, ls: inv.animais.filter((l) => l.cat === c.id) })).filter((x) => x.ls.length).map((x) => ({ titulo: x.c.nome, colunas: COLS, linhas: x.ls.map(linhaPDF) })),
          ],
        }, { paisagem: true, arquivo: `inventario-completo-${hoje}.pdf` });
      } else {
        await baixarPDF({
          titulo: 'Inventário · divergências para acertar', subtitulo: `Fazenda Ibiraçu · ${periodo} · gerado em ${br(hoje)}`, resumo: resumoPDF,
          secoes: [
            { titulo: 'Lote do sistema diferente do lote conferido', colunas: COLS, linhas: inv.animais.filter((l) => l.loteDif).map(linhaPDF) },
            { titulo: 'Passaram em dois lotes', colunas: COLS, linhas: inv.animais.filter((l) => l.duplo).map((l) => ({ ...linhaPDF(l), lc: l.lotesConf.join(' e ') })) },
            { titulo: 'Brincos anotados sem cadastro', colunas: [{ k: 'brinco', label: 'Brinco' }, { k: 'data', label: 'Data' }, { k: 'lote', label: 'Lote' }, { k: 'manejo', label: 'Manejo' }, { k: 'nota', label: 'Observação' }], linhas: inv.semCadastro.map((s) => ({ ...s, data: br(s.data) })) },
            { titulo: 'Passaram no curral mas estão fora do rebanho no sistema', colunas: [{ k: 'brinco', label: 'Brinco' }, { k: 'rot', label: 'Animal' }, { k: 'situacao', label: 'No sistema' }, { k: 'data', label: 'Visto em' }], linhas: inv.fora.map((s) => ({ ...s, data: br(s.data) })) },
            { titulo: 'Crias a confirmar que passaram no curral', colunas: [{ k: 'brinco', label: 'Brinco' }, { k: 'rot', label: 'Animal' }, { k: 'mae', label: 'Mãe' }, { k: 'nasc', label: 'Nascimento' }, { k: 'lote', label: 'Lote conferido' }], linhas: inv.confirmadas.map((s) => ({ ...s, nasc: br(s.nasc) })) },
            { titulo: 'Novilhas que já pariram (categoria a corrigir)', colunas: COLS, linhas: inv.animais.filter((l) => l.novilhaQuePariu).map(linhaPDF) },
            { titulo: 'Não conferidos', colunas: COLS, linhas: inv.animais.filter((l) => l.resultado === 'nao').map(linhaPDF) },
          ].filter((s) => s.linhas.length),
        }, { paisagem: true, arquivo: `inventario-divergencias-${hoje}.pdf` });
      }
    } catch (e) { console.error(e); }
    setGerando('');
  }
  const BotaoPDF = ({ tipo, children, quiet }) => (
    <button className={`btn sm${quiet ? ' quiet' : ''}`} onClick={() => pdf(tipo)} disabled={!!gerando} data-testid={`inv-pdf-${tipo}`}>{gerando === tipo ? <Loader2 size={16} className="spin" /> : <FileDown size={16} />} {children}</button>
  );
  const Chip = ({ on, onClick, children, testid }) => <button className={`fx-cp${on ? ' on' : ''}`} aria-pressed={on} onClick={onClick} data-testid={testid}>{children}</button>;

  return (
    <div className="wrap" data-testid="inventario">
      <div className="head"><div><small>Rebanho vivo x sistema</small><h1>Inventário</h1></div></div>
      <p className="sub pd-lead">
        <b>{periodo}</b>. Dos <b>{r.total + r.aConfirmar}</b> animais ({r.total} no sistema{r.aConfirmar ? ` + ${r.aConfirmar} a confirmar que passou` : ''}), <b>{r.vivos}</b> foram conferidos vivos ({pct(r.vivos, r.total + r.aConfirmar)}): {r.brinco} pelo brinco e {r.mae} bezerros pela mãe.
        {' '}Faltam <b>{r.nao}</b>. A data da conferência é a data do manejo.
      </p>
      {inv.rodadas.length > 1 && <div className="fx-chips">{inv.rodadas.map((x, i) => <Chip key={x.n} on={inv.iRodada === i} onClick={() => setIR(i)} testid={`rodada-${x.n}`}>{x.nome} · {br(x.inicio)}</Chip>)}</div>}

      <IndexTabs rotulo="Inventário" value={aba} onChange={setAba} tabs={[
        { id: 'resumo', label: 'Resumo' }, { id: 'animais', label: 'Animais', count: inv.animais.length },
        { id: 'lotes', label: 'Lotes', count: L.conferidos.length }, { id: 'divergencias', label: 'Divergências', count: divTotal },
      ]} />

      {aba === 'resumo' && (
        <div style={{ marginTop: 14 }} data-testid="inv-resumo">
          <div className="fx-resumo">
            <button className="fx-kpi" onClick={() => verAnimais({})}><small>No sistema</small><b>{r.total}</b>{r.aConfirmar ? <i>+{r.aConfirmar} a confirmar</i> : null}</button>
            <button className="fx-kpi" onClick={() => verAnimais({ res: 'brinco' })}><small>Conferidos pelo brinco</small><b style={{ color: 'var(--green)' }}>{r.brinco}</b></button>
            <button className="fx-kpi" onClick={() => verAnimais({ res: 'mae' })}><small>Bezerros pela mãe</small><b style={{ color: COR_RES.mae }}>{r.mae}</b><i>ao pé, sem brinco anotado</i></button>
            <button className="fx-kpi" onClick={() => verAnimais({ res: 'nao' })} data-testid="kpi-nao"><small>Não conferidos</small><b style={{ color: 'var(--amber)' }}>{r.nao}</b><i>{r.suspeitas} suspeitas</i></button>
            <button className="fx-kpi" onClick={() => verAnimais({ extra: 'loteDif' })}><small>Lote diferente</small><b style={{ color: 'var(--late)' }}>{r.loteDif}</b><i>sistema x curral</i></button>
            <button className="fx-kpi" onClick={() => setAba('divergencias')}><small>Sem cadastro</small><b style={{ color: 'var(--late)' }}>{r.semCadastro}</b><i>brincos anotados</i></button>
          </div>
          <div className="pd-tabela-box" style={{ maxHeight: 'none' }}>
            <table className="pd-tabela" data-testid="inv-tabela-cat">
              <thead><tr><th>Categoria</th><th className="num">No sistema</th><th className="num">Pelo brinco</th><th className="num">Pela mãe</th><th className="num">Não conferidos</th><th className="num">% conferido</th><th className="num">Lote diferente</th></tr></thead>
              <tbody>
                {r.porCat.map((c) => (
                  <tr key={c.id} onClick={() => verAnimais({ cat: c.id })} data-testid={`inv-cat-${c.id}`}>
                    <td><b>{c.nome}</b>{c.aConfirmar ? <small>+{c.aConfirmar} a confirmar que passaram</small> : null}</td>
                    <td className="num">{c.total}</td><td className="num" style={{ color: 'var(--green)' }}>{c.brinco}</td><td className="num">{c.mae || ''}</td>
                    <td className="num" style={{ color: c.nao ? 'var(--amber)' : undefined }}>{c.nao}</td><td className="num">{pct(c.brinco + c.mae, c.total + c.aConfirmar)}</td><td className="num">{c.loteDif || ''}</td>
                  </tr>
                ))}
                <tr style={{ cursor: 'default' }}><td><b>Total</b></td><td className="num"><b>{r.total}</b></td><td className="num"><b>{r.brinco}</b></td><td className="num"><b>{r.mae}</b></td><td className="num"><b>{r.nao}</b></td><td className="num"><b>{pct(r.vivos, r.total + r.aConfirmar)}</b></td><td className="num"><b>{r.loteDif}</b></td></tr>
              </tbody>
            </table>
          </div>
          <div className="pd-pdf" style={{ marginTop: 12 }}><BotaoPDF tipo="completo">PDF do inventário completo</BotaoPDF><BotaoPDF tipo="divergencias" quiet>PDF das divergências</BotaoPDF></div>
          <details className="pd-defs">
            <summary>Como o inventário conta</summary>
            <ul>
              <li><b>No sistema</b>: matrizes não vendidas nem mortas (descarte entra), crias mamando e desmamadas, touros vivos e bois. Crias do histórico "a confirmar" só entram quando passam no curral.</li>
              <li><b>Conferido pelo brinco</b>: o número aparece num manejo, toque, IATF, pesagem, desmama ou parto da rodada.</li>
              <li><b>Pela mãe</b>: bezerro mamando sem o brinco anotado, mas a mãe passou no curral. Conta como vivo, mas vale anotar o brinco no próximo manejo.</li>
              <li><b>Lote conferido</b>: o lote do último manejo da rodada em que o animal passou. O bezerro mamando fica com o lote da mãe.</li>
              <li><b>Rodadas</b>: a primeira começa em {br(inv.inicio)}. Cada toque geral abre a seguinte.</li>
            </ul>
          </details>
        </div>
      )}

      {aba === 'animais' && (
        <div style={{ marginTop: 14 }} data-testid="inv-animais">
          <div className="fx-chips">
            <Chip on={!res} onClick={() => setRes('')}>Todos<b>{r.total + r.aConfirmar}</b></Chip>
            <Chip on={res === 'brinco'} onClick={() => setRes('brinco')} testid="inv-f-brinco">Conferidos<b>{r.brinco}</b></Chip>
            <Chip on={res === 'mae'} onClick={() => setRes('mae')} testid="inv-f-mae">Pela mãe<b>{r.mae}</b></Chip>
            <Chip on={res === 'nao'} onClick={() => setRes('nao')} testid="inv-f-nao">Não conferidos<b>{r.nao}</b></Chip>
          </div>
          <div className="fx-chips">
            <Chip on={!extra} onClick={() => setExtra('')}>Sem destaque</Chip>
            <Chip on={extra === 'loteDif'} onClick={() => setExtra('loteDif')} testid="inv-f-lotedif">Lote diferente<b>{r.loteDif}</b></Chip>
            <Chip on={extra === 'suspeita'} onClick={() => setExtra('suspeita')}>Suspeitas<b>{r.suspeitas}</b></Chip>
            {r.duplos > 0 && <Chip on={extra === 'duplo'} onClick={() => setExtra('duplo')}>Dois lotes<b>{r.duplos}</b></Chip>}
            <Chip on={extra === 'obs'} onClick={() => setExtra('obs')}>Com observação</Chip>
            {inv.rodadas.length > 1 && <Chip on={extra === 'todas'} onClick={() => setExtra('todas')}>Faltaram em todas</Chip>}
          </div>
          <div className="fx-chips">
            <select className="fx-cp" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Categoria" data-testid="inv-cat"><option value="">Todas as categorias</option>{CATS_INV.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
            <select className="fx-cp" value={tipoLote} onChange={(e) => { setTipoLote(e.target.value); setLote(''); }} aria-label="Qual lote"><option value="sistema">Lote no sistema</option><option value="conferido">Lote conferido</option></select>
            <select className="fx-cp" value={lote} onChange={(e) => setLote(e.target.value)} aria-label="Lote" data-testid="inv-lote"><option value="">Todos os lotes</option>{lotesOpc.map((x) => <option key={x} value={x}>{x}</option>)}</select>
          </div>
          <label className="search fx-search"><Search /><input placeholder="Buscar brinco (animal, mãe ou cria)" aria-label="Buscar brinco no inventário" inputMode="numeric" value={busca} onChange={(e) => setBusca(e.target.value)} /></label>
          <div className="pd-pdf"><BotaoPDF tipo="lista">PDF desta lista ({lista.length})</BotaoPDF></div>
          <div className="pd-tabela-box">
            <table className="pd-tabela inv-tabela" data-testid="inv-tabela">
              <thead><tr><th>Brinco</th><th>Categoria</th><th>Lote no sistema</th><th>Lote conferido</th><th>Conferido</th><th>Nascimento</th><th>Mãe / cria</th><th>Situação</th><th>Obs.</th></tr></thead>
              <tbody>
                {lista.length === 0 && <tr><td colSpan={9} className="mut">Nenhum animal com esse filtro.</td></tr>}
                {lista.map((l) => (
                  <tr key={l.k} onClick={() => abrir(l.k)} data-testid={`inv-${l.brinco}`}>
                    <td className="br">{l.brinco}<small style={{ color: COR_RES[l.resultado] }}>{RESULTADOS[l.resultado]}</small></td>
                    <td>{l.rot}<small>{[l.sexo === 'F' ? 'fêmea' : 'macho', l.raca].filter(Boolean).join(' · ')}</small></td>
                    <td>{l.loteSistema || <span className="mut">sem lote</span>}</td>
                    <td>{l.loteConferido ? <span style={{ color: l.loteDif ? 'var(--late)' : 'var(--green)' }}>{l.loteConferido}</span> : <span className="mut">—</span>}{l.duplo && <small className="late">também em {l.lotesConf.filter((x) => x !== l.loteConferido).join(', ')}</small>}</td>
                    <td>{l.resultado !== 'nao' && l.conf ? <>{br(l.conf.data)}<small>{l.resultado === 'mae' ? `pela mãe ${l.mae}` : l.conf.fonte}</small></> : <span className="mut">{l.ultimoAntes ? `antes: ${br(l.ultimoAntes.data)}` : 'nunca'}</span>}</td>
                    <td>{l.nasc ? br(l.nasc) : <span className="mut">—</span>}{l.idadeMeses !== null && <small>{l.idadeMeses} meses</small>}</td>
                    <td>{l.mae ? <>mãe {l.mae}</> : l.criaAoPe ? <>cria {l.criaAoPe.brinco}<small>ao pé, {br(l.criaAoPe.nasc)}</small></> : <span className="mut">—</span>}</td>
                    <td>{l.status}<small>{txtSit(l).split(' · ').slice(1).join(' · ')}</small></td>
                    <td className="acao">{[...l.notas, ...l.motivos].join('; ') || (l.confirmada ? 'a confirmar: está na fazenda' : '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {aba === 'lotes' && (
        <div style={{ marginTop: 14 }} data-testid="inv-lotes">
          <p className="sub">Os lotes do sistema ainda usam os nomes antigos. Abaixo, cada lote do curral com quantos animais passaram e de qual lote do sistema eles vieram.</p>
          <div className="pd-tabela-box" style={{ maxHeight: 'none', marginBottom: 14 }}>
            <table className="pd-tabela"><thead><tr><th>Lote conferido</th><th className="num">Passaram</th><th className="num">Mesmo lote no sistema</th><th>No sistema estão em</th><th>Categorias</th><th className="num">Sem cadastro</th><th className="num">Fora do rebanho</th></tr></thead>
              <tbody>{L.conferidos.map((x) => (
                <tr key={x.lote} onClick={() => { verAnimais({}); setTipoLote('conferido'); setLote(x.lote); }}>
                  <td><b>{x.lote}</b>{x.aoPe ? <small>{x.aoPe} bezerro(s) ao pé</small> : null}</td><td className="num">{x.n}</td><td className="num" style={{ color: x.igual && !x.dif ? 'var(--green)' : undefined }}>{x.igual}{x.n - (x.aoPe || 0) ? <small>de {x.n - (x.aoPe || 0)}</small> : null}</td>
                  <td>{Object.entries(x.de).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} (${n})`).join(', ') || '—'}</td>
                  <td className="acao">{Object.entries(x.porCat).map(([k, n]) => `${k} ${n}`).join(' · ')}</td>
                  <td className="num" style={{ color: x.semCad ? 'var(--late)' : undefined }}>{x.semCad || ''}</td><td className="num" style={{ color: x.fora ? 'var(--late)' : undefined }}>{x.fora || ''}</td>
                </tr>))}</tbody></table>
          </div>
          <div className="pd-tabela-box" style={{ maxHeight: 'none' }}>
            <table className="pd-tabela"><thead><tr><th>Lote no sistema</th><th className="num">Animais</th><th className="num">Conferidos</th><th className="num">Não conferidos</th></tr></thead>
              <tbody>{L.sistema.map((x) => (
                <tr key={x.lote} onClick={() => { verAnimais({ res: 'nao' }); setTipoLote('sistema'); setLote(x.lote === '(sem lote)' ? '' : x.lote); }}>
                  <td><b>{x.lote}</b></td><td className="num">{x.n}</td><td className="num">{x.conferidos}</td><td className="num" style={{ color: x.nao ? 'var(--amber)' : undefined }}>{x.nao}</td>
                </tr>))}</tbody></table>
          </div>
        </div>
      )}

      {aba === 'divergencias' && (
        <div style={{ marginTop: 14 }} data-testid="inv-divergencias">
          <div className="pd-pdf"><BotaoPDF tipo="divergencias">PDF das divergências</BotaoPDF></div>
          <section className="fx-card" style={{ marginBottom: 12 }}>
            <h3>Lote diferente ({r.loteDif})</h3>
            <p className="sub">Passaram no curral num lote, e no sistema estão em outro. <button className="link" onClick={() => verAnimais({ extra: 'loteDif' })}>Ver a lista</button></p>
            {ownerMode && onDecidirLote ? <AplicarLotes key={r.pendLote} lista={inv.animais.filter((l) => l.loteDif)} onDecidir={onDecidirLote} />
              : r.pendLote > 0 && <p className="sub">O proprietário aplica o lote conferido aqui, com a senha.</p>}
          </section>
          {r.duplos > 0 && <section className="fx-card" style={{ marginBottom: 12 }}>
            <h3>Passaram em dois lotes ({r.duplos})</h3>
            <p className="sub">Ou mudaram de lote entre um manejo e outro, ou o brinco foi anotado errado.</p>
            {inv.animais.filter((l) => l.duplo).map((l) => <button key={l.k} className="fx-li" onClick={() => abrir(l.k)}><span className="fx-bb">{l.brinco}<small>{l.rot}</small></span><span className="fx-two"><b>{l.lotesConf.join(' e ')}</b><span>no sistema: {l.loteSistema || 'sem lote'}</span></span></button>)}
          </section>}
          {inv.semCadastro.length > 0 && <section className="fx-card" style={{ marginBottom: 12 }} data-testid="inv-semcad">
            <h3>Brincos sem cadastro ({inv.semCadastro.length})</h3>
            <p className="sub">Anotados no curral, mas não existem no sistema. Cadastre em Lançar &gt; Nova Matriz (ou Rebanho &gt; Bois) ou corrija o número no manejo.</p>
            <div className="pd-tabela-box" style={{ maxHeight: 'none' }}><table className="pd-tabela"><thead><tr><th>Brinco</th><th>Data</th><th>Lote</th><th>Observação</th></tr></thead>
              <tbody>{inv.semCadastro.map((s, i) => <tr key={i} style={{ cursor: 'default' }}><td className="br">{s.brinco}</td><td>{br(s.data)}</td><td>{s.lote}</td><td className="acao">{[s.nota, s.repetido ? 'número repetido no cadastro' : ''].filter(Boolean).join('; ')}</td></tr>)}</tbody></table></div>
          </section>}
          {inv.fora.length > 0 && <section className="fx-card" style={{ marginBottom: 12 }}>
            <h3>Passaram no curral mas estão fora do rebanho ({inv.fora.length})</h3>
            <p className="sub">No sistema estão como vendidos ou mortos. Confira se a baixa está certa.</p>
            {inv.fora.map((s) => <button key={s.k} className="fx-li" onClick={() => abrir(s.k)}><span className="fx-bb">{s.brinco}<small>{s.rot}</small></span><span className="fx-two"><b>{s.situacao}</b><span>visto em {br(s.data)} · {s.manejo}</span></span></button>)}
          </section>}
          {inv.confirmadas.length > 0 && <section className="fx-card" style={{ marginBottom: 12 }}>
            <h3>Crias "a confirmar" que passaram ({inv.confirmadas.length})</h3>
            <p className="sub">Do histórico da planilha, com situação em aberto. Passaram no curral: estão na fazenda.</p>
            {ownerMode && onConfirmarNovilhas ? <ConfirmarNaFazenda key={inv.confirmadas.map((s) => s.id).join()} ix={ix} lista={inv.confirmadas} onConfirmar={onConfirmarNovilhas} />
              : <div className="fx-chips">{inv.confirmadas.map((s) => <button key={s.k} className="fx-pill p-green" style={{ border: 'none', cursor: 'pointer' }} onClick={() => abrir(s.k)}>{s.brinco}</button>)}</div>}
            {inv.confirmadas.some((s) => s.sexo !== 'Fêmea') && <p className="sub">Machos: cadastre em Rebanho &gt; Bois.</p>}
          </section>}
          {r.novilhasQuePariram > 0 && <section className="fx-card" style={{ marginBottom: 12 }} data-testid="inv-novilhas-pariram">
            <h3>Novilhas que já pariram ({r.novilhasQuePariram})</h3>
            <p className="sub">Estão como Novilha no cadastro, mas têm parto registrado. Pela ficha, troque a categoria (primípara ou vaca).</p>
            {inv.animais.filter((l) => l.novilhaQuePariu).map((l) => <button key={l.k} className="fx-li" onClick={() => abrir(l.k)}><span className="fx-bb">{l.brinco}<small>{l.rot}</small></span><span className="fx-two"><b>{l.nPartos} parto(s), último em {br(l.ultimoParto)}</b><span>lote conferido: {l.loteConferido || '—'}</span></span></button>)}
          </section>}
          <section className="fx-card">
            <h3>Não conferidos ({r.nao})</h3>
            <p className="sub">Não apareceram em nada da rodada. {r.suspeitas} já pesavam contra na Produtividade. <button className="link" onClick={() => verAnimais({ res: 'nao' })}>Ver a lista</button></p>
          </section>
        </div>
      )}
    </div>
  );
}
