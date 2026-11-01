// Tela "Parto": previsão de parto das cheias e, nas vazias, todos os partos de cada vaca com as crias (livro-caixa).
import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { linhasPrevisao, formatarDataBR, PERIODO_GESTACAO_DIAS, partosPorMatriz, listarCrias, rotuloSituacao, diasEntre } from '../logica.js';
import { IndexTabs, Aviso } from '../ui.jsx';
import { aplicacoesPorAnimal, situacaoVacinaVaca, manejoConfirmacaoVacina } from '../manejo.js';
import { useFicha } from './Ficha.jsx';
import Toque from './Toque.jsx';
import { MESES_SEM_EMPRENHAR } from '../produtividade.js';

const DIAS_6_MESES = MESES_SEM_EMPRENHAR * 30.44;

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

// Vacina da vaca cheia: reforço da Lepto aos 6 meses de prenhez e vacina reprodutiva (com "Foi vacinada?")
function VacinaCheia({ m, sit, hoje, dados, onGravarLote }) {
  const [data, setData] = useState(hoje);
  const [msg, setMsg] = useState('');
  async function confirmar(tipo) {
    const ev = manejoConfirmacaoVacina([m.id], data, tipo);
    const r = await onGravarLote({ estado: { ...dados, eventos: [...dados.eventos, ev] }, eventosParaGravar: [{ tipo: 'manejo', evento: ev }], matrizesParaGravar: [], tourosParaGravar: [] }, `vacina ${m.brinco}`);
    setMsg(r.ok ? 'Registrado.' : r.msg);
  }
  const pedeInicial = !sit.inicial;
  const pedeReforco = sit.reforco && !sit.reforco.feito && (sit.reforco.atrasoDias || sit.reforco.faltam <= 30);
  const pergunta = (texto, tipo) => (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 8, color: 'var(--tx)' }}>
      {texto}
      <input type="date" aria-label={`Data: ${tipo}`} value={data} onChange={(e) => setData(e.target.value)} style={{ width: 'auto', minHeight: 34 }} />
      <button className="btn sm" style={{ minHeight: 34 }} onClick={() => confirmar(tipo)}>Sim</button>
      <button className="btn quiet sm" style={{ minHeight: 34 }} onClick={() => setMsg('Continua pendente. Vacine em Manejo > Vacinas.')}>Não</button>
    </div>
  );
  return (
    <div style={{ marginTop: 8 }} data-testid={`vacina-${m.brinco}`}>
      <span className={`vac-tag ${sit.nivel}`}>{sit.texto || 'Sem vacina registrada'}</span>
      {pedeReforco && onGravarLote && pergunta('Já tomou o reforço da Lepto?', 'Reforço Lepto')}
      {pedeInicial && onGravarLote && pergunta('Foi vacinada (vacina reprodutiva)?', 'Vacina reprodutiva')}
      {msg && <div className="hint" style={{ marginTop: 4 }}>{msg}</div>}
    </div>
  );
}

// Uma linha por parto: data, há quantos dias e tudo que se sabe da cria (brinco, sexo, situação, pai, pesos)
function PartoDetalhe({ e, c, hoje }) {
  const natimorto = e.resultadoParto === 'Natimorto';
  const sexo = e.sexo === 'Fêmea' ? 'fêmea' : e.sexo === 'Macho' ? 'macho' : '';
  const pesoNascer = String(e.pesoNascer ?? '').trim();
  const partes = [];
  if (natimorto) partes.push(<b key="n" className="late">natimorto</b>);
  else partes.push(<span key="b">cria <b>{e.brincoBezerro || 's/ nº'}</b></span>);
  if (sexo) partes.push(<span key="s">{sexo}</span>);
  if (c && !natimorto) partes.push(<span key="st" data-testid="parto-cria-situacao">{rotuloSituacao(c).toLowerCase()}{c.orfa ? ' (órfã)' : ''}</span>);
  if (c && c.origem && c.origem.rotulo && c.origem.origem !== 'Sem mãe') partes.push(<span key="o">{c.origem.rotulo}</span>);
  if (pesoNascer) partes.push(<span key="pn">nasceu com {pesoNascer.replace('.', ',')} kg</span>);
  if (c && c.pesoAtual && c.pesoData !== e.data) partes.push(<span key="pa">último peso {String(c.pesoAtual).replace('.', ',')} kg ({formatarDataBR(c.pesoData)})</span>);
  if (e.tipoParto && e.tipoParto !== 'Normal') partes.push(<span key="tp">parto {String(e.tipoParto).toLowerCase()}</span>);
  return (
    <div className="parto-lin" data-testid="parto-lin">
      <b className="m">{formatarDataBR(e.data)}</b> <span className="mut">(há {diasEntre(e.data, hoje)} dias)</span>
      <div className="parto-cria">{partes.map((x, i) => <React.Fragment key={i}>{i ? ' · ' : ''}{x}</React.Fragment>)}</div>
    </div>
  );
}

