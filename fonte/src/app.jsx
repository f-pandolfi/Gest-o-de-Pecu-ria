// Gestão da Pecuária · Fazenda Ibiraçu (app v9)
// Casca do app: menu, ano de gestão, senha do proprietário, leitura e gravação na planilha.
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Plus, CalendarClock, List, LayoutDashboard, FileText, Lock, Unlock, Loader2, ChevronDown,
} from 'lucide-react';
import {
  VERSAO_APP, VERSAO_MINIMA_SCRIPT, todayISO, anoDe, anosDisponiveis, filtrarPorAno, normalizarDados,
  aplicarLancamento, calcularKPIs, buildResumoRows,
} from './logica.js';
import { CSS } from './estilos.js';
import { MODO_TESTE, lerTudo, postar } from './api.js';
import { exportarExcel, exportarRelatorioExcel } from './excel.js';
import { Aviso, Modal } from './ui.jsx';
import { descreverEvento } from './util.js';
import Lancar from './telas/Lancar.jsx';
import Parto from './telas/Parto.jsx';
import Rebanho from './telas/Rebanho.jsx';
import Painel from './telas/Painel.jsx';
import Relatorios from './telas/Relatorios.jsx';

// Trava de conveniência (não é segurança de verdade): impede o funcionário de abrir as telas do dono sem querer.
// (nos testes automáticos o build troca a senha por uma de mentira, via __PIN_TESTE__)
const OWNER_PIN = typeof __PIN_TESTE__ !== 'undefined' ? __PIN_TESTE__ : '1537';

const VAZIO = { matrizes: [], touros: [], eventos: [] };

function Marca() {
  return (
    <div className="brand">
      <small>Fazenda Ibiraçu</small>
      <b>Gestão da Pecuária</b>
    </div>
  );
}

