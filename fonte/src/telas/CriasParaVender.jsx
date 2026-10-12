// Crias > Para vender (proprietário): metas de venda dos machos, quem já está no peso, projeção e atalho para vender.
import React, { useMemo, useState } from 'react';
import { ShoppingCart, Save } from 'lucide-react';
import { analiseMachos, configCompleta, addDias, formatarDataBR, numPeso } from '../logica.js';
import { Kpis, Aviso } from '../ui.jsx';
import { fmtKg, fmtIdade, fmtGmd, fmtBRL, fmtNum } from '../util.js';

const txt = (v) => (v === null || v === undefined ? '' : String(v));

export default function ParaVender({ crias, dados, onSalvarConfig, onVender, modoTeste, hoje }) {
  const cfg = useMemo(() => configCompleta(dados.config), [dados.config]);
  const [metaPeso, setMetaPeso] = useState(txt(cfg.metaPesoMacho));
  const [metaQtd, setMetaQtd] = useState(txt(cfg.metaQtdMacho));
  const [pesoMatriz, setPesoMatriz] = useState(txt(cfg.pesoMatriz));
  const [salvo, setSalvo] = useState('');
  const [erro, setErro] = useState('');
  const [valorKg, setValorKg] = useState('');
  const [filtro, setFiltro] = useState(cfg.metaPesoMacho ? 'prontos' : 'todos');
  const [marcados, setMarcados] = useState(() => new Set());

  const an = useMemo(() => analiseMachos(crias, dados.config), [crias, dados.config]);

  function salvarMetas() {
    const mp = metaPeso.trim() === '' ? '' : numPeso(metaPeso);
    const mq = metaQtd.trim() === '' ? '' : numPeso(metaQtd);
    const pm = pesoMatriz.trim() === '' ? '' : numPeso(pesoMatriz);
    if ([mp, mq, pm].some((x) => x !== '' && (isNaN(x) || x <= 0))) { setErro('Use só números maiores que zero, ou deixe o campo em branco.'); setSalvo(''); return; }
    setErro('');
    onSalvarConfig({ metaPesoMacho: mp, metaQtdMacho: mq, pesoMatriz: pm === '' ? 280 : pm });
    setSalvo('Metas salvas.');
    if (mp !== '' && filtro === 'todos') setFiltro('prontos');
  }

  const linhas = an.linhas.filter((l) => (filtro === 'prontos' ? l.pronto : filtro === 'semPeso' ? l.cria.pesoAtual === null : true));
  const prontos = an.linhas.filter((l) => l.pronto);
  const vkg = numPeso(valorKg);

  function alternar(id) {
    setMarcados((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function marcarProntos() { setMarcados(new Set(prontos.map((l) => l.cria.id))); }
  const escolhidos = an.linhas.filter((l) => marcados.has(l.cria.id));
  const semNumero = escolhidos.filter((l) => !l.cria.brinco).length;

  let projecao = null;
  if (an.cfg.metaPesoMacho && an.cfg.metaQtdMacho) {
    if (an.metaQtdAtingida) projecao = `A meta de ${an.cfg.metaQtdMacho} machos no peso já foi atingida: há ${an.prontos} prontos.`;
    else if (an.diasParaMetaQtd !== null) projecao = `No ritmo de ganho atual, a meta de ${an.cfg.metaQtdMacho} machos no peso de ${fmtKg(an.cfg.metaPesoMacho)} deve ser atingida em cerca de ${an.diasParaMetaQtd} dias (por volta de ${formatarDataBR(addDias(hoje, an.diasParaMetaQtd))}).`;
    else projecao = 'Ainda não dá para projetar quando a meta será atingida: faltam pesagens para calcular o ganho de peso.';
  }

  return (
    <section className="sheet pad">
      <h2 className="h2" style={{ marginTop: 0 }}>Para vender</h2>
      <p className="sub">Defina o peso alvo e a quantidade para negociar. A tela mostra quais machos já estão no peso e quando os outros devem chegar.</p>

      <div className="rapido">
        <div className="grid2">
          <div className="fld"><label htmlFor="meta-peso">Peso alvo dos machos (kg)</label><input id="meta-peso" type="text" inputMode="decimal" value={metaPeso} onChange={(e) => { setMetaPeso(e.target.value); setSalvo(''); }} placeholder="ex.: 250" /></div>
          <div className="fld"><label htmlFor="meta-qtd">Quantidade para negociar</label><input id="meta-qtd" type="text" inputMode="numeric" value={metaQtd} onChange={(e) => { setMetaQtd(e.target.value); setSalvo(''); }} placeholder="ex.: 30" /></div>
        </div>
        <div className="fld"><label htmlFor="meta-matriz">Peso para a novilha virar matriz (kg)</label><input id="meta-matriz" type="text" inputMode="decimal" value={pesoMatriz} onChange={(e) => { setPesoMatriz(e.target.value); setSalvo(''); }} /></div>
        <button className="btn quiet" onClick={salvarMetas}><Save size={17} /> Salvar metas</button>
        {salvo && <Aviso tipo="ok">{salvo}{modoTeste ? ' (modo teste: só na tela)' : ''}</Aviso>}
        {erro && <Aviso>{erro}</Aviso>}
      </div>

      <Kpis itens={[
        { rotulo: 'Machos no rebanho', valor: an.total, sub: `${an.semPeso} sem pesagem` },
        { rotulo: 'Peso médio', valor: an.pesoMedio === null ? '—' : fmtKg(an.pesoMedio), pequeno: true },
        { rotulo: an.cfg.metaPesoMacho ? `No peso (${fmtNum(an.cfg.metaPesoMacho, 0)} kg ou mais)` : 'No peso alvo', valor: an.cfg.metaPesoMacho ? an.prontos : '—', cor: an.prontos ? 'var(--green)' : undefined, sub: an.cfg.metaQtdMacho ? `meta ${an.cfg.metaQtdMacho} · faltam ${an.faltamQtd}` : undefined },
        { rotulo: 'Chegam ao peso', valor: an.cfg.metaPesoMacho ? `${an.prox30} em 30d` : '—', pequeno: true, sub: an.cfg.metaPesoMacho ? `${an.prox60} em 60 dias` : 'defina o peso alvo' },
      ]} />
      {!an.cfg.metaPesoMacho && <Aviso tipo="info">Digite o peso alvo acima e salve para ver quais machos já estão prontos.</Aviso>}
      {projecao && <p className="sub" style={{ marginTop: 10 }}>{projecao}</p>}

      {an.prontos > 0 && (
        <div className="rapido" style={{ marginTop: 12 }}>
          <div className="grid2">
            <div className="fld"><label htmlFor="vkg-est">Valor do kg para uma estimativa (R$)</label><input id="vkg-est" type="text" inputMode="decimal" value={valorKg} onChange={(e) => setValorKg(e.target.value)} placeholder="ex.: 12,50" /></div>
            <div className="fld"><span className="lbl" style={{ display: 'block', font: '600 11.5px var(--mono)', letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--mut)', marginBottom: 6 }}>Prontos hoje</span>
              <div style={{ fontSize: 15, lineHeight: 1.4 }}><b>{an.prontos}</b> animais · <b>{fmtKg(an.kgProntos)}</b> (média {fmtKg(an.pesoMedioProntos)}){vkg > 0 && <div>≈ <b>{fmtBRL(an.kgProntos * vkg)}</b> (estimativa)</div>}</div>
            </div>
          </div>
        </div>
      )}

      <div className="seg" style={{ margin: '16px 0 10px' }} role="group" aria-label="Quais machos mostrar">
        <button aria-pressed={filtro === 'prontos'} onClick={() => setFiltro('prontos')}>Prontos {an.prontos}</button>
        <button aria-pressed={filtro === 'todos'} onClick={() => setFiltro('todos')}>Todos {an.total}</button>
        <button aria-pressed={filtro === 'semPeso'} onClick={() => setFiltro('semPeso')}>Sem peso {an.semPeso}</button>
      </div>

      <div className="sheet" style={{ boxShadow: 'none', borderRadius: 8 }}>
        <div className="bar-sum">
          <span>{linhas.length} macho(s)</span>
          <span>{escolhidos.length} marcado(s)</span>
        </div>
        {linhas.length === 0 && <div className="empty">{filtro === 'prontos' ? 'Nenhum macho no peso alvo ainda.' : 'Nenhum macho neste filtro.'}</div>}
        {linhas.map((l) => {
          const c = l.cria;
          const faltam = an.cfg.metaPesoMacho && c.pesoAtual !== null && !l.pronto ? an.cfg.metaPesoMacho - c.pesoAtual : null;
          const status = c.pesoAtual === null ? 'sem pesagem' : l.pronto ? 'no peso' : `faltam ${fmtNum(faltam, 1)} kg${l.dias ? ` · ~${l.dias} dias` : ''}`;
          return (
            <div className="sel-row cols-vender" key={c.id}>
              <input type="checkbox" className="chk" checked={marcados.has(c.id)} onChange={() => alternar(c.id)} aria-label={`Marcar ${c.brinco || 'cria sem número'}`} disabled={!c.brinco} />
              <span className="b" style={{ font: '600 17px var(--mono)' }}>{c.brinco || '—'}</span>
              <span className="two" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25, minWidth: 0 }}>
                <b style={{ fontWeight: 600, fontSize: 15 }}>{fmtIdade(c.idadeDias)}</b>
                <span style={{ color: l.pronto ? 'var(--green)' : 'var(--mut)' }}>mãe {c.maeBrinco || '?'} · {status}</span>
              </span>
              <span className="r" style={{ textAlign: 'right', font: '600 15px var(--mono)' }}>{c.pesoAtual === null ? '—' : fmtKg(c.pesoAtual)}</span>
              <span className="hide-s"><span className={`pill ${l.pronto ? 'pronto' : c.pesoAtual === null ? 'fora' : 'falta'}`}>{l.pronto ? 'pronto' : c.pesoAtual === null ? 'sem peso' : 'em ganho'}</span></span>
              <span className="hide-s m mut">{fmtGmd(c.gmd)}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        <button className="btn quiet sm" onClick={marcarProntos} disabled={!prontos.length}>Marcar todos os prontos</button>
        <button className="btn quiet sm" onClick={() => setMarcados(new Set())} disabled={!marcados.size}>Limpar</button>
        <button className="btn" style={{ marginLeft: 'auto' }} disabled={!escolhidos.length} onClick={() => onVender(escolhidos.filter((l) => l.cria.brinco).map((l) => l.cria.brinco))}>
          <ShoppingCart size={18} /> Vender {escolhidos.length ? `os ${escolhidos.length} marcados` : 'marcados'}
        </button>
      </div>
      {semNumero > 0 && <p className="sub">{semNumero} marcado(s) sem número de brinco ficam de fora da venda.</p>}
    </section>
  );
}
