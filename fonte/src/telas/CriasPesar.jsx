// Crias > Pesar: pesagem em lote. Escolhe a data, digita brinco e peso de cada animal e grava tudo de uma vez.
// No modo "Pesar e desmamar" (proprietário) o mesmo peso vira o peso da desmama e as fêmeas vão para as novilhas.
// v9.5: a lista fica guardada no celular enquanto se digita; aviso de animal já pesado na mesma data (lança marcando 2x);
// cartão com idade, nascimento e mãe; PDF da pesagem do dia.
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Plus, Trash2, Save, Loader2, ClipboardPaste, FileDown } from 'lucide-react';
import {
  infoAnimalVenda, numPeso, avisoDePeso, lerListaPesos, aplicarLote, formatarDataBR, fichaAnimal, relatorioPesagemDia,
} from '../logica.js';
import { Aviso } from '../ui.jsx';
import { fmtKg } from '../util.js';
import FichaRapida from './FichaRapida.jsx';
import { lerLocal, gravarNoCelular, apagarLocal, CHAVE_RASCUNHO_PESAR } from '../fila.js';
import { baixarPDF } from '../pdfloader.js';

const mesmo = (a, b) => String(a).trim() === String(b).trim() || (/^\d+$/.test(String(a).trim()) && /^\d+$/.test(String(b).trim()) && Number(a) === Number(b));

const lerRascunho = () => {
  const r = lerLocal(CHAVE_RASCUNHO_PESAR, null);
  return r && Array.isArray(r.linhas) ? r : null;
};

