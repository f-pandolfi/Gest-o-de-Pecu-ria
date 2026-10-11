// Tela "Lançar": uma ficha por tipo de lançamento (funcionário vê só os tipos permitidos).
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Save, Check, Loader2 } from 'lucide-react';
import {
  CAMPOS, TIPOS_FUNCIONARIO, camposFaltando, jaExiste, sugerirBrincoBezerro, formatarDataBR,
} from '../logica.js';
import { IndexTabs, Campo, Aviso, Lead } from '../ui.jsx';
import { ROTULO_CURTO, ORDEM_LANCAR, rotuloEvento, descreverEvento } from '../util.js';
import LoteFoto from './Lote.jsx';

function formularioInicial(tipo, hoje) {
  const f = {};
  (CAMPOS[tipo] || []).forEach((c) => {
    if (c.default) f[c.key] = c.default;
    if (c.key === 'data') f.data = hoje;
  });
  return f;
}

export default function Lancar({ dados, hoje, ownerMode, preset, onSalvar, onGravarLote, modoTeste }) {
  const tiposVisiveis = ORDEM_LANCAR.filter((id) => ownerMode || TIPOS_FUNCIONARIO.includes(id));
  const abas = [
    ...tiposVisiveis.map((id) => ({ id, label: ROTULO_CURTO[id] })),
    ...(ownerMode ? [{ id: 'lote', label: 'Lote por foto' }] : []),
  ];
  const [tipo, setTipo] = useState('nascimento');
  const [form, setForm] = useState(() => formularioInicial('nascimento', hoje));
  const [erro, setErro] = useState('');
  const [dup, setDup] = useState(false);
  const [salvo, setSalvo] = useState('');
  const timer = useRef(null);

  // Vindo da tela Parto ("Lançar nascimento desta vaca")
  useEffect(() => {
    if (!preset) return;
    setTipo(preset.tipo);
    setForm({ ...formularioInicial(preset.tipo, hoje), matrizId: preset.matrizId || '' });
    setErro(''); setDup(false); setSalvo('');
  }, [preset && preset.n]); // eslint-disable-line react-hooks/exhaustive-deps

  // Funcionário que bloqueou o app voltando de "proprietário": sai de abas que não existem mais
  useEffect(() => {
    if (!abas.some((a) => a.id === tipo)) trocarTipo('nascimento');
  }, [ownerMode]); // eslint-disable-line react-hooks/exhaustive-deps

  function trocarTipo(novo) {
    setTipo(novo);
    setForm(formularioInicial(novo, hoje));
    setErro(''); setDup(false); setSalvo('');
  }

  function atualizar(chave, valor) {
    setForm((f) => {
      const prox = { ...f, [chave]: valor };
      // brinco da cria: sugerido pela convenção da fazenda enquanto ninguém digitou outro
      if (tipo === 'nascimento' && (chave === 'sexo' || chave === 'data')) {
        const automatico = !f.brincoBezerro || f.brincoBezerro === f._sug;
        if (automatico) {
          const sug = sugerirBrincoBezerro(prox.data, prox.sexo, dados.eventos);
          prox.brincoBezerro = sug || '';
          prox._sug = sug || '';
        }
      }
      return prox;
    });
  }

  function salvar(forcar) {
    const falt = camposFaltando(tipo, form);
    if (falt.length) { setErro(`Falta preencher: ${falt.map((c) => c.label).join(', ')}.`); setDup(false); return; }
    if (!forcar && jaExiste(tipo, form, dados)) { setDup(true); setErro(''); return; }
    setErro(''); setDup(false);
    const { _sug, ...limpo } = form;
    const msg = onSalvar(tipo, limpo);
    setSalvo(msg);
    setForm(formularioInicial(tipo, hoje));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSalvo(''), 6000);
  }

  const ultimos = useMemo(() => {
    const nasc = dados.eventos.filter((e) => e.tipo === 'nascimento' && e.brincoBezerro);
    const recente = (sexo) => nasc.filter((e) => e.sexo === sexo).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))[0];
    return { Macho: recente('Macho'), 'Fêmea': recente('Fêmea') };
  }, [dados.eventos]);

  const recentes = useMemo(
    () => [...dados.eventos].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 6),
    [dados.eventos],
  );

  const campos = (CAMPOS[tipo] || []).filter((c) => !c.showIf || c.showIf(form));
  const semMatrizes = dados.matrizes.length === 0 && tipo !== 'cadastro';

  return (
    <div className="wrap">
      <div className="head">
        <div><small>Livro do rebanho</small><h1>Lançar</h1></div>
      </div>

      <IndexTabs tabs={abas} value={tipo} onChange={trocarTipo} rotulo="Tipo de lançamento" />
      <div className="sheet pad">
        {tipo === 'lote' ? (
          <LoteFoto dados={dados} hoje={hoje} onGravarLote={onGravarLote} modoTeste={modoTeste} />
        ) : (
          <>
            <h2 className="h2" style={{ marginTop: 0 }}>{rotuloEvento(tipo)}</h2>
            {semMatrizes && (
              <Aviso tipo="info">
                {ownerMode ? 'Cadastre pelo menos uma matriz em "Nova matriz" para poder ligá-la aos outros lançamentos.' : 'Ainda não há matrizes no sistema. Fale com o proprietário.'}
              </Aviso>
            )}
            {tipo === 'nascimento' && (ultimos.Macho || ultimos['Fêmea']) && (
              <div style={{ marginBottom: 16 }}>
                {['Fêmea', 'Macho'].map((sx) => (ultimos[sx] ? (
                  <Lead key={sx} rotulo={sx === 'Macho' ? 'Último macho' : 'Última fêmea'} valor={`${ultimos[sx].brincoBezerro} · ${formatarDataBR(ultimos[sx].data)}`} />
                ) : null))}
              </div>
            )}
            <div className="grid2">
              {campos.map((c) => (
                <div key={c.key} style={c.type === 'matriz' || c.key === 'observacoes' || c.key === 'motivo' ? { gridColumn: '1 / -1' } : undefined}>
                  <Campo campo={c} value={form[c.key]} onChange={atualizar} matrizes={dados.matrizes} touros={dados.touros} />
                </div>
              ))}
            </div>

            {erro && <Aviso>{erro}</Aviso>}
            {dup && (
              <Aviso tipo="info">
                Esse lançamento parece já existir (mesma vaca e mesma data). Confira antes de salvar de novo.
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn sm" onClick={() => salvar(true)}>Salvar mesmo assim</button>
                  <button className="btn quiet sm" onClick={() => setDup(false)}>Cancelar</button>
                </div>
              </Aviso>
            )}
            {salvo && <Aviso tipo="ok">{salvo}{modoTeste ? ' (modo teste: só na tela, nada foi para a planilha)' : ''}</Aviso>}

            <button className="btn wide" onClick={() => salvar(false)} style={{ marginTop: 6 }}>
              <Save size={18} /> Salvar registro
            </button>
          </>
        )}
      </div>

      {tipo !== 'lote' && (
        <>
          <h2 className="h2">Últimos lançamentos</h2>
          <div className="sheet">
            {recentes.length === 0 ? <div className="empty">Nada lançado ainda.</div> : recentes.map((e) => (
              <div className="led-r" key={e.id} style={{ '--cols': '1fr auto', minHeight: 48 }}>
                <span style={{ fontSize: 14.5 }}>{descreverEvento(e, dados)}</span>
                <span className="m mut">{formatarDataBR(e.data)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
