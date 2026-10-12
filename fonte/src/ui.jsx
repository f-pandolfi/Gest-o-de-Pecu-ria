// Peças visuais reutilizadas nas telas (abas de índice, livro-caixa, campos, janelas).
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, AlertCircle, Info, Check } from 'lucide-react';

export const corStatus = (s) => (s === 'Cheia' ? 'var(--green)' : s === 'Vazia' ? 'var(--amber)' : s === 'Vendida' ? 'var(--mut)' : 'var(--late)');

export function Tag({ status }) {
  return <span className="tag" style={{ color: corStatus(status) }}>{status}</span>;
}

// Abas de índice (orelhas do caderno). tabs: [{ id, label, count? }]
export function IndexTabs({ tabs, value, onChange, rotulo }) {
  return (
    <div className="itabs" role="tablist" aria-label={rotulo}>
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          className="itab"
          onClick={() => onChange(t.id)}
        >
          {t.label}{t.count !== undefined ? ` · ${t.count}` : ''}
        </button>
      ))}
    </div>
  );
}

export function Aviso({ tipo, children, onClose }) {
  const Icon = tipo === 'ok' ? Check : tipo === 'info' ? Info : AlertCircle;
  const cor = tipo === 'ok' ? 'var(--green)' : tipo === 'info' ? 'var(--amber)' : 'var(--late)';
  return (
    <div className={`aviso ${tipo || ''}`} role={tipo === 'ok' || tipo === 'info' ? 'status' : 'alert'}>
      <Icon size={18} color={cor} style={{ flex: 'none', marginTop: 1 }} />
      <div style={{ flex: 1 }}>{children}</div>
      {onClose && <button className="x" onClick={onClose} aria-label="Fechar aviso"><X size={16} /></button>}
    </div>
  );
}

export function Kpis({ itens }) {
  return (
    <div className="kpis">
      {itens.map((k) => (
        <div className="kpi" key={k.rotulo}>
          <small>{k.rotulo}</small>
          <b style={{ ...(k.cor ? { color: k.cor } : null), ...(k.pequeno ? { fontSize: 22 } : null) }}>{k.valor}</b>
          {k.sub ? <span>{k.sub}</span> : null}
        </div>
      ))}
    </div>
  );
}

// Linha de sumário com pontinhos: "rótulo ........ valor"
export function Lead({ rotulo, valor, onClick, big, cor }) {
  return (
    <div className={`lead${big ? ' big' : ''}`}>
      {onClick ? <button onClick={onClick}>{rotulo}</button> : <span>{rotulo}</span>}
      <i />
      <b style={cor ? { color: cor } : undefined}>{valor}</b>
    </div>
  );
}