export default function Pesar({ dados, hoje, crias, ownerMode, modoTeste, onGravarLote }) {
  const rascunho0 = useRef(lerRascunho());
  const [data, setData] = useState(() => (rascunho0.current && rascunho0.current.linhas.length && rascunho0.current.data) || hoje);
  const [modo, setModo] = useState(() => (rascunho0.current && rascunho0.current.linhas.length && ownerMode && rascunho0.current.modo) || 'pesagem');
  const [brinco, setBrinco] = useState('');
  const [pesoTxt, setPesoTxt] = useState('');
  const [linhas, setLinhas] = useState(() => (rascunho0.current ? rascunho0.current.linhas.map((l) => ({ ...l, info: null })) : []));
  const [confDup, setConfDup] = useState(null); // { linha, mesmaData } esperando "Lançar mesmo assim"
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [erro, setErro] = useState(null); // { texto, itens? }
  const [resultado, setResultado] = useState(null);
  const [gravando, setGravando] = useState(false);
  const [travado, setTravado] = useState(false);
  const [colar, setColar] = useState('');
  const brincoRef = useRef(null);
  const pesoRef = useRef(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  // a lista não se perde se o celular travar ou o app fechar no meio da pesagem
  useEffect(() => {
    if (linhas.length) gravarNoCelular(CHAVE_RASCUNHO_PESAR, { data, modo, linhas: linhas.map(({ info, ...l }) => l), guardadoEm: new Date().toISOString() });
    else apagarLocal(CHAVE_RASCUNHO_PESAR);
  }, [linhas, data, modo]);

  // informações de cada linha (refeitas quando os dados ou a data mudam; a lista guardada no celular volta sem elas)
  const infos = useMemo(() => {
    const mapa = new Map();
    linhas.forEach((l) => mapa.set(l.k, fichaAnimal(dados, l.brinco, data || hoje, crias)));
    return mapa;
  }, [linhas, dados, data, hoje, crias]);

  const infoDigitado = useMemo(() => (brinco.trim() ? fichaAnimal(dados, brinco, data || hoje, crias) : null), [brinco, dados, data, hoje, crias]);
  const doDia = useMemo(() => (data ? relatorioPesagemDia(dados, data, hoje) : null), [dados, data, hoje]);

  // valida e prepara uma linha; devolve { linha } ou { erro }
  function preparar(b, p, jaNaLista) {
    const brincoTxt = String(b).trim();
    if (!brincoTxt) return { erro: 'Digite o brinco do animal.' };
    if (isNaN(p) || p <= 0) return { erro: `Digite o peso de ${brincoTxt}.` };
    const info = infoAnimalVenda(dados, brincoTxt, hoje, crias);
    if (!info.achado) return { erro: `Não achei o brinco ${brincoTxt}. Confira o número (cria ou novilha).` };
    if (info.jaMorto) return { erro: `O animal ${brincoTxt} morreu${info.mortoEm ? ` em ${formatarDataBR(info.mortoEm)}` : ''}.` };
    if (info.jaVendido) return { erro: `O animal ${brincoTxt} já foi vendido${info.vendidoEm ? ` em ${formatarDataBR(info.vendidoEm)}` : ''}.` };
    const naLista = jaNaLista.find((l) => mesmo(l.brinco, brincoTxt));
    if (naLista) return { erro: `O brinco ${brincoTxt} já está na lista com ${fmtKg(naLista.peso)}. Verifique a duplicidade.` };
    const linha = { k: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, brinco: info.brinco, peso: p };
    if (modo === 'pesagem' && data) {
      const f = fichaAnimal(dados, info.brinco, data, crias);
      if (f.mesmaData.length) return { linha, mesmaData: f.mesmaData };
    }
    return { linha };
  }

  function limparDigitacao() {
    setBrinco(''); setPesoTxt('');
    if (brincoRef.current) brincoRef.current.focus();
  }

  function adicionar() {
    const r = preparar(brinco, numPeso(pesoTxt), linhas);
    if (r.erro) { setErro({ texto: r.erro }); return; }
    setErro(null); setResultado(null);
    if (r.mesmaData) { setConfDup({ linha: r.linha, mesmaData: r.mesmaData }); return; }
    setLinhas((ls) => [...ls, r.linha]);
    limparDigitacao();
  }

  function confirmarDup(sim) {
    if (sim && confDup) setLinhas((ls) => [...ls, { ...confDup.linha, forcar: true }]);
    setConfDup(null);
    limparDigitacao();
  }

  async function pdfDoDia() {
    if (!doDia || gerandoPdf) return;
    setGerandoPdf(true);
    try {
      await baixarPDF(doDia, { arquivo: `pesagem-${data}.pdf` });
    } catch (e) {
      console.error('Erro ao gerar PDF', e);
      setErro({ texto: 'Não consegui gerar o PDF agora. Abra o app uma vez com internet (para guardar o gerador de PDF no celular) e tente de novo.' });
    }
    setGerandoPdf(false);
  }

  function adicionarColado() {
    const { itens, erros } = lerListaPesos(colar);
    const novas = []; const sobras = [...erros];
    const problemas = erros.map((t) => `Não entendi a linha "${t}". Use o brinco e o peso, por exemplo: 6532 245`);
    itens.forEach((it) => {
      const r = preparar(it.brinco, it.peso, [...linhas, ...novas]);
      if (r.erro) { problemas.push(r.erro); sobras.push(`${it.brinco} ${it.peso}`); return; }
      if (r.mesmaData) {
        problemas.push(`${it.brinco} já foi pesado em ${formatarDataBR(data)} com ${r.mesmaData.map((x) => fmtKg(x.peso)).join(' e ')}. Verifique a duplicidade (para lançar mesmo assim, digite ele na linha de cima).`);
        sobras.push(`${it.brinco} ${it.peso}`); return;
      }
      novas.push(r.linha);
    });
    if (novas.length) setLinhas((ls) => [...ls, ...novas]);
    setResultado(null);
    setErro(problemas.length ? { texto: `${novas.length} animal(is) adicionado(s). Não entraram:`, itens: problemas } : null);
    setColar(sobras.join('\n')); // fica só o que não entrou, para corrigir e tentar de novo
  }

  async function gravar() {
    if (gravando || travado || linhas.length === 0) return;
    if (!data) { setErro({ texto: 'Escolha a data da pesagem.' }); return; }
    const itens = linhas.map((l) => ({ tipo: modo, brincoCria: l.brinco, data, peso: l.peso, ...(l.forcar && modo === 'pesagem' ? { forcar: true } : {}) }));
    const res = aplicarLote(dados, itens, { hoje });
    if (res.aplicados.length === 0) {
      setErro({ texto: 'Nada foi gravado:', itens: res.rejeitados.map((r) => `${itens[r.indice].brincoCria}: ${r.motivo}`) });
      return;
    }
    setGravando(true); setErro(null);
    const r = await onGravarLote(res, modo === 'desmama' ? `desmama de ${res.aplicados.length}` : `pesagem de ${res.aplicados.length}`);
    setGravando(false);
    if (!r.ok) { setErro({ texto: r.msg }); return; }
    const okIdx = new Set(res.aplicados.map((a) => a.indice));
    setLinhas((ls) => ls.filter((_, i) => !okIdx.has(i)));
    setResultado({
      qtd: res.aplicados.length, novilhas: res.matrizesParaGravar.length, modo, offline: !!r.offline,
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
      <div style={{ minHeight: 8 }}>
        <FichaRapida ficha={infoDigitado} digitado={brinco} />
      </div>

      {confDup && (
        <Aviso tipo="info">
          <div data-testid="aviso-duplicado">
            <b>{confDup.linha.brinco}</b> já foi pesado em {formatarDataBR(data)} com {confDup.mesmaData.map((x) => fmtKg(x.peso)).join(' e ')}. Verifique a duplicidade.
            {' '}Se lançar mesmo assim, ele fica com os dois pesos nesta data ({confDup.mesmaData.map((x) => fmtKg(x.peso)).join(', ')} e {fmtKg(confDup.linha.peso)}), marcado como pesado 2x.
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn quiet sm" onClick={() => confirmarDup(false)}>Cancelar</button>
            <button className="btn sm" onClick={() => confirmarDup(true)}>Lançar mesmo assim</button>
          </div>
        </Aviso>
      )}

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
            const info = infos.get(l.k) || { pontos: [], mesmaData: [] };
            const aviso = info.achado ? avisoDePeso((info.pontos || []).filter((p) => p.data !== data), l.peso, data) : 'Brinco não encontrado.';
            const ant = info.pesoAnterior;
            const dif = ant ? l.peso - ant.peso : null;
            const outros = modo === 'pesagem' ? info.mesmaData || [] : [];
            const desc = [info.sexo, info.idade ? info.idade.texto : '', info.maeBrinco ? `mãe ${info.maeBrinco}` : ''].filter(Boolean).join(' · ');
            return (
              <div className="item-lin" key={l.k} data-testid={`linha-${l.brinco}`}>
                <div className="t">
                  <b>{l.brinco}{outros.length ? <span className="tag2x">{outros.length + 1}x</span> : null}</b>
                  <span>{desc}{dif !== null ? ` · ${dif >= 0 ? '+' : ''}${fmtKg(dif)} desde ${formatarDataBR(ant.data)}` : ' · primeira pesagem'}</span>
                  {outros.length > 0 && (
                    <span style={{ color: 'var(--amber)' }}>
                      Já pesado nesta data com {outros.map((x) => fmtKg(x.peso)).join(' e ')}.{l.forcar ? ' Vai gravar os dois pesos (2x).' : ' Verifique a duplicidade.'}
                      {!l.forcar && <button className="btn quiet sm" style={{ marginLeft: 8, minHeight: 32 }} onClick={() => setLinhas((ls) => ls.map((x) => (x.k === l.k ? { ...x, forcar: true } : x)))}>Lançar mesmo assim</button>}
                    </span>
                  )}
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
          {resultado.offline ? ' Sem internet: ficou guardado neste celular e vai para a planilha quando a internet voltar.' : ''}
          {modoTeste ? ' (modo teste: só na tela, nada foi para a planilha)' : ''}
          {resultado.rejeitados.length > 0 && (
            <>
              <div style={{ marginTop: 6 }}>Não gravadas (continuam na lista):</div>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{resultado.rejeitados.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </>
          )}
        </Aviso>
      )}

      <div className="sheet" style={{ marginTop: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14 }} data-testid="resumo-dia">
          {doDia && doDia.secoes[0].linhas.length
            ? <>Já gravados em <b>{formatarDataBR(data)}</b>: {doDia.resumo[0].valor} pesagem(ns), média {doDia.resumo[3].valor}{doDia.resumo[6].valor !== 'nenhum' ? <>, <b style={{ color: 'var(--amber)' }}>2x: {doDia.resumo[6].valor}</b></> : null}</>
            : <>Nada gravado em {data ? formatarDataBR(data) : 'esta data'} ainda.</>}
        </span>
        <button className="btn ghost sm" onClick={pdfDoDia} disabled={!doDia || !doDia.secoes[0].linhas.length || gerandoPdf}>
          {gerandoPdf ? <Loader2 size={16} className="spin" /> : <FileDown size={16} />} PDF da pesagem
        </button>
      </div>

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
