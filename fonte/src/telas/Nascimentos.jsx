// Correção de nascimentos já lançados (só proprietário, com a senha): lista com busca e janela de edição.
import React, { useMemo, useState } from 'react';
import { Search, Save, Loader2 } from 'lucide-react';
import { CAMPOS, formatarDataBR, mapaBrincos } from '../logica.js';
import { Aviso, Campo, Modal } from '../ui.jsx';

const CHAVES_EDICAO = ['matrizId', 'data', 'resultadoParto', 'sexo', 'brincoBezerro', 'pelagem', 'tipoParto', 'observacoes'];

export const faltaNoNascimento = (e) => [!e.matrizId && 'mãe', !e.sexo && 'sexo', !String(e.brincoBezerro ?? '').trim() && 'brinco'].filter(Boolean);

export function ModalNascimento({ nasc, dados, onEditar, onFechar, onFeito }) {
  const [form, setForm] = useState(() => Object.fromEntries(CHAVES_EDICAO.map((k) => [k, nasc[k] ?? ''])));
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);
  const mudar = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErro(''); };

  async function salvar() {
    if (gravando) return;
    setGravando(true);
    const r = await onEditar(nasc.id, form);
    setGravando(false);
    if (!r.ok) { setErro(r.msg); return; }
    onFeito(r.msg); onFechar();
  }

  const titulo = `Nascimento ${nasc.brincoBezerro ? `da cria ${nasc.brincoBezerro}` : 'sem número'}`;
  return (
    <Modal titulo={titulo} onClose={onFechar} rotulo="Corrigir nascimento">
      <p className="sub" style={{ marginTop: 0 }}>Lançado em {nasc.createdAt ? formatarDataBR(String(nasc.createdAt).slice(0, 10)) : '—'}. Mãe, sexo e brinco não podem ser apagados, só trocados. Mudar o brinco leva junto as pesagens, a desmama e a novilha dessa cria.</p>
      <div className="grid2">
        {CAMPOS.nascimento.filter((c) => CHAVES_EDICAO.includes(c.key)).map((c) => (
          <div key={c.key} style={c.type === 'matriz' || c.key === 'observacoes' ? { gridColumn: '1 / -1' } : undefined}>
            <Campo campo={c} value={form[c.key]} onChange={mudar} matrizes={dados.matrizes} touros={dados.touros} />
          </div>
        ))}
      </div>
      {erro && <Aviso>{erro}</Aviso>}
      <button className="btn wide" onClick={salvar} disabled={gravando}>{gravando ? <Loader2 size={17} className="spin" /> : <Save size={17} />} Salvar correção</button>
    </Modal>
  );
}

export function ListaNascimentos({ dados, onEditar }) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [aberto, setAberto] = useState(null);
  const [aviso, setAviso] = useState('');
  const brincos = useMemo(() => mapaBrincos(dados.matrizes), [dados.matrizes]);
  const todos = useMemo(
    () => dados.eventos.filter((e) => e.tipo === 'nascimento')
      .sort((a, b) => (b.data || '').localeCompare(a.data || '') || (b.createdAt || '').localeCompare(a.createdAt || '')),
    [dados.eventos],
  );
  const faltando = todos.filter((e) => faltaNoNascimento(e).length > 0);
  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return (filtro === 'faltando' ? faltando : todos)
      .filter((e) => !q || String(e.brincoBezerro).toLowerCase().includes(q) || String(brincos[e.matrizId] || '').toLowerCase().includes(q));
  }, [todos, faltando, filtro, busca, brincos]);
  const mostradas = lista.slice(0, 40);
  const nasc = aberto ? todos.find((e) => e.id === aberto) : null;

  return (
    <>
      <h2 className="h2">Nascimentos lançados<small>{todos.length} no total · toque para corrigir</small></h2>
      {aviso && <Aviso tipo="ok" onClose={() => setAviso('')}>{aviso}</Aviso>}
      <div className="sheet">
        <label className="search">
          <Search />
          <input placeholder="Buscar pelo brinco da cria ou da mãe" aria-label="Buscar nascimento" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
        <div className="filtros">
          <div className="seg" role="group" aria-label="Filtrar nascimentos">
            <button aria-pressed={filtro === 'todos'} onClick={() => setFiltro('todos')}>Todos {todos.length}</button>
            <button aria-pressed={filtro === 'faltando'} onClick={() => setFiltro('faltando')}>Faltando dados {faltando.length}</button>
          </div>
        </div>
        {mostradas.length === 0 && <div className="empty">{filtro === 'faltando' ? 'Nenhum nascimento com dado faltando.' : 'Nenhum nascimento encontrado.'}</div>}
        {mostradas.map((e) => {
          const falta = faltaNoNascimento(e);
          return (
            <button key={e.id} className="led-r" style={{ '--cols': 'minmax(0,1fr) auto', minHeight: 56 }} onClick={() => setAberto(e.id)} aria-label={`Corrigir nascimento ${e.brincoBezerro || 'sem número'}`}>
              <span className="two" style={{ minWidth: 0 }}>
                <b>{e.brincoBezerro ? `Cria ${e.brincoBezerro}` : 'Cria sem número'} · {e.sexo || 'sexo ?'}{e.resultadoParto === 'Natimorto' ? ' · natimorto' : ''}</b>
                <span>mãe {brincos[e.matrizId] || '?'}{falta.length ? ` · falta: ${falta.join(', ')}` : ''}</span>
              </span>
              <span className="m mut">{formatarDataBR(e.data)}</span>
            </button>
          );
        })}
        {lista.length > mostradas.length && <div className="empty" style={{ fontSize: 13 }}>Mostrando os {mostradas.length} mais recentes de {lista.length}. Use a busca para achar os outros.</div>}
      </div>
      {nasc && <ModalNascimento key={nasc.id} nasc={nasc} dados={dados} onEditar={onEditar} onFechar={() => setAberto(null)} onFeito={setAviso} />}
    </>
  );
}
