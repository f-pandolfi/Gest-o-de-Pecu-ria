// Gestão da Pecuária · Fazenda Ibiraçu (app v10)
// Casca do app: menu, ano de gestão, senha do proprietário, leitura e gravação na planilha.
// v9.5: tudo o que é lançado entra numa fila guardada no celular (fila.js) e vai para a planilha quando há internet.
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Plus, CalendarClock, List, LayoutDashboard, FileText, Lock, Unlock, Loader2, ChevronDown, Baby, CloudOff, AlertTriangle, RefreshCw, Trash2, Syringe,
} from 'lucide-react';
import {
  VERSAO_APP, VERSAO_MINIMA_SCRIPT, todayISO, anoDe, anosDisponiveis, filtrarPorAno,
  aplicarLancamento, aplicarVenda, calcularKPIs, buildResumoRows, validarMorte, listarCrias,
  editarNascimento, editarMorte, anularMorte, postsDeMudancas, aplicarMudancasNoEstado,
} from './logica.js';
import { normalizarTudo, aplicarPendentesTudo, protocoloParaPlanilha } from './manejo.js';
import { decidirLote } from './manejoGeral.js';
import Manejo from './telas/Manejo.jsx';
import { CSS } from './estilos.js';
import { MODO_TESTE, lerTudo, postar as postarDireto } from './api.js';
import {
  enfileirar, enviar as enviarFila, assinarFila, estadoFila, descartar, enviadosDesde, lerLocal, gravarNoCelular, CHAVE_DADOS,
} from './fila.js';
import { exportarExcel, exportarRelatorioExcel } from './excel.js';
import { Aviso, Modal } from './ui.jsx';
import { descreverEvento, fmtKg, fmtBRL } from './util.js';
import Lancar from './telas/Lancar.jsx';
import Parto from './telas/Parto.jsx';
import Crias from './telas/Crias.jsx';
import Rebanho from './telas/Rebanho.jsx';
import Painel from './telas/Painel.jsx';
import Relatorios from './telas/Relatorios.jsx';

// Trava de conveniência (não é segurança de verdade): impede o funcionário de abrir as telas do dono sem querer.
// (nos testes automáticos o build troca a senha por uma de mentira, via __PIN_TESTE__)
const OWNER_PIN = typeof __PIN_TESTE__ !== 'undefined' ? __PIN_TESTE__ : '1537';

const VAZIO = { matrizes: [], touros: [], eventos: [], config: {}, protocolos: [] };

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

