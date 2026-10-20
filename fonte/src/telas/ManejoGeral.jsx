// Manejo > Geral (app 10.3): manejo geral do curral com conferência do lote.
// Cabeçalho: data, lote, manejo (o que está sendo feito), responsável, produtos. Embaixo, os animais do lote DESMARCADOS:
// marca quem passou. Brinco que não é do lote entra com a observação. Mudança de lote: só o proprietário confirma.
import React, { useEffect, useMemo, useState } from 'react';
import { Save, Loader2, FileDown, Plus, X, Check, ArrowLeft, ClipboardCheck } from 'lucide-react';
import { formatarDataBR, padronizarLote } from '../logica.js';
import {
  MANEJOS_RAPIDOS, lotesParaManejo, animaisDoLote, temCriasAoPe, animalForaDoLote, aplicarManejoGeral, pendenciasLote,
  listarManejosGerais, relatorioConferencia, faltasRepetidas,
} from '../manejoGeral.js';
import { Aviso, Kpis, SecaoRelatorio } from '../ui.jsx';
import { AplicacoesEditor, ListaMarcar, Rotulo } from './ManejoComum.jsx';
import { lerLocal, gravarNoCelular, apagarLocal } from '../fila.js';
import { baixarPDF } from '../pdfloader.js';

const CHAVE = 'rascunho-manejo-geral-v1';
const OUTRO = '__outro__';
const vazio = (hoje) => ({ data: hoje, lote: '', loteDigitado: '', descricao: '', responsavel: '', aplicacoes: [], incluirCrias: null, marcados: [], fora: [], aprovar: [], obs: '' });

function Conferencia({ dados, manejoId, msg, onVoltar }) {
  const rel = useMemo(() => relatorioConferencia(dados, manejoId), [dados, manejoId]);
  const e = dados.eventos.find((x) => x.id === manejoId);
  const rep = useMemo(() => (e ? faltasRepetidas(dados, e.lote) : []), [dados, e]);
  const [pdf, setPdf] = useState(false);
  return (
    <section className="sheet pad" data-testid="conferencia">
      <button className="btn quiet sm" onClick={onVoltar} style={{ marginBottom: 10 }}><ArrowLeft size={15} /> Voltar</button>
      {msg && <Aviso tipo="ok">{msg}</Aviso>}
      <h2 className="h2" style={{ marginTop: 0 }}>{rel.titulo}</h2>
      {rel.subtitulo && <p className="sub" style={{ marginTop: 0 }}>{rel.subtitulo}</p>}
      <Kpis itens={rel.resumo} />
      {rep.length > 0 && <Aviso>Faltaram também no manejo anterior deste lote: <b>{rep.map((x) => x.brinco).join(', ')}</b>. Vale procurar.</Aviso>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
        <button className="btn ghost sm" disabled={pdf} onClick={async () => { setPdf(true); try { await baixarPDF(rel); } catch (err) { console.error(err); } setPdf(false); }}>
          {pdf ? <Loader2 size={15} className="spin" /> : <FileDown size={15} />} PDF da conferência
        </button>
      </div>
      {rel.secoes.filter((s) => s.linhas.length).map((s) => <SecaoRelatorio key={s.titulo} secao={s} />)}
    </section>
  );
}

// Pedidos de mudança de lote (manejos feitos por funcionário): o proprietário confirma ou recusa
function PendenciasLote({ dados, onDecidirLote }) {
  const pend = useMemo(() => pendenciasLote(dados), [dados]);
  const [msg, setMsg] = useState('');
  if (!pend.length && !msg) return null;
  const decidir = (itens, aprovar) => {
    const r = onDecidirLote(itens.map((p) => ({ manejoId: p.manejoId, animal: p.animal, aprovar })));
    setMsg(r || '');
  };
  return (
    <section className="sheet pad" data-testid="pendencias-lote" style={{ marginBottom: 12 }}>
      <h2 className="h2" style={{ marginTop: 0 }}>Mudanças de lote para confirmar<small>{pend.length}</small></h2>
      {msg && <Aviso tipo="ok" onClose={() => setMsg('')}>{msg}</Aviso>}
      {pend.map((p) => (
        <div key={`${p.manejoId}-${p.animal}`} className="pend-lote" data-testid={`pend-${p.brinco}`}>
          <div>
            <b className="b">{p.brinco}</b>
            <div className="l2">{p.de || 'sem lote'} → <b>{p.para}</b></div>
            <div className="l3">{formatarDataBR(p.data)} · {p.descricao}{p.responsavel ? ` · ${p.responsavel}` : ''}</div>
          </div>
          <div className="pend-bts">
            <button className="btn sm" onClick={() => decidir([p], true)} aria-label={`Confirmar mudança de lote da ${p.brinco}`}><Check size={15} /> Mudar</button>
            <button className="btn quiet sm" onClick={() => decidir([p], false)} aria-label={`Recusar mudança de lote da ${p.brinco}`}><X size={15} /> Não</button>
          </div>
        </div>
      ))}
      {pend.length > 1 && <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => decidir(pend, true)}>Confirmar todas ({pend.length})</button>}
    </section>
  );
}

