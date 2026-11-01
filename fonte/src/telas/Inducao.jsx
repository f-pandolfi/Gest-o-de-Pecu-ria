// v11: Manejo > Indução. Indução de novilhas para entrarem no ciclo reprodutivo, por etapas:
// D0 (implante de progesterona), D12 (retirada + cipionato) e Avaliação (toque: ciclando ou não).
// Cada etapa é gravada como um manejo com etapa "Indução · <etapa>". Na avaliação: presentes = ciclando, ausentes = não ciclou.
import React, { useMemo, useState } from 'react';
import { Plus, Save, Loader2, Search } from 'lucide-react';
import { formatarDataBR, configCompleta, idadeMesesDias, novoId, noPlantel } from '../logica.js';
import { Aviso } from '../ui.jsx';
import { useFicha } from './Ficha.jsx';
import { ETAPAS_INDUCAO, ehInducao, etapaDaInducao, inducoesDe, opcoesAtuais } from '../ficha.js';

const br = (d) => (d ? formatarDataBR(d) : '—');
const PRODUTOS_ETAPA = { [ETAPAS_INDUCAO[0]]: ['Implante de progesterona'], [ETAPAS_INDUCAO[1]]: ['Cipionato de estradiol'], [ETAPAS_INDUCAO[2]]: [] };
const ids = (v) => String(v || '').split(',').filter(Boolean);
const Chip = ({ on, onClick, children, testid }) => <button type="button" className={`fx-cp${on ? ' on' : ''}`} aria-pressed={on} onClick={onClick} data-testid={testid}>{children}</button>;

