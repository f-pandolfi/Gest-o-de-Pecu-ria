// Manejo > Geral (app 10.5): manejo geral do curral com conferência do lote.
// Cabeçalho: data, lote, manejo (o que está sendo feito), responsável, produtos. Embaixo, os animais do lote DESMARCADOS:
// marca quem passou. O brinco digitado é procurado em tudo (matrizes, novilhas, crias, touros) e mostra a situação do animal.
// Brinco de outro lote entra com a observação; brinco que não existe entra como "sem cadastro". Mudança de lote: só o proprietário confirma.
// 10.7: manejo já gravado reabre no mesmo formulário. Qualquer usuário inclui mais brincos e escreve ou corrige observações;
// só o proprietário muda cabeçalho, tira brincos e exclui o manejo.
import React, { useEffect, useMemo, useState } from 'react';
import { Save, Loader2, FileDown, Plus, X, Check, ArrowLeft, ClipboardCheck, Pencil, Trash2 } from 'lucide-react';
import { formatarDataBR, padronizarLote, mesmoLote } from '../logica.js';
import {
  MANEJOS_RAPIDOS, lotesParaManejo, animaisDoLote, temCriasAoPe, aplicarManejoGeral, pendenciasLote,
  listarManejosGerais, relatorioConferencia, faltasRepetidas, indiceBusca, resolverInclusoes, pendenciasNotas, chaveNota,
  formDoManejo, idsDoManejo, editarManejoGeral, resumoExclusao, semCad,
} from '../manejoGeral.js';
import { Aviso, Kpis, SecaoRelatorio } from '../ui.jsx';
import { AplicacoesEditor, Rotulo } from './ManejoComum.jsx';
import ConferirBrincos, { CampoNota } from './ManejoBusca.jsx';
import { lerLocal, gravarNoCelular, apagarLocal } from '../fila.js';
import { baixarPDF } from '../pdfloader.js';

const CHAVE = 'rascunho-manejo-geral-v1';
const OUTRO = '__outro__';
const vazio = (hoje) => ({ data: hoje, lote: '', loteDigitado: '', descricao: '', responsavel: '', aplicacoes: [], incluirCrias: null, marcados: [], incluidos: [], aprovar: [], notas: {}, obs: '' });
// Rascunho da versão 10.3/10.4 guardava a lista "fora" já pronta; agora guarda só o brinco e o animal escolhido
const migrarRascunho = (r) => {
  if (!r) return r;
  if (r.fora && !r.incluidos) { const { fora, ...resto } = r; return { ...resto, incluidos: fora.map((x) => ({ brinco: x.brinco, animal: x.animal || '' })) }; }
  const { fora, ...resto } = r; return resto;
};

