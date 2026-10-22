// Conferência da pesagem de uma data (tela Pesar): quem ficou SEM PESO x os SEM BRINCO com peso, e os pesados 2x.
// Tocar num sem brinco e escolher um dos que ficaram sem peso liga aquele peso ao animal (dá baixa nas duas listas).
import React, { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { formatarDataBR } from '../logica.js';
import { conferenciaPesagem, identificarSemBrinco, virarSemBrinco } from '../pesagemConferencia.js';
import { Aviso } from '../ui.jsx';
import { fmtKg } from '../util.js';

export default function ConferenciaPesagem({ dados, data, hoje, onCorrigirPesagem }) {
  const [sexo, setSexo] = useState(null); // null = automático (o sexo dos pesados no dia)
  const [aberto, setAberto] = useState(null); // id da pesagem sem brinco aberta
  const [escolha, setEscolha] = useState('');
  const [msg, setMsg] = useState(null); // { tipo, texto }
  const conf = useMemo(() => conferenciaPesagem(dados, data, hoje, sexo === null ? {} : { sexo }), [dados, data, hoje, sexo]);

  function aplicar(r, rotulo, texto) {
    if (r.erro) { setMsg({ tipo: 'erro', texto: r.erro }); return; }
    const res = onCorrigirPesagem ? onCorrigirPesagem(r.mudancas, rotulo) : 'Não foi possível gravar agora.';
    if (typeof res === 'string' && res) { setMsg({ tipo: 'erro', texto: res }); return; }
    setMsg({ tipo: 'ok', texto });
    setAberto(null); setEscolha('');
  }
  function identificar(sb) {
    if (!escolha) { setMsg({ tipo: 'erro', texto: 'Escolha qual animal é.' }); return; }
    const r = identificarSemBrinco(dados, sb.id, escolha);
    aplicar(r, `sem brinco identificado: ${r.brinco || ''}`, `Pronto: ${fmtKg(sb.peso)} agora é do ${r.brinco}. Saiu das duas listas.`);
  }
  function outroAnimal(p, brinco) {
    const r = virarSemBrinco(dados, p.id);
    aplicar(r, `peso repetido do ${brinco} virou sem brinco`, `O peso ${fmtKg(p.peso)} saiu do ${brinco} e foi para os sem brinco (anotado como ${brinco}).`);
  }

  const sexoAtual = sexo === null ? conf.sexo : sexo;
  if (!conf.semBrinco.length && !conf.repetidos.length && !conf.naoPesados.length) return null;
  return (
    <section className="sheet pad conf-pes" data-testid="conferencia-pesagem" style={{ marginTop: 14 }}>
      <h3 className="h2" style={{ marginTop: 0, fontSize: 19 }}>Conferência de {formatarDataBR(data)}</h3>
      <p className="sub" style={{ marginTop: 0 }}>Os sem brinco ficam aqui até alguém dizer de quem é o peso. Toque no sem brinco e escolha entre os que ficaram sem peso.</p>
      <div className="pills" role="group" aria-label="Sexo na conferência">
        {[['Macho', 'Machos'], ['Fêmea', 'Fêmeas'], ['', 'Todos']].map(([v, r]) => (
          <button key={r} type="button" aria-pressed={sexoAtual === v} onClick={() => setSexo(v)}>{r}</button>
        ))}
      </div>
      {msg && <Aviso tipo={msg.tipo === 'ok' ? 'ok' : undefined} onClose={() => setMsg(null)}>{msg.texto}</Aviso>}

      <div className="conf-pes-cols">
        <div data-testid="lista-sem-brinco">
          <div className="conf-pes-tit late">Sem brinco com peso · {conf.semBrinco.length}</div>
          {conf.semBrinco.length === 0 && <p className="sub" style={{ margin: '4px 0' }}>Nenhum.</p>}
          {conf.semBrinco.map((sb) => (
            <div key={sb.id} className={`sb-item${aberto === sb.id ? ' on' : ''}`}>
              <button type="button" className="sb-bt" onClick={() => { setAberto(aberto === sb.id ? null : sb.id); setEscolha(''); setMsg(null); }} aria-label={`Sem brinco de ${sb.peso} kg`}>
                <b>{fmtKg(sb.peso)}</b><span>{sb.sinal || 'sem sinal'}</span>
              </button>
              {aberto === sb.id && (
                <div className="sb-escolha">
                  <select aria-label="Qual animal é" value={escolha} onChange={(e) => setEscolha(e.target.value)}>
                    <option value="">Qual destes é?</option>
                    {conf.naoPesados.map((n) => (
                      <option key={n.criaId} value={n.criaId}>{n.brinco} · {n.idade}{n.maeBrinco ? ` · mãe ${n.maeBrinco}` : ''}{n.ultimoPeso ? ` · últ. ${n.ultimoPeso} kg` : ''}</option>
                    ))}
                  </select>
                  <button type="button" className="btn sm" onClick={() => identificar(sb)}><Check size={15} /> Confirmar</button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div data-testid="lista-nao-pesados">
          <div className="conf-pes-tit">Ficaram sem peso · {conf.naoPesados.length}</div>
          {conf.naoPesados.length === 0 && <p className="sub" style={{ margin: '4px 0' }}>Todos pesados.</p>}
          <div className="np-chips">
            {conf.naoPesados.map((n) => <span key={n.criaId} className="np-chip" title={`${n.idade}${n.maeBrinco ? ` · mãe ${n.maeBrinco}` : ''}`}><b>{n.brinco}</b> {n.idade}</span>)}
          </div>
        </div>
      </div>

      {conf.repetidos.length > 0 && (
        <div data-testid="lista-repetidos" style={{ marginTop: 12 }}>
          <div className="conf-pes-tit" style={{ color: 'var(--amber)' }}>Pesados 2x nesta data · {conf.repetidos.length}</div>
          {conf.repetidos.map((g) => (
            <div key={g.brinco} className="rep-lin">
              <b>{g.brinco}</b>
              {g.pesagens.map((p) => (
                <span key={p.id} className="rep-peso">{fmtKg(p.peso)}
                  <button type="button" className="btn quiet sm" onClick={() => outroAnimal(p, g.brinco)} aria-label={`${fmtKg(p.peso)} do ${g.brinco} é de outro animal`}><X size={14} /> outro animal</button>
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
