// Protocolos de IATF e de monta. O dono cria (manejos, animais, sêmen/touros, custo opcional); todos fazem os manejos.
import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Save, ArrowLeft, FileDown, Loader2, Pencil } from 'lucide-react';
import { formatarDataBR, addDias, noPlantel, acharMatrizPorBrinco } from '../logica.js';
import {
  MODELOS_IATF, MANEJO_ENTRADA_MONTA, DIAS_MONTA_PADRAO, agendaProtocolo, proximoManejo, validarProtocolo, prepararProtocolo,
  infoVaca, avisosParaProtocolo, semensDisponiveis, tourosVivos, nomeTouro, dataIA, fimDaMonta, montaDeRepasse, relatorioProtocolo,
  estoqueSemen, listarToques, resumoToque,
} from '../manejo.js';
import { Aviso, Lead, SecaoRelatorio } from '../ui.jsx';
import { formatarDataBR as fd } from '../logica.js';
import { baixarPDF } from '../pdfloader.js';
import { Rotulo } from './ManejoComum.jsx';
import ManejoCurral from './ManejoCurral.jsx';

const ativos = (dados) => (dados.protocolos || []).filter((p) => p.status !== 'Encerrado');

// ---------------------------------------------------------------- lista
function Lista({ dados, hoje, ownerMode, onAbrir, onNovo }) {
  const [verEncerrados, setVerEncerrados] = useState(false);
  const lista = (dados.protocolos || []).filter((p) => verEncerrados || p.status !== 'Encerrado')
    .sort((a, b) => (b.dataInicio || '').localeCompare(a.dataInicio || ''));
  return (
    <section>
      {ownerMode && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <button className="btn sm" onClick={() => onNovo('IATF')}><Plus size={15} /> Novo protocolo de IATF</button>
          <button className="btn ghost sm" onClick={() => onNovo('Monta')}><Plus size={15} /> Novo lote de monta</button>
        </div>
      )}
      {lista.length === 0 && <div className="sheet"><div className="empty">Nenhum protocolo {verEncerrados ? '' : 'ativo '}ainda.{ownerMode ? ' Crie um nos botões acima.' : ' O proprietário cria os protocolos.'}</div></div>}
      {lista.map((p) => {
        const prox = proximoManejo(dados, p, hoje);
        const touros = (p.touros || []).map((id) => nomeTouro(dados, id)).filter(Boolean);
        return (
          <button key={p.id} className="card-prot" onClick={() => onAbrir(p.id)} data-testid={`prot-${p.nome}`}>
            <b>{p.nome}</b> <span className="mut" style={{ fontSize: 12.5 }}>· {p.tipo === 'Monta' ? 'Monta' : 'IATF'}{p.status === 'Encerrado' ? ' · encerrado' : ''}</span>
            <div className="l2">
              {p.tipo === 'Monta'
                ? `De ${formatarDataBR(p.dataInicio)} a ${formatarDataBR(fimDaMonta(p))}${touros.length ? ` · ${touros.join(', ')}` : ''}`
                : `D0 ${formatarDataBR(p.dataInicio)} · IA ${formatarDataBR(dataIA(p))}${p.semenPadrao ? ` · ${nomeTouro(dados, p.semenPadrao)}` : ''}`}
              {` · ${(p.animais || []).length} animais`}
            </div>
            {prox ? <div className="prox" style={{ color: prox.atrasado ? 'var(--late)' : prox.hoje ? 'var(--green)' : undefined }}>Próximo: {prox.id} em {formatarDataBR(prox.data)}{prox.hoje ? ' (hoje)' : prox.atrasado ? ' (atrasado)' : ''}</div>
              : <div className="prox" style={{ color: 'var(--green)' }}>Todos os manejos feitos</div>}
          </button>
        );
      })}
      <button className="btn quiet sm" onClick={() => setVerEncerrados((v) => !v)}>{verEncerrados ? 'Esconder encerrados' : 'Ver também os encerrados'}</button>
    </section>
  );
}