export default function ManejoGeral({ dados, hoje, ownerMode, modoTeste, scriptDesatualizado, onGravarLote, onDecidirLote }) {
  const [f, setF] = useState(() => ({ ...vazio(hoje), ...(lerLocal(CHAVE, null) || {}) }));
  const [tela, setTela] = useState(() => (lerLocal(CHAVE, null) ? 'form' : 'inicio'));
  const [ver, setVer] = useState(null); // { id, msg }
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);

  useEffect(() => { if (tela === 'form') gravarNoCelular(CHAVE, f); }, [f, tela]);
  const set = (k, v) => { setErro(''); setF((x) => ({ ...x, [k]: v })); };

  const lotes = useMemo(() => lotesParaManejo(dados), [dados]);
  const lote = f.lote === OUTRO ? padronizarLote(f.loteDigitado, dados.matrizes) : f.lote;
  const comCrias = !!lote && temCriasAoPe(dados, lote, hoje);
  const incluirCrias = f.incluirCrias === null ? comCrias : f.incluirCrias && comCrias;
  const itens = useMemo(() => animaisDoLote(dados, lote, { hoje, incluirCrias }), [dados, lote, hoje, incluirCrias]);
  const marcados = useMemo(() => new Set(f.marcados), [f.marcados]);
  const feitos = useMemo(() => listarManejosGerais(dados), [dados]);

  if (ver) return <Conferencia dados={dados} manejoId={ver.id} msg={ver.msg} onVoltar={() => setVer(null)} />;

  if (tela === 'inicio') {
    return (
      <>
        {ownerMode && <PendenciasLote dados={dados} onDecidirLote={onDecidirLote} />}
        <section className="sheet pad" data-testid="geral-inicio">
          <h2 className="h2" style={{ marginTop: 0 }}>Manejo geral</h2>
          <p className="sub" style={{ marginTop: 0 }}>Pour-on, brinco mosquicida, vermífugo, vacina ou só conferência. Escolha o lote, marque quem passou no curral e o app mostra quem faltou e quem veio de outro lote.</p>
          {scriptDesatualizado && <Aviso>A planilha ainda não aceita o manejo geral (precisa do script 13). {ownerMode ? 'Implante a versão nova do script.' : 'Avise o proprietário.'}</Aviso>}
          <button className="btn wide" onClick={() => { setF(vazio(hoje)); setTela('form'); }} disabled={scriptDesatualizado}><Plus size={17} /> Novo manejo</button>
          {feitos.length > 0 && (
            <>
              <h3 className="h2" style={{ fontSize: 18 }}>Manejos feitos<small>{feitos.length}</small></h3>
              {feitos.slice(0, 30).map((c) => (
                <button key={c.id} className="card-prot" onClick={() => setVer({ id: c.id })} data-testid={`manejo-${c.id}`}>
                  <b>{formatarDataBR(c.data)} · {c.descricao}</b>
                  <div className="l2">Lote {c.lote} · {c.conferidos.length} de {c.esperados} conferidos{c.faltando.length ? ` · ${c.faltando.length} faltando` : ''}{c.fora.length ? ` · ${c.fora.length} de fora` : ''}{c.responsavel ? ` · ${c.responsavel}` : ''}</div>
                </button>
              ))}
            </>
          )}
        </section>
      </>
    );
  }

  function toggle(id) { set('marcados', marcados.has(id) ? f.marcados.filter((x) => x !== id) : [...f.marcados, id]); }

  function digitarFora(brinco) {
    if (!lote) return 'Escolha o lote primeiro.';
    const b = String(brinco).trim();
    if (f.fora.some((x) => x.brinco === b)) return `${b} já está na lista de fora do lote.`;
    const r = animalForaDoLote(dados, lote, b, hoje);
    setF((x) => ({ ...x, fora: [...x.fora, r], aprovar: r.mudar === 'pendente' ? [...x.aprovar, r.animal] : x.aprovar }));
    return `Atenção: ${b}. ${r.obs}. Incluído com essa observação.`;
  }

  function rapido(m) {
    const ja = f.descricao.trim();
    const desc = ja.toLowerCase().includes(m.rotulo.toLowerCase()) ? ja : ja ? `${ja} + ${m.rotulo}` : m.rotulo;
    const aps = m.aplicacao && !f.aplicacoes.some((a) => a.tipo === m.aplicacao) ? [...f.aplicacoes, { tipo: m.aplicacao, produto: '' }] : f.aplicacoes;
    setF((x) => ({ ...x, descricao: desc, aplicacoes: aps }));
  }

  async function gravar() {
    if (gravando) return;
    const r = aplicarManejoGeral(dados, {
      data: f.data, lote, descricao: f.descricao, responsavel: f.responsavel, aplicacoes: f.aplicacoes,
      esperados: itens.map((x) => x.id), marcados: f.marcados, fora: f.fora, observacoes: f.obs, incluirCrias, dono: ownerMode, aprovar: f.aprovar,
    });
    if (r.erros && r.erros.length) { setErro(r.erros.join(' ')); return; }
    setGravando(true);
    const e = r.eventosNovos[0];
    const res = await onGravarLote({ estado: r.estado, eventosParaGravar: [{ tipo: 'manejo', evento: e }], matrizesParaGravar: r.matrizesAlteradas, tourosParaGravar: [] },
      `manejo ${f.descricao}: lote ${lote}`);
    setGravando(false);
    if (!res.ok) { setErro(res.msg); return; }
    apagarLocal(CHAVE);
    const pend = r.eventosNovos[0] ? JSON.parse(e.foraDoLote).filter((x) => x.mudar === 'pendente').length : 0;
    const msg = [
      'Manejo gravado.',
      r.matrizesAlteradas.length ? `${r.matrizesAlteradas.length} animal(is) mudado(s) para o lote ${lote}.` : '',
      pend ? `${pend} mudança(s) de lote esperando o proprietário confirmar.` : '',
      res.offline ? 'Sem internet: ficou no celular e vai para a planilha quando a internet voltar.' : '',
      modoTeste ? '(modo teste: só na tela)' : '',
    ].filter(Boolean).join(' ');
    setF(vazio(hoje)); setTela('inicio'); setVer({ id: e.id, msg });
  }

  const nMarc = itens.filter((x) => marcados.has(x.id)).length;
  const total = nMarc + f.fora.length;
  return (
    <section className="sheet pad" data-testid="geral-form">
      <button className="btn quiet sm" onClick={() => setTela('inicio')} style={{ marginBottom: 10 }}><ArrowLeft size={15} /> Voltar (o rascunho fica guardado)</button>
      <h2 className="h2" style={{ marginTop: 0 }}>Novo manejo</h2>
      {scriptDesatualizado && <Aviso>A planilha ainda não aceita o manejo geral (precisa do script 13).</Aviso>}
      <div className="grid2">
        <div className="fld"><label htmlFor="mg-data">Data</label><input id="mg-data" type="date" value={f.data} onChange={(e) => set('data', e.target.value)} /></div>
        <div className="fld">
          <label htmlFor="mg-lote">Lote</label>
          <select id="mg-lote" value={f.lote} onChange={(e) => setF((x) => ({ ...x, lote: e.target.value, marcados: [], fora: [], aprovar: [], incluirCrias: null }))}>
            <option value="">Escolha o lote</option>
            {lotes.map((l) => <option key={l.lote} value={l.lote}>{l.lote} ({l.n})</option>)}
            <option value={OUTRO}>Outro lote (digitar)</option>
          </select>
        </div>
      </div>
      {f.lote === OUTRO && (
        <div className="fld"><label htmlFor="mg-lote-novo">Nome do lote</label><input id="mg-lote-novo" value={f.loteDigitado} onChange={(e) => setF((x) => ({ ...x, loteDigitado: e.target.value, marcados: [], fora: [], aprovar: [] }))} placeholder="Ex.: Pasto da grota" /></div>
      )}
      <div className="fld">
        <label htmlFor="mg-desc">Manejo (o que está sendo feito)</label>
        <div className="pills" style={{ marginTop: 0 }}>
          {MANEJOS_RAPIDOS.map((m) => <button key={m.rotulo} type="button" aria-pressed={f.descricao.toLowerCase().includes(m.rotulo.toLowerCase())} onClick={() => rapido(m)}>{m.rotulo}</button>)}
        </div>
        <input id="mg-desc" value={f.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Ex.: Pour-on no lombo e conferência" />
      </div>
      <div className="fld"><label htmlFor="mg-resp">Responsável</label><input id="mg-resp" value={f.responsavel} onChange={(e) => set('responsavel', e.target.value)} /></div>
      <AplicacoesEditor valor={f.aplicacoes} onChange={(a) => set('aplicacoes', a)} />

      {lote && (
        <>
          {comCrias && (
            <label className="chk" style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '4px 0 10px' }}>
              <input type="checkbox" checked={incluirCrias} onChange={(e) => set('incluirCrias', e.target.checked)} data-testid="incluir-crias" />
              Incluir as crias ao pé (bezerros mamando das vacas deste lote)
            </label>
          )}
          <Rotulo>Animais do lote {lote}: toque em quem passou</Rotulo>
          {itens.length === 0 && <p className="sub">Nenhum animal cadastrado neste lote. Digite os brincos que passarem: eles entram como "de fora" e podem mudar para este lote.</p>}
          <ListaMarcar itens={itens} marcados={marcados} onToggle={toggle} onDigitarFora={digitarFora} rotuloContador="conferidos" />

          {f.fora.length > 0 && (
            <div className="fora-lote" data-testid="fora-lote">
              <Rotulo>De outro lote ou sem cadastro ({f.fora.length})</Rotulo>
              {f.fora.map((x, i) => (
                <div key={x.brinco} className="fora-lin">
                  <div className="fora-top">
                    <b className="b">{x.brinco}</b>
                    <span className="late">{x.obs}</span>
                    <button type="button" className="x-peq" aria-label={`Tirar ${x.brinco}`} onClick={() => setF((s) => ({ ...s, fora: s.fora.filter((_, j) => j !== i), aprovar: s.aprovar.filter((a) => a !== x.animal) }))}><X size={16} /></button>
                  </div>
                  {x.mudar === 'pendente' && (ownerMode ? (
                    <label className="chk" style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
                      <input type="checkbox" checked={f.aprovar.includes(x.animal)} aria-label={`Mudar ${x.brinco} para o lote ${lote}`}
                        onChange={(e) => set('aprovar', e.target.checked ? [...f.aprovar, x.animal] : f.aprovar.filter((a) => a !== x.animal))} />
                      Mudar para o lote {lote}
                    </label>
                  ) : <div className="sub" style={{ fontSize: 13 }}>A mudança para o lote {lote} vai para o proprietário confirmar.</div>)}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="fld" style={{ marginTop: 12 }}><label htmlFor="mg-obs">Observação</label><input id="mg-obs" value={f.obs} onChange={(e) => set('obs', e.target.value)} /></div>
      {erro && <Aviso>{erro}</Aviso>}
      <button className="btn wide" style={{ marginTop: 8 }} onClick={gravar} disabled={gravando || total === 0 || scriptDesatualizado}>
        {gravando ? <Loader2 size={18} className="spin" /> : <Save size={18} />} Gravar manejo ({nMarc} de {itens.length}{f.fora.length ? ` + ${f.fora.length} de fora` : ''})
      </button>
      {lote && itens.length > nMarc && nMarc > 0 && <p className="sub" style={{ textAlign: 'center' }}><ClipboardCheck size={14} style={{ verticalAlign: -2 }} /> {itens.length - nMarc} ainda não marcado(s): ao gravar, entram como faltando.</p>}
    </section>
  );
}