export function Modal({ titulo, onClose, children, rotulo }) {
  const ref = useRef(null);
  // onClose costuma ser uma função nova a cada render. Se ela fosse dependência do efeito, a cada tecla
  // digitada o efeito rodaria de novo e tiraria o foco do campo. Por isso fica guardada numa ref e o
  // efeito roda só uma vez, quando a janela abre.
  const fechar = useRef(onClose);
  fechar.current = onClose;
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') fechar.current(); };
    window.addEventListener('keydown', onKey);
    const caixa = ref.current;
    if (caixa && !caixa.contains(document.activeElement)) caixa.focus(); // não rouba o foco de um campo com autoFocus
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className="ov" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="box" role="dialog" aria-modal="true" aria-label={rotulo || titulo} ref={ref} tabIndex={-1}>
        <div className="top">
          <h2>{titulo}</h2>
          <button className="x" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Escolha da matriz digitando o brinco (no celular é bem mais rápido que uma lista de 190 itens)
export function MatrizPicker({ value, onChange, matrizes, filtro, rotulo }) {
  const [q, setQ] = useState('');
  const [aberto, setAberto] = useState(false);
  const sel = matrizes.find((m) => m.id === value);
  const lista = useMemo(() => {
    const base = matrizes.filter((m) => m.status !== 'Descarte' && m.status !== 'Vendida' && (!filtro || filtro(m)));
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const comeca = base.filter((m) => String(m.brinco).toLowerCase().startsWith(t));
    const contem = base.filter((m) => !String(m.brinco).toLowerCase().startsWith(t) && String(m.brinco).toLowerCase().includes(t));
    return [...comeca, ...contem].slice(0, 8);
  }, [matrizes, filtro, q]);

  if (sel) {
    return (
      <div className="picker">
        <div className="sel" data-testid="matriz-escolhida">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <b>{sel.brinco}</b>
            <span className="mut" style={{ fontSize: 13.5 }}>{[sel.categoria, sel.raca, sel.lote].filter(Boolean).join(' · ')}</span>
            <Tag status={sel.status} />
          </div>
          <button className="btn quiet sm" onClick={() => { onChange(''); setQ(''); }}>Trocar</button>
        </div>
      </div>
    );
  }
  return (
    <div className="picker">
      <input
        type="text"
        autoComplete="off"
        autoCapitalize="off"
        aria-label={rotulo || 'Brinco da matriz'}
        placeholder="Digite o brinco da vaca"
        value={q}
        onChange={(e) => { setQ(e.target.value); setAberto(true); }}
        onFocus={() => setAberto(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' && lista.length) { onChange(lista[0].id); setQ(''); } }}
      />
      {aberto && q.trim() && (
        <div className="sug" role="listbox">
          {lista.length === 0 && <div className="empty" style={{ padding: 14 }}>Nenhuma matriz com esse brinco.</div>}
          {lista.map((m) => (
            <button key={m.id} role="option" onClick={() => { onChange(m.id); setQ(''); setAberto(false); }}>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
                <b className="num" style={{ fontSize: 18 }}>{m.brinco}</b>
                <span className="mut" style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{[m.categoria, m.raca].filter(Boolean).join(' · ')}</span>
              </span>
              <Tag status={m.status} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Um campo de formulário, conforme a definição em CAMPOS (logica.js)
export function Campo({ campo, value, onChange, matrizes, touros }) {
  const id = `f-${campo.key}`;
  const rotulo = <>{campo.label}{campo.required ? <span className="req"> *</span> : null}</>;
  if (campo.type === 'select' && campo.options.length <= 3) {
    return (
      <div className="fld" role="group" aria-label={campo.label}>
        <span className="lbl" style={{ display: 'block', font: '600 11.5px var(--mono)', letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--mut)', marginBottom: 6 }}>{rotulo}</span>
        <div className="seg">
          {campo.options.map((o) => (
            <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(campo.key, value === o && !campo.required ? '' : o)}>{o}</button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="fld">
      <label htmlFor={id}>{rotulo}</label>
      {campo.type === 'select' && (
        <select id={id} value={value || ''} onChange={(e) => onChange(campo.key, e.target.value)}>
          <option value="">Selecione</option>
          {campo.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
      {campo.type === 'matriz' && (
        <MatrizPicker value={value} onChange={(v) => onChange(campo.key, v)} matrizes={matrizes} rotulo={campo.label} />
      )}
      {campo.type === 'touro' && (
        <select id={id} value={value || ''} onChange={(e) => onChange(campo.key, e.target.value)}>
          <option value="">Selecione</option>
          {touros.map((t) => <option key={t.id} value={t.id}>{t.nome}{t.raca ? ` — ${t.raca}` : ''}</option>)}
          <option value="__outro__">Outro / não cadastrado</option>
        </select>
      )}
      {(campo.type === 'text' || campo.type === 'number' || campo.type === 'date') && (
        <input
          id={id}
          type={campo.type}
          inputMode={campo.type === 'number' ? 'decimal' : undefined}
          value={value || ''}
          onChange={(e) => onChange(campo.key, e.target.value)}
        />
      )}
    </div>
  );
}

const vazioTxt = (v) => (v === '' || v === null || v === undefined ? '—' : String(v));

// Seção de relatório: { titulo, nota?, colunas: [{ k, label, align?, mono? }], linhas: [obj] }
export function SecaoRelatorio({ secao }) {
  return (
    <section>
      <h2 className="h2">{secao.titulo}<small>{secao.linhas.length} linha(s)</small></h2>
      {secao.nota ? <p className="nota">{secao.nota}</p> : null}
      {secao.linhas.length === 0 ? (
        <div className="tbwrap"><div className="empty">Nada para mostrar neste período.</div></div>
      ) : (
        <div className="tbwrap">
          <table className="tb">
            <thead>
              <tr>{secao.colunas.map((c) => <th key={c.k} className={c.align === 'right' ? 'r' : ''}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {secao.linhas.map((l, i) => {
                const total = String(l[secao.colunas[0].k]) === 'Total';
                return (
                  <tr key={i}>
                    {secao.colunas.map((c) => (
                      <td
                        key={c.k}
                        className={`${c.align === 'right' ? 'r ' : ''}${c.mono ? 'mono ' : ''}${c.k === 'brincos' ? 'wrapt' : ''}`}
                        style={total ? { fontWeight: 700, color: 'var(--amber)' } : undefined}
                      >
                        {vazioTxt(l[c.k])}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// Tabela simples de objetos (aba Planilha)
export function TabelaLinhas({ rows }) {
  if (!rows || rows.length === 0) {
    return <div className="tbwrap"><div className="empty">Nenhum registro neste período.</div></div>;
  }
  const headers = Object.keys(rows[0]);
  return (
    <div className="tbwrap">
      <table className="tb">
        <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{headers.map((h) => <td key={h}>{String(r[h] ?? '')}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