// v11: a aba Parto passou a se chamar Diagnóstico e ganhou o Toque (que antes ficava em Manejo).
export default function Parto({ dados, hoje, ownerMode, modoTeste, onLancar, onGravarLote, onMontarProtocolo, onAbrirProdutividade }) {
  const { abrir } = useFicha();
  const [aba, setAba] = useState('Cheia');
  const [so6, setSo6] = useState(false); // v11.1: só as vazias com mais de 6 meses sem emprenhar
  const [busca, setBusca] = useState('');
  const [aberta, setAberta] = useState(null);

  const todasCheias = useMemo(() => linhasPrevisao(dados.matrizes, dados.eventos, 'Cheia', hoje, ''), [dados, hoje]);
  const nVazias = dados.matrizes.filter((m) => m.status === 'Vazia').length;
  // Vazias: todos os partos de cada vaca, com a cria de cada parto. A busca acha pelo brinco da vaca ou da cria.
  const partos = useMemo(() => partosPorMatriz(dados.eventos), [dados.eventos]);
  const criaPorNasc = useMemo(() => (aba !== 'Toque' ? new Map(listarCrias(dados, hoje).map((c) => [c.id, c])) : new Map()), [dados, hoje, aba]);
  const linhas = useMemo(() => {
    // v11.0.2: nas Cheias a busca também acha pelo brinco da cria (como nas Vazias)
    const q = busca.trim().toLowerCase();
    return linhasPrevisao(dados.matrizes, dados.eventos, aba, hoje, '').filter((l) => !q || String(l.matriz.brinco).toLowerCase().includes(q)
      || (partos.get(l.matriz.id) || []).some((e) => String(e.brincoBezerro || '').toLowerCase().includes(q)))
      .filter((l) => !(aba === 'Vazia' && so6) || (l.diasDesdeParto !== null && l.diasDesdeParto > DIAS_6_MESES));
  }, [dados, aba, hoje, busca, partos, so6]);
  // v11.1: alerta de vacas vazias com o último parto há mais de 6 meses
  const seisMeses = useMemo(() => linhasPrevisao(dados.matrizes, dados.eventos, 'Vazia', hoje, '').filter((l) => l.diasDesdeParto !== null && l.diasDesdeParto > DIAS_6_MESES).length, [dados, hoje]);

  const atrasadas = todasCheias.filter((l) => l.dias !== null && l.dias < 0).length;
  const porVir = todasCheias.filter((l) => l.dias !== null && l.dias >= 0).length;
  const semPrev = todasCheias.filter((l) => l.dias === null).length;
  const vaziasSemParto = useMemo(() => linhasPrevisao(dados.matrizes, dados.eventos, 'Vazia', hoje, '').filter((l) => !l.ultimoParto).length, [dados, hoje]);

  const cols = '84px minmax(0,1fr) 78px 54px';
  const vazias = aba === 'Vazia';
  const cacheVac = useMemo(() => aplicacoesPorAnimal(dados), [dados]);
  const vacinaDe = (m) => situacaoVacinaVaca(dados, m, hoje, cacheVac);
  const pendVac = aba === 'Cheia' ? todasCheias.filter((l) => vacinaDe(l.matriz).pendente).length : 0;

  return (
    <div className="wrap">
      <div className="head">
        <div><small>Reprodução</small><h1>Diagnóstico</h1></div>
      </div>

      <IndexTabs
        rotulo="Situação"
        value={aba}
        onChange={(v) => { setAba(v); setAberta(null); }}
        tabs={[{ id: 'Cheia', label: 'Cheias', count: todasCheias.length }, { id: 'Vazia', label: 'Vazias', count: nVazias }, { id: 'Toque', label: 'Toque' }]}
      />
      {seisMeses > 0 && aba !== 'Toque' && (
        <div className="pd-alerta" role="status" data-testid="alerta-6meses">
          <span><b>{seisMeses}</b> vaca(s) com mais de {MESES_SEM_EMPRENHAR} meses sem emprenhar (vazias, último parto há mais de {MESES_SEM_EMPRENHAR} meses).</span>
          <span className="acts">
            <button className="btn sm" onClick={() => { setAba('Vazia'); setSo6(true); setAberta(null); }}>Ver em Vazias</button>
            {onAbrirProdutividade && <button className="btn sm quiet" onClick={() => onAbrirProdutividade('seis')}>Produtividade</button>}
          </span>
        </div>
      )}
      {aba === 'Toque' && <Toque dados={dados} hoje={hoje} ownerMode={ownerMode} modoTeste={modoTeste} onGravarLote={onGravarLote} onMontarProtocolo={onMontarProtocolo} />}
      {aba !== 'Toque' && <section className="sheet">
        <label className="search">
          <Search />
          <input placeholder="Buscar pelo brinco da vaca ou da cria" aria-label="Buscar pelo brinco" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>

        <div className="bar-sum">
          {aba === 'Cheia' ? (
            <>
              <span className="late">{atrasadas} atrasadas</span>
              <span className="good">{porVir} por vir</span>
              {semPrev > 0 && <span className="mut">{semPrev} sem previsão</span>}
              {pendVac > 0 && <span className="late">{pendVac} com vacina pendente</span>}
            </>
          ) : (
            <>
              <span className="soon">{nVazias} vazias</span>
              {vaziasSemParto > 0 && <span className="mut">{vaziasSemParto} sem parto lançado</span>}
              {seisMeses > 0 && <button className={`pd-filtro${so6 ? ' on' : ''}`} aria-pressed={so6} onClick={() => setSo6(!so6)} data-testid="filtro-6meses">{so6 ? `mostrando ${seisMeses} com mais de 6 meses · ver todas` : `${seisMeses} com mais de 6 meses sem emprenhar`}</button>}
            </>
          )}
        </div>

        {vazias ? (
          <div className="led-h cols-reb">
            <span>Brinco</span><span>Categoria</span><span>Partos</span><span className="r">Crias</span>
          </div>
        ) : (
          <div className="led-h cols-cheia">
            <span>Brinco</span><span>Categoria</span><span>Partos</span><span className="r">Crias</span><span className="r">Previsão</span>
          </div>
        )}

        {linhas.length === 0 && (
          <div className="empty">{busca ? 'Nenhuma matriz com esse brinco aqui.' : `Nenhuma matriz ${aba === 'Cheia' ? 'cheia' : 'vazia'}.`}</div>
        )}

        {vazias && linhas.map((l) => {
          const m = l.matriz;
          const ps = partos.get(m.id) || [];
          const antes = parseInt(m.partosAnteriores, 10) || 0;
          const aberto = aberta === m.id;
          return (
            <React.Fragment key={m.id}>
              <button className="led-r cols-reb" aria-expanded={aberto} onClick={() => setAberta(aberto ? null : m.id)} data-testid={`vazia-${m.brinco}`}>
                <span className="b">{m.brinco}</span>
                <span className="two"><b>{m.categoria}</b><span>{[m.raca, m.lote].filter(Boolean).join(' · ') || '—'}</span>
                  <span className={`quebra${l.diasDesdeParto !== null && l.diasDesdeParto > DIAS_6_MESES ? ' late' : ''}`}>{l.diasDesdeParto === null ? 'sem parto lançado' : `último parto há ${l.diasDesdeParto} dias (${Math.round(l.diasDesdeParto / 30.44)} meses)`}</span>
                </span>
                <span className="reb-lista" data-testid="parto-datas">
                  {ps.length === 0 && !antes && <span className="mut">—</span>}
                  {ps.map((e) => <span key={e.id}>{formatarDataBR(e.data)}</span>)}
                  {antes > 0 && <span className="mut" title="Partos antes de entrar na fazenda">+{antes} antes</span>}
                </span>
                <span className="reb-lista r" data-testid="parto-crias">
                  {ps.length === 0 && !antes && <span className="mut">—</span>}
                  {ps.map((e) => <span key={e.id} className={e.resultadoParto === 'Natimorto' || !e.brincoBezerro ? 'mut' : ''}>{e.resultadoParto === 'Natimorto' ? 'natim.' : e.brincoBezerro || 's/ nº'}</span>)}
                  {antes > 0 && <span>&nbsp;</span>}
                </span>
              </button>
              {aberto && (
                <div className="detalhe" data-testid="vazia-detalhe">
                  {ps.length === 0 && !antes && <div>Nenhum parto lançado para esta vaca.</div>}
                  {ps.map((e) => <PartoDetalhe key={e.id} e={e} c={criaPorNasc.get(e.id)} hoje={hoje} />)}
                  {antes > 0 && <div className="mut" style={{ marginTop: 6 }}>Mais {antes} parto(s) antes de entrar na fazenda (sem data lançada).</div>}
                  <div style={{ marginTop: 10 }}><button className="btn sm quiet" onClick={() => abrir(`m:${m.id}`)}>Ficha completa</button></div>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {!vazias && linhas.map((l) => {
          const m = l.matriz;
          const dd = aba === 'Cheia' ? textoDias(l.dias) : { t: l.diasDesdeParto === null ? '—' : String(l.diasDesdeParto), c: 'mut' };
          const data = aba === 'Cheia' ? l.previsao : l.ultimoParto;
          const aberto = aberta === m.id;
          return (
            <React.Fragment key={m.id}>
              <button className="led-r cols-cheia" aria-expanded={aberto} onClick={() => setAberta(aberto ? null : m.id)} data-testid={`cheia-${m.brinco}`}>
                <span className="b">{m.brinco}</span>
                <span className="two"><b>{m.categoria}</b><span>{[m.raca, m.lote].filter(Boolean).join(' · ') || '—'}</span>
                  {aba === 'Cheia' && (() => { const v = vacinaDe(m); return v.pendente ? <span style={{ color: v.nivel === 'atrasada' ? 'var(--late)' : 'var(--amber)' }}>{v.reforco && v.reforco.atrasoDias ? 'Lepto atrasada' : !v.inicial ? 'vacina pendente' : 'reforço Lepto em breve'}</span> : null; })()}
                </span>
                {(() => {
                  // v11.0.3: partos e crias em colunas, como nas Vazias (data e brinco na mesma altura)
                  const ps = partos.get(m.id) || []; const antes = parseInt(m.partosAnteriores, 10) || 0;
                  return (
                    <>
                      <span className="reb-lista" data-testid="cheia-datas">
                        {ps.length === 0 && !antes && <span className="mut">—</span>}
                        {ps.map((e) => <span key={e.id}>{formatarDataBR(e.data)}</span>)}
                        {antes > 0 && <span className="mut" title="Partos antes de entrar na fazenda">+{antes} antes</span>}
                      </span>
                      <span className="reb-lista r" data-testid="cheia-crias">
                        {ps.length === 0 && !antes && <span className="mut">—</span>}
                        {ps.map((e) => <span key={e.id} className={e.resultadoParto === 'Natimorto' || !e.brincoBezerro ? 'mut' : ''}>{e.resultadoParto === 'Natimorto' ? 'natim.' : e.brincoBezerro || 's/ nº'}</span>)}
                        {antes > 0 && <span>&nbsp;</span>}
                      </span>
                    </>
                  );
                })()}
                <span className="prev-col r"><b className="m">{data ? formatarDataBR(data) : '—'}</b><span className={dd.c}>{dd.t}</span></span>
              </button>
              {aberto && (
                <div className="detalhe">
                  {aba === 'Cheia' && <div><Calculo info={l.info} /></div>}
                  {aba === 'Cheia' && <VacinaCheia key={m.id} m={m} sit={vacinaDe(m)} hoje={hoje} dados={dados} onGravarLote={onGravarLote} />}
                  {aba === 'Cheia' && (partos.get(m.id) || []).map((e) => <PartoDetalhe key={e.id} e={e} c={criaPorNasc.get(e.id)} hoje={hoje} />)}
                  {l.ultimoParto
                    ? <div>Último parto: <b>{formatarDataBR(l.ultimoParto)}</b>{l.numeroCria ? ` (cria ${l.numeroCria})` : ''}</div>
                    : <div>Nenhum parto lançado para esta vaca.</div>}
                  {aba === 'Cheia' && l.dias !== null && l.dias < 0 && <div className="late" style={{ marginTop: 4 }}>A data prevista já passou há {Math.abs(l.dias)} dia(s). Confira se ela já pariu.</div>}
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {aba === 'Cheia'
                      ? <button className="btn sm" onClick={() => onLancar('nascimento', m.id)}>Lançar nascimento desta vaca</button>
                      : null}
                    <button className="btn sm quiet" onClick={() => abrir(`m:${m.id}`)}>Ficha completa</button>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </section>}
      <p className="sub" style={{ marginTop: 14 }}>
        Dias negativos: a data prevista já passou. Confira se a vaca pariu e lance o nascimento. A previsão olha o histórico inteiro da vaca, não só o ano escolhido.
      </p>
    </div>
  );
}
