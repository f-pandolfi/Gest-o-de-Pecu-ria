// Toque geral: cabeçalho (data, veterinário, método, vacinas) e todas as matrizes e novilhas embaixo.
// Para cada uma: Cheia (com os dias), Vazia, Descarte (novilha: Apta / Não apta). Mostra o histórico na hora da avaliação.
// As marcações ficam guardadas no celular; "Gravar" manda as marcadas para a planilha e dá para continuar depois.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Save, Loader2, FileDown, Search, ClipboardList } from 'lucide-react';
import { formatarDataBR, previsaoPartoInfo, novoId } from '../logica.js';
import {
  elegiveisToque, infoVaca, avisosToque, aplicarToque, concepcaoPeloToque, previsaoPeloToque, origemDaPrenhez, MOTIVOS_DESCARTE,
  listarToques, resumoToque, relatorioToque,
} from '../manejo.js';
import { Aviso, Kpis, SecaoRelatorio } from '../ui.jsx';
import { lerLocal, gravarNoCelular, apagarLocal } from '../fila.js';
import { baixarPDF } from '../pdfloader.js';
import { AplicacoesEditor } from './ManejoComum.jsx';

const CHAVE = 'toque-sessao-v1';

function Linha({ dados, m, info, marca, data, cfg, onMarcar, gravada }) {
  const novilha = m.categoria === 'Novilha' && info.crias === 0;
  const res = marca ? marca.resultado : '';
  const avs = avisosToque(dados, m, marca, data, cfg);
  const c = marca && res === 'Cheia' ? concepcaoPeloToque(data, marca.dg) : '';
  const ori = c ? origemDaPrenhez(dados, m.id, c) : null;
  const classe = res === 'Cheia' ? 'cheia' : res === 'Vazia' ? 'vazia' : res === 'Descarte' ? 'descarte' : res === 'Ausente' ? 'ausente' : '';
  const prevAnt = m.status === 'Cheia' ? previsaoPartoInfo(m.id, dados.eventos) : null;
  const set = (x) => onMarcar(m.id, x);
  const bt = (rotulo, valor, cls, extra) => (
    <button type="button" className={cls} aria-pressed={res === valor && (!extra || marca.apta === extra.apta)} disabled={gravada}
      onClick={() => set(res === valor && (!extra || marca.apta === extra.apta) ? null : { ...(marca || {}), resultado: valor, apta: '', ...(extra || {}) })}>{rotulo}</button>
  );
  return (
    <div className={`toque-lin ${classe}`} data-testid={`toque-${m.brinco}`}>
      <div className="cab">
        <span className="b">{m.brinco}</span>
        <span style={{ fontWeight: 600 }}>{m.categoria || ''}</span>
        <span className="mut" style={{ fontSize: 13 }}>{[m.lote, m.status].filter(Boolean).join(' · ')}</span>
        {gravada && <span className="vac-tag ok">gravado</span>}
      </div>
      <div className="info">
        <b>{info.crias}</b> cria(s) · último parto <b>{info.ultimoParto ? `${formatarDataBR(info.ultimoParto)} (${info.diasParida} d)` : 'nenhum'}</b>
        <br />{info.ultimoServico.texto ? <>Serviço: <b>{info.ultimoServico.texto}</b></> : 'Sem IATF nem monta registrada'}
        {info.ultimoToque ? <><br />Último toque: {formatarDataBR(info.ultimoToque.data)} {info.ultimoToque.resultado}{info.ultimoToque.dg ? ` (${info.ultimoToque.dg} dias)` : ''}{prevAnt && prevAnt.data ? ` · parto previsto ${formatarDataBR(prevAnt.data)}` : ''}</> : null}
        {info.vacina && info.vacina.texto ? <><br /><span className={`vac-tag ${info.vacina.nivel}`}>{info.vacina.texto}</span></> : null}
      </div>
      <div className="res-bts">
        {novilha ? (
          <>
            {bt('Apta', 'Vazia', 'cheia', { apta: 'Sim' })}
            {bt('Não apta', 'Vazia', 'vazia', { apta: 'Não' })}
            {bt('Cheia', 'Cheia', 'cheia')}
            {bt('Vazia', 'Vazia', 'vazia', { apta: '' })}
            {bt('Descarte', 'Descarte', 'descarte')}
          </>
        ) : (
          <>
            {bt('Cheia', 'Cheia', 'cheia')}
            {bt('Vazia', 'Vazia', 'vazia')}
            {bt('Descarte', 'Descarte', 'descarte')}
          </>
        )}
        {bt('Ausente', 'Ausente', 'aus')}
      </div>
      {marca && res === 'Cheia' && (
        <div className="mais">
          <input aria-label={`Dias de prenhez da ${m.brinco}`} inputMode="numeric" placeholder="Dias" value={marca.dg ?? ''} disabled={gravada} onChange={(e) => set({ ...marca, dg: e.target.value.replace(/\D/g, '') })} />
          <input aria-label={`Observação da ${m.brinco}`} placeholder="Observação" value={marca.observacoes || ''} disabled={gravada} onChange={(e) => set({ ...marca, observacoes: e.target.value })} />
        </div>
      )}
      {marca && res === 'Descarte' && (
        <div className="mais">
          <select aria-label={`Motivo do descarte da ${m.brinco}`} value={marca.motivo || ''} disabled={gravada} onChange={(e) => set({ ...marca, motivo: e.target.value })}>
            <option value="">Motivo</option>{MOTIVOS_DESCARTE.map((x) => <option key={x}>{x}</option>)}
          </select>
          <input aria-label={`Observação da ${m.brinco}`} placeholder="Observação" value={marca.observacoes || ''} disabled={gravada} onChange={(e) => set({ ...marca, observacoes: e.target.value })} />
        </div>
      )}
      {marca && res === 'Vazia' && (
        <div className="mais" style={{ gridTemplateColumns: '1fr' }}>
          <input aria-label={`Observação da ${m.brinco}`} placeholder="Observação (opcional)" value={marca.observacoes || ''} disabled={gravada} onChange={(e) => set({ ...marca, observacoes: e.target.value })} />
        </div>
      )}
      {c && marca.dg !== '' && <div className="calc">Concepção {formatarDataBR(c)} · parto previsto {formatarDataBR(previsaoPeloToque(data, marca.dg))}{ori ? ` · ${ori.rotulo}` : ''}</div>}
      {avs.length > 0 && <div className="avs">{avs.join(' · ')}</div>}
    </div>
  );
}

