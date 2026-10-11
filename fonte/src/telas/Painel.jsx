// Tela "Painel" (só proprietário): rebanho de hoje, movimento do ano de gestão, pendências e dinheiro.
import React, { useMemo, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import {
  calcularKPIs, filtrarPorAno, linhasPrevisao, mesCurto, rotuloAno, formatarDataBR,
} from '../logica.js';
import { Kpis, Lead, Aviso } from '../ui.jsx';
import { descreverEvento, fmtBRL } from '../util.js';

export default function Painel({ anoSel, dados, ano, hoje, go, onExcel, onSync, onRecarregar, modoTeste, sincronizando }) {
  const [confirmar, setConfirmar] = useState(false);
  const evsAno = useMemo(() => filtrarPorAno(dados.eventos, ano), [dados.eventos, ano]);
  const k = useMemo(() => calcularKPIs(dados.matrizes, evsAno), [dados.matrizes, evsAno]);
  const cheias = useMemo(() => linhasPrevisao(dados.matrizes, dados.eventos, 'Cheia', hoje, ''), [dados, hoje]);
  const atrasadas = cheias.filter((l) => l.dias !== null && l.dias < 0).length;
  const semPrev = cheias.filter((l) => l.dias === null).length;
  const sinal = cheias.filter((l) => l.dias !== null && l.dias >= 0 && l.dias <= 30).length;

  const nascSemMae = evsAno.filter((e) => e.tipo === 'nascimento' && !e.matrizId).length;
  const semRacaLote = dados.matrizes.filter((m) => m.status !== 'Descarte' && (!m.raca || !m.lote)).length;
  const brincos = {};
  dados.matrizes.forEach((m) => { brincos[m.brinco] = (brincos[m.brinco] || 0) + 1; });
  const duplicados = Object.values(brincos).filter((n) => n > 1).length;

  const porMes = useMemo(() => {
    const mapa = {};
    evsAno.filter((e) => e.tipo === 'nascimento' && e.data).forEach((e) => { const kk = e.data.slice(0, 7); mapa[kk] = (mapa[kk] || 0) + 1; });
    return Object.entries(mapa).sort().slice(-12);
  }, [evsAno]);
  const maxMes = Math.max(1, ...porMes.map(([, n]) => n));

  const recentes = useMemo(
    () => [...dados.eventos].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 8),
    [dados.eventos],
  );

  const ativos = k.cheias + k.vazias;
  const pc = (n) => (ativos ? (n / ativos) * 100 : 0);
  const rot = rotuloAno(ano);
  const pendencias = [
    atrasadas > 0 && { rotulo: 'Previsões de parto já vencidas (conferir se pariram)', valor: atrasadas, onClick: () => go('parto'), cor: 'var(--late)' },
    semPrev > 0 && { rotulo: 'Cheias sem previsão calculada', valor: semPrev, onClick: () => go('parto') },
    nascSemMae > 0 && { rotulo: `Nascimentos de ${rot} sem a mãe informada`, valor: nascSemMae },
    semRacaLote > 0 && { rotulo: 'Matrizes sem raça ou lote no cadastro', valor: semRacaLote, onClick: () => go('rebanho') },
    duplicados > 0 && { rotulo: 'Brincos repetidos no cadastro', valor: duplicados, cor: 'var(--late)' },
  ].filter(Boolean);

  return (
    <div className="wrap">
      <div className="head">
        <div><small>Proprietário · {rot}</small><h1>Painel</h1></div>
        <div className="acts noprint">
          {anoSel}
          <button className="btn ghost sm" onClick={onExcel}><Download size={16} /> Excel de {rot}</button>
        </div>
      </div>

      <h2 className="h2" style={{ marginTop: 4 }}>Rebanho hoje<small>{formatarDataBR(hoje)}</small></h2>
      <Kpis itens={[
        { rotulo: 'Matrizes', valor: k.total },
        { rotulo: 'Cheias', valor: k.cheias, cor: 'var(--green)', sub: `${pc(k.cheias).toFixed(0)}% das ativas` },
        { rotulo: 'Vazias', valor: k.vazias, cor: 'var(--amber)', sub: `${pc(k.vazias).toFixed(0)}% das ativas` },
        { rotulo: 'Descarte', valor: k.descartes, cor: 'var(--late)' },
      ]} />
      <div className="panel" style={{ marginTop: 12 }}>
        <div className="sbar" role="img" aria-label={`${k.cheias} cheias, ${k.vazias} vazias, ${k.descartes} em descarte`}>
          <i style={{ width: `${k.total ? (k.cheias / k.total) * 100 : 0}%`, background: 'var(--green)' }} />
          <i style={{ width: `${k.total ? (k.vazias / k.total) * 100 : 0}%`, background: 'var(--amber)' }} />
          <i style={{ width: `${k.total ? (k.descartes / k.total) * 100 : 0}%`, background: 'var(--late)' }} />
        </div>
        <div className="legend">
          <span style={{ '--c': 'var(--green)' }}>Cheias</span>
          <span style={{ '--c': 'var(--amber)' }}>Vazias</span>
          <span style={{ '--c': 'var(--late)' }}>Descarte</span>
        </div>
        <Lead rotulo="Partos previstos nos próximos 30 dias" valor={sinal} onClick={() => go('parto')} />
        <Lead rotulo="Novilhas em recria" valor={k.emRecria} />
      </div>

      <h2 className="h2">Movimento de {rot}</h2>
      <Kpis itens={[
        { rotulo: 'Nascimentos', valor: k.nascimentos + k.natimortos, sub: `${k.machos} machos · ${k.femeas} fêmeas` },
        { rotulo: 'IATF / coberturas', valor: k.iatfs },
        { rotulo: 'Toques', valor: k.diagnosticos, sub: k.diagnosticos ? `${k.taxaPrenhez.toFixed(0)}% prenhes` : 'nenhum no período' },
        { rotulo: 'Desmamas', valor: k.desmamas, sub: k.desmamas ? `peso médio ${k.pesoMedioDesmama.toFixed(0)} kg` : 'nenhuma no período' },
      ]} />
      <div className="cols2" style={{ marginTop: 16 }}>
        <div className="panel">
          <h3>Nascimentos por mês</h3>
          {porMes.length === 0 ? <p className="sub">Nenhum nascimento lançado em {rot}.</p> : (
            <div className="mbars" role="img" aria-label="Nascimentos por mês">
              {porMes.map(([mes, n]) => (
                <div className="c" key={mes}>
                  <b>{n}</b>
                  <i style={{ height: `${(n / maxMes) * 100}%` }} />
                  <span>{mesCurto(mes)}</span>
                </div>
              ))}
            </div>
          )}
          <Lead rotulo="Perda ao nascer (natimortos)" valor={`${k.taxaPerda.toFixed(0)}% · ${k.natimortos}`} cor={k.taxaPerda > 5 ? 'var(--late)' : undefined} />
        </div>

        <div className="panel">
          <h3>A conferir</h3>
          {pendencias.length === 0 ? <p className="sub">Nada pendente. Tudo em ordem.</p> : (
            pendencias.map((p) => <Lead key={p.rotulo} rotulo={p.rotulo} valor={p.valor} onClick={p.onClick} cor={p.cor} />)
          )}
        </div>
      </div>

      <h2 className="h2">Dinheiro de {rot}</h2>
      <Kpis itens={[
        { rotulo: 'Vendas', valor: fmtBRL(k.receitaTotal), pequeno: true },
        { rotulo: 'Custos', valor: fmtBRL(k.custoTotal), pequeno: true, sub: 'IATF, toque, insumo e frete' },
        { rotulo: 'Custo por bezerro', valor: fmtBRL(k.custoPorBezerro), pequeno: true, cor: 'var(--amber)' },
        { rotulo: 'Margem', valor: fmtBRL(k.margem), pequeno: true, cor: k.margem >= 0 ? 'var(--green)' : 'var(--late)' },
      ]} />
      {k.receitaTotal === 0 && k.custoTotal === 0 && <p className="sub" style={{ marginTop: 8 }}>Ainda não há vendas ou custos lançados em {rot}.</p>}

      <h2 className="h2">Atividade recente</h2>
      <div className="sheet">
        {recentes.length === 0 ? <div className="empty">Nada lançado ainda.</div> : recentes.map((e) => (
          <div className="led-r" key={e.id} style={{ '--cols': '1fr auto', minHeight: 48 }}>
            <span style={{ fontSize: 14.5 }}>{descreverEvento(e, dados)}</span>
            <span className="m mut">{formatarDataBR(e.data)}</span>
          </div>
        ))}
      </div>

      <details className="ferr noprint">
        <summary>Ferramentas avançadas</summary>
        <div className="in2">
          <button className="btn quiet sm" onClick={onRecarregar}><RefreshCw size={15} /> Recarregar dados da planilha</button>
          <button className="btn quiet sm" onClick={() => setConfirmar(true)} disabled={sincronizando}><RefreshCw size={15} /> Sincronizar planilha agora</button>
        </div>
        {confirmar && (
          <Aviso tipo="info">
            Isso regrava a planilha inteira com o que está na tela (nada se perde; atualiza fórmulas, formatação e a aba Resumo). {modoTeste ? 'No modo teste não faz nada de verdade.' : 'Pode levar alguns segundos.'}
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button className="btn sm" onClick={async () => { setConfirmar(false); await onSync(); }}>Confirmar</button>
              <button className="btn quiet sm" onClick={() => setConfirmar(false)}>Cancelar</button>
            </div>
          </Aviso>
        )}
      </details>
    </div>
  );
}
