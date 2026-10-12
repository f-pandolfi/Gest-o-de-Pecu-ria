// Crias > lista: todas as crias com sexo, idade, mãe, origem (IATF ou monta), peso e ganho. Toque na cria abre a ficha.
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Search, Scale, ShoppingCart } from 'lucide-react';
import {
  rotuloSituacao, formatarDataBR, numPeso, avisoDePeso, jaExiste, definirDestinoNovilha, DESTINOS_NOVILHA,
} from '../logica.js';
import { Modal, Lead, Aviso } from '../ui.jsx';
import { fmtKg, fmtIdade, fmtGmd } from '../util.js';

const NO_REBANHO = ['mamando', 'desmamado', 'novilha'];
const FILTROS_SIT = [
  ['rebanho', 'No rebanho'], ['mamando', 'Mamando'], ['desmamado', 'Desmamadas(os)'], ['novilha', 'Novilhas'],
  ['matriz', 'Viraram matriz'], ['vendido', 'Vendidas(os)'], ['todas', 'Todas'],
];
const ORDENS = [['nova', 'Mais novas primeiro'], ['velha', 'Mais velhas primeiro'], ['peso', 'Mais pesadas'], ['ganho', 'Maior ganho por dia'], ['brinco', 'Número do brinco']];

const corSituacao = (s) => (s === 'vendido' ? 'fora' : s === 'mamando' ? 'falta' : 'pronto');