function ResumoToque({ dados, toqueId, ownerMode, onMontarProtocolo, onVoltar }) {
  const rel = useMemo(() => relatorioToque(dados, toqueId), [dados, toqueId]);
  const r = useMemo(() => resumoToque(dados, toqueId), [dados, toqueId]);
  const [pdf, setPdf] = useState(false);
  return (
    <section className="sheet pad" data-testid="resumo-toque">
      <h2 className="h2" style={{ marginTop: 0 }}>{rel.titulo}</h2>
      <Kpis itens={rel.resumo} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
        <button className="btn ghost sm" disabled={pdf} onClick={async () => { setPdf(true); try { await baixarPDF(rel); } catch (e) { console.error(e); } setPdf(false); }}>{pdf ? <Loader2 size={15} className="spin" /> : <FileDown size={15} />} PDF do toque</button>
        {ownerMode
          ? <button className="btn sm" onClick={() => onMontarProtocolo([...r.vaziasIds, ...r.aptasIds])}><ClipboardList size={15} /> Montar protocolo com vazias e novilhas aptas ({r.vaziasIds.length + r.aptasIds.length})</button>
          : <span className="sub" style={{ alignSelf: 'center' }}>O proprietário monta o próximo protocolo com as vazias e as novilhas aptas.</span>}
        {onVoltar && <button className="btn quiet sm" onClick={onVoltar}>Voltar</button>}
      </div>
      {rel.secoes.map((s) => <SecaoRelatorio key={s.titulo} secao={s} />)}
    </section>
  );
}