// ---------------------------------------------------------------- detalhe
function Detalhe({ dados, hoje, p, ownerMode, onVoltar, onFazer, onEditar, onSalvarProtocolo, onNovoRepasse }) {
  const ag = agendaProtocolo(dados, p, hoje);
  const [pdf, setPdf] = useState(false);
  const [confEncerrar, setConfEncerrar] = useState(false);
  const rel = relatorioProtocolo(dados, p, hoje);
  const touros = (p.touros || []).map((id) => nomeTouro(dados, id)).filter(Boolean);
  async function baixar() { setPdf(true); try { await baixarPDF(rel); } catch (e) { console.error(e); } setPdf(false); }
  return (
    <section className="sheet pad" data-testid="detalhe-protocolo">
      <button className="btn quiet sm" onClick={onVoltar} style={{ marginBottom: 10 }}><ArrowLeft size={15} /> Protocolos</button>
      <h2 className="h2" style={{ marginTop: 0 }}>{p.nome}<small>{p.tipo === 'Monta' ? 'monta' : 'IATF'}{p.status === 'Encerrado' ? ' · encerrado' : ''}</small></h2>
      {p.tipo === 'Monta' ? (
        <>
          <Lead rotulo="Período" valor={`${formatarDataBR(p.dataInicio)} a ${formatarDataBR(fimDaMonta(p))}`} />
          <Lead rotulo="Touros do lote" valor={touros.join(', ') || 'nenhum escolhido'} />
        </>
      ) : (
        <>
          <Lead rotulo="D0" valor={formatarDataBR(p.dataInicio)} />
          <Lead rotulo="Inseminação" valor={formatarDataBR(dataIA(p))} />
          <Lead rotulo="Sêmen" valor={p.semenPadrao ? nomeTouro(dados, p.semenPadrao) : 'escolher no dia'} />
          {p.tecnico && <Lead rotulo="Técnico" valor={p.tecnico} />}
        </>
      )}
      <Lead rotulo="Animais" valor={(p.animais || []).length} />
      {ownerMode && p.custoTotal ? <Lead rotulo="Custo" valor={`R$ ${p.custoTotal}${p.custoObs ? ` (${p.custoObs})` : ''}`} /> : null}

      <h3 className="h2" style={{ fontSize: 18 }}>Manejos</h3>
      {ag.map((m) => (
        <div className="manejo-lin" key={m.id}>
          <span className="d">{m.id}</span>
          <span className="m mut" style={{ font: '500 13.5px var(--mono)' }}>{formatarDataBR(m.data)}</span>
          <span style={{ lineHeight: 1.35 }}>{m.descricao}{m.medicamentos ? <span className="mut" style={{ display: 'block', fontSize: 12.5 }}>{m.medicamentos}</span> : null}
            <span style={{ display: 'block', fontSize: 12.5, color: m.feito ? 'var(--green)' : m.atrasado ? 'var(--late)' : 'var(--mut)' }}>{m.feito ? `feito · ${m.presentes} animais` : m.atrasado ? 'atrasado' : m.hoje ? 'é hoje' : 'a fazer'}</span>
          </span>
          {p.status !== 'Encerrado' && <button className={`btn sm${m.feito ? ' quiet' : ''}`} onClick={() => onFazer(m)}>{m.feito ? 'De novo' : 'Fazer'}</button>}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
        <button className="btn ghost sm" onClick={baixar} disabled={pdf}>{pdf ? <Loader2 size={15} className="spin" /> : <FileDown size={15} />} PDF do protocolo</button>
        {ownerMode && <button className="btn quiet sm" onClick={onEditar}><Pencil size={15} /> Editar</button>}
        {ownerMode && p.tipo === 'IATF' && p.status !== 'Encerrado' && <button className="btn quiet sm" onClick={onNovoRepasse}>Mandar para o repasse (monta)</button>}
        {ownerMode && p.status !== 'Encerrado' && (confEncerrar
          ? <button className="btn sm" style={{ background: 'var(--late)', borderColor: 'var(--late)' }} onClick={() => { onSalvarProtocolo({ ...p, status: 'Encerrado' }); setConfEncerrar(false); }}>Confirmar encerrar</button>
          : <button className="btn quiet sm" onClick={() => setConfEncerrar(true)}>Encerrar</button>)}
      </div>
      <SecaoRelatorio secao={rel.secoes[1]} />
    </section>
  );
}

// ---------------------------------------------------------------- criar / editar (dono)
function FormProtocolo({ dados, hoje, inicial, onSalvar, onCancelar }) {
  const [f, setF] = useState(() => ({
    tipo: 'IATF', nome: '', dataInicio: '', status: 'Ativo', manejos: MODELOS_IATF['3 manejos'].map((m) => ({ ...m })),
    animais: [], touros: [], semenPadrao: '', tecnico: '', custoTotal: '', custoObs: '', observacoes: '', diasMonta: DIAS_MONTA_PADRAO, ...(inicial || {}),
  }));
  const [erro, setErro] = useState(''); const [aviso, setAviso] = useState('');
  const [busca, setBusca] = useState('');
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const monta = f.tipo === 'Monta';
  const outros = ativos(dados).filter((p) => p.id !== f.id);
  const outroDe = (id) => outros.find((p) => (p.animais || []).includes(id));
  const infos = useMemo(() => {
    const porId = new Map(dados.matrizes.map((m) => [m.id, m]));
    return f.animais.map((id) => { const m = porId.get(id); return m ? { id, m, i: infoVaca(dados, m, hoje) } : { id, m: null }; })
      .sort((a, b) => String(a.m ? a.m.brinco : '').localeCompare(String(b.m ? b.m.brinco : ''), 'pt-BR', { numeric: true }));
  }, [f.animais, dados, hoje]);

  // sugestões ao digitar o brinco: mostra último parto e última IATF antes de pôr na lista
  const sugestoes = useMemo(() => {
    const t = busca.trim(); if (!t) return [];
    return dados.matrizes.filter((m) => m.status !== 'Vendida' && m.status !== 'Morta' && String(m.brinco).startsWith(t) && !f.animais.includes(m.id)).slice(0, 6)
      .map((m) => ({ m, i: infoVaca(dados, m, hoje) }));
  }, [busca, dados, hoje, f.animais]);

  const add = (ids) => setF((x) => ({ ...x, animais: [...new Set([...x.animais, ...ids])] }));
  const vazias = dados.matrizes.filter((m) => noPlantel(m) && m.status === 'Vazia').map((m) => m.id);
  const ultToque = listarToques(dados)[0];
  const doToque = ultToque ? resumoToque(dados, ultToque.id) : null;

  function trocarModelo(nome) { set('manejos', MODELOS_IATF[nome].map((m) => ({ ...m }))); }
  function trocarTipo(t) {
    setF((x) => ({ ...x, tipo: t, manejos: t === 'Monta' ? [{ ...MANEJO_ENTRADA_MONTA }] : MODELOS_IATF['3 manejos'].map((m) => ({ ...m })) }));
  }
  const mudaManejo = (i, k, v) => set('manejos', f.manejos.map((m, j) => (j === i ? { ...m, [k]: v } : (k === 'ia' && v ? { ...m, ia: false } : m))));

  function salvar() {
    const p = { ...f, dataFim: monta ? addDias(f.dataInicio || hoje, parseInt(f.diasMonta, 10) || DIAS_MONTA_PADRAO) : '' };
    delete p.diasMonta;
    p.manejos = p.manejos.map((m) => ({ ...m, dias: parseInt(m.dias, 10), id: String(m.id || '').trim() || `D${m.dias}` }));
    const v = validarProtocolo(dados, p);
    if (v.erros.length) { setErro(v.erros.join(' ')); return; }
    setErro(''); setAviso(v.avisos.join(' '));
    onSalvar(prepararProtocolo(p, inicial && inicial.id ? inicial : null));
  }

  return (
    <section className="sheet pad" data-testid="form-protocolo">
      <button className="btn quiet sm" onClick={onCancelar} style={{ marginBottom: 10 }}><ArrowLeft size={15} /> Cancelar</button>
      <h2 className="h2" style={{ marginTop: 0 }}>{inicial && inicial.id ? 'Editar' : 'Novo'} {monta ? 'lote de monta' : 'protocolo de IATF'}</h2>
      {!(inicial && inicial.id) && (
        <div className="seg" style={{ marginBottom: 12 }}>
          <button type="button" aria-pressed={!monta} onClick={() => trocarTipo('IATF')}>IATF</button>
          <button type="button" aria-pressed={monta} onClick={() => trocarTipo('Monta')}>Monta (touro)</button>
        </div>
      )}
      <div className="grid2">
        <div className="fld"><label htmlFor="pr-nome">Nome</label><input id="pr-nome" value={f.nome} placeholder={monta ? 'Ex.: Monta Dez/26 lote 2' : 'Ex.: IATF Nov/26'} onChange={(e) => set('nome', e.target.value)} /></div>
        <div className="fld"><label htmlFor="pr-data">{monta ? 'Entrada no lote' : 'Data do D0'}</label><input id="pr-data" type="date" value={f.dataInicio} onChange={(e) => set('dataInicio', e.target.value)} /></div>
      </div>

      {monta ? (
        <>
          <div className="fld"><label htmlFor="pr-dias">Dias com os touros</label><input id="pr-dias" type="number" value={f.diasMonta} onChange={(e) => set('diasMonta', e.target.value)} />
            {f.dataInicio && <div className="hint">Sai do lote em {formatarDataBR(addDias(f.dataInicio, parseInt(f.diasMonta, 10) || DIAS_MONTA_PADRAO))}</div>}</div>
          <div className="fld"><Rotulo>Touros do lote (pode ser mais de um)</Rotulo>
            {tourosVivos(dados).length === 0 && <p className="sub" style={{ margin: 0 }}>Nenhum touro vivo cadastrado. Cadastre em Rebanho &gt; Touros.</p>}
            <div className="pills">{tourosVivos(dados).map((t) => {
              const on = f.touros.includes(t.id);
              return <button key={t.id} type="button" aria-pressed={on} onClick={() => set('touros', on ? f.touros.filter((x) => x !== t.id) : [...f.touros, t.id])}>{t.nome}</button>;
            })}</div>
          </div>
        </>
      ) : (
        <>
          <div className="grid2">
            <div className="fld"><label htmlFor="pr-semen">Sêmen (padrão)</label>
              <select id="pr-semen" value={f.semenPadrao} onChange={(e) => set('semenPadrao', e.target.value)}>
                <option value="">Escolher no dia da IA</option>
                {semensDisponiveis(dados).map((t) => { const e = estoqueSemen(t, dados.eventos); return <option key={t.id} value={t.id}>{t.nome}{e.compradas ? ` (${e.restantes} doses)` : ''}</option>; })}
              </select></div>
            <div className="fld"><label htmlFor="pr-tec">Técnico</label><input id="pr-tec" value={f.tecnico} onChange={(e) => set('tecnico', e.target.value)} /></div>
          </div>
          <div className="fld"><Rotulo>Modelo</Rotulo>
            <div className="seg">{Object.keys(MODELOS_IATF).map((n) => <button key={n} type="button" onClick={() => trocarModelo(n)}>{n}</button>)}</div>
          </div>
        </>
      )}

      <Rotulo>Manejos (dia, nome, o que fazer e medicamentos)</Rotulo>
      {f.manejos.map((m, i) => (
        <div key={i} className="manejo-ed">
          <input aria-label="Dia (número)" placeholder="Dia" type="number" value={m.dias} onChange={(e) => mudaManejo(i, 'dias', e.target.value)} />
          <input aria-label="Nome do manejo" value={m.id} onChange={(e) => mudaManejo(i, 'id', e.target.value)} />
          <div style={{ display: 'grid', gap: 6 }}>
            <input aria-label="O que fazer" value={m.descricao} onChange={(e) => mudaManejo(i, 'descricao', e.target.value)} />
            <input aria-label="Medicamentos" placeholder="Medicamentos" value={m.medicamentos || ''} onChange={(e) => mudaManejo(i, 'medicamentos', e.target.value)} />
            {!monta && <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}><input type="radio" name="ia" checked={!!m.ia} onChange={() => mudaManejo(i, 'ia', true)} style={{ width: 18, minHeight: 18 }} /> Este é o dia da inseminação</label>}
          </div>
          <button type="button" className="x-peq" aria-label="Tirar este manejo" onClick={() => set('manejos', f.manejos.filter((_, j) => j !== i))}><Trash2 size={16} /></button>
        </div>
      ))}
      <button type="button" className="btn quiet sm" onClick={() => set('manejos', [...f.manejos, { id: '', dias: '', descricao: '', medicamentos: '' }])}><Plus size={15} /> Manejo</button>
      <p className="sub">Os manejos vêm de um modelo: ajuste os dias e os produtos conforme o veterinário. O reforço da Lepto das que ficarem cheias é avisado sozinho (tela Vacinas).</p>

      <div className="grid2">
        <div className="fld"><label htmlFor="pr-custo">Custo total (opcional, R$)</label><input id="pr-custo" inputMode="decimal" value={f.custoTotal} onChange={(e) => set('custoTotal', e.target.value)} /></div>
        <div className="fld"><label htmlFor="pr-custo-obs">Do que é o custo (opcional)</label><input id="pr-custo-obs" value={f.custoObs} onChange={(e) => set('custoObs', e.target.value)} /></div>
      </div>

      <h3 className="h2" style={{ fontSize: 18 }}>Animais<small>{f.animais.length}</small></h3>
      <div className="pills">
        <button type="button" onClick={() => add(vazias.filter((id) => !outroDe(id)))}>+ Todas as vazias ({vazias.filter((id) => !outroDe(id)).length})</button>
        {doToque && <button type="button" onClick={() => add([...doToque.vaziasIds, ...doToque.aptasIds].filter((id) => !outroDe(id)))}>+ Vazias e novilhas aptas do toque de {fd(doToque.data)} ({doToque.vaziasIds.length + doToque.aptasIds.length})</button>}
        {f.animais.length > 0 && <button type="button" onClick={() => set('animais', [])}>Limpar lista</button>}
      </div>
      <div className="fld" style={{ position: 'relative' }}>
        <label htmlFor="pr-busca">Colocar vaca pelo brinco</label>
        <input id="pr-busca" inputMode="numeric" autoComplete="off" value={busca} onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const r = acharMatrizPorBrinco(dados.matrizes, busca); if (r.matriz) { add([r.matriz.id]); setBusca(''); } } }} />
        {sugestoes.length > 0 && (
          <div className="marcar" data-testid="sugestoes-protocolo">
            {sugestoes.map(({ m, i }) => (
              <div key={m.id} className="marca-lin">
                <button type="button" className="marca-bt" onClick={() => { add([m.id]); setBusca(''); }}>
                  <span className="caixa"><Plus size={16} /></span><span className="b">{m.brinco}</span>
                  <span className="two"><b>{m.categoria} · {m.status}</b>
                    <span>Último parto: {i.ultimoParto ? `${formatarDataBR(i.ultimoParto)} (${i.diasParida} d)` : 'nenhum'} · Última IATF: {i.ultimoServico.iatf ? formatarDataBR(i.ultimoServico.iatf.data) : 'nenhuma'}</span>
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="marcar" data-testid="animais-protocolo">
        {infos.length === 0 && <div className="empty">Nenhum animal ainda.</div>}
        {infos.map(({ id, m, i }) => {
          const av = m ? avisosParaProtocolo(dados, i, dados.config, outroDe(id)) : ['não encontrado'];
          return (
            <div key={id} className="marca-lin">
              <div className="marca-bt" style={{ gridTemplateColumns: '80px minmax(0,1fr) 40px' }}>
                <span className="b">{m ? m.brinco : '?'}</span>
                <span className="two">
                  <b>{m ? `${m.categoria || ''} · ${i.crias} cria(s)` : ''}</b>
                  {m && <span>Último parto: {i.ultimoParto ? `${formatarDataBR(i.ultimoParto)} (${i.diasParida} d)` : 'nenhum'} · Última IATF: {i.ultimoServico.iatf ? formatarDataBR(i.ultimoServico.iatf.data) : 'nenhuma'}</span>}
                  {m && i.ultimoToque && <span>Último toque: {formatarDataBR(i.ultimoToque.data)} {i.ultimoToque.resultado}</span>}
                  {av.length > 0 && <span className="late">{av.join(' · ')}</span>}
                </span>
                <button type="button" className="x-peq" aria-label={`Tirar ${m ? m.brinco : id}`} onClick={() => set('animais', f.animais.filter((x) => x !== id))}><Trash2 size={16} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {erro && <Aviso>{erro}</Aviso>}
      {aviso && <Aviso tipo="info">{aviso}</Aviso>}
      <button className="btn wide" style={{ marginTop: 12 }} onClick={salvar}><Save size={18} /> Salvar {monta ? 'lote de monta' : 'protocolo'}</button>
    </section>
  );
}

// ---------------------------------------------------------------- tela
export default function Protocolos({ dados, hoje, ownerMode, modoTeste, onSalvarProtocolo, onGravarLote, abrirNovo, onNovoConsumido }) {
  const [view, setView] = useState({ tela: 'lista' });
  const [msg, setMsg] = useState('');
  // vindo do toque: "Montar protocolo" já com os animais
  React.useEffect(() => {
    if (abrirNovo && ownerMode) { setView({ tela: 'form', inicial: abrirNovo }); if (onNovoConsumido) onNovoConsumido(); }
  }, [abrirNovo]); // eslint-disable-line react-hooks/exhaustive-deps

  const p = view.id ? (dados.protocolos || []).find((x) => x.id === view.id) : null;
  function salvar(prot) {
    const r = onSalvarProtocolo(prot);
    setMsg(r || `Protocolo "${prot.nome}" salvo.`);
    setView({ tela: 'detalhe', id: prot.id });
  }

  if (view.tela === 'form' && ownerMode) {
    return <FormProtocolo dados={dados} hoje={hoje} inicial={view.inicial} onSalvar={salvar} onCancelar={() => setView(view.inicial && view.inicial.id ? { tela: 'detalhe', id: view.inicial.id } : { tela: 'lista' })} />;
  }
  if (view.tela === 'fazer' && p) {
    const m = agendaProtocolo(dados, p, hoje).find((x) => x.id === view.manejoId);
    return <ManejoCurral key={`${p.id}-${view.manejoId}`} dados={dados} hoje={hoje} protocolo={p} manejo={m} modoTeste={modoTeste} onGravarLote={onGravarLote} onVoltar={() => setView({ tela: 'detalhe', id: p.id })} titulo={`${m.id} · ${p.nome}`} />;
  }
  if (view.tela === 'detalhe' && p) {
    return (
      <>
        {msg && <Aviso tipo="ok" onClose={() => setMsg('')}>{msg}</Aviso>}
        <Detalhe
          dados={dados} hoje={hoje} p={p} ownerMode={ownerMode} onVoltar={() => { setMsg(''); setView({ tela: 'lista' }); }}
          onFazer={(m) => { setMsg(''); setView({ tela: 'fazer', id: p.id, manejoId: m.id }); }}
          onEditar={() => setView({ tela: 'form', inicial: { ...p, diasMonta: p.tipo === 'Monta' && p.dataFim && p.dataInicio ? Math.round((new Date(p.dataFim) - new Date(p.dataInicio)) / 86400000) : DIAS_MONTA_PADRAO } })}
          onSalvarProtocolo={(x) => { onSalvarProtocolo(prepararProtocolo(x, p)); setMsg('Protocolo encerrado.'); }}
          onNovoRepasse={() => setView({ tela: 'form', inicial: { ...montaDeRepasse(dados, p, {}), diasMonta: DIAS_MONTA_PADRAO } })}
        />
      </>
    );
  }
  return <Lista dados={dados} hoje={hoje} ownerMode={ownerMode} onAbrir={(id) => setView({ tela: 'detalhe', id })} onNovo={(tipo) => setView({ tela: 'form', inicial: tipo === 'Monta' ? { tipo: 'Monta', manejos: [{ ...MANEJO_ENTRADA_MONTA }] } : undefined })} />;
}
