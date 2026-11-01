// v11.1: aba Produtividade. Meta de um bezerro por vaca por ano: números do plantel, matrizes por situação,
// alerta de "mais de 6 meses sem emprenhar" e a lista de cada matriz com o que fazer. Toque na linha abre a ficha.
import React, { useMemo, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { formatarDataBR } from '../logica.js';
import { useFicha } from './Ficha.jsx';
import { analisarMatrizes, resumoProdutividade, GRUPOS_PROD, MESES_SEM_EMPRENHAR } from '../produtividade.js';

const br = (d) => (d ? formatarDataBR(d) : '');
const virgula = (v) => String(v).replace('.', ',');
const COLS = [
  { k: 'brinco', t: 'Brinco' }, { k: 'ordem', t: 'Situação' }, { k: 'nPartos', t: 'Partos', num: true },
  { k: 'mesesSemParir', t: 'Meses sem parir', num: true }, { k: 'iepMeses', t: 'Intervalo médio', num: true }, { k: 'previsao', t: 'Previsão' },
];

export default function Produtividade({ dados, hoje, filtroInicial }) {
  const { ix, abrir } = useFicha();
  const linhas = useMemo(() => analisarMatrizes(dados, hoje, ix ? ix.criaDaMatriz : null), [dados, hoje, ix]);
  const r = useMemo(() => resumoProdutividade(linhas), [linhas]);
  const [filtro, setFiltro] = useState(filtroInicial || '');
  const [busca, setBusca] = useState('');
  const [sort, setSort] = useState({ k: 'ordem', dir: 1 });
  useEffect(() => { if (filtroInicial) setFiltro(filtroInicial.split(':')[0]); }, [filtroInicial]);

  const q = busca.trim();
  let lista = linhas.filter((l) => !filtro || (filtro === 'seis' ? l.semEmprenhar : filtro === 'vencida' ? l.previsaoVencida > 0 : l.grupo === filtro))
    .filter((l) => !q || l.brinco.startsWith(q) || l.partos.some((p) => String(p.brincoBezerro || '').startsWith(q)));
  lista = lista.slice().sort((a, b) => {
    const k = sort.k; const va = a[k]; const vb = b[k];
    if (k === 'ordem') return (va - vb) * sort.dir || ((b.diasSemParir ?? -1) - (a.diasSemParir ?? -1));
    const vazio = (v) => v === null || v === undefined || v === '';
    if (vazio(va) && vazio(vb)) return 0; if (vazio(va)) return 1; if (vazio(vb)) return -1;
    if (typeof va === 'number') return (va - vb) * sort.dir;
    return String(va).localeCompare(String(vb), 'pt-BR', { numeric: true }) * sort.dir;
  });
  const maxG = Math.max(1, ...r.porGrupo.map((g) => g.n));
  const ordenar = (k) => setSort((s) => ({ k, dir: s.k === k ? -s.dir : 1 }));
  const Chip = ({ id, children, cor }) => (
    <button className={`fx-cp${filtro === id ? ' on' : ''}`} aria-pressed={filtro === id} onClick={() => setFiltro(id)}>
      {cor && <span className="pd-dot" style={{ background: `var(--${cor})` }} />}{children}
    </button>
  );
  const corVar = { bad: 'late', warn: 'amber', ok: 'green', mut: 'mut' };

  return (
    <div className="wrap" data-testid="produtividade">
      <div className="head"><div><small>Matrizes</small><h1>Produtividade</h1></div></div>
      <p className="sub pd-lead">
        Meta: cada vaca dá um bezerro por ano. Hoje <b>{Math.round(r.pct12m * 100)}%</b> das vacas pariram nos últimos 12 meses,
        o intervalo médio entre partos é de <b>{r.iepMedio !== null ? virgula(r.iepMedio) : '—'} meses</b> e <b>{r.descarte}</b> vacas são candidatas a descarte.
      </p>

      <div className="fx-resumo">
        <div className="fx-kpi"><small>Vacas no plantel</small><b>{r.vacas}</b><i>sem novilhas</i></div>
        <div className="fx-kpi"><small>Pariram em 12 meses</small><b style={{ color: 'var(--green)' }}>{r.pariram12m}</b><i>{Math.round(r.pct12m * 100)}%</i></div>
        <div className="fx-kpi"><small>Intervalo médio entre partos</small><b style={{ color: 'var(--amber)' }}>{r.iepMedio !== null ? virgula(r.iepMedio) : '—'}</b><i>meses (meta 12)</i></div>
        <button className="fx-kpi" onClick={() => setFiltro('seis')} data-testid="kpi-seis"><small>Mais de {MESES_SEM_EMPRENHAR} meses sem emprenhar</small><b style={{ color: 'var(--late)' }}>{r.semEmprenhar}</b></button>
        <button className="fx-kpi" onClick={() => setFiltro('nunca')}><small>Candidatas a descarte</small><b style={{ color: 'var(--late)' }}>{r.descarte}</b></button>
        <button className="fx-kpi" onClick={() => setFiltro('vencida')}><small>Cheias com previsão vencida</small><b style={{ color: 'var(--amber)' }}>{r.previsaoVencida}</b></button>
      </div>

      <section className="fx-card" style={{ marginBottom: 14 }}>
        <h3>Onde está cada matriz</h3>
        <div className="pd-barras">
          {r.porGrupo.filter((g) => g.n > 0 || g.id !== 'descarte').map((g) => (
            <button key={g.id} className="pd-barra" onClick={() => setFiltro(g.id)} aria-label={`${g.nome}: ${g.n}`}>
              <span className="nome">{g.nome}</span>
              <span className="trilho"><span style={{ width: `${(g.n / maxG) * 100}%`, background: `var(--${corVar[g.cor]})` }} /></span>
              <b>{g.n}</b>
            </button>
          ))}
        </div>
      </section>

      <div className="fx-chips">
        <Chip id="">Todas<b>{linhas.length}</b></Chip>
        <Chip id="seis" cor="late">Mais de {MESES_SEM_EMPRENHAR} meses sem emprenhar<b>{r.semEmprenhar}</b></Chip>
        {r.previsaoVencida > 0 && <Chip id="vencida" cor="amber">Previsão vencida<b>{r.previsaoVencida}</b></Chip>}
        {r.porGrupo.filter((g) => g.n > 0).map((g) => <Chip key={g.id} id={g.id} cor={corVar[g.cor]}>{g.nome}<b>{g.n}</b></Chip>)}
      </div>
      <label className="search fx-search">
        <Search />
        <input placeholder="Buscar brinco da vaca ou da cria" aria-label="Buscar brinco da vaca ou da cria" inputMode="numeric" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </label>

      <div className="pd-tabela-box">
        <table className="pd-tabela" data-testid="tabela-produtividade">
          <thead>
            <tr>
              {COLS.map((c) => (
                <th key={c.k} className={c.num ? 'num' : ''} aria-sort={sort.k === c.k ? (sort.dir > 0 ? 'ascending' : 'descending') : undefined}>
                  <button onClick={() => ordenar(c.k)}>{c.t}</button>
                </th>
              ))}
              <th>Datas dos partos</th><th>Crias</th><th>O que fazer</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan={9} className="mut">Nenhuma matriz com esse filtro.</td></tr>}
            {lista.map((l) => {
              const g = GRUPOS_PROD[l.ordem];
              return (
                <tr key={l.id} onClick={() => abrir(`m:${l.id}`)} data-testid={`prod-${l.brinco}`}>
                  <td className="br">{l.brinco}<small>{l.status}{l.lote ? ` · ${l.lote}` : ''}</small></td>
                  <td><span className={`fx-pill p-${{ bad: 'late', warn: 'amber', ok: 'green', mut: 'gray' }[g.cor]}`}>{g.nome}</span>{l.semEmprenhar && <small className="late">{l.mesesSemParir} meses sem emprenhar</small>}</td>
                  <td className="num">{l.nPartos}{l.antes ? <small>+{l.antes} antes</small> : null}</td>
                  <td className="num">{l.mesesSemParir ?? ''}</td>
                  <td className="num">{l.iepMeses !== null ? virgula(l.iepMeses) : ''}</td>
                  <td>{br(l.previsao)}{l.previsaoVencida ? <small className="late">venceu há {l.previsaoVencida} d</small> : null}</td>
                  <td className="lista">{l.partos.map((p) => <span key={p.id}>{br(p.data)}</span>)}</td>
                  <td className="lista">{l.partos.map((p) => <span key={p.id} className={p.brincoBezerro ? '' : 'mut'}>{p.resultadoParto === 'Natimorto' ? 'natim.' : p.brincoBezerro || 's/ nº'}</span>)}</td>
                  <td className="acao">{l.acao}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <details className="pd-defs">
        <summary>Como cada situação é definida</summary>
        <ul>
          <li><b>Em dia</b>: pariu nos últimos 13 meses (um bezerro por ano, com um mês de folga).</li>
          <li><b>Mais de {MESES_SEM_EMPRENHAR} meses sem emprenhar</b>: está vazia e o último parto foi há mais de {MESES_SEM_EMPRENHAR} meses. Vaca que pariu e ainda não passou por toque aparece como vazia: o toque confirma.</li>
          <li><b>Prenhe, mas atrasada</b>: cheia, mas o último parto foi há mais de 13 meses (ou nunca pariu).</li>
          <li><b>Vazia há 13 a 24 meses</b>: perdeu uma parição. <b>Vazia há mais de 2 anos</b> e <b>Vaca que nunca pariu</b>: candidatas a descarte.</li>
          <li><b>Novilha passada da idade</b>: 30 meses ou mais sem parir. <b>Novilha jovem</b>: menos de 30 meses ou idade não informada.</li>
          <li>Intervalo médio: média dos intervalos entre partos de cada vaca com dois partos ou mais. Partos antes de 2022 ou antes de a vaca entrar na fazenda não têm data e não entram na conta.</li>
        </ul>
      </details>
    </div>
  );
}
