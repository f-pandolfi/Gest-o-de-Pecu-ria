// Tela "Parto": previsão de parto das cheias e situação das vazias, em formato de livro-caixa.
import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { linhasPrevisao, formatarDataBR, PERIODO_GESTACAO_DIAS } from '../logica.js';
import { IndexTabs } from '../ui.jsx';

function textoDias(dias) {
  if (dias === null || dias === undefined) return { t: '—', c: 'mut' };
  if (dias < 0) return { t: `−${Math.abs(dias)}`, c: 'late' };
  if (dias === 0) return { t: 'hoje', c: 'late' };
  if (dias <= 15) return { t: `+${dias}`, c: 'soon' };
  return { t: `+${dias}`, c: 'good' };
}

function Calculo({ info }) {
  if (!info) return null;
  if (info.origem === 'toque') return <>Cálculo: toque de <b>{formatarDataBR(info.base)}</b> com <b>{info.dg}</b> dias de gestação, completando {PERIODO_GESTACAO_DIAS} dias.</>;
  if (info.origem === 'iatf') return <>Cálculo: IATF de <b>{formatarDataBR(info.base)}</b> mais {PERIODO_GESTACAO_DIAS} dias.</>;
  return <>Toque de <b>{formatarDataBR(info.base)}</b> sem os dias de gestação (DG) anotados: não dá para calcular a data.</>;
}

export default function Parto({ dados, hoje, onLancar }) {
  const [aba, setAba] = useState('Cheia');
  const [busca, setBusca] = useState('');
  const [aberta, setAberta] = useState(null);

  const todasCheias = useMemo(() => linhasPrevisao(dados.matrizes, dados.eventos, 'Cheia', hoje, ''), [dados, hoje]);
  const nVazias = dados.matrizes.filter((m) => m.status === 'Vazia').length;
  const linhas = useMemo(() => linhasPrevisao(dados.matrizes, dados.eventos, aba, hoje, busca), [dados, aba, hoje, busca]);

  const atrasadas = todasCheias.filter((l) => l.dias !== null && l.dias < 0).length;
  const porVir = todasCheias.filter((l) => l.dias !== null && l.dias >= 0).length;
  const semPrev = todasCheias.filter((l) => l.dias === null).length;
  const vaziasSemParto = useMemo(() => linhasPrevisao(dados.matrizes, dados.eventos, 'Vazia', hoje, '').filter((l) => !l.ultimoParto).length, [dados, hoje]);

  const cols = '84px minmax(0,1fr) 78px 54px';

  return (
    <div className="wrap">
      <div className="head">
        <div><small>Livro do rebanho</small><h1>Previsão de parto</h1></div>
      </div>

      <IndexTabs
        rotulo="Situação"
        value={aba}
        onChange={(v) => { setAba(v); setAberta(null); }}
        tabs={[{ id: 'Cheia', label: 'Cheias', count: todasCheias.length }, { id: 'Vazia', label: 'Vazias', count: nVazias }]}
      />
      <section className="sheet">
        <label className="search">
          <Search />
          <input placeholder="Buscar pelo brinco" aria-label="Buscar pelo brinco" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>

        <div className="bar-sum">
          {aba === 'Cheia' ? (
            <>
              <span className="late">{atrasadas} atrasadas</span>
              <span className="good">{porVir} por vir</span>
              {semPrev > 0 && <span className="mut">{semPrev} sem previsão</span>}
            </>
          ) : (
            <>
              <span className="soon">{nVazias} vazias</span>
              {vaziasSemParto > 0 && <span className="mut">{vaziasSemParto} sem parto lançado</span>}
            </>
          )}
        </div>

        <div className="led-h" style={{ '--cols': cols }}>
          <span>Brinco</span><span>Categoria</span>
          <span>{aba === 'Cheia' ? 'Previsão' : 'Últ. parto'}</span>
          <span className="r">{aba === 'Cheia' ? 'Dias' : 'Há (d)'}</span>
        </div>

        {linhas.length === 0 && (
          <div className="empty">{busca ? 'Nenhuma matriz com esse brinco aqui.' : `Nenhuma matriz ${aba === 'Cheia' ? 'cheia' : 'vazia'}.`}</div>
        )}

        {linhas.map((l) => {
          const m = l.matriz;
          const dd = aba === 'Cheia' ? textoDias(l.dias) : { t: l.diasDesdeParto === null ? '—' : String(l.diasDesdeParto), c: 'mut' };
          const data = aba === 'Cheia' ? l.previsao : l.ultimoParto;
          const aberto = aberta === m.id;
          return (
            <React.Fragment key={m.id}>
              <button className="led-r" style={{ '--cols': cols }} aria-expanded={aberto} onClick={() => setAberta(aberto ? null : m.id)}>
                <span className="b">{m.brinco}</span>
                <span className="two"><b>{m.categoria}</b><span>{[m.raca, m.lote].filter(Boolean).join(' · ') || '—'}</span></span>
                <span className="m">{data ? formatarDataBR(data) : '—'}</span>
                <span className={`r ${dd.c}`}>{dd.t}</span>
              </button>
              {aberto && (
                <div className="detalhe">
                  {aba === 'Cheia' && <div><Calculo info={l.info} /></div>}
                  {l.ultimoParto
                    ? <div>Último parto: <b>{formatarDataBR(l.ultimoParto)}</b>{l.numeroCria ? ` (cria ${l.numeroCria})` : ''}</div>
                    : <div>Nenhum parto lançado para esta vaca.</div>}
                  {aba === 'Cheia' && l.dias !== null && l.dias < 0 && <div className="late" style={{ marginTop: 4 }}>A data prevista já passou há {Math.abs(l.dias)} dia(s). Confira se ela já pariu.</div>}
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {aba === 'Cheia'
                      ? <button className="btn sm" onClick={() => onLancar('nascimento', m.id)}>Lançar nascimento desta vaca</button>
                      : <button className="btn sm" onClick={() => onLancar('iatf', m.id)}>Lançar IATF desta vaca</button>}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </section>
      <p className="sub" style={{ marginTop: 14 }}>
        Dias negativos: a data prevista já passou. Confira se a vaca pariu e lance o nascimento. A previsão olha o histórico inteiro da vaca, não só o ano escolhido.
      </p>
    </div>
  );
}