// "19/10 às 14:05" (data e hora locais)
function quandoTxt(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} às ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Situação da fila no topo: enviando, guardado no celular (sem internet) ou erro da planilha
function ChipFila({ est, onClick }) {
  if (!est.pendentes) return null;
  if (est.semInternet) {
    return <button className="chip fila-off" onClick={onClick} data-testid="chip-fila"><CloudOff size={14} /> {est.pendentes} no celular</button>;
  }
  if (est.erroPlanilha) {
    return <button className="chip fila-erro" onClick={onClick} data-testid="chip-fila"><AlertTriangle size={14} /> erro ao gravar</button>;
  }
  return <button className="chip" onClick={onClick} data-testid="chip-fila"><Loader2 size={14} className="spin" /> gravando {est.pendentes}</button>;
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
  const [filaEst, setFilaEst] = useState(estadoFila());
  const [filaAberta, setFilaAberta] = useState(false);
  const [descartarUid, setDescartarUid] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [preset, setPreset] = useState(null);
  const [atualizadoEm, setAtualizadoEm] = useState(null); // quando os dados da tela vieram da planilha
  const [doCelular, setDoCelular] = useState(false); // tela mostrando a cópia guardada no celular (sem internet)
  const versaoRef = useRef(null);
  const timerCopia = useRef(null);
  const pendentes = filaEst.pendentes;

  useEffect(() => assinarFila(setFilaEst), []);
  // ao sair do app (trocar de tela no celular, fechar), guarda a cópia na hora
  useEffect(() => {
    const agora = () => { if (dadosRef.current !== VAZIO) { clearTimeout(timerCopia.current); guardarCopia(); } };
    const vis = () => { if (document.visibilityState === 'hidden') agora(); };
    window.addEventListener('pagehide', agora);
    document.addEventListener('visibilitychange', vis);
    return () => { window.removeEventListener('pagehide', agora); document.removeEventListener('visibilitychange', vis); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cada mudança na tela também fica guardada no celular (assim o app abre sem internet com o que foi lançado)
  function commit(novo) {
    dadosRef.current = novo; setDados(novo);
    clearTimeout(timerCopia.current);
    timerCopia.current = setTimeout(guardarCopia, 400);
  }
  function guardarCopia(quando) {
    const anterior = lerLocal(CHAVE_DADOS, null);
    gravarNoCelular(CHAVE_DADOS, {
      dados: dadosRef.current, versao: versaoRef.current,
      atualizadoEm: quando || (anterior && anterior.atualizadoEm) || null, guardadoEm: new Date().toISOString(),
    });
  }
  function definirVersao(v) { versaoRef.current = v; setVersaoScript(v); }

  // Se o app ficou aberto de um dia para o outro, "hoje" acompanha
  useEffect(() => {
    const f = () => setHoje(todayISO());
    document.addEventListener('visibilitychange', f);
    return () => document.removeEventListener('visibilitychange', f);
  }, []);

  useEffect(() => { carregar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Abre com a cópia do celular (rápido e funciona sem internet), manda o que estiver na fila e depois relê a planilha.
  async function carregar() {
    setAviso(null);
    const copia = lerLocal(CHAVE_DADOS, null);
    const temCopia = !!(copia && copia.dados && Array.isArray(copia.dados.matrizes));
    if (temCopia && dadosRef.current === VAZIO) {
      // a fila também entra (a cópia pode ter sido guardada um instante antes do último lançamento)
      const comFila = aplicarPendentesTudo({ protocolos: [], ...copia.dados }, estadoFila().itens);
      dadosRef.current = comFila; setDados(comFila);
      definirVersao(copia.versao || null);
      setAtualizadoEm(copia.atualizadoEm || null);
      setDoCelular(true);
      setLoading(false);
    } else if (!temCopia && dadosRef.current === VAZIO) {
      setLoading(true);
    }
    const inicio = Date.now();
    try {
      await enviarFila();
      const data = await lerTudo();
      // o que ainda está na fila (ou chegou na planilha enquanto ela era lida) continua aparecendo
      const extra = [...enviadosDesde(inicio), ...estadoFila().itens];
      const novos = aplicarPendentesTudo(normalizarTudo(data), extra);
      const v = Number(data.versao) || 0;
      definirVersao(v);
      commit(novos);
      const agora = new Date().toISOString();
      setAtualizadoEm(agora); setDoCelular(false);
      clearTimeout(timerCopia.current);
      guardarCopia(agora);
      if (v < VERSAO_MINIMA_SCRIPT) {
        if (MODO_TESTE) {
          setAviso({ tipo: 'info', texto: `Modo teste: a planilha ainda está na versão ${v || 'antiga'} do script. As telas novas já funcionam aqui; protocolos, manejos e touros só serão gravados depois que o script v${VERSAO_MINIMA_SCRIPT} for publicado.` });
        } else {
          setAviso({ tipo: 'erro', texto: `ATENÇÃO: o script da planilha está desatualizado (versão ${v || 'antiga'}). O que você lançar aparece na tela, mas NÃO está sendo gravado na planilha. Avise o responsável pelo sistema.` });
        }
      }
    } catch (e) {
      console.error('Erro ao carregar dados da planilha', e);
      const copiaAgora = lerLocal(CHAVE_DADOS, null);
      if (copiaAgora && copiaAgora.dados) {
        setDoCelular(true);
        setAviso({
          tipo: 'info',
          texto: `Sem internet agora. Você está vendo os dados guardados neste celular${copiaAgora.atualizadoEm ? ` (planilha lida em ${quandoTxt(copiaAgora.atualizadoEm)})` : ''}. Pode lançar normalmente: fica guardado aqui e vai para a planilha quando a internet voltar.`,
        });
      } else {
        setAviso({ tipo: 'erro', texto: 'Não consegui falar com a planilha agora e este celular ainda não tem os dados guardados. Abra o app uma vez com internet.' });
      }
    }
    setLoading(false);
  }

  // ---------------------------------------------------------------- gravação: tudo passa pela fila do celular
  // A tela muda na hora e o que precisa ir para a planilha entra na fila (fila.js), na ordem.
  const semInternet = () => typeof navigator !== 'undefined' && navigator.onLine === false;
  const NOTA_FILA = ' Sem internet: ficou guardado neste celular e vai para a planilha quando a internet voltar.';
  const notaFila = () => (semInternet() ? NOTA_FILA : '');

  function salvarLancamento(tipo, form) {
    const antes = dadosRef.current;
    const r = aplicarLancamento(antes, tipo, form);
    commit(r.estado);
    enfileirar([
      ...r.eventosNovos.map((e) => ({ action: 'appendEvento', tipo: e.tipo, evento: e })),
      ...r.matrizesAlteradas.map((m) => ({ action: 'upsertMatriz', matriz: m })),
      ...r.tourosNovos.map((t) => ({ action: 'appendTouro', touro: t })),
    ], tipo === 'cadastro' ? 'nova matriz' : tipo === 'touro' ? 'touro' : `lançamento: ${tipo}`);

    if (tipo === 'cadastro') return `Matriz ${r.matrizesAlteradas[0].brinco} cadastrada.${notaFila()}`;
    if (tipo === 'touro') return `Touro ${r.tourosNovos[0].nome} cadastrado.${notaFila()}`;
    const mudou = r.matrizesAlteradas.map((m) => {
      const a = antes.matrizes.find((x) => x.id === m.id);
      const partes = [];
      if (a && a.status !== m.status) partes.push(`${a.status} → ${m.status}`);
      if (a && a.categoria !== m.categoria) partes.push(`${a.categoria} → ${m.categoria}`);
      return partes.length ? `${m.brinco}: ${partes.join(', ')}` : '';
    }).filter(Boolean);
    return `Salvo: ${descreverEvento(r.eventosNovos[0], r.estado)}.${mudou.length ? ` Atualizado: ${mudou.join('; ')}.` : ''}${notaFila()}`;
  }

  function salvarMatriz(m) {
    const d = dadosRef.current;
    commit({ ...d, matrizes: d.matrizes.map((x) => (x.id === m.id ? m : x)) });
    enfileirar([{ action: 'upsertMatriz', matriz: m }], `matriz ${m.brinco}`);
  }

  // Metas e peso de corte da novilha (aba Config da planilha)
  function salvarConfig(parcial) {
    const d = dadosRef.current;
    commit({ ...d, config: { ...(d.config || {}), ...parcial } });
    enfileirar([{ action: 'setConfig', config: parcial }], 'metas');
  }

  const scriptAntes = (v) => !MODO_TESTE && versaoScript !== null && (versaoScript || 0) < v;
  const MSG_SCRIPT_12 = 'O script da planilha está desatualizado e não aceita protocolos, manejos e touros. Avise o responsável pelo sistema.';
  const MSG_SCRIPT_13 = 'A planilha ainda não aceita o manejo geral (precisa do script 13). Avise o proprietário.';

  // Protocolo (IATF ou monta): grava ou atualiza pelo id
  function salvarProtocolo(p) {
    if (scriptAntes(12)) return MSG_SCRIPT_12;
    const d = dadosRef.current;
    const lista = d.protocolos || [];
    commit({ ...d, protocolos: lista.some((x) => x.id === p.id) ? lista.map((x) => (x.id === p.id ? p : x)) : [...lista, p] });
    enfileirar([{ action: 'upsertProtocolos', protocolos: [protocoloParaPlanilha(p)] }], `protocolo ${p.nome}`);
    return `Protocolo "${p.nome}" salvo.${notaFila()}`;
  }

  function salvarTouro(t) {
    if (scriptAntes(12)) return MSG_SCRIPT_12;
    const d = dadosRef.current;
    commit({ ...d, touros: d.touros.some((x) => x.id === t.id) ? d.touros.map((x) => (x.id === t.id ? t : x)) : [...d.touros, t] });
    enfileirar([{ action: 'upsertTouros', touros: [t] }], `touro ${t.nome}`);
    return null;
  }

  // Manejo de curral, toque e vacinação (mesma forma do lote): eventos, matrizes alteradas
  async function gravarManejo(res, rotulo) {
    if (scriptAntes(12)) return { ok: false, msg: MSG_SCRIPT_12 };
    if (scriptAntes(13) && res.eventosParaGravar.some((x) => x.tipo === 'manejo' && x.evento.etapa === 'Geral')) return { ok: false, msg: MSG_SCRIPT_13 };
    return gravarLote(res, rotulo);
  }

  // Proprietário confirma (ou recusa) a mudança de lote pedida num manejo geral
  function decidirMudancaLote(decisoes) {
    if (scriptAntes(13)) return MSG_SCRIPT_13;
    const r = decidirLote(dadosRef.current, decisoes);
    if (!r.mudancas.eventos.length) return 'Nada para confirmar.';
    gravarCorrecao(r, 'confirmação de lote');
    return [r.aprovadas ? `${r.aprovadas} animal(is) mudado(s) de lote.` : '', r.recusadas ? `${r.recusadas} continua(m) no lote de antes.` : ''].filter(Boolean).join(' ') + notaFila();
  }

  // eventos em pacotes de 40, depois as matrizes e os touros
  function postsDeLote(eventos, matrizes, touros) {
    const posts = [];
    for (let i = 0; i < eventos.length; i += 40) posts.push({ action: 'appendEventos', itens: eventos.slice(i, i + 40) });
    if (matrizes.length) posts.push({ action: 'upsertMatrizes', matrizes });
    (touros || []).forEach((t) => posts.push({ action: 'appendTouro', touro: t }));
    return posts;
  }

  // Venda por peso: um registro da venda, um por animal e a baixa das matrizes vendidas.
  async function registrarVenda(form) {
    if (scriptAntes(9)) return { ok: false, msg: 'O script da planilha está desatualizado e não aceita vendas. Avise o responsável pelo sistema.' };
    const r = aplicarVenda(dadosRef.current, form, { hoje });
    if (r.erro) return { ok: false, msg: r.erro };
    commit(r.estado);
    enfileirar(postsDeLote(r.eventosNovos.map((e) => ({ tipo: e.tipo, evento: e })), r.matrizesAlteradas), 'venda');
    const baixas = r.itens.filter((i) => i.criaId || i.matrizId).length;
    return {
      ok: true,
      msg: `Venda gravada: ${r.totais.qtd} animal(is), ${fmtKg(r.totais.kg)}, ${fmtBRL(r.totais.valor)}.${baixas ? ` ${baixas} saíram do rebanho.` : ''}${r.avisos.length ? ` Atenção: ${r.avisos.join(' ')}` : ''}${notaFila()}`,
    };
  }

  async function gravarLote(res, rotulo) {
    if (scriptAntes(9)) return { ok: false, msg: 'O script da planilha está desatualizado e não aceita lote. Avise o responsável pelo sistema.' };
    if (scriptAntes(10) && res.eventosParaGravar.some((x) => x.tipo === 'morte')) {
      return { ok: false, msg: 'O script da planilha está desatualizado e não aceita mortes. Avise o responsável pelo sistema.' };
    }
    commit(res.estado);
    enfileirar(postsDeLote(res.eventosParaGravar, res.matrizesParaGravar, res.tourosParaGravar), rotulo || 'lote');
    return { ok: true, offline: semInternet(), msg: `Gravados ${res.eventosParaGravar.length} lançamento(s) e ${res.matrizesParaGravar.length} matriz(es) atualizada(s).${notaFila()}` };
  }

  // ---------------------------------------------------------------- morte e correções
  const MSG_SCRIPT_MORTE = 'O script da planilha está desatualizado e não aceita mortes. Avise o responsável pelo sistema.';

  async function registrarMorte(form) {
    if (scriptAntes(10)) return { ok: false, msg: MSG_SCRIPT_MORTE };
    const v = validarMorte(dadosRef.current, form, hoje);
    if (v.erros.length) return { ok: false, msg: v.erros.join(' ') };
    const r = aplicarLancamento(dadosRef.current, 'morte', form);
    const ev = r.eventosNovos[0];
    commit(r.estado);
    enfileirar([
      { action: 'appendEvento', tipo: 'morte', evento: ev },
      ...(r.matrizesAlteradas.length ? [{ action: 'upsertMatrizes', matrizes: r.matrizesAlteradas }] : []),
    ], `morte ${ev.brinco || ''}`.trim());
    const morta = r.matrizesAlteradas[0];
    const orfas = morta ? listarCrias(r.estado, hoje).filter((c) => c.orfa && c.matrizId === morta.id) : [];
    const partes = [`Morte registrada: ${descreverEvento(ev, r.estado)}.`];
    if (morta) partes.push(`A matriz ${morta.brinco} saiu da lista de vacas.`);
    if (orfas.length) partes.push(`Atenção: ${orfas.length === 1 ? 'a cria' : 'as crias'} ${orfas.map((c) => c.brinco || 'sem número').join(', ')} ficou(aram) órfã(s). Os funcionários continuam criando.`);
    if (v.avisos.length) partes.push(v.avisos.join(' '));
    return { ok: true, msg: partes.join(' ') + notaFila() };
  }

  function gravarCorrecao(r, rotulo) {
    commit(aplicarMudancasNoEstado(dadosRef.current, r.mudancas));
    enfileirar(postsDeMudancas(r.mudancas), rotulo);
    return null;
  }

  async function corrigirNascimento(id, campos) {
    const r = editarNascimento(dadosRef.current, id, campos);
    if (r.erro) return { ok: false, msg: r.erro };
    if (scriptAntes(10) && r.mudancas.eventos.some((m) => m.tipo === 'morte')) return { ok: false, msg: MSG_SCRIPT_MORTE };
    gravarCorrecao(r, 'correção de nascimento');
    const ligados = r.mudancas.eventos.length - 1 + r.mudancas.matrizes.length;
    const partes = [`Nascimento corrigido: ${descreverEvento(r.evento, dadosRef.current)}.`];
    if (ligados > 0) partes.push(`Também acertei ${ligados} registro(s) ligados a essa cria.`);
    if (r.avisos.length) partes.push(`Atenção: ${r.avisos.join(' ')}`);
    return { ok: true, msg: partes.join(' ') + notaFila() };
  }

  async function corrigirMorte(id, campos) {
    if (scriptAntes(10)) return { ok: false, msg: MSG_SCRIPT_MORTE };
    const r = editarMorte(dadosRef.current, id, campos, hoje);
    if (r.erro) return { ok: false, msg: r.erro };
    gravarCorrecao(r, 'correção de morte');
    return { ok: true, msg: `Morte corrigida: ${descreverEvento(r.evento, dadosRef.current)}.${notaFila()}` };
  }

  async function anularUmaMorte(id) {
    if (scriptAntes(10)) return { ok: false, msg: MSG_SCRIPT_MORTE };
    const r = anularMorte(dadosRef.current, id);
    if (r.erro) return { ok: false, msg: r.erro };
    gravarCorrecao(r, 'anulação de morte');
    const m = r.mudancas.matrizes[0];
    return { ok: true, msg: `Morte anulada.${m ? ` A matriz ${m.brinco} voltou a ${m.status}.` : ' O animal voltou a contar no rebanho.'}${notaFila()}` };
  }

  // Regrava a planilha inteira com o que está na tela. Só com tudo enviado e com os dados lidos da planilha agora
  // (senão poderia apagar o que outro celular lançou).
  async function sincronizarTudo() {
    if (pendentes > 0 || doCelular) {
      setAviso({ tipo: 'erro', texto: 'Antes de sincronizar, é preciso internet e nenhum lançamento esperando na fila. Toque em "Recarregar dados" com internet e tente de novo.' });
      return;
    }
    setSincronizando(true);
    const d = dadosRef.current;
    const a = anoDe(hoje);
    const resumo = buildResumoRows(calcularKPIs(d.matrizes, filtrarPorAno(d.eventos, a)), a);
    try {
      await postarDireto({ action: 'syncAll', matrizes: d.matrizes, touros: d.touros, eventos: d.eventos, protocolos: (d.protocolos || []).map(protocoloParaPlanilha), resumo });
      setAviso({ tipo: 'ok', texto: `Planilha sincronizada${MODO_TESTE ? ' (modo teste: simulado)' : ''}. A aba Resumo mostra o ano ${a}.` });
    } catch (e) {
      setAviso({ tipo: 'erro', texto: `Não consegui sincronizar: ${e.message}.` });
    }
    setSincronizando(false);
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
    if (tab === 'painel') setTab('lancar');
  }

  function mudarTab(t) { setPreset(null); setTab(t); }
  function lancarDaVaca(tipo, matrizId) { setPreset({ tipo, matrizId, n: Date.now() }); setTab('lancar'); }

  const anos = useMemo(() => anosDisponiveis(dados.eventos, hoje), [dados.eventos, hoje]);

  const itensNav = [
    ownerMode && { id: 'painel', label: 'Painel', Icon: LayoutDashboard },
    { id: 'lancar', label: 'Lançar', Icon: Plus },
    { id: 'manejo', label: 'Manejo', Icon: Syringe },
    { id: 'parto', label: 'Parto', Icon: CalendarClock },
    { id: 'crias', label: 'Crias', Icon: Baby },
    { id: 'rebanho', label: 'Rebanho', Icon: List },
    { id: 'relatorios', label: 'Relatórios', Icon: FileText },
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
            <span>Lê os dados reais da planilha, mas NÃO grava nada nela. O que você lançar aqui some ao recarregar com internet.</span>
            <button onClick={carregar}>Recarregar dados</button>
          </div>
        )}
        <header className="topbar">
          <div className="in">
            <Marca />
            <ChipFila est={filaEst} onClick={() => setFilaAberta(true)} />
            {botaoDono}
          </div>
        </header>
        {pendentes > 0 && <span className="sr" role="status">{filaEst.semInternet ? `${pendentes} lançamento(s) guardado(s) no celular esperando internet` : 'Gravando na planilha'}</span>}
        {pendentes > 0 && <div className="lado-fila"><ChipFila est={filaEst} onClick={() => setFilaAberta(true)} /></div>}

        {aviso && <div className="wrap"><Aviso tipo={aviso.tipo === 'erro' ? undefined : aviso.tipo} onClose={() => setAviso(null)}>{aviso.texto}</Aviso></div>}

        {tab === 'lancar' && (
          <Lancar
            dados={dados} hoje={hoje} ownerMode={ownerMode} preset={preset} onSalvar={salvarLancamento} onGravarLote={gravarLote} modoTeste={MODO_TESTE}
            onRegistrarMorte={registrarMorte} onEditarNascimento={corrigirNascimento} onEditarMorte={corrigirMorte} onAnularMorte={anularUmaMorte}
          />
        )}
        {tab === 'manejo' && (
          <Manejo dados={dados} hoje={hoje} ownerMode={ownerMode} modoTeste={MODO_TESTE} onGravarLote={gravarManejo} onSalvarProtocolo={salvarProtocolo} onSalvarConfig={salvarConfig} scriptAntes13={scriptAntes(13)} onDecidirLote={decidirMudancaLote} />
        )}
        {tab === 'parto' && <Parto dados={dados} hoje={hoje} onLancar={lancarDaVaca} onGravarLote={gravarManejo} />}
        {tab === 'crias' && (
          <Crias
            dados={dados} hoje={hoje} ownerMode={ownerMode} modoTeste={MODO_TESTE}
            onLancar={salvarLancamento} onGravarLote={gravarLote} onVender={registrarVenda}
            onSalvarMatriz={salvarMatriz} onSalvarConfig={salvarConfig}
            onRegistrarMorte={registrarMorte} onEditarNascimento={corrigirNascimento} onEditarMorte={corrigirMorte} onAnularMorte={anularUmaMorte}
          />
        )}
        {tab === 'rebanho' && <Rebanho dados={dados} ownerMode={ownerMode} onSalvarMatriz={salvarMatriz} onSalvarTouro={salvarTouro} />}
        {tab === 'painel' && ownerMode && (
          <Painel
            anoSel={anoSel} dados={dados} ano={ano} hoje={hoje} go={mudarTab} modoTeste={MODO_TESTE} sincronizando={sincronizando}
            onExcel={() => exportarExcel(dadosRef.current, ano, hoje)} onSync={sincronizarTudo} onRecarregar={carregar}
          />
        )}
        {tab === 'relatorios' && (
          <Relatorios
            anoSel={anoSel} dados={dados} ano={ano} hoje={hoje} ownerMode={ownerMode}
            onExcel={() => exportarExcel(dadosRef.current, ano, hoje)} onExcelRelatorio={(rel) => exportarRelatorioExcel(rel, ano, hoje)}
          />
        )}

        <div className="foot-note">
          Fazenda Ibiraçu · app {VERSAO_APP} · planilha {versaoScript ? `v${versaoScript}` : 'versão antiga'}{MODO_TESTE ? ' · TESTE' : ''}
          {atualizadoEm ? ` · dados de ${quandoTxt(atualizadoEm)}${doCelular ? ' (guardados no celular)' : ''}` : ''}
        </div>
      </div>

      <nav className={`bnav${itensNav.length > 5 ? ' mini' : ''}`} aria-label="Telas (celular)">
        {itensNav.map(({ id, label, Icon }) => (
          <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => mudarTab(id)}><Icon /> {label}</button>
        ))}
      </nav>

      {filaAberta && (
        <Modal titulo="Lançamentos guardados no celular" onClose={() => { setFilaAberta(false); setDescartarUid(null); }}>
          {filaEst.pendentes === 0 ? (
            <p className="sub" style={{ marginTop: 0 }}>Tudo já chegou na planilha. Nada esperando.</p>
          ) : (
            <>
              <p className="sub" style={{ marginTop: 0 }}>
                {filaEst.semInternet
                  ? 'Sem internet. Estes lançamentos estão guardados neste celular e vão sozinhos para a planilha quando a internet voltar. Não feche o app pela metade de um lançamento, mas pode fechar e abrir à vontade: nada se perde.'
                  : filaEst.erroPlanilha ? `A planilha recusou um lançamento: ${filaEst.erroPlanilha}. Os outros esperam na fila, na ordem.` : 'Enviando para a planilha...'}
              </p>
              <div className="sheet" data-testid="lista-fila">
                {filaEst.itens.map((it) => (
                  <div className="led-r" key={it.uid} style={{ '--cols': ownerMode ? '1fr auto auto' : '1fr auto', minHeight: 48 }}>
                    <span style={{ fontSize: 14 }}>{it.rotulo || it.payload.action}{it.erro ? <small style={{ display: 'block', color: it.rede ? 'var(--amber)' : 'var(--late)' }}>{it.rede ? 'esperando internet' : it.erro}</small> : null}</span>
                    <span className="m mut">{quandoTxt(it.criadoEm)}</span>
                    {ownerMode && (descartarUid === it.uid ? (
                      <button className="btn sm" style={{ background: 'var(--late)' }} onClick={() => { descartar(it.uid); setDescartarUid(null); }}>Confirmar</button>
                    ) : (
                      <button className="x-peq" aria-label="Descartar este lançamento da fila" title="Descartar (só se a planilha recusa sempre)" onClick={() => setDescartarUid(it.uid)}><Trash2 size={16} /></button>
                    ))}
                  </div>
                ))}
              </div>
              {ownerMode && descartarUid && <Aviso>Descartar tira esse lançamento da fila e ele NÃO vai para a planilha (continua na tela até recarregar). Use só se a planilha recusa sempre.</Aviso>}
            </>
          )}
          <button className="btn wide" style={{ marginTop: 12 }} onClick={() => enviarFila()} disabled={filaEst.enviando || filaEst.pendentes === 0}>
            {filaEst.enviando ? <Loader2 size={18} className="spin" /> : <RefreshCw size={18} />} Tentar enviar agora
          </button>
        </Modal>
      )}

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
