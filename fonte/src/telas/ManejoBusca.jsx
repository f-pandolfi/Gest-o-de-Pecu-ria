// Conferência por brinco do Manejo > Geral (app 10.5).
// Digitou o brinco: o app procura em matrizes, novilhas, crias e touros e mostra a ficha na hora (cheia, vazia, previsão de
// parto, último parto, cria ao pé, lote). Achou e é do lote: marca. Achou em outro lote: inclui com a observação.
// Não achou em lugar nenhum: inclui do mesmo jeito, anotado como "não está no banco de dados nem em nenhum lote".
import React, { useMemo, useRef, useState } from 'react';
import { Search, Check, Plus, AlertTriangle } from 'lucide-react';
import { buscarAnimais, fichaSemCadastro } from '../manejoGeral.js';

const mesmaInclusao = (i, f) => String(i.brinco) === String(f.brinco) && (i.animal || '') === (f.animal || '');

function Ficha({ f, marcado, incluido, lote, onMarcar, onIncluir }) {
  const cor = f.naLista ? 'good' : f.obs ? (f.ativo ? 'soon' : 'late') : 'mut';
  return (
    <div className={`ficha-busca ${cor}`} data-testid={`ficha-${f.chave}`}>
      <div className="fb-topo">
        <b className="b">{f.brinco}</b>
        <span className="fb-tit">{f.titulo}</span>
      </div>
      <div className={`fb-sit ${f.situacao.nivel}`} data-testid="ficha-situacao">{f.situacao.texto}</div>
      {f.linhas.map((l) => <div key={l} className="fb-lin">{l}</div>)}
      <div className="fb-lin">{f.loteAtual ? <>Lote atual: <b>{f.loteAtual}</b></> : f.tipo === 'cria' ? 'Cria: não tem lote próprio' : 'Sem lote no cadastro'}</div>
      <div className={`fb-obs ${f.naLista ? 'good' : f.ativo ? 'soon' : 'late'}`}>{f.naLista ? `Está na lista do lote ${lote}.` : f.obs}</div>
      {f.naLista ? (
        <button type="button" className={`btn wide${marcado ? ' quiet' : ''}`} onClick={() => onMarcar(f)} data-testid="ficha-acao">
          <Check size={17} /> {marcado ? 'Marcada. Toque para desmarcar' : 'Marcar como presente'}
        </button>
      ) : incluido ? (
        <button type="button" className="btn wide quiet" disabled data-testid="ficha-acao"><Check size={17} /> Já incluída no manejo</button>
      ) : (
        <button type="button" className="btn wide" onClick={() => onIncluir(f)} data-testid="ficha-acao"><Plus size={17} /> {f.ativo ? 'Incluir no manejo' : 'Incluir mesmo assim'}</button>
      )}
    </div>
  );
}