function SeletorAno({ ano, anos, onChange }) {
  return (
    <label className="chip" title="Ano de gestão">
      <span className="sr">Ano de gestão</span>
      <span aria-hidden="true">ANO</span>
      <select aria-label="Ano de gestão" value={String(ano)} onChange={(e) => onChange(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}>
        {anos.map((a) => <option key={a} value={a}>{a}</option>)}
        <option value="todos">Todos</option>
      </select>
      <ChevronDown size={14} aria-hidden="true" />
    </label>
  );
}

function GestaoPecuaria() {
  const [tab, setTab] = useState('lancar');
  const [dados, setDados] = useState(VAZIO);
  const dadosRef = useRef(VAZIO);
  const [loading, setLoading] = useState(true);
  const [aviso, setAviso] = useState(null); // { tipo: 'erro' | 'ok' | 'info', texto }
  const [versaoScript, setVersaoScript] = useState(null);
  const [ownerMode, setOwnerMode] = useState(false);
  const [pinAberto, setPinAberto] = useState(false);
  const [pin, setPin] = useState('');
  const [pinErro, setPinErro] = useState(false);
  const [hoje, setHoje] = useState(todayISO());
  const [ano, setAno] = useState(() => anoDe(todayISO()));
  const [pendentes, setPendentes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const [preset, setPreset] = useState(null);
  const fila = useRef(Promise.resolve());

  function commit(novo) { dadosRef.current = novo; setDados(novo); }

  // Se o app ficou aberto de um dia para o outro, "hoje" acompanha
  useEffect(() => {
    const f = () => setHoje(todayISO());
    document.addEventListener('visibilitychange', f);
    return () => document.removeEventListener('visibilitychange', f);
  }, []);

  useEffect(() => { carregar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function carregar() {
    setLoading(true);
    setAviso(null);
    try {
      const data = await lerTudo();
      commit(normalizarDados(data));
      const v = Number(data.versao) || 0;
      setVersaoScript(v);
      if (v < VERSAO_MINIMA_SCRIPT) {
        setAviso({ tipo: 'erro', texto: `ATENÇÃO: o script da planilha está desatualizado (versão ${v || 'antiga'}). O que você lançar aparece na tela, mas NÃO está sendo gravado na planilha. Avise o responsável pelo sistema.` });
      }
    } catch (e) {
      console.error('Erro ao carregar dados da planilha', e);
      setAviso({ tipo: 'erro', texto: 'Não consegui falar com a planilha agora. Verifique a internet e tente de novo. Os dados na tela podem estar desatualizados.' });
    }
    setLoading(false);
  }

  // ---------------------------------------------------------------- gravação (uma de cada vez, em ordem)
  async function gravar(payload, rotulo) {
    try {
      await postar(payload);
      return true;
    } catch (e) {
      console.error(`Erro ao gravar (${rotulo})`, e);
      setAviso({ tipo: 'erro', texto: `Não consegui gravar na planilha (${rotulo}): ${e.message}. O registro aparece na tela, mas pode sumir ao recarregar. Tente salvar de novo.` });
      return false;
    }
  }

  function enfileirar(payload, rotulo) {
    setPendentes((n) => n + 1);
    fila.current = fila.current.then(() => gravar(payload, rotulo)).then(() => setPendentes((n) => n - 1));
  }

  function salvarLancamento(tipo, form) {
    const antes = dadosRef.current;
    const r = aplicarLancamento(antes, tipo, form);
    commit(r.estado);
    r.eventosNovos.forEach((e) => enfileirar({ action: 'appendEvento', tipo: e.tipo, evento: e }, 'lançamento'));
    r.matrizesAlteradas.forEach((m) => enfileirar({ action: 'upsertMatriz', matriz: m }, 'matriz'));
    r.tourosNovos.forEach((t) => enfileirar({ action: 'appendTouro', touro: t }, 'touro'));

    if (tipo === 'cadastro') return `Matriz ${r.matrizesAlteradas[0].brinco} cadastrada.`;
    if (tipo === 'touro') return `Touro ${r.tourosNovos[0].nome} cadastrado.`;
    const mudou = r.matrizesAlteradas.map((m) => {
      const a = antes.matrizes.find((x) => x.id === m.id);
      const partes = [];
      if (a && a.status !== m.status) partes.push(`${a.status} → ${m.status}`);
      if (a && a.categoria !== m.categoria) partes.push(`${a.categoria} → ${m.categoria}`);
      return partes.length ? `${m.brinco}: ${partes.join(', ')}` : '';
    }).filter(Boolean);
    return `Salvo: ${descreverEvento(r.eventosNovos[0], r.estado)}.${mudou.length ? ` Atualizado: ${mudou.join('; ')}.` : ''}`;
  }

  function salvarMatriz(m) {
    const d = dadosRef.current;
    commit({ ...d, matrizes: d.matrizes.map((x) => (x.id === m.id ? m : x)) });
    enfileirar({ action: 'upsertMatriz', matriz: m }, 'matriz');
  }

  async function gravarLote(res) {
    if (!MODO_TESTE && (versaoScript || 0) < 8) {
      return { ok: false, msg: 'O script da planilha está desatualizado e não aceita lote. Avise o responsável pelo sistema.' };
    }
    try {
      const itens = res.eventosParaGravar;
      for (let i = 0; i < itens.length; i += 40) await postar({ action: 'appendEventos', itens: itens.slice(i, i + 40) });
      if (res.matrizesParaGravar.length) await postar({ action: 'upsertMatrizes', matrizes: res.matrizesParaGravar });
      for (const t of res.tourosParaGravar) await postar({ action: 'appendTouro', touro: t });
    } catch (e) {
      console.error('Erro ao gravar lote', e);
      return { ok: false, msg: `Não consegui gravar tudo: ${e.message}. Use "Recarregar dados" nas ferramentas avançadas do Painel para ver o que chegou na planilha antes de tentar de novo, para não duplicar.` };
    }
    commit(res.estado);
    return { ok: true, msg: `Gravados ${res.eventosParaGravar.length} lançamento(s) e ${res.matrizesParaGravar.length} matriz(es) atualizada(s).` };
  }

  async function sincronizarTudo() {
    setSincronizando(true);
    const d = dadosRef.current;
    const a = anoDe(hoje);
    const resumo = buildResumoRows(calcularKPIs(d.matrizes, filtrarPorAno(d.eventos, a)), a);
    const ok = await gravar({ action: 'syncAll', matrizes: d.matrizes, touros: d.touros, eventos: d.eventos, resumo }, 'sincronização completa');
    setSincronizando(false);
    if (ok) setAviso({ tipo: 'ok', texto: `Planilha sincronizada${MODO_TESTE ? ' (modo teste: simulado)' : ''}. A aba Resumo mostra o ano ${a}.` });
  }

  // ---------------------------------------------------------------- senha do proprietário
  function tentarEntrar() {
    if (pin === OWNER_PIN) {
      setOwnerMode(true); setPinAberto(false); setPin(''); setPinErro(false); setTab('painel');
    } else {
      setPinErro(true);
    }
  }
  function sairDoModoDono() {
    setOwnerMode(false);
    if (tab === 'painel' || tab === 'relatorios') setTab('lancar');
  }

  function mudarTab(t) { setPreset(null); setTab(t); }
  function lancarDaVaca(tipo, matrizId) { setPreset({ tipo, matrizId, n: Date.now() }); setTab('lancar'); }

  const anos = useMemo(() => anosDisponiveis(dados.eventos, hoje), [dados.eventos, hoje]);

  const itensNav = [
    ownerMode && { id: 'painel', label: 'Painel', Icon: LayoutDashboard },
    { id: 'lancar', label: 'Lançar', Icon: Plus },
    { id: 'parto', label: 'Parto', Icon: CalendarClock },
    { id: 'rebanho', label: 'Rebanho', Icon: List },
    ownerMode && { id: 'relatorios', label: 'Relatórios', Icon: FileText },
  ].filter(Boolean);

  const anoSel = <SeletorAno ano={ano} anos={anos} onChange={setAno} />;
  const botaoDono = ownerMode ? (
    <button className="chip on" onClick={sairDoModoDono} aria-label="Sair do modo proprietário" title="Voltar para o modo funcionário"><Unlock size={15} /> DONO</button>
  ) : (
    <button className="chip lock" onClick={() => { setPinAberto(true); setPin(''); setPinErro(false); }} aria-label="Entrar como proprietário" title="Entrar como proprietário"><Lock size={16} /></button>
  );

  if (loading) {
    return (
      <div className="app"><style>{CSS}</style>
        <div className="main"><div className="loading"><Loader2 size={20} className="spin" /> Abrindo o livro do rebanho...</div></div>
      </div>
    );
  }

  return (
    <div className="app">
      <style>{CSS}</style>

      <aside className="side">
        <Marca />
        <nav aria-label="Telas">
          {itensNav.map(({ id, label, Icon }) => (
            <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => mudarTab(id)}><Icon /> {label}</button>
          ))}
        </nav>
        <div className="foot">
          {botaoDono}
        </div>
      </aside>

      <div className="main">
        {MODO_TESTE && (
          <div className="banner-teste" role="status">
            <b>MODO TESTE</b>
            <span>Lê os dados reais da planilha, mas NÃO grava nada nela. O que você lançar aqui some ao recarregar.</span>
            <button onClick={carregar}>Recarregar dados</button>
          </div>
        )}
        <header className="topbar">
          <div className="in">
            <Marca />
            {pendentes > 0 && <span className="chip" role="status"><Loader2 size={14} className="spin" /> gravando</span>}
            {botaoDono}
          </div>
        </header>
        {pendentes > 0 && <span className="sr" role="status">Gravando na planilha</span>}

        {aviso && <div className="wrap"><Aviso tipo={aviso.tipo === 'erro' ? undefined : aviso.tipo} onClose={() => setAviso(null)}>{aviso.texto}</Aviso></div>}

        {tab === 'lancar' && (
          <Lancar dados={dados} hoje={hoje} ownerMode={ownerMode} preset={preset} onSalvar={salvarLancamento} onGravarLote={gravarLote} modoTeste={MODO_TESTE} />
        )}
        {tab === 'parto' && <Parto dados={dados} hoje={hoje} onLancar={lancarDaVaca} />}
        {tab === 'rebanho' && <Rebanho dados={dados} ownerMode={ownerMode} onSalvarMatriz={salvarMatriz} />}
        {tab === 'painel' && ownerMode && (
          <Painel
            anoSel={anoSel} dados={dados} ano={ano} hoje={hoje} go={mudarTab} modoTeste={MODO_TESTE} sincronizando={sincronizando}
            onExcel={() => exportarExcel(dadosRef.current, ano, hoje)} onSync={sincronizarTudo} onRecarregar={carregar}
          />
        )}
        {tab === 'relatorios' && ownerMode && (
          <Relatorios
            anoSel={anoSel} dados={dados} ano={ano} hoje={hoje}
            onExcel={() => exportarExcel(dadosRef.current, ano, hoje)} onExcelRelatorio={(rel) => exportarRelatorioExcel(rel, ano, hoje)}
          />
        )}

        <div className="foot-note">
          Fazenda Ibiraçu · app {VERSAO_APP} · planilha {versaoScript ? `v${versaoScript}` : 'versão antiga'}{MODO_TESTE ? ' · TESTE' : ''}
        </div>
      </div>

      <nav className="bnav" aria-label="Telas (celular)">
        {itensNav.map(({ id, label, Icon }) => (
          <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => mudarTab(id)}><Icon /> {label}</button>
        ))}
      </nav>

      {pinAberto && !ownerMode && (
        <Modal titulo="Área do proprietário" onClose={() => setPinAberto(false)}>
          <form onSubmit={(e) => { e.preventDefault(); tentarEntrar(); }}>
            <div className="fld">
              <label htmlFor="pin">Senha (PIN)</label>
              <input id="pin" type="password" inputMode="numeric" autoComplete="off" autoFocus value={pin} onChange={(e) => { setPin(e.target.value); setPinErro(false); }} />
              {pinErro && <div className="hint late" role="alert">Senha incorreta.</div>}
            </div>
            <button type="submit" className="btn wide">Entrar</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<GestaoPecuaria />);