function Conferencia({ dados, manejoId, msg, onVoltar, ownerMode, onAbrir, onExcluir }) {
  const rel = useMemo(() => relatorioConferencia(dados, manejoId), [dados, manejoId]);
  const e = dados.eventos.find((x) => x.id === manejoId);
  const rep = useMemo(() => (e ? faltasRepetidas(dados, e.lote) : []), [dados, e]);
  const resumo = useMemo(() => resumoExclusao(dados, manejoId), [dados, manejoId]);
  const [pdf, setPdf] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [erroExcluir, setErroExcluir] = useState('');
  const excluir = async () => { const r = await onExcluir(manejoId); if (r && !r.ok) { setErroExcluir(r.msg); } };
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
        {onAbrir && (
          <button className="btn sm" onClick={() => onAbrir(manejoId)} data-testid="abrir-manejo">
            <Pencil size={15} /> {ownerMode ? 'Editar manejo' : 'Incluir brincos e observações'}
          </button>
        )}
        {ownerMode && onExcluir && <button className="btn quiet sm" onClick={() => { setErroExcluir(''); setConfirmando(true); }} data-testid="excluir-manejo"><Trash2 size={15} /> Excluir manejo</button>}
      </div>
      {confirmando && resumo && (
        <Aviso>
          <div data-testid="confirmar-exclusao">
            <b>Excluir este manejo?</b> {formatarDataBR(resumo.data)} · lote {resumo.lote} · {resumo.descricao}.
            <div style={{ margin: '6px 0' }}>
              Ele some do app e da planilha (a planilha guarda uma cópia na aba Excluidos).
              {resumo.pendentes ? ` ${resumo.pendentes} pedido(s) de mudança de lote que ainda esperam você somem junto.` : ''}
              {resumo.notasPendentes ? ` ${resumo.notasPendentes} observação(ões) ainda não efetivada(s) somem junto.` : ''}
              {resumo.aprovadas ? ` ${resumo.aprovadas} mudança(s) de lote já confirmada(s) NÃO voltam: o animal continua no lote novo.` : ''}
            </div>
            {erroExcluir && <div className="late" role="alert" style={{ margin: '4px 0' }}>{erroExcluir}</div>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn sm" onClick={excluir} data-testid="confirmar-exclusao-sim"><Trash2 size={15} /> Sim, excluir</button>
              <button className="btn quiet sm" onClick={() => setConfirmando(false)}>Não, manter</button>
            </div>
          </div>
        </Aviso>
      )}
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

// Observações por brinco anotadas nos manejos: o proprietário efetiva (cadastra, muda de lote, corrige...) e marca como feita
function PendenciasNotas({ dados, onEfetivarNotas, onAbrir }) {
  const pend = useMemo(() => pendenciasNotas(dados), [dados]);
  const [msg, setMsg] = useState(null); // { t, desfazer: [decisoes] }
  if (!pend.length && !msg) return null;
  const efetivar = (itens) => {
    const r = onEfetivarNotas(itens.map((p) => ({ manejoId: p.manejoId, idx: p.idx, feito: true })));
    setMsg(r ? { t: r, desfazer: itens.map((p) => ({ manejoId: p.manejoId, idx: p.idx, feito: false })) } : null);
  };
  const desfazer = () => { const r = onEfetivarNotas(msg.desfazer); setMsg(r ? { t: 'Voltou para a lista de observações para efetivar.', desfazer: null } : null); };
  return (
    <section className="sheet pad" data-testid="pendencias-notas" style={{ marginBottom: 12 }}>
      <h2 className="h2" style={{ marginTop: 0 }}>Observações para efetivar<small>{pend.length}</small></h2>
      {msg && (
        <Aviso tipo="ok" onClose={() => setMsg(null)}>
          {msg.t}{msg.desfazer && <button type="button" className="btn quiet sm" style={{ marginLeft: 8 }} onClick={desfazer} data-testid="desfazer-notas">Desfazer</button>}
        </Aviso>
      )}
      {pend.map((p) => (
        <div key={`${p.manejoId}-${p.idx}`} className="pend-lote" data-testid={`nota-pend-${p.brinco}`}>
          <div style={{ minWidth: 0 }}>
            <b className="b">{p.brinco}</b>
            <span className="nota-quem"> {p.semCadastro || (!p.animal) ? 'sem cadastro' : p.sit || ''}</span>
            <div className="l2 nota-corpo">{p.nota}</div>
            <button type="button" className="l3 link-lin" onClick={() => onAbrir(p.manejoId)}>{formatarDataBR(p.data)} · lote {p.lote} · {p.descricao}{p.responsavel ? ` · ${p.responsavel}` : ''}</button>
          </div>
          <div className="pend-bts">
            <button className="btn sm" onClick={() => efetivar([p])} aria-label={`Efetivada a observação do brinco ${p.brinco}`}><Check size={15} /> Efetivada</button>
          </div>
        </div>
      ))}
      {pend.length > 1 && <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => efetivar(pend)} data-testid="efetivar-todas">Marcar todas como efetivadas ({pend.length})</button>}
    </section>
  );
}

export default function ManejoGeral({ dados, hoje, ownerMode, modoTeste, scriptDesatualizado, onGravarLote, onDecidirLote, onEfetivarNotas, onCorrigirManejo, onExcluirManejo }) {
  const [f, setF] = useState(() => ({ ...vazio(hoje), ...(migrarRascunho(lerLocal(CHAVE, null)) || {}) }));
  const [tela, setTela] = useState(() => (lerLocal(CHAVE, null) ? 'form' : 'inicio'));
  const [ver, setVer] = useState(null); // { id, msg }
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);
  const [avisoInicio, setAvisoInicio] = useState('');
  const editando = tela === 'form' && !!f.editId;
  const eventoEdicao = editando ? dados.eventos.find((x) => x.id === f.editId) : null;
  const soAcrescenta = editando && !ownerMode; // funcionário reabrindo manejo: só inclui brincos e observações

  useEffect(() => { if (tela === 'form' && !f.editId) gravarNoCelular(CHAVE, f); }, [f, tela]);
  const set = (k, v) => { setErro(''); setF((x) => ({ ...x, [k]: v })); };

  const lotes = useMemo(() => lotesParaManejo(dados), [dados]);
  const lote = f.lote === OUTRO ? padronizarLote(f.loteDigitado, dados.matrizes) : f.lote;
  const comCrias = useMemo(() => !!lote && temCriasAoPe(dados, lote, hoje), [dados, lote, hoje]);
  const incluirCrias = f.incluirCrias === null ? comCrias : f.incluirCrias && comCrias;
  const indice = useMemo(() => indiceBusca(dados, hoje), [dados, hoje]);
  const mesmoLoteGravado = !!eventoEdicao && mesmoLote(lote, eventoEdicao.lote);
  const extras = useMemo(() => (eventoEdicao && mesmoLoteGravado ? idsDoManejo(eventoEdicao) : undefined), [eventoEdicao, mesmoLoteGravado]);
  const jaGravados = useMemo(() => new Set(eventoEdicao ? String(eventoEdicao.presentes || '').split(',').filter(Boolean) : []), [eventoEdicao]);
  const itens = useMemo(() => animaisDoLote(dados, lote, { hoje, incluirCrias, indice, extras }), [dados, lote, hoje, incluirCrias, indice, extras]);
  const esperados = useMemo(() => new Set(itens.map((x) => x.id)), [itens]);
  // brincos incluídos na mão: de outro lote ou sem cadastro (se o lote mudou e o animal já é dele, passa a contar como marcado)
  const incl = useMemo(() => resolverInclusoes(dados, lote, f.incluidos, hoje, { indice, esperados }), [dados, lote, f.incluidos, hoje, indice, esperados]);
  const fora = incl.fora;
  const marcadosTodos = useMemo(() => [...new Set([...f.marcados.filter((id) => esperados.has(id)), ...incl.marcadosExtra])], [f.marcados, esperados, incl.marcadosExtra]);
  const marcados = useMemo(() => new Set(marcadosTodos), [marcadosTodos]);
  const feitos = useMemo(() => listarManejosGerais(dados), [dados]);

  // manejo já gravado volta para o formulário (proprietário muda tudo; funcionário só acrescenta brincos e observações)
  const abrirEdicao = (id) => {
    const e = dados.eventos.find((x) => x.id === id);
    if (!e) return;
    const base = formDoManejo(dados, e);
    const existe = lotes.find((l) => mesmoLote(l.lote, base.lote));
    setErro(''); setAvisoInicio('');
    setF({ ...vazio(hoje), ...base, lote: existe ? existe.lote : OUTRO, loteDigitado: existe ? '' : base.lote });
    setVer(null); setTela('form');
  };
  const sairDaEdicao = () => { const id = f.editId; setErro(''); setF(vazio(hoje)); setTela('inicio'); setVer(id ? { id } : null); };
  const excluirManejo = async (id) => {
    const r = await onExcluirManejo(id);
    if (r && r.ok) { setVer(null); setAvisoInicio(r.msg); }
    return r;
  };

  if (ver) return <Conferencia dados={dados} manejoId={ver.id} msg={ver.msg} onVoltar={() => setVer(null)} ownerMode={ownerMode} onAbrir={abrirEdicao} onExcluir={onExcluirManejo ? excluirManejo : null} />;

  if (tela === 'inicio') {
    return (
      <>
        {avisoInicio && <Aviso tipo="ok" onClose={() => setAvisoInicio('')}>{avisoInicio}</Aviso>}
        {ownerMode && <PendenciasLote dados={dados} onDecidirLote={onDecidirLote} />}
        {ownerMode && onEfetivarNotas && <PendenciasNotas dados={dados} onEfetivarNotas={onEfetivarNotas} onAbrir={(id) => setVer({ id })} />}
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
                  <div className="l2">Lote {c.lote} · {c.conferidos.length} de {c.esperados} conferidos{c.faltando.length ? ` · ${c.faltando.length} faltando` : ''}{c.fora.length ? ` · ${c.fora.length} de fora` : ''}{c.notas.length ? ` · ${c.notas.length} observação(ões)` : ''}{c.responsavel ? ` · ${c.responsavel}` : ''}</div>
                </button>
              ))}
            </>
          )}
        </section>
      </>
    );
  }

  function toggle(id) {
    if (soAcrescenta && jaGravados.has(id)) { setErro('Quem já foi marcado neste manejo só o proprietário pode desmarcar.'); return; }
    set('marcados', marcados.has(id) ? f.marcados.filter((x) => x !== id) : [...f.marcados.filter((x) => esperados.has(x)), id]);
  }

  // ficha vinda da busca por brinco (de outro lote ou sem cadastro)
  function incluir(ficha) {
    setErro('');
    setF((x) => {
      if (x.incluidos.some((i) => String(i.brinco) === String(ficha.brinco) && (i.animal || '') === (ficha.animal || ''))) return x;
      return {
        ...x, incluidos: [...x.incluidos, { brinco: ficha.brinco, animal: ficha.animal || '' }],
        aprovar: ficha.mudar === 'pendente' && !x.aprovar.includes(ficha.animal) ? [...x.aprovar, ficha.animal] : x.aprovar,
      };
    });
  }
  function tirar(x) {
    setF((s) => {
      const { [chaveNota(x)]: _tirada, ...notas } = s.notas || {};
      return { ...s, incluidos: s.incluidos.filter((i) => !(String(i.brinco) === String(x.brinco) && (i.animal || '') === (x.animal || ''))), aprovar: s.aprovar.filter((a) => a !== x.animal), notas };
    });
  }
  function anotar(chave, texto) { setErro(''); setF((s) => ({ ...s, notas: { ...(s.notas || {}), [chave]: texto } })); }

  function rapido(m) {
    const ja = f.descricao.trim();
    const desc = ja.toLowerCase().includes(m.rotulo.toLowerCase()) ? ja : ja ? `${ja} + ${m.rotulo}` : m.rotulo;
    const aps = m.aplicacao && !f.aplicacoes.some((a) => a.tipo === m.aplicacao) ? [...f.aplicacoes, { tipo: m.aplicacao, produto: '' }] : f.aplicacoes;
    setF((x) => ({ ...x, descricao: desc, aplicacoes: aps }));
  }

  async function gravarEdicao() {
    if (gravando) return;
    const r = editarManejoGeral(dados, f.editId, {
      data: f.data, lote, descricao: f.descricao, responsavel: f.responsavel, aplicacoes: f.aplicacoes,
      esperados: itens.map((x) => x.id), marcados: marcadosTodos, fora, observacoes: f.obs, incluirCrias, aprovar: f.aprovar, notas: f.notas,
    }, { dono: !!ownerMode, hoje });
    if (r.erros && r.erros.length) { setErro(r.erros.join(' ')); return; }
    setGravando(true);
    const res = await onCorrigirManejo(r.mudancas, `edição de manejo ${f.descricao}`);
    setGravando(false);
    if (!res || !res.ok) { setErro((res && res.msg) || 'Não consegui gravar.'); return; }
    const e = r.evento;
    const itensFora = JSON.parse(e.foraDoLote);
    const pend = itensFora.filter((x) => x.mudar === 'pendente').length;
    const nNotas = itensFora.filter((x) => x.nota).length;
    const msg = [
      ownerMode ? 'Manejo alterado.' : 'Brincos e observações incluídos no manejo.',
      nNotas ? `${nNotas} observação(ões) por brinco no manejo.` : '',
      r.mudancas.matrizes.length ? `${r.mudancas.matrizes.length} animal(is) mudado(s) para o lote ${e.lote}.` : '',
      pend ? `${pend} mudança(s) de lote esperando o proprietário confirmar.` : '',
      res.offline ? 'Sem internet: ficou no celular e vai para a planilha quando a internet voltar.' : '',
      modoTeste ? '(modo teste: só na tela)' : '',
    ].filter(Boolean).join(' ');
    setF(vazio(hoje)); setTela('inicio'); setVer({ id: e.id, msg });
  }

  async function gravar() {
    if (editando) return gravarEdicao();
    if (gravando) return;
    const r = aplicarManejoGeral(dados, {
      data: f.data, lote, descricao: f.descricao, responsavel: f.responsavel, aplicacoes: f.aplicacoes,
      esperados: itens.map((x) => x.id), marcados: marcadosTodos, fora, observacoes: f.obs, incluirCrias, dono: ownerMode, aprovar: f.aprovar, notas: f.notas,
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
    const nSem = JSON.parse(e.foraDoLote).filter(semCad).length;
    const nNotas = JSON.parse(e.foraDoLote).filter((x) => x.nota).length;
    const msg = [
      'Manejo gravado.',
      nSem ? `${nSem} brinco(s) sem cadastro anotado(s).` : '',
      nNotas ? `${nNotas} observação(ões) por brinco gravada(s)${ownerMode ? ' (ficam em "Observações para efetivar")' : ' para o proprietário efetivar'}.` : '',
      r.matrizesAlteradas.length ? `${r.matrizesAlteradas.length} animal(is) mudado(s) para o lote ${lote}.` : '',
      pend ? `${pend} mudança(s) de lote esperando o proprietário confirmar.` : '',
      res.offline ? 'Sem internet: ficou no celular e vai para a planilha quando a internet voltar.' : '',
      modoTeste ? '(modo teste: só na tela)' : '',
    ].filter(Boolean).join(' ');
    setF(vazio(hoje)); setTela('inicio'); setVer({ id: e.id, msg });
  }

  const nMarc = itens.filter((x) => marcados.has(x.id)).length;
  const total = nMarc + fora.length;
  // manejo gravado antes da 10.6 não tem o sinal semCadastro: sem animal ligado também é "sem cadastro"
  const nSemCad = fora.filter(semCad).length;
  const foraOutro = fora.filter((x) => !semCad(x));
  const semCadastro = fora.filter(semCad);
  return (
    <section className="sheet pad" data-testid="geral-form">
      <button className="btn quiet sm" onClick={() => (editando ? sairDaEdicao() : setTela('inicio'))} style={{ marginBottom: 10 }}><ArrowLeft size={15} /> {editando ? 'Voltar sem salvar' : 'Voltar (o rascunho fica guardado)'}</button>
      <h2 className="h2" style={{ marginTop: 0 }}>{!editando ? 'Novo manejo' : ownerMode ? 'Editar manejo' : 'Incluir brincos e observações'}</h2>
      {scriptDesatualizado && <Aviso>A planilha ainda não aceita o manejo geral (precisa do script 13).</Aviso>}
      {soAcrescenta ? (
        <div className="sub" data-testid="cabecalho-travado" style={{ marginTop: 0 }}>
          <b>{formatarDataBR(f.data)} · lote {lote} · {f.descricao}</b>{f.responsavel ? ` · ${f.responsavel}` : ''}
          <div style={{ fontSize: 13, marginTop: 4 }}>Aqui você inclui mais brincos e escreve ou corrige observações. O que já foi gravado fica como está: só o proprietário muda o manejo ou tira brincos.</div>
        </div>
      ) : (
        <>
      <div className="grid2">
        <div className="fld"><label htmlFor="mg-data">Data</label><input id="mg-data" type="date" value={f.data} onChange={(e) => set('data', e.target.value)} /></div>
        <div className="fld">
          <label htmlFor="mg-lote">Lote</label>
          <select id="mg-lote" value={f.lote} onChange={(e) => setF((x) => ({ ...x, lote: e.target.value, marcados: [], incluirCrias: null }))}>
            <option value="">Escolha o lote</option>
            {lotes.map((l) => <option key={l.lote} value={l.lote}>{l.lote} ({l.n})</option>)}
            <option value={OUTRO}>Outro lote (digitar)</option>
          </select>
        </div>
      </div>
      {f.lote === OUTRO && (
        <div className="fld"><label htmlFor="mg-lote-novo">Nome do lote</label><input id="mg-lote-novo" value={f.loteDigitado} onChange={(e) => { setErro(''); setF((x) => ({ ...x, loteDigitado: e.target.value })); }} placeholder="Ex.: Pasto da grota" /></div>
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
        </>
      )}

      {!lote && <p className="sub" data-testid="geral-sem-lote">{f.lote === OUTRO ? 'Digite o nome do lote novo para começar a conferir os brincos.' : 'Escolha o lote (ou "Outro lote") para conferir os brincos.'}</p>}
      {lote && (
        <>
          {comCrias && (
            <label className="chk-lin" style={{ margin: '4px 0 10px' }}>
              <input type="checkbox" checked={incluirCrias} onChange={(e) => set('incluirCrias', e.target.checked)} data-testid="incluir-crias" />
              Incluir as crias ao pé (bezerros mamando das vacas deste lote)
            </label>
          )}
          <Rotulo>Conferir os brincos do lote {lote}</Rotulo>
          {itens.length === 0 && <p className="sub" data-testid="lote-sem-animais">Este lote ainda não tem animais no cadastro. Digite o brinco de cada animal que passar: se ele existe em outro lote, o app mostra a situação dele e inclui com a observação; se não existe em lugar nenhum, inclui anotado como "sem cadastro".</p>}
          <ConferirBrincos dados={dados} lote={lote} hoje={hoje} itens={itens} marcados={marcados} onToggle={toggle} incluidos={f.incluidos} onIncluir={incluir} indice={indice} esperados={esperados} rotuloContador="conferidos" notas={f.notas || {}} onNota={anotar} />

          {fora.length > 0 && (
            <div className="fora-lote" data-testid="fora-lote">
              {foraOutro.length > 0 && <Rotulo>Incluídos de fora da lista do lote ({foraOutro.length})</Rotulo>}
              {foraOutro.map((x) => (
                <div key={`${x.animal}-${x.brinco}`} className="fora-lin" data-testid={`fora-${x.brinco}`}>
                  <div className="fora-top">
                    <b className="b">{x.brinco}</b>
                    <span className="late">{x.obs}</span>
                    {!(soAcrescenta && x.manter) && <button type="button" className="x-peq" aria-label={`Tirar ${x.brinco}`} onClick={() => tirar(x)}><X size={16} /></button>}
                  </div>
                  {x.sit && <div className="sub fora-sit" style={{ margin: '2px 0 0', fontSize: 13 }}>{x.sit}</div>}
                  <CampoNota brinco={x.brinco} valor={(f.notas || {})[chaveNota(x)]} onChange={(t) => anotar(chaveNota(x), t)} />
                  {x.mudar === 'pendente' && (ownerMode ? (
                    <label className="chk-lin" style={{ fontSize: 14 }}>
                      <input type="checkbox" checked={f.aprovar.includes(x.animal)} aria-label={`Mudar ${x.brinco} para o lote ${lote}`}
                        onChange={(e) => set('aprovar', e.target.checked ? [...f.aprovar, x.animal] : f.aprovar.filter((a) => a !== x.animal))} />
                      Mudar para o lote {lote}
                    </label>
                  ) : <div className="sub" style={{ fontSize: 13 }}>A mudança para o lote {lote} vai para o proprietário confirmar.</div>)}
                </div>
              ))}
              {semCadastro.length > 0 && <div style={{ marginTop: foraOutro.length ? 10 : 0 }}><Rotulo>Sem cadastro ({semCadastro.length})</Rotulo><p className="sub" style={{ margin: '0 0 4px', fontSize: 13 }}>Não estão no banco de dados nem em nenhum lote. Ficam anotados no manejo.</p></div>}
              {semCadastro.map((x) => (
                <div key={`sc-${x.brinco}`} className="fora-lin" data-testid={`fora-${x.brinco}`}>
                  <div className="fora-top">
                    <b className="b">{x.brinco}</b>
                    <span className="late">{x.obs}</span>
                    {!(soAcrescenta && x.manter) && <button type="button" className="x-peq" aria-label={`Tirar ${x.brinco}`} onClick={() => tirar(x)}><X size={16} /></button>}
                  </div>
                  <CampoNota brinco={x.brinco} valor={(f.notas || {})[chaveNota(x)]} onChange={(t) => anotar(chaveNota(x), t)} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!soAcrescenta && <div className="fld" style={{ marginTop: 12 }}><label htmlFor="mg-obs">Observação</label><input id="mg-obs" value={f.obs} onChange={(e) => set('obs', e.target.value)} /></div>}
      {erro && <Aviso>{erro}</Aviso>}
      <button className="btn wide" style={{ marginTop: 8 }} onClick={gravar} disabled={gravando || total === 0 || scriptDesatualizado}>
        {gravando ? <Loader2 size={18} className="spin" /> : <Save size={18} />} {editando ? 'Salvar alterações' : 'Gravar manejo'} ({nMarc} de {itens.length}{fora.length ? ` + ${fora.length} de fora${nSemCad ? `, ${nSemCad} sem cadastro` : ''}` : ''})
      </button>
      {total === 0 && !scriptDesatualizado && <p className="sub" data-testid="dica-gravar" style={{ textAlign: 'center', marginTop: 8 }}>Para gravar: marque quem passou ou digite um brinco.</p>}
      {lote && itens.length > nMarc && nMarc > 0 && <p className="sub" style={{ textAlign: 'center' }}><ClipboardCheck size={14} style={{ verticalAlign: -2 }} /> {itens.length - nMarc} ainda não marcado(s): ao gravar, entram como faltando.</p>}
    </section>
  );
}
