// "Lote por foto": o Claude lê a folha do manejo (foto) e devolve um bloco de texto; aqui o proprietário
// cola, confere o que vai acontecer com cada vaca e só então grava. Nada é gravado antes de confirmar.
import React, { useState } from 'react';
import { ClipboardPaste, Check, Loader2 } from 'lucide-react';
import { aplicarLote, formatarDataBR } from '../logica.js';
import { Aviso } from '../ui.jsx';
import { descreverEvento } from '../util.js';

// Aceita o bloco com ou sem ``` e tanto uma lista [...] quanto { "itens": [...] }
export function lerBlocoLote(texto) {
  let t = String(texto || '').trim();
  if (!t) return { erro: 'Cole o texto que o Claude devolveu.' };
  t = t.replace(/^```[a-zA-Z]*\s*/m, '').replace(/```\s*$/m, '').trim();
  let obj;
  try { obj = JSON.parse(t); } catch (e) { return { erro: 'Não consegui ler o texto colado. Cole o bloco inteiro, do primeiro [ até o último ].' }; }
  const itens = Array.isArray(obj) ? obj : obj && Array.isArray(obj.itens) ? obj.itens : null;
  if (!itens) return { erro: 'O texto colado não tem uma lista de lançamentos.' };
  if (itens.length === 0) return { erro: 'A lista está vazia.' };
  if (itens.length > 200) return { erro: 'Muitos lançamentos de uma vez (mais de 200). Divida em partes.' };
  if (itens.some((i) => !i || typeof i !== 'object' || !i.tipo)) return { erro: 'Algum item não tem o campo "tipo".' };
  return { itens };
}

function mudancas(aplicado, dados) {
  const partes = [];
  aplicado.matrizes.forEach((m) => {
    const antes = dados.matrizes.find((x) => x.id === m.id);
    if (!antes) { partes.push(`nova matriz ${m.brinco} (${m.status})`); return; }
    if (antes.status !== m.status) partes.push(`${m.brinco}: ${antes.status} → ${m.status}`);
    if (antes.categoria !== m.categoria) partes.push(`${m.brinco}: ${antes.categoria} → ${m.categoria}`);
  });
  return partes.join(' · ');
}

export default function LoteFoto({ dados, hoje, onGravarLote, modoTeste }) {
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');
  const [prev, setPrev] = useState(null);
  const [gravando, setGravando] = useState(false);
  const [feito, setFeito] = useState('');

  function conferir() {
    setFeito('');
    const r = lerBlocoLote(texto);
    if (r.erro) { setErro(r.erro); setPrev(null); return; }
    setErro('');
    setPrev(aplicarLote(dados, r.itens, { hoje }));
  }

  async function gravar() {
    if (!prev || prev.aplicados.length === 0) return;
    setGravando(true);
    const r = await onGravarLote(prev);
    setGravando(false);
    if (r.ok) { setFeito(r.msg); setPrev(null); setTexto(''); } else setErro(r.msg);
  }

  return (
    <div>
      <h2 className="h2" style={{ marginTop: 0 }}>Lote por foto</h2>
      <p className="sub">
        Tire a foto da folha do manejo e mande para o Claude no chat. Ele devolve um bloco de texto com os lançamentos.
        Cole aqui, confira o que vai mudar em cada vaca e só então grave.
      </p>
      <div className="fld">
        <label htmlFor="lote-texto">Bloco de lançamentos</label>
        <textarea id="lote-texto" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder='[ { "tipo": "nascimento", "matriz": "3012", "data": "10/10/26", "sexo": "F" } ]' spellCheck={false} />
      </div>
      <button className="btn wide quiet" onClick={conferir}><ClipboardPaste size={18} /> Conferir antes de gravar</button>

      {erro && <Aviso>{erro}</Aviso>}
      {feito && <Aviso tipo="ok">{feito}{modoTeste ? ' (modo teste: só na tela, nada foi para a planilha)' : ''}</Aviso>}

      {prev && (
        <div style={{ marginTop: 18 }}>
          <h2 className="h2">Conferência<small>{prev.aplicados.length} para gravar · {prev.rejeitados.length} com problema</small></h2>

          {prev.aplicados.length > 0 && (
            <div className="sheet" data-testid="lote-aplicados">
              {prev.aplicados.map((a) => (
                <div className="lote-item" key={a.indice} data-testid="lote-item">
                  <span className="n">{a.indice + 1}</span>
                  <div className="txt">
                    <b>{descreverEvento(a.eventos[0], prev.estado)}</b>
                    <span>{mudancas(a, dados) || 'sem mudança no cadastro da vaca'}</span>
                  </div>
                  <span className="m mut">{formatarDataBR(a.eventos[0].data)}</span>
                </div>
              ))}
            </div>
          )}

          {prev.avisos.length > 0 && (
            <Aviso tipo="info">
              <b>Atenção:</b>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                {prev.avisos.map((a, i) => <li key={i}>linha {a.indice + 1}: {a.aviso}</li>)}
              </ul>
            </Aviso>
          )}

          {prev.rejeitados.length > 0 && (
            <Aviso>
              <b>Não vão ser gravados:</b>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18 }} data-testid="lote-rejeitados">
                {prev.rejeitados.map((r, i) => <li key={i}>linha {r.indice + 1}: {r.motivo}</li>)}
              </ul>
            </Aviso>
          )}

          <button className="btn wide" disabled={gravando || prev.aplicados.length === 0} onClick={gravar} style={{ marginTop: 10 }}>
            {gravando ? <Loader2 size={18} className="spin" /> : <Check size={18} />}
            {gravando ? 'Gravando...' : `Gravar ${prev.aplicados.length} lançamento(s)`}
          </button>
        </div>
      )}
    </div>
  );
}