function CriaFicha({ c, dados, hoje, ownerMode, onLancar, onVender, onSalvarMatriz, onFechar }) {
  const [peso, setPeso] = useState('');
  const [data, setData] = useState(hoje);
  const [confirma, setConfirma] = useState('');
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const [travado, setTravado] = useState(false);
  const [desmData, setDesmData] = useState(hoje);
  const [desmPeso, setDesmPeso] = useState('');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  function trava() {
    setTravado(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setTravado(false), 1500);
  }

  function registrar(forcar) {
    if (travado) return;
    const p = numPeso(peso);
    if (isNaN(p) || p <= 0) { setErro('Digite o peso em kg.'); setConfirma(''); return; }
    if (!data) { setErro('Escolha a data da pesagem.'); return; }
    setErro('');
    const form = { brinco: c.brinco, criaId: c.id, data, peso: p };
    if (c.novilha) form.matrizId = c.novilha.id;
    if (!forcar) {
      if (jaExiste('pesagem', form, dados)) { setConfirma('Esta cria já tem um peso lançado nesta data. Confira antes de lançar de novo.'); return; }
      const av = avisoDePeso(c.pontos, p, data);
      if (av) { setConfirma(av); return; }
    }
    setConfirma('');
    setMsg(onLancar('pesagem', form));
    setPeso('');
    trava();
  }

  function desmamar() {
    if (travado) return;
    const p = numPeso(desmPeso);
    if (!desmData) { setErro('Escolha a data da desmama.'); return; }
    setErro('');
    const form = { brincoBezerro: c.brinco, data: desmData };
    if (!isNaN(p) && p > 0) form.pesoDesmama = p;
    setMsg(onLancar('desmama', form));
    trava();
  }

  const podeDesmamar = ownerMode && c.situacao === 'mamando' && c.brinco;
  const hist = [...c.pontos].reverse();

  return (
    <Modal titulo={`Cria ${c.brinco || 'sem número'}`} onClose={onFechar} rotulo={`Cria ${c.brinco || 'sem número'}`}>
      <div style={{ marginBottom: 6 }}><span className={`pill ${corSituacao(c.situacao)}`}>{rotuloSituacao(c)}</span></div>
      <Lead rotulo="Sexo" valor={c.sexo || '—'} />
      <Lead rotulo="Nascimento" valor={`${formatarDataBR(c.nascData)} · ${fmtIdade(c.idadeDias)}`} />
      <Lead rotulo="Mãe" valor={c.maeBrinco || 'não informada'} />
      <Lead rotulo="Origem / pai" valor={c.origem.rotulo} />
      {c.origem.iatfData && <Lead rotulo="IATF da mãe" valor={formatarDataBR(c.origem.iatfData)} />}
      {c.pelagem && <Lead rotulo="Pelagem" valor={c.pelagem} />}
      <Lead rotulo="Último peso" valor={c.pesoAtual === null ? 'sem pesagem' : `${fmtKg(c.pesoAtual)} em ${formatarDataBR(c.pesoData)}`} />
      <Lead rotulo="Ganho recente" valor={fmtGmd(c.gmd)} />
      {c.desmamaData && <Lead rotulo="Desmama" valor={formatarDataBR(c.desmamaData)} />}
      {c.situacao === 'vendido' && <Lead rotulo="Baixa (venda)" valor={c.vendaData ? formatarDataBR(c.vendaData) : 'vendida'} />}

      <h3 className="h2" style={{ fontSize: 18 }}>Pesagens<small>{c.pontos.length} registro(s)</small></h3>
      {hist.length === 0 ? <p className="sub">Nenhuma pesagem ainda.</p> : (
        <ul className="hist" data-testid="pesagens">
          {hist.map((p) => <li key={p.id}><span>{fmtKg(p.peso)}{p.fonte !== 'Pesagem' ? ` · ${p.fonte.toLowerCase()}` : ''}</span><span>{formatarDataBR(p.data)}</span></li>)}
        </ul>
      )}

      {c.situacao !== 'vendido' && (
        <div className="rapido" style={{ marginTop: 14 }}>
          <div className="grid2">
            <div className="fld">
              <label htmlFor="ficha-peso">Peso (kg)</label>
              <input id="ficha-peso" type="number" inputMode="decimal" value={peso} onChange={(e) => { setPeso(e.target.value); setConfirma(''); setErro(''); }} onKeyDown={(e) => { if (e.key === 'Enter') registrar(false); }} />
            </div>
            <div className="fld">
              <label htmlFor="ficha-data">Data</label>
              <input id="ficha-data" type="date" value={data} onChange={(e) => { setData(e.target.value); setConfirma(''); }} />
            </div>
          </div>
          {confirma && (
            <Aviso tipo="info">
              {confirma}
              <div style={{ marginTop: 8 }}><button className="btn sm" onClick={() => registrar(true)} disabled={travado}>Lançar mesmo assim</button></div>
            </Aviso>
          )}
          <button className="btn wide" onClick={() => registrar(false)} disabled={travado}><Scale size={18} /> Registrar peso</button>
        </div>
      )}

      {erro && <Aviso>{erro}</Aviso>}
      {msg && <Aviso tipo="ok">{msg}</Aviso>}

      {podeDesmamar && (
        <div className="rapido">
          <div className="lbl" style={{ font: '600 11.5px var(--mono)', letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--mut)', marginBottom: 8 }}>Desmama (proprietário)</div>
          <div className="grid2">
            <div className="fld"><label htmlFor="desm-data">Data da desmama</label><input id="desm-data" type="date" value={desmData} onChange={(e) => setDesmData(e.target.value)} /></div>
            <div className="fld"><label htmlFor="desm-peso">Peso na desmama (kg)</label><input id="desm-peso" type="number" inputMode="decimal" value={desmPeso} onChange={(e) => setDesmPeso(e.target.value)} /></div>
          </div>
          <button className="btn quiet wide" onClick={desmamar} disabled={travado}>Desmamar{c.sexo === 'Fêmea' ? ' e levar para as novilhas' : ''}</button>
        </div>
      )}
      {ownerMode && c.situacao === 'mamando' && !c.brinco && (
        <p className="sub">Para desmamar esta cria, primeiro ela precisa de um número (brinco) no lançamento do nascimento.</p>
      )}

      {ownerMode && c.novilha && c.situacao !== 'vendido' && (
        <div className="rapido">
          <div className="lbl" style={{ font: '600 11.5px var(--mono)', letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--mut)', marginBottom: 8 }}>Destino da novilha</div>
          <div className="seg" role="group" aria-label="Destino da novilha">
            {DESTINOS_NOVILHA.map((d) => (
              <button key={d} aria-pressed={c.novilha.destino === d} onClick={() => onSalvarMatriz(definirDestinoNovilha(c.novilha, d))}>{d}</button>
            ))}
          </div>
        </div>
      )}

      {ownerMode && c.situacao !== 'vendido' && c.situacao !== 'matriz' && (
        <button className="btn ghost wide" style={{ marginTop: 8 }} onClick={() => { onFechar(); onVender([c.brinco]); }} disabled={!c.brinco}>
          <ShoppingCart size={18} /> Vender {c.sexo === 'Fêmea' ? 'esta cria' : 'este animal'}
        </button>
      )}
    </Modal>
  );
}

export default function ListaCrias({ crias, dados, hoje, ownerMode, onLancar, onVender, onSalvarMatriz }) {
  const [sexo, setSexo] = useState('todos');
  const [sit, setSit] = useState('rebanho');
  const [busca, setBusca] = useState('');
  const [ordem, setOrdem] = useState('nova');
  const [aberta, setAberta] = useState(null);

  const porSituacao = useMemo(() => crias.filter((c) => (sit === 'todas' ? true : sit === 'rebanho' ? NO_REBANHO.includes(c.situacao) : c.situacao === sit)), [crias, sit]);
  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const l = porSituacao
      .filter((c) => sexo === 'todos' || c.sexo === sexo)
      .filter((c) => !q || String(c.brinco).toLowerCase().includes(q) || String(c.maeBrinco).toLowerCase().includes(q));
    const brincoCmp = (a, b) => String(a.brinco).localeCompare(String(b.brinco), 'pt-BR', { numeric: true });
    const ord = {
      nova: (a, b) => (b.nascData || '').localeCompare(a.nascData || '') || brincoCmp(a, b),
      velha: (a, b) => (a.nascData || '').localeCompare(b.nascData || '') || brincoCmp(a, b),
      peso: (a, b) => (b.pesoAtual ?? -1) - (a.pesoAtual ?? -1) || brincoCmp(a, b),
      ganho: (a, b) => (b.gmd ?? -99) - (a.gmd ?? -99) || brincoCmp(a, b),
      brinco: brincoCmp,
    }[ordem];
    return l.slice().sort(ord);
  }, [porSituacao, sexo, busca, ordem]);

  const conta = (sx) => porSituacao.filter((c) => sx === 'todos' || c.sexo === sx).length;
  const ficha = aberta ? crias.find((c) => c.id === aberta) : null;
  const semPeso = lista.filter((c) => c.ativa && c.pesoAtual === null).length;

  return (
    <section className="sheet">
      <label className="search">
        <Search />
        <input placeholder="Buscar pelo brinco da cria ou da mãe" aria-label="Buscar cria" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </label>
      <div className="filtros">
        <div className="seg" role="group" aria-label="Filtrar por sexo">
          {[['todos', 'Todas'], ['Macho', 'Machos'], ['Fêmea', 'Fêmeas']].map(([id, rot]) => (
            <button key={id} aria-pressed={sexo === id} onClick={() => setSexo(id)}>{rot} {conta(id)}</button>
          ))}
        </div>
      </div>
      <div className="filtros">
        <select aria-label="Situação" value={sit} onChange={(e) => setSit(e.target.value)}>
          {FILTROS_SIT.map(([id, rot]) => <option key={id} value={id}>{rot}</option>)}
        </select>
        <select aria-label="Ordem" value={ordem} onChange={(e) => setOrdem(e.target.value)}>
          {ORDENS.map(([id, rot]) => <option key={id} value={id}>{rot}</option>)}
        </select>
      </div>
      <div className="bar-sum">
        <span>{lista.length} cria(s)</span>
        <span>{semPeso} sem pesagem</span>
      </div>
      <div className="led-h cols-cria">
        <span>Brinco</span><span>Cria · mãe · origem</span><span className="r">Peso</span>
        <span className="hide-s">Situação</span><span className="hide-s">Pesada em</span>
      </div>
      {lista.length === 0 && <div className="empty">Nenhuma cria neste filtro.</div>}
      {lista.map((c) => (
        <button key={c.id} className="led-r cols-cria" onClick={() => setAberta(c.id)} aria-label={`Abrir cria ${c.brinco || 'sem número'}`}>
          <span className="b">{c.brinco || '—'}</span>
          <span className="two">
            <b>{c.sexo || 'Sexo ?'} · {fmtIdade(c.idadeDias)}</b>
            <span>mãe {c.maeBrinco || '?'} · {c.origem.rotulo}</span>
          </span>
          <span className="r">
            {c.pesoAtual === null ? <span className="mut">—</span> : fmtKg(c.pesoAtual)}
            {c.gmd !== null && <div style={{ font: '500 11.5px var(--body)', color: 'var(--mut)' }}>{fmtGmd(c.gmd)}</div>}
          </span>
          <span className="hide-s"><span className={`pill ${corSituacao(c.situacao)}`}>{rotuloSituacao(c)}</span></span>
          <span className="hide-s m mut">{c.pesoData ? formatarDataBR(c.pesoData) : '—'}</span>
        </button>
      ))}
      {ficha && (
        <CriaFicha key={ficha.id} c={ficha} dados={dados} hoje={hoje} ownerMode={ownerMode} onLancar={onLancar} onVender={onVender} onSalvarMatriz={onSalvarMatriz} onFechar={() => setAberta(null)} />
      )}
    </section>
  );
}