// itens: relação do lote [{ id, brinco, linha1, linha2, nivel }]; incluidos: [{ brinco, animal }] (de fora e sem cadastro)
export default function ConferirBrincos({ dados, lote, hoje, itens, marcados, onToggle, incluidos, onIncluir, indice, esperados, rotuloContador }) {
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState(null);
  const [letras, setLetras] = useState(false); // a maioria dos brincos é número; alguns têm letra ou barra (E5, 219/1413)
  const entrada = useRef(null);
  const b = q.trim();
  const fichas = useMemo(() => (b ? buscarAnimais(dados, lote, b, hoje, { indice, esperados }) : []), [dados, lote, b, hoje, indice, esperados]);
  const filtrados = useMemo(() => (b ? itens.filter((x) => String(x.brinco).toLowerCase().startsWith(b.toLowerCase())) : itens), [itens, b]);
  const n = itens.filter((x) => marcados.has(x.id)).length;
  const marcadoNaFicha = (f) => marcados.has(f.animal) || incluidos.some((i) => mesmaInclusao(i, f));

  function marcar(f) {
    if (marcados.has(f.animal)) { onToggle(f.animal); setMsg({ t: `${f.brinco} desmarcada.`, tom: 'late' }); return; }
    onToggle(f.animal); setMsg({ t: `${f.brinco} marcada.`, tom: 'good' }); setQ('');
  }
  function incluir(f) {
    if (incluidos.some((i) => mesmaInclusao(i, f))) { setMsg({ t: `${f.brinco} já está incluída.`, tom: 'late' }); return; }
    onIncluir(f);
    setMsg({ t: f.semCadastro ? `${f.brinco} incluída: ${f.obs}.` : `${f.brinco} incluída${f.obs ? `: ${f.obs}` : ''}.`, tom: f.semCadastro || f.obs ? 'late' : 'good' });
    setQ('');
  }
  function enter() {
    if (!b) return;
    if (fichas.length === 1) { const f = fichas[0]; if (f.naLista) { if (!marcados.has(f.animal)) marcar(f); else setMsg({ t: `${f.brinco} já está marcada.`, tom: 'good' }); } else incluir(f); return; }
    if (fichas.length > 1) { setMsg({ t: `Tem mais de um animal com o brinco ${b}. Toque no que é.`, tom: 'late' }); return; }
    incluir(fichaSemCadastro(b));
  }

  return (
    <div>
      <div className="contador" data-testid="contador">{n} de {itens.length} {rotuloContador || 'conferidos'}</div>
      <label className="search" style={{ marginTop: 8 }}>
        <Search />
        <input
          ref={entrada} inputMode={letras ? 'text' : 'numeric'} enterKeyHint="done" autoCapitalize="characters" autoComplete="off" placeholder="Digite o brinco do animal" aria-label="Brinco para conferir"
          value={q} onChange={(e) => { setQ(e.target.value); setMsg(null); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); enter(); } }}
        />
        <button type="button" className="tec-bt" aria-label={letras ? 'Usar teclado de números' : 'Usar teclado de letras'} data-testid="trocar-teclado"
          onClick={() => { setLetras(!letras); const el = entrada.current; if (el) { el.blur(); setTimeout(() => el.focus(), 60); } }}>{letras ? '123' : 'ABC'}</button>
      </label>
      {msg && <div className={`hint ${msg.tom}`} role="status" data-testid="msg-marcar" style={{ margin: '6px 2px', fontSize: 13.5 }}>{msg.t}</div>}

      {fichas.map((f) => (
        <Ficha key={f.chave} f={f} lote={lote} marcado={marcadoNaFicha(f)} incluido={incluidos.some((i) => mesmaInclusao(i, f))} onMarcar={marcar} onIncluir={incluir} />
      ))}
      {b && fichas.length === 0 && filtrados.length === 0 && (
        <div className="ficha-busca late" data-testid="ficha-sem-cadastro">
          <div className="fb-topo"><b className="b">{b}</b><span className="fb-tit"><AlertTriangle size={14} style={{ verticalAlign: -2 }} /> Brinco sem cadastro</span></div>
          <div className="fb-lin">Não está no banco de dados (matrizes, novilhas, crias e touros) nem em nenhum lote.</div>
          <button type="button" className="btn wide" onClick={() => incluir(fichaSemCadastro(b))} data-testid="incluir-sem-cadastro"><Plus size={17} /> Incluir {b} mesmo assim</button>
        </div>
      )}

      <div className="marcar" data-testid="lista-marcar" hidden={filtrados.length === 0 && !!b}>
        {filtrados.map((x) => {
          const on = marcados.has(x.id);
          return (
            <div key={x.id} className={`marca-lin${on ? ' on' : ''}`}>
              <button type="button" className="marca-bt" aria-pressed={on} aria-label={`${on ? 'Desmarcar' : 'Marcar'} ${x.brinco}`} onClick={() => onToggle(x.id)}>
                <span className="caixa">{on ? <Check size={18} /> : null}</span>
                <span className="b">{x.brinco}</span>
                <span className="two"><b>{x.linha1}</b><span className={x.nivel || 'mut'}>{x.linha2}</span></span>
              </button>
            </div>
          );
        })}
        {filtrados.length === 0 && !b && <div className="empty">Nenhum animal cadastrado neste lote ainda.</div>}
      </div>
    </div>
  );
}