export default function Inducao({ dados, hoje, ownerMode, modoTeste, onGravarLote }) {
  const { ix, abrir } = useFicha();
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [q, setQ] = useState('');
  const [aviso, setAviso] = useState('');
  const corte = configCompleta(dados.config).pesoMatriz;

  const novs = useMemo(() => dados.matrizes.filter(noPlantel).filter((m) => m.categoria === 'Novilha').map((m) => {
    const cria = ix && ix.criaDaMatriz.get(m.id);
    const nasc = m.dataNascimento || (cria && cria.nascData) || '';
    const inds = inducoesDe(dados, m.id);
    return { m, u: ix ? ix.ultimoPeso(m.brinco) : null, idade: nasc ? idadeMesesDias(nasc, hoje) : null, ind: inds[inds.length - 1] || null, ult: inds[0] || null };
  }), [dados, ix, hoje]);
  const naoInd = novs.filter((x) => !x.ind);
  const prontas = naoInd.filter((x) => x.u && x.u.peso >= corte);
  const historico = useMemo(() => dados.eventos.filter(ehInducao).sort((a, b) => b.data.localeCompare(a.data) || (b.createdAt || '').localeCompare(a.createdAt || '')), [dados.eventos]);

  function nova() {
    setMsg(null);
    setForm({ data: hoje, etapa: ETAPAS_INDUCAO[0], produtos: PRODUTOS_ETAPA[ETAPAS_INDUCAO[0]], responsavel: '', observacoes: '', filtro: prontas.length ? 'prontas' : 'nao', marcadas: [], res: {}, ref: '' });
  }
  function mudarEtapa(etapa) {
    setForm((f) => {
      const n = { ...f, etapa, produtos: PRODUTOS_ETAPA[etapa] || [], res: {} };
      if (etapa !== ETAPAS_INDUCAO[0]) {
        // continua a indução mais recente: já marca as novilhas do D0
        const d0 = historico.find((e) => etapaDaInducao(e) === ETAPAS_INDUCAO[0]);
        if (d0) { n.marcadas = ids(d0.presentes).filter((id) => novs.some((x) => x.m.id === id)); n.filtro = 'continuar'; n.ref = d0.id; }
      } else { n.ref = ''; if (f.filtro === 'continuar') n.filtro = 'nao'; }
      return n;
    });
  }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const marcar = (id) => setForm((f) => ({ ...f, marcadas: f.marcadas.includes(id) ? f.marcadas.filter((x) => x !== id) : [...f.marcadas, id] }));

  async function gravar() {
    const f = form;
    const aval = f.etapa === ETAPAS_INDUCAO[2];
    if (!f.marcadas.length) return setMsg({ tipo: 'erro', t: 'Marque pelo menos uma novilha.' });
    if (aval && f.marcadas.some((id) => !f.res[id])) return setMsg({ tipo: 'erro', t: 'Na avaliação, marque Ciclando ou Não para cada novilha marcada.' });
    const agora = new Date().toISOString();
    const ev = {
      id: `ind-${novoId()}`, tipo: 'manejo', data: f.data, protocoloId: '', etapa: `Indução · ${f.etapa}`, manejoRef: f.ref || '',
      responsavel: f.responsavel || '', descricao: `Indução de novilhas · ${f.etapa}`,
      aplicacoes: JSON.stringify(f.produtos.map((p) => ({ tipo: 'Hormônio', produto: p }))),
      presentes: (aval ? f.marcadas.filter((id) => f.res[id] === 'Ciclando') : f.marcadas).join(','),
      ausentes: aval ? f.marcadas.filter((id) => f.res[id] !== 'Ciclando').join(',') : '',
      observacoes: f.observacoes || '', lote: '', foraDoLote: '', createdAt: agora,
    };
    setSalvando(true);
    const r = await onGravarLote({ estado: { ...dados, eventos: [...dados.eventos, ev] }, eventosParaGravar: [{ tipo: 'manejo', evento: ev }], matrizesParaGravar: [], tourosParaGravar: [] }, `indução ${f.etapa}`);
    setSalvando(false);
    if (!r.ok) return setMsg({ tipo: 'erro', t: r.msg });
    setForm(null);
    const cicl = aval ? ev.presentes.split(',').filter(Boolean).length : 0;
    setMsg({ tipo: 'ok', t: `Indução gravada: ${f.etapa}, ${f.marcadas.length} novilha(s)${aval ? `, ${cicl} ciclando` : ''}.${modoTeste ? ' (modo teste: só na tela)' : ''}${r.offline ? ' Sem internet: vai para a planilha quando voltar.' : ''}` });
  }

  if (!form) {
    return (
      <div data-testid="inducao">
        {msg && <Aviso tipo={msg.tipo === 'ok' ? 'ok' : undefined} onClose={() => setMsg(null)}>{msg.t}</Aviso>}
        <div className="fx-resumo">
          <div className="fx-kpi"><small>Novilhas no plantel</small><b>{novs.length}</b></div>
          <div className="fx-kpi"><small>Não induzidas</small><b style={{ color: 'var(--amber)' }}>{naoInd.length}</b></div>
          <div className="fx-kpi"><small>Prontas (≥ {corte} kg)</small><b style={{ color: 'var(--green)' }}>{prontas.length}</b><i>não induzidas</i></div>
          <div className="fx-kpi"><small>Induzidas</small><b>{novs.length - naoInd.length}</b></div>
        </div>
        <p className="sub">A indução segue por etapas, igual a um protocolo: <b>D0</b> coloca o implante de progesterona, <b>D12</b> retira e aplica o cipionato e, na <b>avaliação</b> (toque), você marca quem está ciclando. A novilha passa a mostrar "Induzida em" no Rebanho e na ficha.</p>
        <button className="btn wide" onClick={nova} data-testid="nova-inducao"><Plus size={18} /> Nova indução</button>
        <section className="fx-card" style={{ marginTop: 14 }}>
          <h3>Induções feitas<span>{historico.length}</span></h3>
          {!historico.length ? <div className="fx-vazio">Nenhuma indução registrada ainda.</div> : historico.map((e) => {
            const aval = /avalia/i.test(etapaDaInducao(e));
            const n = ids(e.presentes).length; const nao = ids(e.ausentes).length;
            let prods = []; try { prods = JSON.parse(e.aplicacoes || '[]').map((a) => a.produto).filter(Boolean); } catch (x) { /* nada */ }
            return (
              <div className="fx-row" key={e.id}>
                <span className="d">{br(e.data)}</span>
                <span>{etapaDaInducao(e)}<small>{[prods.join(' + '), e.responsavel].filter(Boolean).join(' · ')}</small></span>
                <span className={`fx-pill p-${aval ? 'green' : 'blue'}`}>{aval ? `${n} ciclando · ${nao} não` : `${n} novilha(s)`}</span>
              </div>
            );
          })}
        </section>
      </div>
    );
  }

  const aval = form.etapa === ETAPAS_INDUCAO[2];
  // brinco digitado: procura em todas as novilhas (ignora o filtro); Enter marca quando só uma bate
  const qq = q.trim();
  const achadas = qq ? novs.filter((x) => String(x.m.brinco).startsWith(qq)) : [];
  function digitar(v) {
    setQ(v); setAviso('');
    const t = v.trim(); if (!t) return;
    if (!novs.some((x) => String(x.m.brinco).startsWith(t))) {
      const m = dados.matrizes.find((x) => String(x.brinco) === t);
      setAviso(m ? `O brinco ${t} é ${m.categoria === 'Novilha' ? 'novilha fora do plantel' : `${String(m.categoria || 'matriz').toLowerCase()} (${m.status})`}, não entra na indução.` : `Nenhuma novilha com o brinco ${t}.`);
    }
  }
  function marcarDigitado() {
    const exata = achadas.find((x) => String(x.m.brinco) === qq) || (achadas.length === 1 ? achadas[0] : null);
    if (!exata) return;
    if (!form.marcadas.includes(exata.m.id)) marcar(exata.m.id);
    setAviso(`${exata.m.brinco} marcada.`); setQ('');
  }
  let lista = form.filtro === 'prontas' ? prontas : form.filtro === 'nao' ? naoInd : form.filtro === 'continuar' ? novs.filter((x) => form.marcadas.includes(x.m.id)) : novs;
  if (qq) lista = achadas;
  lista = lista.slice().sort((a, b) => ((b.u && b.u.peso) || 0) - ((a.u && a.u.peso) || 0) || String(a.m.brinco).localeCompare(String(b.m.brinco), 'pt-BR', { numeric: true }));
  const produtos = opcoesAtuais('produtos', '');
  const pessoas = opcoesAtuais('pessoas', '');
  return (
    <div data-testid="inducao-form">
      <section className="fx-card" style={{ marginBottom: 12 }}>
        <h3>Nova indução</h3>
        <div className="fld"><label htmlFor="ind-data">Data</label><input id="ind-data" type="date" value={form.data} onChange={(e) => set('data', e.target.value)} /></div>
        <div className="fld" role="group" aria-label="Etapa"><span className="lbl fx-lbl">Etapa</span>
          <div className="fx-chips">{ETAPAS_INDUCAO.map((e) => <Chip key={e} on={form.etapa === e} onClick={() => mudarEtapa(e)} testid={`etapa-${e}`}>{e}</Chip>)}</div></div>
        <div className="fld" role="group" aria-label="Produtos"><span className="lbl fx-lbl">Produtos aplicados</span>
          <div className="fx-chips">{produtos.map((p) => <Chip key={p} on={form.produtos.includes(p)} onClick={() => set('produtos', form.produtos.includes(p) ? form.produtos.filter((x) => x !== p) : [...form.produtos, p])}>{p}</Chip>)}</div></div>
        <div className="fld"><label htmlFor="ind-resp">Responsável</label><input id="ind-resp" list="ind-pessoas" value={form.responsavel} onChange={(e) => set('responsavel', e.target.value)} /><datalist id="ind-pessoas">{pessoas.map((p) => <option key={p} value={p} />)}</datalist></div>
        <div className="fld"><label htmlFor="ind-obs">Observação</label><input id="ind-obs" value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} /></div>
      </section>
      <div className="fx-chips">
        {form.ref && <Chip on={form.filtro === 'continuar'} onClick={() => set('filtro', 'continuar')}>Do último D0</Chip>}
        <Chip on={form.filtro === 'prontas'} onClick={() => set('filtro', 'prontas')}>Prontas ≥ {corte} kg<b>{prontas.length}</b></Chip>
        <Chip on={form.filtro === 'nao'} onClick={() => set('filtro', 'nao')}>Não induzidas<b>{naoInd.length}</b></Chip>
        <Chip on={form.filtro === 'todas'} onClick={() => set('filtro', 'todas')}>Todas<b>{novs.length}</b></Chip>
      </div>
      <label className="search fx-search" style={{ marginTop: 4 }}>
        <Search />
        <input inputMode="numeric" autoComplete="off" placeholder="Digite o brinco e toque para marcar (Enter marca)" aria-label="Brinco da novilha" data-testid="ind-brinco"
          value={q} onChange={(e) => digitar(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); marcarDigitado(); } }} />
      </label>
      {aviso && <p className="sub" style={{ margin: '0 2px 8px', color: /marcada/.test(aviso) ? 'var(--green)' : 'var(--amber)' }} role="status">{aviso}</p>}
      <div className="contador">{form.marcadas.length} marcada(s){qq ? ` · mostrando ${achadas.length} com "${qq}"` : ''}</div>
      <div className="fx-lista" style={{ marginTop: 8 }}>
        {!lista.length && <div className="empty">Nenhuma novilha com esse filtro.</div>}
        {lista.map((x) => {
          const on = form.marcadas.includes(x.m.id);
          return (
            <div key={x.m.id} className={`fx-li fx-marca${on ? ' on' : ''}`}>
              <button type="button" className="fx-marca-bt" onClick={() => marcar(x.m.id)} aria-pressed={on} data-testid={`ind-${x.m.brinco}`}>
                <span className="fx-bb">{x.m.brinco}<small>{on ? '✓ marcada' : 'Novilha'}</small></span>
                <span className="fx-two"><b>{x.u ? `${x.u.peso} kg` : 'Sem peso'}{x.idade ? ` · ${x.idade.meses} meses` : ''}</b><span>{x.ult ? `${x.ult.etapa} em ${br(x.ult.data)}` : 'Não induzida'} · {x.m.lote || 'sem lote'}</span></span>
              </button>
              {aval && on ? (
                <span className="fx-res">{['Ciclando', 'Não'].map((r) => <button key={r} type="button" className={`fx-pill p-${form.res[x.m.id] === r ? (r === 'Ciclando' ? 'green' : 'late') : 'gray'}`} onClick={() => set('res', { ...form.res, [x.m.id]: r })} data-testid={`res-${x.m.brinco}-${r}`}>{r}</button>)}</span>
              ) : (
                <button type="button" className="fx-pill p-gray" onClick={() => abrir(`m:${x.m.id}`)} aria-label={`Ficha da novilha ${x.m.brinco}`}>ficha</button>
              )}
            </div>
          );
        })}
      </div>
      {msg && <Aviso tipo={msg.tipo === 'ok' ? 'ok' : undefined}>{msg.t}</Aviso>}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn" style={{ flex: 1 }} onClick={gravar} disabled={salvando} data-testid="gravar-inducao">{salvando ? <Loader2 size={17} className="spin" /> : <Save size={17} />} Gravar ({form.marcadas.length})</button>
        <button className="btn quiet" onClick={() => { setForm(null); setMsg(null); }}>Cancelar</button>
      </div>
    </div>
  );
}
