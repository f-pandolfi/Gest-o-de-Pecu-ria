// Vacinas: pendências do calendário (reforço da Lepto, vacina reprodutiva, brucelose das bezerras e as que o dono criar),
// confirmação "Foi vacinada?" e vacinação no curral (lista desmarcada, marca quem tomou).
import React, { useMemo, useState } from 'react';
import { Syringe, FileDown, Loader2, Plus, Trash2, Save } from 'lucide-react';
import { formatarDataBR, listarCrias, noPlantel } from '../logica.js';
import {
  pendenciasVacinas, calendarioVacinas, manejoConfirmacaoVacina, relatorioVacinas, DIAS_MIN_POS_PARTO_PADRAO,
} from '../manejo.js';
import { Aviso } from '../ui.jsx';
import { baixarPDF } from '../pdfloader.js';
import ManejoCurral from './ManejoCurral.jsx';

const NIVEL = { atrasada: 'atrasada', pendente: 'pendente', futura: 'ok' };

function Calendario({ dados, onSalvarConfig, onFechar }) {
  const [regras, setRegras] = useState(() => calendarioVacinas(dados.config));
  const [diasMin, setDiasMin] = useState(String((dados.config || {}).diasMinPosParto || DIAS_MIN_POS_PARTO_PADRAO));
  const [ok, setOk] = useState('');
  const mudar = (i, k, v) => setRegras((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  function salvar() {
    onSalvarConfig({ calendarioVacinas: JSON.stringify(regras.filter((r) => String(r.nome || '').trim())), diasMinPosParto: parseInt(diasMin, 10) || DIAS_MIN_POS_PARTO_PADRAO });
    setOk('Calendário salvo.');
  }
  return (
    <section className="sheet pad" data-testid="calendario-vacinas">
      <h2 className="h2" style={{ marginTop: 0 }}>Calendário de vacinas</h2>
      {regras.map((r, i) => (
        <div key={r.id} style={{ borderBottom: '1px solid var(--line2)', padding: '10px 0' }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 600 }}>
            <input type="checkbox" checked={r.ativo !== false} onChange={(e) => mudar(i, 'ativo', e.target.checked)} style={{ width: 20, minHeight: 20 }} />
            {r.tipo === 'periodo' ? <input aria-label="Nome da vacina" value={r.nome} onChange={(e) => mudar(i, 'nome', e.target.value)} /> : r.nome}
          </label>
          <div className="sub" style={{ margin: '4px 0 0 28px' }}>
            {r.id === 'reprodutiva' && 'Matrizes: uma dose por ciclo (depois do parto). Vaca sem registro aparece para confirmar.'}
            {r.id === 'lepto' && <>Vaca cheia: reforço aos <input aria-label="Meses de prenhez" style={{ width: 60, minHeight: 34, display: 'inline-block' }} value={r.meses} onChange={(e) => mudar(i, 'meses', e.target.value)} /> meses de prenhez (obrigatório).</>}
            {r.tipo === 'idade' && <>Bezerras de <input aria-label="Idade mínima (meses)" style={{ width: 54, minHeight: 34, display: 'inline-block' }} value={r.idadeMin} onChange={(e) => mudar(i, 'idadeMin', e.target.value)} /> a <input aria-label="Idade máxima (meses)" style={{ width: 54, minHeight: 34, display: 'inline-block' }} value={r.idadeMax} onChange={(e) => mudar(i, 'idadeMax', e.target.value)} /> meses, uma vez na vida.</>}
            {r.tipo === 'periodo' && (
              <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
                Para <select aria-label="Para quem" value={r.publico} onChange={(e) => mudar(i, 'publico', e.target.value)} style={{ width: 'auto', minHeight: 36 }}>
                  <option value="matrizes">matrizes</option><option value="cheias">vacas cheias</option><option value="todos">todas as vacas e novilhas</option>
                </select>
                a cada <input aria-label="Intervalo em meses" style={{ width: 60, minHeight: 34 }} value={r.intervaloMeses} onChange={(e) => mudar(i, 'intervaloMeses', e.target.value)} /> meses
                <button type="button" className="x-peq" aria-label="Tirar esta vacina" onClick={() => setRegras((rs) => rs.filter((_, j) => j !== i))}><Trash2 size={16} /></button>
              </span>
            )}
          </div>
        </div>
      ))}
      <button type="button" className="btn quiet sm" style={{ marginTop: 10 }} onClick={() => setRegras((rs) => [...rs, { id: `v${Date.now()}`, nome: '', tipo: 'periodo', publico: 'matrizes', intervaloMeses: 12, ativo: true }])}><Plus size={15} /> Vacina periódica (ex.: clostridioses, raiva)</button>
      <div className="fld" style={{ marginTop: 14 }}>
        <label htmlFor="dias-min">Dias mínimos de parida para entrar no protocolo</label>
        <input id="dias-min" type="number" value={diasMin} onChange={(e) => setDiasMin(e.target.value)} />
      </div>
      {ok && <Aviso tipo="ok">{ok}</Aviso>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn" onClick={salvar}><Save size={17} /> Salvar calendário</button>
        <button className="btn quiet" onClick={onFechar}>Voltar</button>
      </div>
    </section>
  );
}

export default function Vacinas({ dados, hoje, ownerMode, modoTeste, onGravarLote, onSalvarConfig }) {
  const [vacinando, setVacinando] = useState(null); // { titulo, itens, aplicacoes }
  const [calendario, setCalendario] = useState(false);
  const [conf, setConf] = useState({}); // matrizId -> data da confirmação
  const [msg, setMsg] = useState('');
  const [pdf, setPdf] = useState(false);
  const [verFuturas, setVerFuturas] = useState(false);
  const pend = useMemo(() => pendenciasVacinas(dados, dados.config, hoje), [dados, hoje]);

  const grupos = useMemo(() => {
    const mp = new Map();
    pend.filter((p) => verFuturas || p.nivel !== 'futura').forEach((p) => { if (!mp.has(p.regra.id)) mp.set(p.regra.id, { regra: p.regra, itens: [] }); mp.get(p.regra.id).itens.push(p); });
    return [...mp.values()];
  }, [pend, verFuturas]);

  if (calendario && ownerMode) return <Calendario dados={dados} onSalvarConfig={onSalvarConfig} onFechar={() => setCalendario(false)} />;
  if (vacinando) {
    return <ManejoCurral key={vacinando.titulo} dados={dados} hoje={hoje} itensAvulsos={vacinando.itens} etapa="Vacinação" titulo={vacinando.titulo} aplicacoesIniciais={vacinando.aplicacoes} modoTeste={modoTeste} onGravarLote={onGravarLote} onVoltar={() => setVacinando(null)} />;
  }

  const tipoAplicacao = (regra) => (regra.id === 'reprodutiva' ? 'Vacina reprodutiva' : regra.id === 'lepto' ? 'Reforço Lepto' : regra.id === 'brucelose' ? 'Brucelose' : regra.nome);
  function vacinar(g) {
    setVacinando({
      titulo: `Vacinação: ${g.regra.nome}`,
      itens: g.itens.map((p) => ({ id: p.animalId, brinco: p.brinco, linha1: [p.tipo, p.mae ? `mãe ${p.mae}` : ''].filter(Boolean).join(' · '), linha2: p.situacao })),
      aplicacoes: [{ tipo: tipoAplicacao(g.regra), produto: '' }],
    });
  }
  function vacinacaoAvulsa() {
    const vacas = dados.matrizes.filter((m) => m.status !== 'Vendida' && m.status !== 'Morta' && (noPlantel(m) || m.categoria === 'Novilha'))
      .map((m) => ({ id: m.id, brinco: m.brinco, linha1: [m.categoria, m.lote].filter(Boolean).join(' · '), linha2: m.status }));
    const crias = listarCrias(dados, hoje).filter((c) => c.ativa && !c.novilha).map((c) => ({ id: `c:${c.id}`, brinco: c.brinco, linha1: c.sexo === 'Fêmea' ? 'Bezerra' : 'Bezerro', linha2: `mãe ${c.maeBrinco || '?'}` }));
    setVacinando({ titulo: 'Vacinação avulsa', itens: [...vacas, ...crias].sort((a, b) => String(a.brinco).localeCompare(String(b.brinco), 'pt-BR', { numeric: true })), aplicacoes: [] });
  }
  async function confirmar(p, foi) {
    if (!foi) { setConf((c) => ({ ...c, [p.animalId]: undefined })); setMsg(`Vaca ${p.brinco}: continua pendente. Vacine e registre em "Vacinar estes".`); return; }
    const data = conf[p.animalId] || hoje;
    const ev = manejoConfirmacaoVacina([p.animalId], data);
    const r = await onGravarLote({ estado: { ...dados, eventos: [...dados.eventos, ev] }, eventosParaGravar: [{ tipo: 'manejo', evento: ev }], matrizesParaGravar: [], tourosParaGravar: [] }, `vacina confirmada ${p.brinco}`);
    setMsg(r.ok ? `Vaca ${p.brinco}: vacina reprodutiva registrada em ${formatarDataBR(data)}.` : r.msg);
  }

  return (
    <section data-testid="tela-vacinas">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button className="btn sm" onClick={vacinacaoAvulsa}><Syringe size={15} /> Vacinação avulsa (escolher animais)</button>
        <button className="btn ghost sm" disabled={pdf} onClick={async () => { setPdf(true); try { await baixarPDF(relatorioVacinas(dados, dados.config, hoje)); } catch (e) { console.error(e); } setPdf(false); }}>{pdf ? <Loader2 size={15} className="spin" /> : <FileDown size={15} />} PDF das pendências</button>
        {ownerMode && <button className="btn quiet sm" onClick={() => setCalendario(true)}>Calendário de vacinas</button>}
        <button className="btn quiet sm" onClick={() => setVerFuturas((v) => !v)}>{verFuturas ? 'Só as de agora' : 'Ver também as próximas'}</button>
      </div>
      {msg && <Aviso tipo="ok" onClose={() => setMsg('')}>{msg}</Aviso>}
      {grupos.length === 0 && <div className="sheet"><div className="empty">Nenhuma vacina pendente agora.</div></div>}
      {grupos.map((g) => (
        <div className="grp-vac" key={g.regra.id} data-testid={`grupo-${g.regra.id}`}>
          <header>
            <b>{g.regra.nome}<span className="mut" style={{ fontSize: 13, fontWeight: 500 }}> · {g.itens.length} animal(is)</span></b>
            <button className="btn sm" onClick={() => vacinar(g)}><Syringe size={15} /> Vacinar estes</button>
          </header>
          {g.itens.map((p) => (
            <div key={`${g.regra.id}-${p.animalId}`} className="led-r" style={{ '--cols': '72px minmax(0,1fr)', minHeight: 54 }}>
              <span className="b">{p.brinco}</span>
              <span className="two">
                <b style={{ fontSize: 14 }}>{[p.tipo, p.status].filter(Boolean).join(' · ')}</b>
                <span className={`vac-tag ${NIVEL[p.nivel]}`} style={{ whiteSpace: 'normal' }}>{p.situacao}</span>
                {p.confirmar && (
                  <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 6, color: 'var(--tx)' }}>
                    Foi vacinada?
                    <input type="date" aria-label={`Data da vacina da ${p.brinco}`} value={conf[p.animalId] || hoje} onChange={(e) => setConf((c) => ({ ...c, [p.animalId]: e.target.value }))} style={{ width: 'auto', minHeight: 34 }} />
                    <button className="btn sm" style={{ minHeight: 34 }} onClick={() => confirmar(p, true)}>Sim</button>
                    <button className="btn quiet sm" style={{ minHeight: 34 }} onClick={() => confirmar(p, false)}>Não</button>
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
