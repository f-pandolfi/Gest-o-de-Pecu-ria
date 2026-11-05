// v11.4: na ficha de qualquer animal, o dono já vê os campos do cadastro abertos para corrigir na hora
// (matriz, cria/nascimento, touro e boi), inclusive animal vendido ou morto. Funcionário só vê a ficha.
// Grava pelos mesmos caminhos de antes: matriz (upsertMatriz), nascimento (correção de nascimento), touro/boi (upsertTouros).
import React, { useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { CAMPOS_EDICAO_MATRIZ, padronizarLote } from '../logica.js';
import { useFicha } from './Ficha.jsx';

const opcoes = (k) => (CAMPOS_EDICAO_MATRIZ.find((c) => c.key === k) || {}).options || [];
const s = (v) => String(v ?? '').trim();

function Campo({ id, rot, valor, onChange, tipo = 'text', lista, opc, extra }) {
  return (
    <div className="fld">
      <label htmlFor={`ed-${id}`}>{rot}</label>
      {opc ? (
        <select id={`ed-${id}`} value={valor ?? ''} onChange={(e) => onChange(e.target.value)}>{opc.map((o) => <option key={o} value={o}>{o || '(em branco)'}</option>)}</select>
      ) : (
        <input id={`ed-${id}`} type={tipo} value={valor ?? ''} list={lista} inputMode={tipo === 'number' ? 'numeric' : undefined} onChange={(e) => onChange(e.target.value)} {...extra} />
      )}
    </div>
  );
}

export default function EditorCadastro({ k }) {
  const { ix, ownerMode, salvarMatriz, corrigirNascimento, salvarTouro } = useFicha();
  const tipo = k[0]; const id = k.slice(2);
  const orig = useMemo(() => {
    if (!ix) return null;
    if (tipo === 'm') return ix.matPorId.get(id) || null;
    if (tipo === 'c') { const c = ix.criaPorId.get(id); return c ? c.nasc : null; }
    return (ix.dados.touros || []).find((t) => t.id === id) || null;
  }, [ix, tipo, id]);
  const [f, setF] = useState(() => ({ ...(orig || {}), maeBrinco: tipo === 'c' && orig && orig.matrizId ? s((ix.matPorId.get(orig.matrizId) || {}).brinco) : '' }));
  const [msg, setMsg] = useState(null);
  const [gravando, setGravando] = useState(false);
  const listas = useMemo(() => {
    if (!ix) return { lotes: [], racas: [], maes: [] };
    const d = ix.dados;
    return {
      lotes: [...new Set(d.matrizes.map((m) => m.lote).concat((d.touros || []).map((t) => t.lote)).filter(Boolean))].sort(),
      racas: [...new Set(d.matrizes.map((m) => m.raca).filter(Boolean))].sort(),
      maes: d.matrizes.map((m) => s(m.brinco)).filter(Boolean),
    };
  }, [ix]);
  if (!ownerMode || !orig || (!salvarMatriz && !corrigirNascimento && !salvarTouro)) return null;
  const set = (campo) => (v) => { setF((x) => ({ ...x, [campo]: v })); setMsg(null); };

  // campos de cada tipo: [campo, rótulo, tipo, lista/opções]
  let campos;
  if (tipo === 'm') {
    campos = [['brinco', 'Brinco'], ['categoria', 'Categoria', null, opcoes('categoria')], ['raca', 'Raça', 'text', 'ed-racas'], ['lote', 'Lote', 'text', 'ed-lotes'],
      ['dataNascimento', 'Nascimento', 'date'], ['partosAnteriores', 'Partos antes da fazenda', 'number'], ['status', 'Status', null, opcoes('status')]];
    if (f.status === 'Vendida' || f.status === 'Morta') campos.push(['dataBaixa', f.status === 'Morta' ? 'Data da morte' : 'Data da venda', 'date'], ['motivoBaixa', 'Motivo / causa']);
  } else if (tipo === 'c') {
    campos = [['brincoBezerro', 'Brinco da cria'], ['sexo', 'Sexo', null, ['Macho', 'Fêmea']], ['data', 'Nascimento', 'date'], ['maeBrinco', 'Brinco da mãe', 'text', 'ed-maes'],
      ['resultadoParto', 'Resultado do parto', null, ['Vivo', 'Natimorto']], ['pelagem', 'Pelagem'], ['tipoParto', 'Tipo de parto', null, ['', 'Normal', 'Distócico (com dificuldade)']], ['observacoes', 'Observações']];
  } else {
    campos = [['nome', 'Nome'], ['brinco', 'Brinco'], ['raca', 'Raça', 'text', 'ed-racas'], ['lote', 'Lote', 'text', 'ed-lotes'], ['dataNascimento', 'Nascimento', 'date'],
      ['situacao', 'Situação', null, ['', 'Vendido', 'Morto']], ['dataSaida', 'Data de saída', 'date']];
  }
  const mudou = campos.some(([c]) => s(f[c]) !== s(c === 'maeBrinco' ? (orig.matrizId ? (ix.matPorId.get(orig.matrizId) || {}).brinco : '') : orig[c]));

  async function salvar() {
    setGravando(true);
    try {
      if (tipo === 'm') {
        if (!s(f.brinco)) { setMsg({ erro: true, t: 'O brinco não pode ficar vazio.' }); return; }
        const outra = ix.dados.matrizes.find((m) => m.id !== orig.id && s(m.brinco) === s(f.brinco) && m.status !== 'Vendida' && m.status !== 'Morta');
        if (outra && f.status !== 'Vendida' && f.status !== 'Morta') { setMsg({ erro: true, t: `Já existe outra matriz ativa com o brinco ${s(f.brinco)}.` }); return; }
        const ativa = f.status !== 'Vendida' && f.status !== 'Morta';
        const m = {
          ...orig, brinco: /^\d+$/.test(s(f.brinco)) ? Number(s(f.brinco)) : s(f.brinco), categoria: f.categoria, raca: s(f.raca), lote: padronizarLote(s(f.lote), ix.dados.matrizes.filter((x) => x.id !== orig.id)),
          dataNascimento: s(f.dataNascimento), partosAnteriores: parseInt(f.partosAnteriores, 10) || 0, status: f.status,
          dataBaixa: ativa ? '' : s(f.dataBaixa), motivoBaixa: ativa ? '' : s(f.motivoBaixa),
        };
        salvarMatriz(m);
        setMsg({ t: `Cadastro da ${m.brinco} salvo.${ativa && (orig.status === 'Vendida' || orig.status === 'Morta') ? ' Voltou para o rebanho.' : ''}` });
      } else if (tipo === 'c') {
        const campos2 = {};
        ['brincoBezerro', 'sexo', 'data', 'resultadoParto', 'pelagem', 'tipoParto', 'observacoes'].forEach((c) => { if (s(f[c]) !== s(orig[c])) campos2[c] = f[c]; });
        const maeAntes = orig.matrizId ? s((ix.matPorId.get(orig.matrizId) || {}).brinco) : '';
        if (s(f.maeBrinco) !== maeAntes) {
          const mae = ix.dados.matrizes.filter((m) => s(m.brinco) === s(f.maeBrinco));
          if (!mae.length) { setMsg({ erro: true, t: `A mãe ${s(f.maeBrinco)} não está no cadastro. Cadastre a vaca primeiro.` }); return; }
          campos2.matrizId = (mae.find((m) => m.status !== 'Vendida' && m.status !== 'Morta') || mae[0]).id;
        }
        const r = await corrigirNascimento(orig.id, campos2);
        setMsg({ erro: !r.ok, t: r.msg });
      } else {
        const t = { ...orig, nome: s(f.nome) || orig.nome, brinco: s(f.brinco), raca: s(f.raca), lote: s(f.lote), dataNascimento: s(f.dataNascimento), situacao: f.situacao || '', dataSaida: s(f.dataSaida) };
        const e = salvarTouro(t);
        setMsg(e ? { erro: true, t: e } : { t: `${t.nome} salvo.` });
      }
    } finally { setGravando(false); }
  }

  return (
    <section className="fx-card full ed-card" data-testid="editor-cadastro" style={{ marginBottom: 12 }}>
      <h3>Cadastro · corrigir aqui</h3>
      <div className="ed-grid">
        {campos.map(([c, rot, tp, l]) => <Campo key={c} id={c} rot={rot} valor={f[c]} onChange={set(c)} tipo={tp || 'text'} lista={Array.isArray(l) ? undefined : l} opc={Array.isArray(l) ? l : undefined} />)}
      </div>
      <datalist id="ed-lotes">{listas.lotes.map((x) => <option key={x} value={x} />)}</datalist>
      <datalist id="ed-racas">{listas.racas.map((x) => <option key={x} value={x} />)}</datalist>
      <datalist id="ed-maes">{listas.maes.slice(0, 400).map((x) => <option key={x} value={x} />)}</datalist>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
        <button className="btn sm" disabled={!mudou || gravando} onClick={salvar} data-testid="editor-salvar"><Save size={16} /> Salvar alterações</button>
        {mudou && <button className="btn sm quiet" onClick={() => { setF({ ...orig, maeBrinco: tipo === 'c' && orig.matrizId ? s((ix.matPorId.get(orig.matrizId) || {}).brinco) : '' }); setMsg(null); }}>Desfazer</button>}
        {msg && <span className="sub" style={{ margin: 0, color: msg.erro ? 'var(--late)' : 'var(--green)' }} data-testid="editor-msg">{msg.t}</span>}
      </div>
    </section>
  );
}
