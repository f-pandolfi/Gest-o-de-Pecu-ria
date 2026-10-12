// Crias > Vendas (proprietário): venda por peso. Comprador e valor do kg no alto; embaixo, uma linha por animal
// (número, tipo de animal e peso). Serve para bezerros, novilhas e também para vacas de descarte ou vacas velhas.
// Ao confirmar, cada animal vendido sai do rebanho (baixa).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, ShoppingCart, Loader2, ChevronDown, ChevronUp, Scale } from 'lucide-react';
import {
  TIPOS_ANIMAL_VENDA, infoAnimalVenda, validarVenda, totaisVenda, listarVendas, numPeso, formatarDataBR,
} from '../logica.js';
import { Aviso, Modal } from '../ui.jsx';
import { fmtKg, fmtBRL } from '../util.js';

let contador = 0;
const novaLinha = (extra) => ({ k: `l${Date.now()}-${++contador}`, brinco: '', tipoAnimal: '', peso: '', tipoManual: false, ...extra });

// Fica fora do componente principal de propósito: se fosse declarada dentro, a cada tecla digitada
// o React a trataria como outra tela, recriaria os campos e o foco do teclado se perderia.
function LinhaVenda({ n, linha, dados, hoje, crias, onMudar, onTirar, onEnterPeso }) {
  const info = useMemo(
    () => (linha.brinco.trim() ? infoAnimalVenda(dados, linha.brinco, hoje, crias) : null),
    [linha.brinco, dados, hoje, crias],
  );
  const ruim = info && (!info.achado || info.jaVendido);
  let texto = '';
  if (info && info.achado && !info.jaVendido) {
    texto = `${info.descricao}${info.pesoUltimo ? ` · último peso ${fmtKg(info.pesoUltimo)} em ${formatarDataBR(info.pesoData)}` : ' · sem pesagem'}`;
  } else if (info && info.achado && info.jaVendido) {
    texto = `Este animal já foi vendido${info.vendidoEm ? ` em ${formatarDataBR(info.vendidoEm)}` : ''}.`;
  } else if (info && linha.brinco.trim().length >= 3) {
    texto = 'Número não encontrado no sistema: a venda é registrada, mas sem dar baixa em ninguém.';
  }
  return (
    <div className="vlin" data-testid="linha-venda">
      <div className="l1">
        <div className="fld f-b">
          <label htmlFor={`v-b-${linha.k}`}>Número {n}</label>
          <input
            id={`v-b-${linha.k}`} type="text" inputMode="numeric" autoComplete="off" autoFocus={!!linha.auto} value={linha.brinco}
            onChange={(e) => onMudar(linha.k, 'brinco', e.target.value)}
          />
        </div>
        <div className="fld f-p">
          <label htmlFor={`v-p-${linha.k}`}>Peso (kg) {n}</label>
          <input
            id={`v-p-${linha.k}`} type="text" inputMode="decimal" autoComplete="off" value={linha.peso}
            placeholder={info && info.achado && info.pesoUltimo ? String(info.pesoUltimo).replace('.', ',') : ''}
            onChange={(e) => onMudar(linha.k, 'peso', e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onEnterPeso(linha.k); } }}
          />
        </div>
        <button type="button" className="x-peq f-x" onClick={() => onTirar(linha.k)} aria-label={`Tirar a linha ${n}`}><Trash2 size={17} /></button>
      </div>
      <div className="l2">
        <div className="fld f-t">
          <label htmlFor={`v-t-${linha.k}`}>Tipo de animal {n}</label>
          <select id={`v-t-${linha.k}`} value={linha.tipoAnimal} onChange={(e) => onMudar(linha.k, 'tipoAnimal', e.target.value)}>
            <option value="">Escolha o tipo</option>
            {TIPOS_ANIMAL_VENDA.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      {texto && <div className={`info${ruim ? ' ruim' : ''}`}>{texto}</div>}
    </div>
  );
}