export default function Toque({ dados, hoje, ownerMode, modoTeste, onGravarLote, onMontarProtocolo }) {
  const [sessao, setSessao] = useState(() => lerLocal(CHAVE, null));
  const [cab, setCab] = useState({ data: hoje, veterinario: '', metodo: 'Toque retal', aplicacoes: [], observacoes: '' });
  const [filtro, setFiltro] = useState('faltam');
  const [busca, setBusca] = useState('');
  const [msg, setMsg] = useState(null);
  const [gravando, setGravando] = useState(false);
  const [verResumo, setVerResumo] = useState(null);
  const [confEncerrar, setConfEncerrar] = useState(false);
  const topo = useRef(null);

  useEffect(() => { if (sessao) gravarNoCelular(CHAVE, sessao); else apagarLocal(CHAVE); }, [sessao]);

  const eleg = useMemo(() => elegiveisToque(dados), [dados]);
  const infos = useMemo(() => new Map(eleg.map((m) => [m.id, infoVaca(dados, m, sessao ? sessao.data : hoje)])), [eleg, dados, sessao && sessao.data, hoje]); // eslint-disable-line react-hooks/exhaustive-deps
  const toques = useMemo(() => listarToques(dados), [dados]);

  if (verResumo) return <ResumoToque dados={dados} toqueId={verResumo} ownerMode={ownerMode} onMontarProtocolo={onMontarProtocolo} onVoltar={() => setVerResumo(null)} />;

  if (!sessao) {
    return (
      <section className="sheet pad" data-testid="toque-inicio">
        <h2 className="h2" style={{ marginTop: 0 }}>Toque geral</h2>
        <p className="sub" style={{ marginTop: 0 }}>Preencha o cabeçalho e comece. Aparecem todas as matrizes e novilhas ({eleg.length}) com o histórico de cada uma. As marcações ficam guardadas neste celular até gravar.</p>
        <div className="grid2">
          <div className="fld"><label htmlFor="tq-data">Data do toque</label><input id="tq-data" type="date" value={cab.data} onChange={(e) => setCab({ ...cab, data: e.target.value })} /></div>
          <div className="fld"><label htmlFor="tq-vet">Veterinário</label><input id="tq-vet" value={cab.veterinario} onChange={(e) => setCab({ ...cab, veterinario: e.target.value })} /></div>
        </div>
        <div className="seg" style={{ marginBottom: 12 }}>
          {['Toque retal', 'Ultrassom'].map((x) => <button key={x} type="button" aria-pressed={cab.metodo === x} onClick={() => setCab({ ...cab, metodo: x })}>{x}</button>)}
        </div>
        <AplicacoesEditor valor={cab.aplicacoes} onChange={(a) => setCab({ ...cab, aplicacoes: a })} />
        <button className="btn wide" onClick={() => setSessao({ ...cab, id: `tq-${novoId()}`, marcas: {}, gravadas: [] })} disabled={!cab.data}>Começar o toque</button>

        {toques.length > 0 && (
          <>
            <h3 className="h2" style={{ fontSize: 18 }}>Toques já feitos</h3>
            {toques.map((t) => (
              <button key={t.id} className="card-prot" onClick={() => setVerResumo(t.id)}>
                <b>Toque de {formatarDataBR(t.data)}</b><div className="l2">{t.diags.length} avaliadas{t.veterinario ? ` · ${t.veterinario}` : ''}</div>
              </button>
            ))}
          </>
        )}
      </section>
    );
  }

  const marcas = sessao.marcas || {};
  const gravadas = new Set(sessao.gravadas || []);
  const naoGravadas = Object.entries(marcas).filter(([id, mk]) => mk && !gravadas.has(id) && mk.resultado !== 'Ausente');
  const avaliadas = Object.values(marcas).filter((mk) => mk && mk.resultado).length;
  const contagem = (r) => Object.values(marcas).filter((mk) => mk && mk.resultado === r).length;

  function marcar(id, mk) {
    setMsg(null);
    setSessao((s) => ({ ...s, marcas: { ...s.marcas, [id]: mk } }));
  }

  const t = busca.trim();
  const lista = eleg.filter((m) => {
    if (t) return String(m.brinco).startsWith(t);
    const mk = marcas[m.id];
    if (filtro === 'faltam') return !mk || !mk.resultado;
    if (filtro === 'cheias') return mk && mk.resultado === 'Cheia';
    if (filtro === 'vazias') return mk && mk.resultado === 'Vazia';
    if (filtro === 'novilhas') return m.categoria === 'Novilha';
    return true;
  });

  async function gravar() {
    if (gravando) return;
    const semDias = naoGravadas.filter(([, mk]) => mk.resultado === 'Cheia' && (mk.dg === '' || mk.dg === undefined));
    if (semDias.length) { setMsg({ tipo: 'erro', texto: `Faltam os dias de prenhez de ${semDias.length} vaca(s) cheia(s): ${semDias.map(([id]) => (dados.matrizes.find((m) => m.id === id) || {}).brinco).join(', ')}.` }); return; }
    const lista2 = naoGravadas.map(([matrizId, mk]) => ({ matrizId, ...mk }));
    const r = aplicarToque(dados, sessao, lista2);
    if (!r.aplicados.length) { setMsg({ tipo: 'erro', texto: r.rejeitados.map((x) => x.motivo).join(' ') || 'Nada para gravar.' }); return; }
    setGravando(true);
    const res = await onGravarLote(r, `toque: ${r.aplicados.length} vaca(s)`);
    setGravando(false);
    if (!res.ok) { setMsg({ tipo: 'erro', texto: res.msg }); return; }
    const ids = r.aplicados.map((a) => a.matriz.id);
    // as recusadas (já tinham toque nesta data) também ficam travadas, para não tentar de novo
    const recusadas = r.rejeitados.map((x) => x.marca.matrizId);
    setSessao((s) => ({ ...s, gravadas: [...new Set([...(s.gravadas || []), ...ids, ...recusadas])] }));
    setMsg({ tipo: 'ok', texto: `${ids.length} avaliação(ões) gravada(s).${r.rejeitados.length ? ` Não gravadas: ${r.rejeitados.map((x) => x.motivo).join('; ')}.` : ''}${res.offline ? ' Sem internet: ficou no celular e vai para a planilha quando a internet voltar.' : ''}${modoTeste ? ' (modo teste: só na tela)' : ''}` });
  }

  function encerrar() {
    const id = sessao.id;
    setSessao(null); setConfEncerrar(false);
    if ((sessao.gravadas || []).length) setVerResumo(id);
  }

  return (
    <section data-testid="toque-sessao">
      <div className="sheet pad" ref={topo}>
        <h2 className="h2" style={{ marginTop: 0 }}>Toque de {formatarDataBR(sessao.data)}<small>{sessao.veterinario || 'sem veterinário'} · {sessao.metodo}</small></h2>
        <div className="bar-sum" style={{ padding: 0, border: 'none' }} data-testid="placar-toque">
          <span className="mut">{avaliadas} de {eleg.length} avaliadas</span>
          <span className="good">{contagem('Cheia')} cheias</span>
          <span className="soon">{contagem('Vazia')} vazias</span>
          <span className="late">{contagem('Descarte')} descarte</span>
          <span className="mut">{gravadas.size} gravadas</span>
        </div>
        <div className="pills">
          {[['faltam', 'Faltam'], ['todas', 'Todas'], ['cheias', 'Cheias'], ['vazias', 'Vazias'], ['novilhas', 'Novilhas']].map(([id, r]) => (
            <button key={id} type="button" aria-pressed={filtro === id && !t} onClick={() => { setFiltro(id); setBusca(''); }}>{r}</button>
          ))}
        </div>
        <label className="search" style={{ border: '1px solid var(--line)', borderRadius: 6 }}>
          <Search /><input inputMode="numeric" placeholder="Digite o brinco da vaca no brete" aria-label="Buscar brinco no toque" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
      </div>

      <div className="sheet" style={{ marginTop: 10 }}>
        {lista.length === 0 && <div className="empty">{t ? `Nenhuma vaca com o brinco ${t} no toque.` : filtro === 'faltam' ? 'Todas avaliadas.' : 'Nada aqui.'}</div>}
        {lista.map((m) => (
          <Linha key={m.id} dados={dados} m={m} info={infos.get(m.id)} marca={marcas[m.id]} data={sessao.data} cfg={dados.config} onMarcar={marcar} gravada={gravadas.has(m.id)} />
        ))}
      </div>

      <div className="sheet pad" style={{ marginTop: 10, position: 'sticky', bottom: 70, zIndex: 5 }}>
        {msg && <Aviso tipo={msg.tipo === 'erro' ? undefined : 'ok'}>{msg.texto}</Aviso>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" style={{ flex: '1 1 200px' }} onClick={gravar} disabled={gravando || naoGravadas.length === 0}>
            {gravando ? <Loader2 size={18} className="spin" /> : <Save size={18} />} Gravar {naoGravadas.length} avaliação(ões)
          </button>
          {confEncerrar
            ? <button className="btn quiet" onClick={encerrar}>{naoGravadas.length ? `Encerrar sem gravar ${naoGravadas.length}` : 'Confirmar encerrar'}</button>
            : <button className="btn quiet" onClick={() => setConfEncerrar(true)}>Encerrar toque</button>}
        </div>
      </div>
    </section>
  );
}
