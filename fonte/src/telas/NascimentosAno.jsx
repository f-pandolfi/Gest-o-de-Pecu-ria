// v11: aba Nascimentos > Nascimentos. Todos os nascimentos do ano escolhido: totais, gráfico por mês e lista (toque abre a ficha).
// O lançamento do parto continua em Lançar.
import React, { useMemo, useState } from 'react';
import { situacaoHistorica } from '../logica.js';
import { useFicha, ListaAnimais } from './Ficha.jsx';
import { chaveDaCria } from '../ficha.js';

const LETRAS = 'JFMAMJJASOND';
export default function NascimentosAno({ dados, hoje }) {
  const { ix } = useFicha();
  const anos = useMemo(() => [...new Set(dados.eventos.filter((e) => e.tipo === 'nascimento').map((e) => (e.data || '').slice(0, 4)).filter(Boolean))].sort().reverse(), [dados.eventos]);
  const [ano, setAno] = useState(() => (anos.includes(String(hoje).slice(0, 4)) ? String(hoje).slice(0, 4) : anos[0] || ''));
  const [falta, setFalta] = useState(false);
  const doAno = useMemo(() => dados.eventos.filter((e) => e.tipo === 'nascimento' && (e.data || '').startsWith(ano)).sort((a, b) => b.data.localeCompare(a.data)), [dados.eventos, ano]);
  const faltando = (e) => !e.sexo || (!e.matrizId && !(situacaoHistorica(e) || {}).maeFora) || !String(e.brincoBezerro ?? '').trim();
  const M = doAno.filter((e) => e.sexo === 'Macho').length; const F = doAno.filter((e) => e.sexo === 'Fêmea').length;
  const nat = doAno.filter((e) => e.resultadoParto === 'Natimorto').length;
  const vivos = ix ? doAno.map((e) => ix.criaPorId.get(e.id)).filter((c) => c && c.situacao !== 'vendido' && c.situacao !== 'morto').length : 0;
  const porMes = Array.from({ length: 12 }, (_, i) => doAno.filter((e) => Number(e.data.slice(5, 7)) === i + 1).length);
  const mx = Math.max(1, ...porMes);
  const pct = (n) => (doAno.length ? `${Math.round((n / doAno.length) * 100)}%` : '');
  const lista = (falta ? doAno.filter(faltando) : doAno).map((e) => (ix && ix.criaPorId.get(e.id) ? chaveDaCria(ix.criaPorId.get(e.id)) : null)).filter(Boolean);
  const nFalta = doAno.filter(faltando).length;
  return (
    <div data-testid="nascimentos-ano">
      <div className="fx-chips">{anos.map((a) => <button key={a} className={`fx-cp${ano === a ? ' on' : ''}`} aria-pressed={ano === a} onClick={() => setAno(a)}>{a}</button>)}</div>
      <div className="fx-resumo">
        <div className="fx-kpi"><small>Nascimentos {ano}</small><b>{doAno.length}</b></div>
        <div className="fx-kpi"><small>Machos</small><b>{M}</b><i>{pct(M)}</i></div>
        <div className="fx-kpi"><small>Fêmeas</small><b>{F}</b><i>{pct(F)}</i></div>
        <div className="fx-kpi"><small>Natimortos</small><b>{nat}</b></div>
        <div className="fx-kpi"><small>Ainda na fazenda</small><b>{vivos}</b></div>
      </div>
      <section className="fx-card" style={{ marginBottom: 12 }}>
        <h3>Nascimentos por mês</h3>
        <div className="fx-meses">
          {porMes.map((n, i) => (
            <div key={i}><span>{n || ''}</span><div style={{ height: Math.max(3, (n / mx) * 62), background: n ? 'var(--amber)' : 'var(--line2)' }} /><small>{LETRAS[i]}</small></div>
          ))}
        </div>
      </section>
      <div className="fx-chips">
        <button className={`fx-cp${!falta ? ' on' : ''}`} onClick={() => setFalta(false)}>Todos<b>{doAno.length}</b></button>
        <button className={`fx-cp${falta ? ' on' : ''}`} onClick={() => setFalta(true)}>Faltando dados<b>{nFalta}</b></button>
      </div>
      <ListaAnimais chaves={lista} vazio={falta ? 'Nenhum nascimento com dado faltando.' : 'Nenhum nascimento neste ano.'} />
    </div>
  );
}
