// Crias > Pesar: pesagem em lote. Escolhe a data, digita brinco e peso de cada animal e grava tudo de uma vez.
// No modo "Pesar e desmamar" (proprietário) o mesmo peso vira o peso da desmama e as fêmeas vão para as novilhas.
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Plus, Trash2, Save, Loader2, ClipboardPaste } from 'lucide-react';
import { infoAnimalVenda, numPeso, avisoDePeso, lerListaPesos, aplicarLote, formatarDataBR } from '../logica.js';
import { Aviso } from '../ui.jsx';
import { fmtKg } from '../util.js';

const mesmo = (a, b) => String(a).trim() === String(b).trim() || (/^\d+$/.test(String(a).trim()) && /^\d+$/.test(String(b).trim()) && Number(a) === Number(b));

export default function Pesar({ dados, hoje, crias, ownerMode, modoTeste, onGravarLote }) {
  const [data, setData] = useState(hoje);
  const [modo, setModo] = useState('pesagem');
  const [brinco, setBrinco] = useState('');
  const [pesoTxt, setPesoTxt] = useState('');
  const [linhas, setLinhas] = useState([]);
  const [erro, setErro] = useState(null); // { texto, itens? }
  const [resultado, setResultado] = useState(null);
  const [gravando, setGravando] = useState(false);
  const [travado, setTravado] = useState(false);
  const [colar, setColar] = useState('');
  const brincoRef = useRef(null);
  const pesoRef = useRef(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const infoDigitado = useMemo(() => (brinco.trim() ? infoAnimalVenda(dados, brinco, hoje, crias) : null), [brinco, dados, hoje, crias]);

  // valida e prepara uma linha; devolve { linha } ou { erro }
  function preparar(b, p, jaNaLista) {
    const brincoTxt = String(b).trim();
    if (!brincoTxt) return { erro: 'Digite o brinco do animal.' };
    if (isNaN(p) || p <= 0) return { erro: `Digite o peso de ${brincoTxt}.` };
    const info = infoAnimalVenda(dados, brincoTxt, hoje, crias);
    if (!info.achado) return { erro: `Não achei o brinco ${brincoTxt}. Confira o número (cria ou novilha).` };
    if (info.jaMorto) return { erro: `O animal ${brincoTxt} morreu${info.mortoEm ? ` em ${formatarDataBR(info.mortoEm)}` : ''}.` };
    if (info.jaVendido) return { erro: `O animal ${brincoTxt} já foi vendido${info.vendidoEm ? ` em ${formatarDataBR(info.vendidoEm)}` : ''}.` };
    if (jaNaLista.some((l) => mesmo(l.brinco, brincoTxt))) return { erro: `O brinco ${brincoTxt} já está na lista.` };
    return { linha: { k: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, brinco: info.brinco, peso: p, info } };
  }

  function adicionar() {
    const r = preparar(brinco, numPeso(pesoTxt), linhas);
    if (r.erro) { setErro({ texto: r.erro }); return; }
    setErro(null); setResultado(null);
    setLinhas((ls) => [...ls, r.linha]);
    setBrinco(''); setPesoTxt('');
    if (brincoRef.current) brincoRef.current.focus();
  }

  function adicionarColado() {
    const { itens, erros } = lerListaPesos(colar);
    const novas = []; const sobras = [...erros];
    const problemas = erros.map((t) => `Não entendi a linha "${t}". Use o brinco e o peso, por exemplo: 6532 245`);
    itens.forEach((it) => {
      const r = preparar(it.brinco, it.peso, [...linhas, ...novas]);
      if (r.erro) { problemas.push(r.erro); sobras.push(`${it.brinco} ${it.peso}`); } else novas.push(r.linha);
    });
    if (novas.length) setLinhas((ls) => [...ls, ...novas]);
    setResultado(null);
    setErro(problemas.length ? { texto: `${novas.length} animal(is) adicionado(s). Não entraram:`, itens: problemas } : null);
    setColar(sobras.join('\n')); // fica só o que não entrou, para corrigir e tentar de novo
  }

  async function gravar() {
    if (gravando || travado || linhas.length === 0) return;
    if (!data) { setErro({ texto: 'Escolha a data da pesagem.' }); return; }
    const itens = linhas.map((l) => ({ tipo: modo, brincoCria: l.brinco, data, peso: l.peso }));
    const res = aplicarLote(dados, itens, { hoje });
    if (res.aplicados.length === 0) {
      setErro({ texto: 'Nada foi gravado:', itens: res.rejeitados.map((r) => `${itens[r.indice].brincoCria}: ${r.motivo}`) });
      return;
    }
    setGravando(true); setErro(null);
    const r = await onGravarLote(res);
    setGravando(false);
    if (!r.ok) { setErro({ texto: r.msg }); return; }
    const okIdx = new Set(res.aplicados.map((a) => a.indice));
    setLinhas((ls) => ls.filter((_, i) => !okIdx.has(i)));
    setResultado({
      qtd: res.aplicados.length, novilhas: res.matrizesParaGravar.length, modo,
      rejeitados: res.rejeitados.map((x) => `${itens[x.indice].brincoCria}: ${x.motivo}`),
    });
    setTravado(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setTravado(false), 1500);
  }

  const total = linhas.reduce((s, l) => s + l.peso, 0);

  return (
    <section className="sheet pad">
      <h2 className="h2" style={{ marginTop: 0 }}>Pesar</h2>
      <p className="sub">Escolha a data, digite o brinco e o peso de cada animal e grave tudo de uma vez. Serve para crias e para novilhas.</p>

      <div className="grid2">
        <div className="fld">
          <label htmlFor="pesar-data">Data da pesagem</label>
          <input id="pesar-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        {ownerMode && (
          <div className="fld" role="group" aria-label="Tipo de pesagem">
            <span className="lbl" style={{ display: 'block', font: '600 11.5px var(--mono)', letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--mut)', marginBottom: 6 }}>O que é esta pesagem</span>
            <div className="seg">
              <button type="button" aria-pressed={modo === 'pesagem'} onClick={() => { setModo('pesagem'); setResultado(null); }}>Só pesar</button>
              <button type="button" aria-pressed={modo === 'desmama'} onClick={() => { setModo('desmama'); setResultado(null); }}>Desmama</button>
            </div>
          </div>
        )}
      </div>
      {modo === 'desmama' && <Aviso tipo="info">Modo desmama: cada peso vira o peso da desmama. As fêmeas passam para o lote de novilhas (destino "a definir").</Aviso>}

      <div className="linha-add">
        <div className="fld">
          <label htmlFor="pesar-brinco">Brinco</label>
          <input
            id="pesar-brinco" ref={brincoRef} type="text" inputMode="numeric" autoComplete="off" value={brinco}
            onChange={(e) => { setBrinco(e.target.value); setErro(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (pesoRef.current) pesoRef.current.focus(); } }}
          />
        </div>
        <div className="fld">
          <label htmlFor="pesar-peso">Peso (kg)</label>
          <input
            id="pesar-peso" ref={pesoRef} type="text" inputMode="decimal" autoComplete="off" value={pesoTxt}
            onChange={(e) => { setPesoTxt(e.target.value); setErro(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionar(); } }}
          />
        </div>
        <button className="btn" onClick={adicionar} aria-label="Adicionar à lista"><Plus size={20} /></button>
      </div>
      <div className="hint" style={{ minHeight: 22, margin: '6px 2px 10px', fontSize: 13, color: infoDigitado && (!infoDigitado.achado || infoDigitado.jaVendido || infoDigitado.jaMorto) && brinco.trim().length >= 3 ? 'var(--late)' : 'var(--mut)' }} data-testid="info-brinco">
        {infoDigitado && infoDigitado.achado && infoDigitado.jaMorto && `Este animal morreu${infoDigitado.mortoEm ? ` em ${formatarDataBR(infoDigitado.mortoEm)}` : ''}. Não dá para pesar.`}
        {infoDigitado && infoDigitado.achado && !infoDigitado.jaMorto && !infoDigitado.jaVendido && `${infoDigitado.descricao}${infoDigitado.pesoUltimo ? ` · último peso ${fmtKg(infoDigitado.pesoUltimo)} em ${formatarDataBR(infoDigitado.pesoData)}` : ' · ainda sem pesagem'}`}
        {infoDigitado && infoDigitado.achado && !infoDigitado.jaMorto && infoDigitado.jaVendido && 'Este animal já foi vendido.'}
        {infoDigitado && !infoDigitado.achado && brinco.trim().length >= 3 && 'Brinco não encontrado (cria ou novilha).'}
      </div>

      {erro && (
        <Aviso>
          {erro.texto}
          {erro.itens && <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>{erro.itens.map((t, i) => <li key={i}>{t}</li>)}</ul>}
        </Aviso>
      )}

      <h3 className="h2" style={{ fontSize: 18 }}>Na lista<small>{linhas.length} animal(is){linhas.length ? ` · ${fmtKg(total)} no total` : ''}</small></h3>
      {linhas.length === 0 ? <p className="sub">Nenhum animal na lista ainda.</p> : (
        <div data-testid="lista-pesar">
          {linhas.map((l) => {
            const aviso = avisoDePeso(l.info.pontos, l.peso, data);
            const dif = l.info.pesoUltimo ? l.peso - l.info.pesoUltimo : null;
            return (
              <div className="item-lin" key={l.k}>
                <div className="t">
                  <b>{l.brinco}</b>
                  <span>{l.info.descricao}{dif !== null ? ` · ${dif >= 0 ? '+' : ''}${fmtKg(dif)} desde ${formatarDataBR(l.info.pesoData)}` : ''}</span>
                  {aviso && <span style={{ color: 'var(--amber)' }}>{aviso}</span>}
                </div>
                <div className="p">{fmtKg(l.peso)}</div>
                <button className="x-peq" onClick={() => setLinhas((ls) => ls.filter((x) => x.k !== l.k))} aria-label={`Tirar ${l.brinco} da lista`}><Trash2 size={17} /></button>
              </div>
            );
          })}
        </div>
      )}

      <button className="btn wide" style={{ marginTop: 12 }} onClick={gravar} disabled={gravando || travado || linhas.length === 0}>
        {gravando ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
        {gravando ? 'Gravando...' : modo === 'desmama' ? `Gravar ${linhas.length} desmama(s)` : `Gravar ${linhas.length} pesagem(ns)`}
      </button>

      {resultado && (
        <Aviso tipo="ok">
          {resultado.modo === 'desmama' ? `${resultado.qtd} desmama(s) gravada(s)` : `${resultado.qtd} pesagem(ns) gravada(s)`}
          {resultado.novilhas > 0 ? `; ${resultado.novilhas} novilha(s) entraram no lote de novilhas` : ''}.
          {modoTeste ? ' (modo teste: só na tela, nada foi para a planilha)' : ''}
          {resultado.rejeitados.length > 0 && (
            <>
              <div style={{ marginTop: 6 }}>Não gravadas (continuam na lista):</div>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{resultado.rejeitados.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </>
          )}
        </Aviso>
      )}

      <details className="ferr noprint">
        <summary><ClipboardPaste size={15} style={{ marginRight: 8 }} /> Colar uma lista pronta</summary>
        <div className="in2" style={{ display: 'block' }}>
          <p className="sub">Um animal por linha: o brinco e o peso (ex.: 6532 245). Depois toque em adicionar e confira a lista antes de gravar.</p>
          <div className="fld"><label htmlFor="pesar-colar">Lista</label><textarea id="pesar-colar" style={{ minHeight: 120 }} value={colar} onChange={(e) => setColar(e.target.value)} placeholder={'6532 245\n6533 250,5'} spellCheck={false} /></div>
          <button className="btn quiet" onClick={adicionarColado} disabled={!colar.trim()}>Adicionar à lista</button>
        </div>
      </details>
    </section>
  );
}
