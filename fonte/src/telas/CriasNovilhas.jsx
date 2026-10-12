// Crias > Novilhas (proprietário): o lote de recria das fêmeas desmamadas. Mostra quem já passou do peso para virar matriz
// e deixa o proprietário decidir o destino de cada uma: virar matriz, ser vendida ou ficar "a definir".
import React, { useMemo, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { listarNovilhas, configCompleta, definirDestinoNovilha, formatarDataBR, DESTINOS_NOVILHA } from '../logica.js';
import { Kpis, Aviso, Modal, Lead } from '../ui.jsx';
import { fmtKg, fmtIdade, fmtGmd, fmtNum } from '../util.js';

const ROTULO_DESTINO = { 'A definir': 'A definir', Matriz: 'Virar matriz', Venda: 'Para venda' };
const FILTROS = [['aptas', 'Aptas'], ['todas', 'Todas'], ['A definir', 'A definir'], ['Matriz', 'Matriz'], ['Venda', 'Venda']];

function FichaNovilha({ n, cfg, onDestino, onVender, onFechar }) {
  const hist = [...n.pontos].reverse();
  const status = n.pesoAtual === null ? 'sem pesagem' : n.apta ? `apta (${fmtNum(cfg.pesoMatriz, 0)} kg ou mais)` : `faltam ${fmtNum(n.faltam, 1)} kg${n.diasParaApta ? ` · ~${n.diasParaApta} dias` : ''}`;
  return (
    <Modal titulo={`Novilha ${n.brinco}`} onClose={onFechar} rotulo={`Novilha ${n.brinco}`}>
      <Lead rotulo="Nascimento" valor={n.nascData ? `${formatarDataBR(n.nascData)} · ${fmtIdade(n.idadeDias)}` : '—'} />
      <Lead rotulo="Último peso" valor={n.pesoAtual === null ? 'sem pesagem' : `${fmtKg(n.pesoAtual)} em ${formatarDataBR(n.pesoData)}`} />
      <Lead rotulo="Ganho recente" valor={fmtGmd(n.gmd)} />
      <Lead rotulo="Para virar matriz" valor={status} cor={n.apta ? 'var(--green)' : undefined} />
      <Lead rotulo="Destino" valor={ROTULO_DESTINO[n.destino] || n.destino} />

      <h3 className="h2" style={{ fontSize: 18 }}>Pesagens<small>{n.pontos.length} registro(s)</small></h3>
      {hist.length === 0 ? <p className="sub">Nenhuma pesagem ainda.</p> : (
        <ul className="hist" data-testid="pesagens-novilha">
          {hist.map((p) => <li key={p.id}><span>{fmtKg(p.peso)}{p.fonte !== 'Pesagem' ? ` · ${p.fonte.toLowerCase()}` : ''}</span><span>{formatarDataBR(p.data)}</span></li>)}
        </ul>
      )}

      <div className="rapido" style={{ marginTop: 14 }}>
        <div className="lbl" style={{ font: '600 11.5px var(--mono)', letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--mut)', marginBottom: 8 }}>Destino desta novilha</div>
        <div className="seg" role="group" aria-label="Destino da novilha">
          {DESTINOS_NOVILHA.map((d) => (
            <button key={d} type="button" aria-pressed={n.destino === d} onClick={() => onDestino([n], d)}>{ROTULO_DESTINO[d]}</button>
          ))}
        </div>
      </div>
      <button className="btn wide" onClick={() => onVender([n.brinco])}><ShoppingCart size={18} /> Vender esta novilha</button>
    </Modal>
  );
}

export default function Novilhas({ dados, hoje, onSalvarMatriz, onVender }) {
  const cfg = useMemo(() => configCompleta(dados.config), [dados.config]);
  const lista = useMemo(() => listarNovilhas(dados, dados.config, hoje), [dados, hoje]);
  const [filtro, setFiltro] = useState('todas');
  const [marcadas, setMarcadas] = useState(() => new Set());
  const [aberta, setAberta] = useState(null); // matriz.id da ficha aberta
  const [msg, setMsg] = useState('');

  const aptas = lista.filter((n) => n.apta);
  const pesadas = lista.filter((n) => n.pesoAtual !== null);
  const pesoMedio = pesadas.length ? pesadas.reduce((s, n) => s + n.pesoAtual, 0) / pesadas.length : null;
  const semPeso = lista.length - pesadas.length;
  const mostradas = lista.filter((n) => (filtro === 'todas' ? true : filtro === 'aptas' ? n.apta : n.destino === filtro));
  const escolhidas = lista.filter((n) => marcadas.has(n.matriz.id));
  const fichaAberta = aberta ? lista.find((n) => n.matriz.id === aberta) || null : null;

  function alternar(id) {
    setMarcadas((s) => { const x = new Set(s); if (x.has(id)) x.delete(id); else x.add(id); return x; });
  }
  function marcarAptas() { setMarcadas(new Set(aptas.map((n) => n.matriz.id))); }

  function destinoPara(novilhas, destino) {
    const mudar = novilhas.filter((n) => n.destino !== destino);
    mudar.forEach((n) => onSalvarMatriz(definirDestinoNovilha(n.matriz, destino)));
    setMsg(mudar.length
      ? `${mudar.length} novilha(s) com destino "${ROTULO_DESTINO[destino]}": ${mudar.map((n) => n.brinco).join(', ')}.`
      : `Todas já estavam com o destino "${ROTULO_DESTINO[destino]}".`);
    setMarcadas(new Set());
  }

  function venderNovilhas(brincos) {
    setAberta(null);
    onVender(brincos.filter(Boolean));
  }

  return (
    <section className="sheet pad">
      <h2 className="h2" style={{ marginTop: 0 }}>Novilhas</h2>
      <p className="sub">Fêmeas desmamadas em recria. A partir de {fmtNum(cfg.pesoMatriz, 0)} kg a novilha está apta a virar matriz. Você decide o destino de cada uma. (Para mudar o peso de corte, use a aba Para vender.)</p>

      <Kpis itens={[
        { rotulo: 'Novilhas no lote', valor: lista.length, sub: `${semPeso} sem pesagem` },
        { rotulo: `Aptas (${fmtNum(cfg.pesoMatriz, 0)} kg ou mais)`, valor: aptas.length, cor: aptas.length ? 'var(--green)' : undefined },
        { rotulo: 'Peso médio', valor: pesoMedio === null ? '—' : fmtKg(pesoMedio), pequeno: true },
        { rotulo: 'Destino', valor: `${lista.filter((n) => n.destino === 'Matriz').length} matriz`, pequeno: true, sub: `${lista.filter((n) => n.destino === 'Venda').length} venda · ${lista.filter((n) => n.destino === 'A definir').length} a definir` },
      ]} />

      {lista.length === 0 && <Aviso tipo="info">Ainda não há novilhas no lote. Elas entram aqui quando uma fêmea é desmamada (aba Pesar, modo Desmama).</Aviso>}

      {lista.length > 0 && (
        <>
          <div className="seg" style={{ margin: '16px 0 10px', flexWrap: 'wrap' }} role="group" aria-label="Quais novilhas mostrar">
            {FILTROS.map(([id, rot]) => (
              <button key={id} type="button" aria-pressed={filtro === id} onClick={() => setFiltro(id)} style={{ minWidth: 86 }}>
                {rot} {id === 'aptas' ? aptas.length : id === 'todas' ? lista.length : lista.filter((n) => n.destino === id).length}
              </button>
            ))}
          </div>

          <div className="sheet" style={{ boxShadow: 'none', borderRadius: 8 }}>
            <div className="bar-sum"><span>{mostradas.length} novilha(s)</span><span>{escolhidas.length} marcada(s)</span></div>
            {mostradas.length === 0 && <div className="empty">Nenhuma novilha neste filtro.</div>}
            {mostradas.map((n) => {
              const status = n.pesoAtual === null ? 'sem pesagem' : n.apta ? 'apta para matriz' : `faltam ${fmtNum(n.faltam, 1)} kg${n.diasParaApta ? ` · ~${n.diasParaApta} dias` : ''}`;
              return (
                <div className="sel-row cols-nov" key={n.matriz.id}>
                  <input type="checkbox" className="chk" checked={marcadas.has(n.matriz.id)} onChange={() => alternar(n.matriz.id)} aria-label={`Marcar a novilha ${n.brinco}`} />
                  <button type="button" onClick={() => setAberta(n.matriz.id)} aria-label={`Abrir a novilha ${n.brinco}`}
                    style={{ background: 'transparent', border: 'none', textAlign: 'left', font: '600 17px var(--mono)', minHeight: 48, padding: 0, color: 'inherit' }}>{n.brinco}</button>
                  <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25, minWidth: 0 }}>
                    <b style={{ fontWeight: 600, fontSize: 15 }}>{fmtIdade(n.idadeDias)}</b>
                    <span style={{ color: n.apta ? 'var(--green)' : 'var(--mut)' }}>{ROTULO_DESTINO[n.destino] || n.destino} · {status}</span>
                  </span>
                  <span className="r" style={{ textAlign: 'right', font: '600 15px var(--mono)' }}>{n.pesoAtual === null ? '—' : fmtKg(n.pesoAtual)}</span>
                  <span className="hide-s"><span className={`pill ${n.apta ? 'pronto' : n.pesoAtual === null ? 'fora' : 'falta'}`}>{n.apta ? 'apta' : n.pesoAtual === null ? 'sem peso' : 'em ganho'}</span></span>
                  <span className="hide-s m mut">{fmtGmd(n.gmd)}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button type="button" className="btn quiet sm" onClick={marcarAptas} disabled={!aptas.length}>Marcar as aptas</button>
            <button type="button" className="btn quiet sm" onClick={() => setMarcadas(new Set())} disabled={!marcadas.size}>Limpar</button>
          </div>

          <div className="rapido" style={{ marginTop: 12 }}>
            <div className="lbl" style={{ font: '600 11.5px var(--mono)', letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--mut)', marginBottom: 8 }}>
              Destino das {escolhidas.length} marcada(s)
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DESTINOS_NOVILHA.map((d) => (
                <button key={d} type="button" className="btn quiet" disabled={!escolhidas.length} onClick={() => destinoPara(escolhidas, d)}>{ROTULO_DESTINO[d]}</button>
              ))}
              <button type="button" className="btn" disabled={!escolhidas.length} onClick={() => venderNovilhas(escolhidas.map((n) => n.brinco))}>
                <ShoppingCart size={18} /> Vender marcadas
              </button>
            </div>
          </div>
        </>
      )}

      {msg && <Aviso tipo="ok" onClose={() => setMsg('')}>{msg}</Aviso>}

      {fichaAberta && <FichaNovilha n={fichaAberta} cfg={cfg} onDestino={destinoPara} onVender={venderNovilhas} onFechar={() => setAberta(null)} />}
    </section>
  );
}
