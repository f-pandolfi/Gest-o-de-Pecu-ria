// Morte de animais: ficha de lançamento (funcionário e proprietário), lista das mortes lançadas e correção (só proprietário).
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Save, Loader2, Undo2 } from 'lucide-react';
import {
  CAMPOS, infoAnimalMorte, validarMorte, listarMortes, formatarDataBR,
} from '../logica.js';
import { Aviso, Campo, Modal, Lead } from '../ui.jsx';

const campoDef = (k) => CAMPOS.morte.find((c) => c.key === k);
const inicial = (brinco, hoje) => ({ brinco: brinco || '', data: hoje, causa: '', tipoAnimal: '', observacoes: '' });

// Ficha "Morte". onRegistrar(form) devolve Promise<{ ok, msg }>. brincoFixo: abre já com o animal escolhido (ficha da cria).
export function FormMorte({ dados, hoje, brincoFixo, onRegistrar, modoTeste, aoTerminar }) {
  const [form, setForm] = useState(() => inicial(brincoFixo, hoje));
  const [erro, setErro] = useState('');
  const [confirmar, setConfirmar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState('');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const info = useMemo(() => infoAnimalMorte(dados, form.brinco), [dados, form.brinco]);
  const temBrinco = !!form.brinco.trim();

  function mudar(chave, valor) {
    setForm((f) => ({ ...f, [chave]: valor }));
    setErro(''); setConfirmar(false); setMsg('');
  }

  async function salvar(confirmado) {
    if (salvando) return;
    const f = { ...form, brinco: form.brinco.trim(), tipoAnimal: info.achado ? '' : form.tipoAnimal };
    const v = validarMorte(dados, f, hoje);
    if (v.erros.length) { setErro(v.erros.join(' ')); setConfirmar(false); return; }
    if (info.matriz && !confirmado) { setConfirmar(true); setErro(''); return; }
    setErro(''); setConfirmar(false); setSalvando(true);
    const r = await onRegistrar(f);
    setSalvando(false);
    if (!r.ok) { setErro(r.msg); return; }
    setMsg(r.msg);
    setForm(inicial(brincoFixo, hoje));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(''), 12000);
    if (aoTerminar) aoTerminar(r);
  }

  return (
    <div>
      <div className="fld">
        <label htmlFor="morte-brinco">Brinco do animal</label>
        <input
          id="morte-brinco" type="text" autoComplete="off" autoCapitalize="off" disabled={!!brincoFixo}
          value={form.brinco} onChange={(e) => mudar('brinco', e.target.value)}
          placeholder="Digite o número do brinco (cria, novilha ou vaca)"
        />
        {!temBrinco && <div className="hint">Deixe em branco se o animal não tem número (touro, boi, bezerro sem brinco). Aí escolha que animal é.</div>}
        {temBrinco && info.achado && !info.jaMorto && !info.jaVendido && <div className="hint" data-testid="morte-achei">Achei: {info.descricao}</div>}
        {temBrinco && info.achado && info.jaMorto && <div className="hint late">Este animal já está registrado como morto{info.mortoEm ? ` em ${formatarDataBR(info.mortoEm)}` : ''}.</div>}
        {temBrinco && info.achado && !info.jaMorto && info.jaVendido && <div className="hint late">Este animal já foi vendido{info.vendidoEm ? ` em ${formatarDataBR(info.vendidoEm)}` : ''}.</div>}
        {temBrinco && !info.achado && <div className="hint late" data-testid="morte-nao-achei">Não achei o número {form.brinco.trim()} no sistema. Se o número está certo, escolha que animal é abaixo para registrar assim mesmo.</div>}
      </div>

      <div className="grid2">
        <Campo campo={campoDef('data')} value={form.data} onChange={mudar} matrizes={[]} touros={[]} />
        <Campo campo={campoDef('causa')} value={form.causa} onChange={mudar} matrizes={[]} touros={[]} />
      </div>
      {!info.achado && (
        <Campo campo={{ ...campoDef('tipoAnimal'), label: 'Que animal é', required: true }} value={form.tipoAnimal} onChange={mudar} matrizes={[]} touros={[]} />
      )}
      <Campo campo={{ ...campoDef('observacoes'), label: 'Observação (livre)' }} value={form.observacoes} onChange={mudar} matrizes={[]} touros={[]} />

      {erro && <Aviso>{erro}</Aviso>}
      {confirmar && info.matriz && (
        <Aviso tipo="info">
          Vai registrar a morte de <b>{info.descricao}</b>. {info.matriz.status === 'Cheia' ? 'Ela estava cheia e ' : 'Ela '}sai da lista de vacas e da previsão de parto. Confirma?
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn sm" onClick={() => salvar(true)} disabled={salvando}>Confirmar morte</button>
            <button className="btn quiet sm" onClick={() => setConfirmar(false)}>Voltar</button>
          </div>
        </Aviso>
      )}
      {msg && <Aviso tipo="ok">{msg}{modoTeste ? ' (modo teste: só na tela, nada foi para a planilha)' : ''}</Aviso>}

      <button className="btn wide" onClick={() => salvar(false)} disabled={salvando} style={{ marginTop: 6 }}>
        {salvando ? <Loader2 size={18} className="spin" /> : <Save size={18} />} {salvando ? 'Gravando...' : 'Registrar morte'}
      </button>
    </div>
  );
}

