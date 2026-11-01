// v11: Cadastros (só o proprietário). As listas que alimentam os campos do app: unidades, produtos, vacinas, causas de morte etc.
// O que já foi usado não é apagado, só desativado (some das opções, mas o histórico continua certo).
import React, { useState } from 'react';
import { Plus, X, RotateCcw } from 'lucide-react';
import { Aviso } from '../ui.jsx';
import { LISTAS_CADASTRO, itensCadastro, valoresUsados, cadastrosParaSalvar } from '../ficha.js';

function Lista({ def, dados, onSalvar }) {
  const itens = itensCadastro(dados, def.id, valoresUsados(dados, def.id));
  const [novo, setNovo] = useState('');
  const [aberto, setAberto] = useState(false);
  const ativos = itens.filter((x) => x.ativo); const inativos = itens.filter((x) => !x.ativo);
  function salvar(lista) { return onSalvar(cadastrosParaSalvar(dados, def.id, lista)); }
  function adicionar() {
    const v = novo.trim(); if (!v) return;
    const ja = itens.find((x) => x.v.toLowerCase() === v.toLowerCase());
    salvar(ja ? itens.map((x) => (x === ja ? { ...x, ativo: true } : x)) : [...itens, { v, ativo: true, salvo: true }]);
    setNovo('');
  }
  const alternar = (it) => salvar(itens.map((x) => (x === it ? { ...x, ativo: !x.ativo } : x)));
  return (
    <section className="fx-card fx-cad" data-testid={`cad-${def.id}`}>
      <h3>{def.titulo}<span>{ativos.length}</span></h3>
      <p>{def.desc}</p>
      <div className="vals">
        {ativos.map((x) => (
          <span className="v" key={x.v}>{x.v}<button aria-label={`Desativar ${x.v}`} title="Desativar (some das opções)" onClick={() => alternar(x)}><X size={13} /></button></span>
        ))}
        {!aberto ? <button className="v add" onClick={() => setAberto(true)}><Plus size={13} /> adicionar</button> : (
          <span className="v add" style={{ padding: '0 4px 0 10px' }}>
            <input autoFocus value={novo} onChange={(e) => setNovo(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') adicionar(); if (e.key === 'Escape') setAberto(false); }} placeholder="Novo item" aria-label={`Novo item em ${def.titulo}`} />
            <button onClick={adicionar} aria-label="Adicionar"><Plus size={14} /></button>
          </span>
        )}
      </div>
      {inativos.length > 0 && (
        <div className="vals" style={{ marginTop: 8 }}>
          <small className="mut" style={{ width: '100%' }}>Desativados (não aparecem nas opções):</small>
          {inativos.map((x) => <span className="v off" key={x.v}>{x.v}<button aria-label={`Reativar ${x.v}`} title="Reativar" onClick={() => alternar(x)}><RotateCcw size={12} /></button></span>)}
        </div>
      )}
    </section>
  );
}

export default function Cadastros({ dados, onSalvarCadastros, scriptAntigo }) {
  const [msg, setMsg] = useState(null);
  function salvar(json) {
    const r = onSalvarCadastros(json);
    setMsg(r ? { tipo: 'erro', t: r } : null);
  }
  return (
    <div className="wrap">
      <div className="head"><div><small>Só o proprietário</small><h1>Cadastros</h1></div></div>
      <p className="sub" style={{ marginTop: -6 }}>As listas que aparecem nos campos do app. Toque no × para desativar um item (ele some das opções, mas o que já foi lançado continua igual). Os itens já usados nos lançamentos aparecem aqui sozinhos.</p>
      {scriptAntigo && <Aviso>Para gravar os cadastros a planilha precisa do script 15. Implante a versão nova do script (fonte/Code_v15.gs). Enquanto isso as mudanças ficam só na tela.</Aviso>}
      {msg && <Aviso onClose={() => setMsg(null)}>{msg.t}</Aviso>}
      {LISTAS_CADASTRO.map((d) => <Lista key={d.id} def={d} dados={dados} onSalvar={salvar} />)}
    </div>
  );
}