function Historico({ dados }) {
  const vendas = useMemo(() => listarVendas(dados), [dados]);
  const [abertas, setAbertas] = useState(() => new Set());
  const alternar = (id) => setAbertas((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  if (!vendas.length) return <div className="empty">Nenhuma venda registrada ainda.</div>;
  return (
    <div className="sheet" data-testid="historico-vendas">
      {vendas.map(({ venda, itens }) => {
        const aberta = abertas.has(venda.id);
        const Seta = aberta ? ChevronUp : ChevronDown;
        return (
          <div className="venda-hist" key={venda.id}>
            <button type="button" onClick={() => alternar(venda.id)} aria-expanded={aberta}>
              <span className="m mut" style={{ fontSize: 13 }}>{formatarDataBR(venda.data)}</span>
              <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25, minWidth: 0 }}>
                <b style={{ fontWeight: 600, fontSize: 15 }}>{venda.comprador || 'Sem comprador'}</b>
                <span style={{ fontSize: 13, color: 'var(--mut)' }}>{venda.animais || `${venda.qtd || '?'} animais`}{venda.pesoTotal ? ` · ${fmtKg(Number(venda.pesoTotal))}` : ''}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 15px var(--mono)' }}>
                {venda.valorTotal ? fmtBRL(Number(venda.valorTotal)) : '—'} <Seta size={16} />
              </span>
            </button>
            {aberta && (
              <div className="itens">
                {itens.length === 0 ? <p className="sub" style={{ margin: 0 }}>Venda antiga, sem a lista de animais.</p> : itens.map((i) => (
                  <div className="item-lin" key={i.id}>
                    <div className="t"><b>{i.brinco || 'sem número'}</b><span>{i.tipoAnimal}</span></div>
                    <div className="p">{fmtKg(Number(i.peso))}</div>
                  </div>
                ))}
                {venda.valorKg ? <p className="sub" style={{ margin: '8px 0 0' }}>Valor do kg: {fmtBRL(Number(venda.valorKg))}{venda.frete ? ` · frete ${fmtBRL(Number(venda.frete))}` : ''}</p> : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Vendas({ dados, hoje, crias, preset, onVender, modoTeste }) {
  const [data, setData] = useState(hoje);
  const [comprador, setComprador] = useState('');
  const [valorKg, setValorKg] = useState('');
  const [frete, setFrete] = useState('');
  const [linhas, setLinhas] = useState(() => [novaLinha()]);
  const [erros, setErros] = useState([]);
  const [confirmando, setConfirmando] = useState(null); // { form, tot, avisos }
  const [gravando, setGravando] = useState(false);
  const [erroGravar, setErroGravar] = useState('');
  const [resultado, setResultado] = useState('');
  const [travado, setTravado] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  // Vindo de "Para vender", "Novilhas" ou da ficha da cria: entram as linhas dos animais escolhidos
  useEffect(() => {
    if (!preset || !preset.brincos || !preset.brincos.length) return;
    setLinhas((atuais) => {
      const comConteudo = atuais.filter((l) => l.brinco.trim() || l.peso.trim());
      const ja = new Set(comConteudo.map((l) => l.brinco.trim()));
      const novas = preset.brincos.filter((b) => !ja.has(String(b).trim())).map((b) => {
        const info = infoAnimalVenda(dados, b, hoje, crias);
        return novaLinha({ brinco: String(b).trim(), tipoAnimal: info.achado && !info.jaVendido ? info.tipoSugerido : '' });
      });
      const todas = [...comConteudo, ...novas];
      return todas.length ? todas : [novaLinha()];
    });
    setErros([]); setResultado('');
  }, [preset && preset.n]); // eslint-disable-line react-hooks/exhaustive-deps

  function mudarLinha(k, campo, valor) {
    setLinhas((ls) => ls.map((l) => {
      if (l.k !== k) return l;
      const nova = { ...l, [campo]: valor };
      if (campo === 'tipoAnimal') nova.tipoManual = true;
      if (campo === 'brinco' && !l.tipoManual) {
        const info = valor.trim() ? infoAnimalVenda(dados, valor, hoje, crias) : null;
        nova.tipoAnimal = info && info.achado && !info.jaVendido ? info.tipoSugerido : '';
      }
      return nova;
    }));
    setErros([]); setResultado('');
  }
  function tirarLinha(k) {
    setLinhas((ls) => { const r = ls.filter((l) => l.k !== k); return r.length ? r : [novaLinha()]; });
  }
  function adicionarLinha() { setLinhas((ls) => [...ls, novaLinha({ auto: true })]); }
  function enterNoPeso(k) {
    setLinhas((ls) => {
      const ultima = ls[ls.length - 1];
      if (ultima && ultima.k === k && ultima.peso.trim()) return [...ls, novaLinha({ auto: true })];
      return ls;
    });
  }
  function preencherPesos() {
    setLinhas((ls) => ls.map((l) => {
      if (l.peso.trim() || !l.brinco.trim()) return l;
      const info = infoAnimalVenda(dados, l.brinco, hoje, crias);
      return info.achado && info.pesoUltimo ? { ...l, peso: String(info.pesoUltimo).replace('.', ',') } : l;
    }));
    setErros([]);
  }

  const itensForm = linhas.map((l) => ({ brinco: l.brinco, tipoAnimal: l.tipoAnimal, peso: l.peso }));
  const tot = useMemo(() => totaisVenda(itensForm, valorKg, frete), [linhas, valorKg, frete]); // eslint-disable-line react-hooks/exhaustive-deps
  const semPeso = linhas.filter((l) => l.brinco.trim() && !l.peso.trim()).length;

  function conferir() {
    if (travado || gravando) return;
    setResultado(''); setErroGravar('');
    const form = { data, comprador, valorKg, frete, itens: itensForm };
    const v = validarVenda(dados, form, hoje);
    if (v.erros.length) { setErros(v.erros); return; }
    setErros([]);
    setConfirmando({ form, tot: totaisVenda(v.linhas.map((l) => ({ tipoAnimal: l.tipoAnimal, peso: l.peso })), valorKg, frete), avisos: v.avisos });
  }

  async function confirmar() {
    if (gravando || !confirmando) return;
    setGravando(true); setErroGravar('');
    const r = await onVender(confirmando.form);
    setGravando(false);
    if (!r.ok) { setErroGravar(r.msg); return; }
    setConfirmando(null);
    setResultado(r.msg);
    setLinhas([novaLinha()]); setComprador(''); setValorKg(''); setFrete('');
    setTravado(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setTravado(false), 1500);
  }

  return (
    <section className="sheet pad">
      <h2 className="h2" style={{ marginTop: 0 }}>Vender por peso</h2>
      <p className="sub">Informe o comprador e o valor do kg. Embaixo, uma linha para cada animal: o número, o tipo e o peso. Pode vender também vacas de descarte e vacas velhas. Cada animal vendido sai do rebanho.</p>

      <div className="grid2">
        <div className="fld"><label htmlFor="venda-data">Data da venda</label><input id="venda-data" type="date" value={data} onChange={(e) => { setData(e.target.value); setErros([]); }} /></div>
        <div className="fld"><label htmlFor="venda-comprador">Comprador</label><input id="venda-comprador" type="text" autoComplete="off" value={comprador} onChange={(e) => { setComprador(e.target.value); setErros([]); }} /></div>
        <div className="fld"><label htmlFor="venda-valor">Valor do kg (R$)</label><input id="venda-valor" type="text" inputMode="decimal" autoComplete="off" value={valorKg} onChange={(e) => { setValorKg(e.target.value); setErros([]); }} placeholder="ex.: 12,50" /></div>
        <div className="fld"><label htmlFor="venda-frete">Frete (R$, se houver)</label><input id="venda-frete" type="text" inputMode="decimal" autoComplete="off" value={frete} onChange={(e) => setFrete(e.target.value)} /></div>
      </div>

      <h3 className="h2" style={{ fontSize: 18 }}>Animais da venda<small>{tot.qtd} com peso</small></h3>
      {linhas.map((l, i) => (
        <LinhaVenda key={l.k} n={i + 1} linha={l} dados={dados} hoje={hoje} crias={crias} onMudar={mudarLinha} onTirar={tirarLinha} onEnterPeso={enterNoPeso} />
      ))}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn quiet" onClick={adicionarLinha}><Plus size={18} /> Adicionar animal</button>
        {semPeso > 0 && <button type="button" className="btn quiet" onClick={preencherPesos}><Scale size={18} /> Usar o último peso dos {semPeso} sem peso</button>}
      </div>

      <div className="totais" data-testid="totais-venda">
        <div className="grande">{tot.valor > 0 ? fmtBRL(tot.valor) : 'R$ —'}</div>
        <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>
          <b>{tot.qtd}</b> animal(is) · <b>{fmtKg(tot.kg)}</b>{tot.qtd ? ` (média ${fmtKg(tot.kgMedio)})` : ''}
          {tot.frete > 0 && <> · frete {fmtBRL(tot.frete)} · líquido <b>{fmtBRL(tot.liquido)}</b></>}
        </div>
        {tot.porTipo.length > 0 && <div style={{ fontSize: 13.5, color: 'var(--mut)', marginTop: 4 }}>{tot.porTipo.map((t) => `${t.qtd} ${t.tipo} (${fmtKg(t.kg)})`).join(' · ')}</div>}
      </div>

      {erros.length > 0 && (
        <Aviso>
          Falta ajustar:
          <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>{erros.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </Aviso>
      )}
      {resultado && <Aviso tipo="ok">{resultado}{modoTeste ? ' (modo teste: só na tela, nada foi para a planilha)' : ''}</Aviso>}

      <button className="btn wide" onClick={conferir} disabled={travado || gravando}>
        <ShoppingCart size={18} /> Conferir e vender
      </button>

      <h3 className="h2" style={{ fontSize: 18, marginTop: 28 }}>Vendas anteriores</h3>
      <Historico dados={dados} />

      {confirmando && (
        <Modal titulo="Confirmar a venda" onClose={() => { if (!gravando) { setConfirmando(null); setErroGravar(''); } }}>
          <div data-testid="confirmar-venda">
            <p style={{ margin: '0 0 6px', fontSize: 15.5, lineHeight: 1.5 }}>
              <b>{confirmando.tot.qtd}</b> animal(is) para <b>{confirmando.form.comprador.trim()}</b> em {formatarDataBR(confirmando.form.data)}.
            </p>
            <div className="totais" style={{ marginTop: 6 }}>
              <div className="grande">{fmtBRL(confirmando.tot.valor)}</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>
                {fmtKg(confirmando.tot.kg)} (média {fmtKg(confirmando.tot.kgMedio)}) a {fmtBRL(numPeso(confirmando.form.valorKg))} o kg
                {confirmando.tot.frete > 0 && <> · frete {fmtBRL(confirmando.tot.frete)} · líquido {fmtBRL(confirmando.tot.liquido)}</>}
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--mut)', marginTop: 4 }}>{confirmando.tot.porTipo.map((t) => `${t.qtd} ${t.tipo}`).join(' · ')}</div>
            </div>
            {confirmando.avisos.length > 0 && (
              <Aviso tipo="info"><ul style={{ margin: 0, paddingLeft: 18 }}>{confirmando.avisos.map((t, i) => <li key={i}>{t}</li>)}</ul></Aviso>
            )}
            <p className="sub">Os animais com número cadastrado saem do rebanho ao confirmar.</p>
            {erroGravar && <Aviso>{erroGravar}</Aviso>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn" onClick={confirmar} disabled={gravando}>
                {gravando ? <Loader2 size={18} className="spin" /> : <ShoppingCart size={18} />} {gravando ? 'Gravando...' : 'Confirmar venda'}
              </button>
              <button className="btn quiet" onClick={() => { setConfirmando(null); setErroGravar(''); }} disabled={gravando}>Voltar</button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
