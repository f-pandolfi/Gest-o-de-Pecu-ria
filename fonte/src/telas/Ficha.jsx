// v11: busca geral (lupa no topo) e ficha completa de qualquer animal: matriz, novilha, cria, touro ou boi.
// Todos veem a ficha; alterar cadastro só com a senha. Qualquer tela abre a ficha com useFicha().abrir(chave).
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, ChevronLeft, Lock } from 'lucide-react';
import { formatarDataBR } from '../logica.js';
import {
  indiceRebanho, buscarAnimais, resumoAnimal, reproducaoDaMatriz, manejosDoAnimal, eventosDoAnimal, categoriaCria, racaDoHistorico,
  idadeTexto, idadeCurta, rotuloSit, corSituacao, corStatus, chaveDaCria, ehBoi, pesagensBoi, boiAtivo, situacaoHistorica, nomeTouroEvento, infoAnimalVenda, categoriaBoi,
} from '../ficha.js';

const br = (d) => (d ? formatarDataBR(d) : '—');
const Ctx = createContext({ abrir: () => {}, buscar: () => {}, ix: null });
export const useFicha = () => useContext(Ctx);

export function Pill({ t, cor }) { return <span className={`fx-pill p-${cor || 'gray'}`}>{t}</span>; }

// Linha de lista usada no Rebanho, na busca e no Diagnóstico
export function LinhaAnimal({ k, extra }) {
  const { abrir, ix } = useFicha();
  const r = ix && resumoAnimal(ix, k, br);
  if (!r) return null;
  return (
    <button className="fx-li" onClick={() => abrir(k)} data-testid={`animal-${r.brinco}`} aria-label={`Abrir ficha do ${r.rot} ${r.brinco}`}>
      <span className="fx-bb">{r.brinco}<small>{r.rot}</small></span>
      <span className="fx-two"><b style={r.cor ? { color: `var(--${r.cor === 'late' ? 'late' : r.cor})` } : undefined}>{r.titulo}</b><span>{r.linha}</span></span>
      {extra || <Pill t={r.pill.t} cor={r.pill.cor} />}
    </button>
  );
}

export function ListaAnimais({ chaves, vazio, passo = 60 }) {
  const [lim, setLim] = useState(passo);
  useEffect(() => setLim(passo), [chaves.length, passo]);
  if (!chaves.length) return <div className="fx-lista"><div className="empty">{vazio || 'Nenhum animal com esse filtro.'}</div></div>;
  return (
    <div className="fx-lista">
      {chaves.slice(0, lim).map((k) => <LinhaAnimal key={k} k={k} />)}
      {chaves.length > lim && <button className="fx-mais" onClick={() => setLim((n) => n + 200)}>Mostrar mais ({chaves.length - lim})</button>}
    </div>
  );
}

function Card({ titulo, n, children, full }) {
  return <section className={`fx-card${full ? ' full' : ''}`}><h3>{titulo}{n !== undefined && <span>{n}</span>}</h3>{children}</section>;
}
function Dl({ itens }) {
  return <dl className="fx-dl">{itens.filter(Boolean).map(([a, b], i) => <React.Fragment key={i}><dt>{a}</dt><dd>{b}</dd></React.Fragment>)}</dl>;
}
function Link({ k, children }) {
  const { abrir } = useFicha();
  return k ? <button className="fx-link" onClick={() => abrir(k)}>{children}</button> : <>{children}</>;
}
function Vazio({ children }) { return <div className="fx-vazio">{children}</div>; }