// Janela de correção de uma morte (proprietário): data, causa, observação e, se o animal não tem cadastro, tipo e número. Também anula.
export function ModalMorte({ item, onEditar, onAnular, onFechar, onFeito }) {
  const e = item.e;
  const semCadastro = !e.criaId && !e.matrizId;
  const [form, setForm] = useState({ data: e.data || '', causa: e.causa || '', observacoes: e.observacoes || '', tipoAnimal: e.tipoAnimal || '', brinco: e.brinco || '' });
  const [erro, setErro] = useState('');
  const [anular, setAnular] = useState(false);
  const [gravando, setGravando] = useState(false);
  const mudar = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErro(''); };

  async function salvar() {
    if (gravando) return;
    setGravando(true);
    const campos = { data: form.data, causa: form.causa, observacoes: form.observacoes, ...(semCadastro ? { tipoAnimal: form.tipoAnimal, brinco: form.brinco } : {}) };
    const r = await onEditar(e.id, campos);
    setGravando(false);
    if (!r.ok) { setErro(r.msg); return; }
    onFeito(r.msg); onFechar();
  }
  async function confirmarAnular() {
    if (gravando) return;
    setGravando(true);
    const r = await onAnular(e.id);
    setGravando(false);
    if (!r.ok) { setErro(r.msg); setAnular(false); return; }
    onFeito(r.msg); onFechar();
  }

  return (
    <Modal titulo={`Morte · ${item.animal}`} onClose={onFechar} rotulo="Corrigir morte">
      <Lead rotulo="Animal" valor={item.animal} />
      {item.mae && <Lead rotulo="Mãe" valor={item.mae} />}
      <Lead rotulo="Lote" valor={item.lote} />
      {!item.ativa ? (
        <p className="sub" style={{ marginTop: 12 }}>Esta morte foi anulada (lançamento errado). Ela não conta nos relatórios. Se o animal realmente morreu, lance a morte de novo.</p>
      ) : (
        <>
          <div style={{ marginTop: 14 }}>
            <div className="grid2">
              <Campo campo={CAMPOS.morte.find((c) => c.key === 'data')} value={form.data} onChange={mudar} matrizes={[]} touros={[]} />
              <Campo campo={CAMPOS.morte.find((c) => c.key === 'causa')} value={form.causa} onChange={mudar} matrizes={[]} touros={[]} />
            </div>
            {semCadastro && (
              <div className="grid2">
                <Campo campo={{ ...CAMPOS.morte.find((c) => c.key === 'tipoAnimal'), required: true }} value={form.tipoAnimal} onChange={mudar} matrizes={[]} touros={[]} />
                <Campo campo={CAMPOS.morte.find((c) => c.key === 'brinco')} value={form.brinco} onChange={mudar} matrizes={[]} touros={[]} />
              </div>
            )}
            <Campo campo={{ ...CAMPOS.morte.find((c) => c.key === 'observacoes'), label: 'Observação (livre)' }} value={form.observacoes} onChange={mudar} matrizes={[]} touros={[]} />
          </div>
          {erro && <Aviso>{erro}</Aviso>}
          {anular && (
            <Aviso tipo="info">
              Anular quando a morte foi lançada no animal errado ou por engano.{' '}
              {e.matrizId ? `A vaca volta ao status de antes (${e.statusAnterior || 'Vazia'}).` : 'O animal volta a contar no rebanho.'} A linha fica guardada na planilha, marcada como anulada.
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn sm" onClick={confirmarAnular} disabled={gravando}>Sim, anular esta morte</button>
                <button className="btn quiet sm" onClick={() => setAnular(false)}>Não</button>
              </div>
            </Aviso>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <button className="btn" style={{ flex: 1 }} onClick={salvar} disabled={gravando}>{gravando ? <Loader2 size={17} className="spin" /> : <Save size={17} />} Salvar correção</button>
            <button className="btn quiet" onClick={() => setAnular(true)} disabled={gravando}><Undo2 size={17} /> Anular</button>
          </div>
        </>
      )}
    </Modal>
  );
}

// Lista das mortes lançadas. Funcionário vê as últimas e só lê; proprietário vê todas e toca para corrigir.
export function ListaMortes({ dados, ownerMode, onEditar, onAnular }) {
  const [aberta, setAberta] = useState(null);
  const [aviso, setAviso] = useState('');
  const todas = useMemo(() => listarMortes(dados), [dados]);
  const lista = ownerMode ? todas : todas.filter((x) => x.ativa).slice(0, 6);
  const item = aberta ? todas.find((x) => x.e.id === aberta) : null;

  return (
    <>
      <h2 className="h2">{ownerMode ? 'Mortes lançadas' : 'Últimas mortes lançadas'}<small>{ownerMode ? `${todas.filter((x) => x.ativa).length} ativa(s) · toque para corrigir` : ''}</small></h2>
      {aviso && <Aviso tipo="ok" onClose={() => setAviso('')}>{aviso}</Aviso>}
      <div className="sheet" data-testid="lista-mortes">
        {lista.length === 0 ? <div className="empty">Nenhuma morte lançada.</div> : lista.map((x) => {
          const corpo = (
            <>
              <span className="two" style={{ minWidth: 0 }}>
                <b>{x.animal}{!x.ativa ? ' · anulada' : ''}</b>
                <span>{[x.e.causa, x.mae ? `mãe ${x.mae}` : '', x.e.observacoes].filter(Boolean).join(' · ')}</span>
              </span>
              <span className="m mut">{formatarDataBR(x.e.data)}</span>
            </>
          );
          return ownerMode ? (
            <button className="led-r" key={x.e.id} style={{ '--cols': 'minmax(0,1fr) auto', minHeight: 56, opacity: x.ativa ? 1 : 0.55 }} onClick={() => setAberta(x.e.id)} aria-label={`Abrir morte de ${x.animal}`}>{corpo}</button>
          ) : (
            <div className="led-r" key={x.e.id} style={{ '--cols': 'minmax(0,1fr) auto', minHeight: 56 }}>{corpo}</div>
          );
        })}
      </div>
      {item && <ModalMorte key={item.e.id} item={item} onEditar={onEditar} onAnular={onAnular} onFechar={() => setAberta(null)} onFeito={setAviso} />}
    </>
  );
}
