// Peças comuns das telas de curral (protocolo, toque, vacinação): aplicações do cabeçalho e lista para marcar presentes.
import React, { useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Search, Check } from 'lucide-react';
import { TIPOS_APLICACAO } from '../manejo.js';

const ROTULO = { display: 'block', font: '600 11.5px var(--mono)', letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--mut)', marginBottom: 6 };
export const Rotulo = ({ children }) => <span className="lbl" style={ROTULO}>{children}</span>;

// Vacinas, vermífugo, fortificante... aplicados a todos os animais presentes no manejo
export function AplicacoesEditor({ valor, onChange, extras }) {
  const itens = valor || [];
  const tipos = [...TIPOS_APLICACAO.filter((t) => t !== 'Outra'), ...(extras || []).filter((t) => !TIPOS_APLICACAO.includes(t)), 'Outra'];
  const mudar = (i, campo, v) => onChange(itens.map((x, j) => (j === i ? { ...x, [campo]: v } : x)));
  return (
    <div className="fld" data-testid="aplicacoes">
      <Rotulo>Vacinas e medicamentos aplicados</Rotulo>
      {itens.length === 0 && <p className="sub" style={{ margin: '0 0 8px' }}>Nenhum. Se vai aplicar vacina, vermífugo ou outro produto em todos, coloque aqui.</p>}
      {itens.map((a, i) => (
        <div key={i} className="apl-lin">
          <select aria-label="Tipo de aplicação" value={a.tipo || ''} onChange={(e) => mudar(i, 'tipo', e.target.value)}>
            <option value="">Escolha</option>
            {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input aria-label="Produto" placeholder="Produto (opcional)" value={a.produto || ''} onChange={(e) => mudar(i, 'produto', e.target.value)} />
          <button type="button" className="x-peq" aria-label="Tirar esta aplicação" onClick={() => onChange(itens.filter((_, j) => j !== i))}><Trash2 size={16} /></button>
        </div>
      ))}
      <button type="button" className="btn quiet sm" onClick={() => onChange([...itens, { tipo: '', produto: '' }])}><Plus size={15} /> Aplicação</button>
    </div>
  );
}

// Lista de animais para marcar quem passou no curral. Começa DESMARCADA; tocar marca/desmarca.
// itens: [{ id, brinco, linha1, linha2, avisos? }]. onDigitarFora(brinco) é chamado quando o brinco não está na lista.
export function ListaMarcar({ itens, marcados, onToggle, onDigitarFora, extraDaLinha, rotuloContador }) {
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const refs = useRef({});
  const total = itens.length;
  const n = itens.filter((x) => marcados.has(x.id)).length;
  const filtrados = useMemo(() => {
    const t = q.trim();
    if (!t) return itens;
    return itens.filter((x) => String(x.brinco).startsWith(t));
  }, [itens, q]);
  function marcarDigitado() {
    const t = q.trim();
    if (!t) return;
    const achado = itens.find((x) => String(x.brinco) === t || (/^\d+$/.test(t) && /^\d+$/.test(String(x.brinco)) && Number(x.brinco) === Number(t)));
    if (achado) {
      if (!marcados.has(achado.id)) onToggle(achado.id);
      setMsg(`${achado.brinco} marcada.`); setQ('');
      return;
    }
    setMsg(onDigitarFora ? onDigitarFora(t) : `O brinco ${t} não está nesta lista. Verifique.`);
  }
  return (
    <div>
      <div className="contador" data-testid="contador">{n} de {total} {rotuloContador || 'presentes'}</div>
      <label className="search" style={{ marginTop: 8 }}>
        <Search />
        <input
          inputMode="numeric" placeholder="Digite o brinco e tecle Enter para marcar" aria-label="Brinco para marcar"
          value={q} onChange={(e) => { setQ(e.target.value); setMsg(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); marcarDigitado(); } }}
        />
      </label>
      {msg && <div className={`hint ${/não está|Não achei|Verifique|Atenção|Escolha o lote|já está/.test(msg) ? 'late' : 'good'}`} role="status" data-testid="msg-marcar" style={{ margin: '6px 2px', fontSize: 13.5 }}>{msg}</div>}
      <div className="marcar" data-testid="lista-marcar">
        {filtrados.map((x) => {
          const on = marcados.has(x.id);
          return (
            <div key={x.id} className={`marca-lin${on ? ' on' : ''}`} ref={(el) => { refs.current[x.id] = el; }}>
              <button type="button" className="marca-bt" aria-pressed={on} aria-label={`${on ? 'Desmarcar' : 'Marcar'} ${x.brinco}`} onClick={() => onToggle(x.id)}>
                <span className="caixa">{on ? <Check size={18} /> : null}</span>
                <span className="b">{x.brinco}</span>
                <span className="two"><b>{x.linha1}</b><span>{x.linha2}</span>{x.avisos && x.avisos.length ? <span className="late">{x.avisos.join(' · ')}</span> : null}</span>
              </button>
              {on && extraDaLinha ? <div className="marca-extra">{extraDaLinha(x)}</div> : null}
            </div>
          );
        })}
        {filtrados.length === 0 && <div className="empty">Nenhum animal com esse número nesta lista.</div>}
      </div>
    </div>
  );
}