function Peso({ pontos, gmd }) {
  const pts = (pontos || []).filter((p) => p.peso > 0);
  if (!pts.length) return <Card titulo="Peso"><Vazio>Ainda não foi pesado.</Vazio></Card>;
  const W = 300; const H = 100; const pad = 8;
  const xs = pts.map((p) => new Date(p.data).getTime()); const ys = pts.map((p) => p.peso);
  const x0 = Math.min(...xs); const x1 = Math.max(...xs); const y0 = Math.min(...ys); const y1 = Math.max(...ys);
  const X = (x) => pad + (x1 === x0 ? (W - 2 * pad) / 2 : ((x - x0) / (x1 - x0)) * (W - 2 * pad));
  const Y = (y) => H - pad - (y1 === y0 ? (H - 2 * pad) / 2 : ((y - y0) / (y1 - y0)) * (H - 2 * pad));
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(xs[i]).toFixed(1)},${Y(p.peso).toFixed(1)}`).join(' ');
  const u = pts[pts.length - 1];
  return (
    <Card titulo="Peso" n={`${pts.length} pesagem(ns)`}>
      <div className="fx-dest">
        <div><small>Último peso</small><b>{u.peso} kg</b></div>
        <div><small>Em</small><b>{br(u.data)}</b></div>
        {gmd ? <div><small>Ganho por dia</small><b>{String(Number(gmd).toFixed(2)).replace('.', ',')} kg</b></div> : null}
      </div>
      {pts.length > 1 && (
        <svg className="fx-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Evolução do peso">
          <path d={d} fill="none" stroke="var(--green)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          {pts.map((p, i) => <circle key={i} cx={X(xs[i])} cy={Y(p.peso)} r="3.5" fill="var(--green)" />)}
        </svg>
      )}
    </Card>
  );
}

function Manejos({ dados, ids, brinco }) {
  const ms = manejosDoAnimal(dados, ids, brinco);
  return (
    <Card titulo="Sanidade e manejos" n={ms.length}>
      {!ms.length ? <Vazio>Nenhum manejo registrado para este animal.</Vazio> : ms.slice(0, 10).map((m) => (
        <div className="fx-row" key={m.id}>
          <span className="d">{br(m.data)}</span>
          <span>{m.titulo}{m.aplic && <small>{m.aplic}</small>}{m.nota && <small style={{ color: 'var(--amber)' }}>Obs.: {m.nota}</small>}</span>
          <span>{m.lote ? <Pill t={m.lote} /> : null}</span>
        </div>
      ))}
    </Card>
  );
}

function Linha({ itens }) {
  const l = itens.filter((x) => x.data).sort((a, b) => b.data.localeCompare(a.data));
  if (!l.length) return null;
  return (
    <Card titulo="Linha do tempo" n={l.length} full>
      <div className="fx-tl">
        {l.slice(0, 50).map((x, i) => <div className="ev" key={i} style={{ '--c': `var(--${x.c || 'mut'})` }}><small>{br(x.data)}</small>{x.t}{x.s ? <span> · {x.s}</span> : null}</div>)}
      </div>
    </Card>
  );
}

function Cabecalho({ tipo, brinco, pills, linha, grande = true }) {
  return (
    <div className="fx-head">
      <div className="tipo">{tipo}</div>
      <div className="brinco" style={grande ? undefined : { fontSize: 34 }}>{brinco}</div>
      <div className="pills">{pills}</div>
      {linha && <div className="linha">{linha}</div>}
    </div>
  );
}

function FichaMatriz({ ix, m }) {
  const r = reproducaoDaMatriz(ix, m);
  const info = infoAnimalVenda(ix.dados, m.brinco, ix.hoje, ix.crias);
  const evs = eventosDoAnimal(ix.dados, [m.id], m.brinco);
  const ult = r.diags[0];
  const cria = r.cria;
  const tl = [
    ...(r.nasc ? [{ data: r.nasc, t: 'Nasceu', s: cria ? `mãe ${cria.maeBrinco || '?'}` : '', c: 'blue' }] : []),
    ...r.ps.map((p) => ({ data: p.data, t: `Pariu ${p.brincoBezerro || 's/ nº'}`, s: p.sexo, c: 'green' })),
    ...r.iatfs.map((e) => ({ data: e.data, t: e.tipoServico || 'IATF', s: nomeTouroEvento(e, ix.dados.touros), c: 'blue' })),
    ...r.diags.map((e) => ({ data: e.data, t: `Toque: ${e.resultado}`, s: [e.dg ? `${e.dg} dias` : '', e.veterinario].filter(Boolean).join(' · '), c: e.resultado === 'Prenhe' ? 'green' : e.resultado === 'Vazia' ? 'amber' : 'late' })),
    ...manejosDoAnimal(ix.dados, [m.id], m.brinco).map((x) => ({ data: x.data, t: x.titulo, s: x.lote, c: /indu/i.test(x.titulo) ? 'amber' : 'mut' })),
    ...evs.filter((e) => e.tipo === 'pesagem').map((e) => ({ data: e.data, t: `Pesagem ${e.peso} kg`, c: 'mut' })),
    ...evs.filter((e) => e.tipo === 'morte').map((e) => ({ data: e.data, t: 'Morte', s: e.causa, c: 'late' })),
    ...evs.filter((e) => e.tipo === 'descarte').map((e) => ({ data: e.data, t: 'Descarte', s: e.motivo, c: 'late' })),
    ...(m.status === 'Vendida' && m.dataBaixa ? [{ data: m.dataBaixa, t: 'Vendida', c: 'mut' }] : []),
  ];
  return (
    <>
      <Cabecalho
        tipo={`${m.categoria || 'Matriz'}${m.raca ? ` · ${m.raca}` : ''}`} brinco={m.brinco}
        pills={<><Pill t={m.status} cor={corStatus(m.status)} />{m.lote && <Pill t={m.lote} />}{r.ps.length > 0 && <Pill t={`${r.ps.length} parto${r.ps.length > 1 ? 's' : ''}`} cor="blue" />}{m.destino && <Pill t={`recria: ${m.destino}`} cor="amber" />}</>}
        linha={r.nasc ? `Nascida em ${br(r.nasc)} · ${idadeCurta(r.nasc, ix.hoje)}` : 'Nascimento não informado'}
      />
      {r.alertas.map((a, i) => <div key={i} className={`fx-alerta${a.ruim ? ' ruim' : ''}`}>{a.t}</div>)}
      <div className="fx-grid">
        <Card titulo="Identificação">
          <Dl itens={[
            ['Nascimento', br(r.nasc)], ['Idade', idadeCurta(r.nasc, ix.hoje) || '—'], ['Raça', m.raca || (cria && racaDoHistorico(cria.nasc)) || '—'],
            ['Mãe', cria && cria.matrizId ? <Link k={`m:${cria.matrizId}`}>{cria.maeBrinco}</Link> : (cria && cria.maeBrinco) || '—'],
            ['Pai / origem', cria && cria.origem ? cria.origem.rotulo : '—'], ['Lote', m.lote || '—'],
            ['Partos antes de entrar', m.partosAnteriores || 0],
            (m.status === 'Vendida' || m.status === 'Morta') && ['Baixa', `${br(m.dataBaixa)} ${m.motivoBaixa || ''}`],
          ]} />
        </Card>
        <Card titulo="Reprodução agora">
          <div className="fx-dest">
            <div><small>Último toque</small><b>{ult ? ult.resultado : '—'}</b><small>{ult ? `${br(ult.data)}${ult.dg ? ` · ${ult.dg} d` : ''}` : ''}</small></div>
            <div><small>Previsão de parto</small><b>{r.prev && r.prev.data ? br(r.prev.data) : '—'}</b><small>{r.prev ? `pelo ${r.prev.origem}` : ''}</small></div>
          </div>
          <Dl itens={[
            ['Última IATF', r.iatfs[0] ? `${br(r.iatfs[0].data)}${r.touroIatf ? ` · ${r.touroIatf}` : ''}` : '—'],
            ['Último parto', r.ps[0] ? br(r.ps[0].data) : '—'],
            ['Intervalo entre partos', r.ipp ? `${Math.round(r.ipp / 30.4)} meses (${r.ipp} d)` : '—'],
          ]} />
        </Card>
        {m.categoria === 'Novilha' && (
          <Card titulo="Indução" n={r.inds.length ? 'induzida' : 'não induzida'} full>
            {!r.inds.length ? <Vazio>Nenhuma indução registrada. Faça em Manejo &gt; Indução.</Vazio> : r.inds.map((x) => (
              <div className="fx-row" key={x.id}>
                <span className="d">{br(x.data)}</span>
                <span>{x.etapa}{x.produtos.length > 0 && <small>{x.produtos.join(' + ')}</small>}</span>
                <span>{x.res ? <Pill t={x.res} cor={x.res === 'Ciclando' ? 'green' : 'late'} /> : null}</span>
              </div>
            ))}
          </Card>
        )}
        <Card titulo="Partos e crias" n={r.ps.length} full>
          {!r.ps.length ? <Vazio>Nenhum parto registrado.</Vazio> : r.ps.map((p) => {
            const c = ix.criaPorId.get(p.id);
            return (
              <div className="fx-row" key={p.id}>
                <span className="d">{br(p.data)}</span>
                <span>{c ? <Link k={chaveDaCria(c)}>{c.brinco || 's/ nº'}</Link> : (p.brincoBezerro || 's/ nº')} · {p.sexo || '?'}{c && c.origem && <small>{c.origem.rotulo}</small>}</span>
                <span>{c ? <Pill t={rotuloSit(c)} cor={corSituacao(c.situacao)} /> : p.resultadoParto === 'Natimorto' ? <Pill t="Natimorto" cor="late" /> : null}</span>
              </div>
            );
          })}
        </Card>
        <Peso pontos={info.pontos} />
        <Manejos dados={ix.dados} ids={[m.id]} brinco={m.brinco} />
        <Linha itens={tl} />
      </div>
    </>
  );
}

function FichaCria({ ix, c }) {
  const n = c.nasc;
  const irmaos = c.matrizId ? (ix.partos.get(c.matrizId) || []).filter((p) => p.id !== c.id) : [];
  const evs = eventosDoAnimal(ix.dados, [c.id], c.brinco);
  const tl = [
    { data: c.nascData, t: 'Nasceu', s: `mãe ${c.maeBrinco || '?'}`, c: 'blue' },
    ...c.pontos.filter((p) => p.fonte !== 'Nascimento').map((p) => ({ data: p.data, t: `${p.fonte || 'Pesagem'} ${p.peso} kg`, c: 'mut' })),
    ...(c.desmamaData ? [{ data: c.desmamaData, t: 'Desmama', c: 'green' }] : []),
    ...(c.situacao === 'vendido' && c.vendaData ? [{ data: c.vendaData, t: 'Vendido', c: 'mut' }] : []),
    ...(c.mortoData ? [{ data: c.mortoData, t: 'Morte', s: c.causaMorte, c: 'late' }] : []),
    ...evs.filter((e) => e.tipo === 'manejo').map((e) => ({ data: e.data, t: e.descricao || e.etapa || 'Manejo', s: e.lote, c: 'mut' })),
  ];
  const raca = racaDoHistorico(n);
  return (
    <>
      <Cabecalho
        tipo={`${categoriaCria(c)}${raca ? ` · ${raca}` : ''}`} brinco={c.brinco || 's/ nº'}
        pills={<><Pill t={rotuloSit(c)} cor={corSituacao(c.situacao)} /><Pill t={c.sexo || 'sexo?'} cor={c.sexo === 'Fêmea' ? 'amber' : 'blue'} />{c.orfa && <Pill t="Órfã" cor="late" />}{c.historico && <Pill t="Histórico" />}</>}
        linha={`Nasceu em ${br(c.nascData)} · ${idadeTexto(c.nascData, ix.hoje)}`}
      />
      {c.situacao === 'confirmar' && <div className="fx-alerta">Situação a confirmar: não se sabe se virou novilha, foi apartada, vendida ou está a meia.</div>}
      {c.orfa && <div className="fx-alerta ruim">A mãe morreu: cria órfã, mamando.</div>}
      <div className="fx-grid">
        <Card titulo="Identificação">
          <Dl itens={[
            ['Nascimento', br(c.nascData)], ['Idade', idadeTexto(c.nascData, ix.hoje) || '—'], ['Sexo', c.sexo || '—'],
            ['Mãe', c.matrizId ? <Link k={`m:${c.matrizId}`}>{c.maeBrinco}</Link> : <>{c.maeBrinco || '—'}{c.maeFora ? <span className="mut"> (fora do cadastro)</span> : null}</>],
            ['Pai / origem', c.origem ? c.origem.rotulo : '—'], ['Tipo de parto', n.tipoParto || '—'],
            ['Peso ao nascer', n.pesoNascer ? `${n.pesoNascer} kg` : '—'], ['Pelagem', n.pelagem || '—'],
            ['Registro', c.historico ? 'Planilha antiga' : 'Lançado no app'],
          ]} />
        </Card>
        <Card titulo="Situação">
          <Dl itens={[
            ['Agora', rotuloSit(c)], ['Desmama', br(c.desmamaData)],
            ['Venda', c.situacao === 'vendido' ? br(c.vendaData) : '—'], ['Morte', c.situacao === 'morto' ? `${br(c.mortoData)}${c.causaMorte ? ` · ${c.causaMorte}` : ''}` : '—'],
          ]} />
          {n.observacoes && <p className="fx-obs">{n.observacoes}</p>}
        </Card>
        <Peso pontos={c.pontos.filter((p) => p.fonte !== 'Nascimento' || p.peso)} gmd={c.gmd} />
        <Card titulo="Irmãos (mesma mãe)" n={irmaos.length}>
          {!irmaos.length ? <Vazio>Nenhum outro parto da mãe registrado.</Vazio> : irmaos.map((p) => {
            const x = ix.criaPorId.get(p.id);
            return (
              <div className="fx-row" key={p.id}>
                <span className="d">{br(p.data)}</span>
                <span>{x ? <Link k={chaveDaCria(x)}>{x.brinco || 's/ nº'}</Link> : (p.brincoBezerro || 's/ nº')} · {p.sexo || ''}</span>
                <span>{x ? <Pill t={rotuloSit(x)} cor={corSituacao(x.situacao)} /> : null}</span>
              </div>
            );
          })}
        </Card>
        <Manejos dados={ix.dados} ids={[c.id]} brinco={c.brinco} />
        <Linha itens={tl} />
      </div>
    </>
  );
}

function FichaTouro({ ix, t }) {
  const filhos = ix.crias.filter((c) => c.origem && c.origem.pai && String(c.origem.pai).toUpperCase().includes(String(t.nome || '').toUpperCase()));
  const M = filhos.filter((c) => c.sexo === 'Macho').length;
  return (
    <>
      <Cabecalho tipo={`${t.tipo || 'Touro / sêmen'}${t.raca ? ` · ${t.raca}` : ''}`} brinco={t.nome} grande={false}
        pills={<><Pill t={t.tipo === 'Touro vivo' ? 'Touro vivo' : 'Sêmen'} cor="blue" />{t.situacao && <Pill t={t.situacao} />}</>} />
      <div className="fx-grid">
        <Card titulo="Dados">
          <Dl itens={[['Raça', t.raca || '—'], t.tipo !== 'Touro vivo' && ['Doses', t.doses ?? '—'], ['Fornecedor', t.fornecedor || t.vendedor || '—'], t.brinco && ['Brinco', t.brinco], t.lote && ['Lote', t.lote]]} />
          {t.observacoes && <p className="fx-obs">{t.observacoes}</p>}
        </Card>
        <Card titulo="Filhos registrados" n={filhos.length}>
          <div className="fx-dest"><div><small>Machos</small><b>{M}</b></div><div><small>Fêmeas</small><b>{filhos.length - M}</b></div></div>
          {filhos.slice(0, 15).map((c) => (
            <div className="fx-row" key={c.id}>
              <span className="d">{br(c.nascData)}</span>
              <span><Link k={chaveDaCria(c)}>{c.brinco || 's/ nº'}</Link> · mãe {c.maeBrinco || '?'}</span>
              <span><Pill t={rotuloSit(c)} cor={corSituacao(c.situacao)} /></span>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

function FichaBoi({ ix, t }) {
  const pts = pesagensBoi(ix.dados, t);
  const ativo = boiAtivo(t);
  const evs = (ix.dados.eventos || []).filter((e) => e.tipo === 'manejo' && String(e.presentes || '').split(',').includes(t.id));
  return (
    <>
      <Cabecalho tipo={`${categoriaBoi(t)}${t.raca ? ` · ${t.raca}` : ''}`} brinco={t.brinco || t.nome}
        pills={<><Pill t={ativo ? 'Na fazenda' : 'Saiu'} cor={ativo ? 'green' : 'gray'} />{t.lote && <Pill t={t.lote} />}</>}
        linha={t.dataNascimento ? `Nascido em ${br(t.dataNascimento)} · ${idadeCurta(t.dataNascimento, ix.hoje)}` : t.dataCompra ? `Entrou em ${br(t.dataCompra)}` : ''} />
      <div className="fx-grid">
        <Card titulo="Identificação">
          <Dl itens={[
            ['Nome / apelido', t.nome && t.nome !== t.brinco ? t.nome : '—'], ['Raça', t.raca || '—'], ['Origem', t.origem || '—'],
            ['Entrada', br(t.dataCompra)], ['Peso de entrada', t.pesoAtual ? `${t.pesoAtual} kg` : '—'], ['Vendedor', t.vendedor || '—'], ['Lote', t.lote || '—'],
            !ativo && ['Saída', `${br(t.dataSaida)} ${t.motivoSaida || ''}`],
          ]} />
          {t.observacoes && <p className="fx-obs">{t.observacoes}</p>}
        </Card>
        <Peso pontos={pts} />
        <Card titulo="Manejos" n={evs.length}>{!evs.length ? <Vazio>Nenhum manejo registrado.</Vazio> : evs.map((e) => <div className="fx-row" key={e.id}><span className="d">{br(e.data)}</span><span>{e.descricao || e.etapa}</span><span /></div>)}</Card>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- provedor: guarda a pilha de fichas abertas e a busca
export function FichaProvider({ dados, hoje, ownerMode, children, onEditarMatriz, onEditarBoi }) {
  const ix = useMemo(() => indiceRebanho(dados, hoje), [dados, hoje]);
  const [pilha, setPilha] = useState([]);
  const [busca, setBusca] = useState(null);
  const caixa = useRef(null);
  const valor = useMemo(() => ({
    ix,
    abrir: (k) => { setBusca(null); setPilha((p) => [...p, k]); setTimeout(() => caixa.current && caixa.current.scrollTo(0, 0), 0); },
    buscar: (q) => { setPilha([]); setBusca(q || ''); },
  }), [ix]);
  const aberto = pilha.length > 0 || busca !== null;
  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : '';
    const k = (e) => { if (e.key === 'Escape' && !document.querySelector('.ov')) { if (pilha.length) setPilha((p) => p.slice(0, -1)); else setBusca(null); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [aberto, pilha.length]);

  const k = pilha[pilha.length - 1];
  let corpo = null; let editar = null;
  if (k) {
    const id = k.slice(2);
    if (k[0] === 'm') {
      const m = ix.matPorId.get(id);
      corpo = m ? <FichaMatriz ix={ix} m={m} /> : <Vazio>Animal não encontrado.</Vazio>;
      if (m && ownerMode && m.status !== 'Vendida' && m.status !== 'Morta') editar = () => onEditarMatriz(m);
    } else if (k[0] === 'c') {
      const c = ix.criaPorId.get(id);
      corpo = c ? <FichaCria ix={ix} c={c} /> : <Vazio>Animal não encontrado.</Vazio>;
    } else {
      const t = (dados.touros || []).find((x) => x.id === id);
      corpo = !t ? <Vazio>Animal não encontrado.</Vazio> : ehBoi(t) ? <FichaBoi ix={ix} t={t} /> : <FichaTouro ix={ix} t={t} />;
      if (t && ehBoi(t) && ownerMode) editar = () => onEditarBoi(t);
    }
  }

  return (
    <Ctx.Provider value={valor}>
      {children}
      {aberto && (
        <div className="fx-sobre" ref={caixa} role="dialog" aria-modal="true" aria-label={k ? 'Ficha do animal' : 'Buscar animal'}>
          <div className="fx-barra">
            {k ? (
              <>
                <button className="chip lock" onClick={() => setPilha((p) => p.slice(0, -1))} aria-label="Voltar"><ChevronLeft size={18} /></button>
                <b className="fx-tit">Ficha do animal</b>
                <button className="chip lock" onClick={() => valor.buscar('')} aria-label="Buscar outro animal"><Search size={17} /></button>
              </>
            ) : (
              <label className="fx-busca">
                <Search size={19} />
                <input autoFocus inputMode="numeric" autoComplete="off" placeholder="Brinco do animal ou nome do touro" aria-label="Brinco do animal"
                  value={busca || ''} onChange={(e) => setBusca(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { const r = buscarAnimais(ix, busca); if (r.length === 1) valor.abrir(r[0].k); } }} />
              </label>
            )}
            <button className="chip lock" onClick={() => { setPilha([]); setBusca(null); }} aria-label="Fechar"><X size={18} /></button>
          </div>
          <div className="fx-corpo">
            {k ? (
              <>
                {corpo}
                {editar ? <button className="btn wide" style={{ marginTop: 14 }} onClick={editar}>Alterar cadastro</button> : (
                  <p className="sub" style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center' }}><Lock size={14} /> Todos veem a ficha. Alterar cadastro só com a senha.</p>
                )}
              </>
            ) : <ResultadoBusca ix={ix} q={busca} />}
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

function ResultadoBusca({ ix, q }) {
  const r = useMemo(() => buscarAnimais(ix, q), [ix, q]);
  const repetido = r.length > 1 && r.every((x) => x.exato);
  return (
    <>
      <p className="sub" style={{ margin: '4px 2px 12px' }}>
        {!String(q || '').trim() ? 'Digite o brinco: vaca, novilha, cria, boi ou touro (ou o nome do touro).'
          : !r.length ? 'Nenhum animal com esse brinco no banco.'
            : repetido ? <><b style={{ color: 'var(--amber)' }}>Número repetido:</b> mais de um animal com esse brinco. Escolha qual.</> : `${r.length} encontrado(s)`}
      </p>
      {r.length > 0 && <div className="fx-lista">{r.map((x) => <LinhaAnimal key={x.k} k={x.k} />)}</div>}
    </>
  );
}

export { situacaoHistorica };
